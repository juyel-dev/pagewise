import { addLocalAttempt, listLocalBookmarks, removeLocalBookmark, saveLocalBookmark, saveLocalProgress } from "@/lib/local/store";
import { recordAttempt, saveProgress, toggleBookmark } from "./actions";
import { createLocalStore, createRemoteStore, type StudyStore } from "./store";

/** The one place that connects the store interface to the real IndexedDB helpers and server actions. */
export function createStudyStore(guest: boolean): StudyStore {
  return guest
    ? createLocalStore({ addAttempt: addLocalAttempt, saveBookmark: saveLocalBookmark, removeBookmark: removeLocalBookmark, saveProgress: saveLocalProgress, listBookmarks: listLocalBookmarks })
    : createRemoteStore({ recordAttempt, toggleBookmark, saveProgress });
}
