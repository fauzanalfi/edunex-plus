// Edunex's core feeds (#71): who is signed in (also the liveness check) and
// this term's courses.

import type { z } from "zod";
import { accountKey } from "../../../core/account";
import type { Account, AccountRole, Course } from "../../../core/models";
import { EngineError } from "../../errors";
import type { FeedRead } from "../../report/kept-pages";
import type { SourceContext } from "../source";
import type { EdunexClient } from "./client";
import { CoursePairs, LoginMe } from "./schemas";

const MINUTE = 60_000;

/** The signed-in user's Edunex id, from the account feed's /login/me: the notification feed's address. One per session. */
export interface EdunexUser {
  id: number | null;
}

/** GET /login/me: who is signed in. A lecturer (`level: "LECTURER"`, no `code`) is a lecturer account; everyone else needs a NIM. */
export async function fetchMe(client: EdunexClient): Promise<z.infer<typeof LoginMe>> {
  return client.get("/login/me", {}, LoginMe);
}

/** Student when `code` is present; lecturer when Edunex says LECTURER without a NIM; otherwise a vendor change (same wording as before). */
export function roleOf(me: z.infer<typeof LoginMe>): AccountRole {
  const level = me.level?.toUpperCase();
  if (level === "LECTURER" && me.code === undefined) return "lecturer";
  if (me.code !== undefined) return "student";
  throw new EngineError("VendorChanged", "/login/me: code Invalid input: expected string, received undefined");
}

/**
 * Student-only feeds wait for the account feed, then skip when the signed-in account is a lecturer (their feeds come
 * in a later phase). Returns false when this run should do nothing.
 */
export async function forStudent(context: SourceContext): Promise<boolean> {
  if (!context.get("edunex.account")) await context.runNow((feed) => feed === "edunex.account");
  return context.get("edunex.account")?.role !== "lecturer";
}

export function registerCoreFeeds(context: SourceContext, client: EdunexClient, user: EdunexUser = { id: null }): void {
  // Each run reads and stores through its own view of the two, so the report knows which run got what (FeedSpec.run).
  const noted = (read: FeedRead) => ({ context: context.for(read), client: client.for(read) });
  context.feed({
    name: "edunex.account",
    // Whose session this is, and whether it still holds: before anything else is read.
    priority: "now",
    every: 10 * MINUTE,
    jitter: MINUTE,
    async run(current, read) {
      const { context, client } = noted(read);
      const me = await fetchMe(client);
      const role = roleOf(me);
      const account: Account = {
        name: me.name.trim(),
        nim: role === "student" ? (me.code ?? null) : null,
        role,
        userId: me.id,
      };
      if (!current()) return;
      user.id = me.id;
      const previous = context.get("edunex.account");
      const nextKey = accountKey(account);
      const previousKey = previous ? accountKey(previous) : null;
      // A different account signed in on this computer: nothing of the last one may show.
      if (previousKey && previousKey !== nextKey) await context.remove("edunex.");
      // Nor their snoozes and what they marked handled, kept past signing out of Edunex alone: Task ids are the
      // whole class's, so a classmate's "not handing it in" would hide this Student's Task and stop its reminders.
      // Nor their highlights: the course's files are the whole class's too, and what one Student marked is theirs.
      const owner = context.get("local.owner");
      if ((previousKey && previousKey !== nextKey) || (owner && owner.key !== nextKey)) {
        await context.remove("local.snoozes");
        await context.remove("local.done");
        await context.remove("local.highlights");
      }
      if (owner?.key !== nextKey) await context.set("local.owner", { key: nextKey });
      await context.set("edunex.account", account);
    },
  });
  context.feed({
    name: "edunex.courses",
    // What the Tasks and Presence are read for (one call). Lecturers get their own feeds in a later phase.
    priority: "now",
    every: 30 * MINUTE,
    jitter: 3 * MINUTE,
    async run(_current, read) {
      const { context, client } = noted(read);
      if (!(await forStudent(context))) return;
      await context.set("edunex.courses", await fetchCourses(client));
    },
  });
}

const PARENT = /\s*\[Parent Class\]\s*$/i;

/**
 * The term's courses. Edunex lists a class's parent course ("… [Parent
 * Class]") as a separate pair; both are kept on one course, the child first.
 */
export async function fetchCourses(client: EdunexClient): Promise<Course[]> {
  const pairs = await client.get("/course/presences/list", {}, CoursePairs);
  const byClass = new Map<string, Course>();
  const sorted = [...pairs].sort((a, b) => Number(PARENT.test(a.courses_name)) - Number(PARENT.test(b.courses_name)));
  for (const pair of sorted) {
    const key = `${pair.course_code}|${pair.class_id}`;
    const existing = byClass.get(key);
    if (existing) {
      existing.edunex.relatedCourseIds.push(pair.course_id);
      continue;
    }
    byClass.set(key, {
      code: pair.course_code,
      name: pair.courses_name.replace(PARENT, ""),
      classNo: /-(\d+)$/.exec(pair.class_name)?.[1] ?? null,
      term: `${pair.year}-${pair.semester}`,
      edunex: { courseId: pair.course_id, classId: pair.class_id, relatedCourseIds: [] },
    });
  }
  return [...byClass.values()].sort((a, b) => a.code.localeCompare(b.code));
}
