// Edunex: the signed-in account and this term's courses (#71).
import { z } from "zod";

/** Whose shell the app opens after Edunex sign-in. Older saves without `role` are students (they have a NIM). */
export const AccountRole = z.enum(["student", "lecturer"]);
export type AccountRole = z.infer<typeof AccountRole>;

export const Account = z.object({
  name: z.string(),
  /** Student number (NIM). Null for a lecturer account (Edunex's `/login/me` has no `code`). */
  nim: z.string().nullable(),
  /** Whose shell to open. Default keeps older `{ name, nim }` saves as students. */
  role: AccountRole.default("student"),
  /** Edunex user id from `/login/me`; ownership key for lecturers, and the notifications feed. */
  userId: z.number().optional(),
});
export type Account = z.infer<typeof Account>;

/** A course the Student takes this term, as Edunex knows it. SIX details join in later. */
export const Course = z.object({
  code: z.string(),
  name: z.string(),
  /** "01" from Edunex's "II4091-01". */
  classNo: z.string().nullable(),
  /** SIX term code: "2026-1". */
  term: z.string(),
  edunex: z.object({
    courseId: z.number(),
    classId: z.number(),
    /** Parent and child Edunex courses for the same class; information can sit in either. */
    relatedCourseIds: z.array(z.number()),
  }),
});
export type Course = z.infer<typeof Course>;

export const edunexDatasets = {
  "edunex.account": Account,
  "edunex.courses": z.array(Course),
} as const;
