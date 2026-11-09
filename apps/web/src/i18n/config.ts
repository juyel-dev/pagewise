/** Locales that have a COMPLETE message catalogue. Add a locale here only when `messages/<locale>.json` is complete (docs/walkthrough/00-tour.md §4). */
export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
