"use client";

import { useEffect, useRef } from "react";
import { shortcutFor, type ShortcutAction } from "./logic";

export type ShortcutHandlers = Partial<{ [K in ShortcutAction["type"]]: (action: Extract<ShortcutAction, { type: K }>) => void }>;

const EDITABLE = "input, textarea, select, [contenteditable=''], [contenteditable='true']";
// Enter on a focused control must keep its native meaning, or the answer would be checked twice.
const ACTIVATES_ON_ENTER = "button, a, summary, [role='radio'], [role='switch'], [role='tab'], [role='separator']";

/** Window-level keyboard shortcuts for the workspace (docs/spec/screens/S05 §6). Handlers can change without re-subscribing. */
export function useWorkspaceShortcuts(handlers: ShortcutHandlers) {
  const latest = useRef(handlers);
  useEffect(() => { latest.current = handlers; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const action = shortcutFor({ key: e.key, shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, inEditable: Boolean(target?.closest(EDITABLE)) });
      if (!action) return;
      if (action.type === "enter" && target?.closest(ACTIVATES_ON_ENTER)) return;
      const handler = latest.current[action.type] as ((a: ShortcutAction) => void) | undefined;
      if (!handler) return;
      e.preventDefault();
      handler(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
