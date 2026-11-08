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
  description?: string;
  children?: ReactNode;
  /** Buttons row. Destructive confirmations: make the safe action the primary one. */
  footer?: ReactNode;
  dismissible?: boolean;
  className?: string;
};

/** Centred modal, 480 px. Esc and backdrop close it unless `dismissible={false}`. */
export function Dialog({ open, onClose, title, description, children, footer, dismissible = true, className }: Props) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} describedBy={description ? descId : undefined} dismissible={dismissible} className={cn("m-auto w-[min(92vw,30rem)] rounded-2xl", className)}>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 id={titleId} className="text-h3 text-ink">{title}</h2>
            {description ? <p id={descId} className="mt-1 text-small text-ink-2">{description}</p> : null}
          </div>
          {dismissible ? <IconButton label="Close" size="sm" onClick={onClose}><X className="size-4" aria-hidden="true" /></IconButton> : null}
        </div>
        {children}
        {footer ? <div className="flex flex-wrap justify-end gap-2">{footer}</div> : null}
      </div>
    </Modal>
  );
}
