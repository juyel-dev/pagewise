/**
 * Public surface of the Study module for OTHER features (docs/blueprint/14 §3).
 * Only pure, client-safe helpers belong here; routes may still import module files directly.
 */
export { progressOf, CLASSES, SUBJECTS, pairKey } from "./hub";
export type { HubProgressRow } from "./hub";
