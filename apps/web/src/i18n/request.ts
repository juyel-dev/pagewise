import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE } from "./config";

// One locale for now, so nothing here reads cookies or headers and pages can stay prerendered.
// When a second language ships, read the locale cookie here and keep the reading inside Suspense.
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import("../../messages/en.json")).default,
}));
