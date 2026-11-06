/** Domain helpers over the IndexedDB store (guests and pre-sync browsing). */

import { clearAll, deleteOne, putOne, readAll, readOne } from "./db";
import type { LocalAttempt, LocalBookmark, LocalProgress, LocalSnapshot } from "./types";

export const listLocalBookmarks = () => readAll<LocalBookmark>("bookmarks");
export const saveLocalBookmark = (b: LocalBookmark) => putOne("bookmarks", b).then(() => undefined);
export const removeLocalBookmark = (questionId: string) => deleteOne("bookmarks", questionId).then(() => undefined);

export const listLocalProgress = () => readAll<LocalProgress>("progress");
export const getLocalProgress = (chapterId: string) => readOne<LocalProgress>("progress", chapterId);
export const saveLocalProgress = (p: LocalProgress) => putOne("progress", p).then(() => undefined);

export const addLocalAttempt = (a: LocalAttempt) => putOne("attempts", a).then(() => undefined);
export const listLocalAttempts = () => readAll<LocalAttempt>("attempts");

export async function readLocalSnapshot(): Promise<LocalSnapshot> {
  const [bookmarks, progress, attempts] = await Promise.all([
    listLocalBookmarks(),
    listLocalProgress(),
    listLocalAttempts(),
  ]);
  return { bookmarks, progress, attempts };
}

export const clearLocalData = () => clearAll();
