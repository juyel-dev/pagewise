"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navLinks } from "@/config/brand";
import { flags } from "@/lib/flags";
import { ButtonLink } from "@/components/ui/button";

/** Mobile menu: disclosure pattern, closes on link tap and on Escape. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="md:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)} className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink-2 hover:bg-surface-2">
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-canvas/95 px-5 pb-6 pt-2 shadow-card backdrop-blur">
        <nav aria-label="Mobile"><ul className="flex flex-col">
          {navLinks.map((l) => <li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-2 py-3 text-base font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">{l.label}</a></li>)}
        </ul>
        <ButtonLink href={flags.appOpen ? "/home" : "#waitlist"} size="lg" className="mt-3 w-full" onClick={() => setOpen(false)}>{flags.appOpen ? "Open the app" : "Join the waitlist"}</ButtonLink>
        </nav>
      </div>}
    </div>
  );
}
