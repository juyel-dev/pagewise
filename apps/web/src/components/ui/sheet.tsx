"use client";

import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconButton } from "./icon-button";
import { Modal } from "./modal";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** `bottom` on phones, `right` as a desktop drawer. */
  side?: "bottom" | "right";
  className?: string;
};

const sides = {
  bottom: "mx-auto mt-auto mb-0 w-full max-w-lg max-h-[85dvh] rounded-t-2xl",
  right: "ml-auto mr-0 my-0 h-dvh max-h-none w-[min(92vw,26rem)] rounded-l-2xl",
} as const;

/** Edge-anchored panel built on the same native dialog as Dialog. */
export function Sheet({ open, onClose, title, children, side = "bottom", className }: Props) {
  const titleId = `${useId()}-title`;
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} className={cn("overflow-hidden", sides[side], className)}>
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <h2 id={titleId} className="flex-1 text-h3 text-ink">{title}</h2>
          <IconButton label="Close" size="sm" onClick={onClose}><X className="size-4" aria-hidden="true" /></IconButton>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </Modal>
  );
}
