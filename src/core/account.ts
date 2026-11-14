// Whose Edunex account is signed in: a Student (NIM) or a Lecturer (Edunex user id).
import type { Account } from "./models";

/** Stable id for local data that must not cross accounts (snoozes, highlights, file cache). */
export function accountKey(account: Account): string {
  if (account.role === "lecturer") return `l:${account.userId ?? account.name}`;
  return `s:${account.nim ?? ""}`;
}

export const isLecturer = (account: Account | undefined): boolean => account?.role === "lecturer";
