"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** Id of the element that names the dialog. */
  labelledBy: string;
  describedBy?: string;
  /** When false, Esc and backdrop clicks do nothing (use for in-flight destructive actions). */
  dismissible?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Shared base for Dialog and Sheet on the native <dialog> element: the browser traps focus,
 * closes on Esc and restores focus to the opener. We only sync `open`, lock page scroll and
 * route dismissals through `onClose`.
 */
export function Modal({ open, onClose, labelledBy, describedBy, dismissible = true, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => { e.preventDefault(); if (dismissible) onClose(); }}
      onClick={(e) => { if (dismissible && e.target === ref.current) onClose(); }}
      className={cn("fixed z-50 border border-line bg-surface p-0 text-ink shadow-window", className)}
    >
      {open ? children : null}
    </dialog>
  );
}
