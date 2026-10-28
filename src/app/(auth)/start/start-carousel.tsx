"use client";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Slide = { title: string; text: string; art: ReactNode };

const slides: Slide[] = [
  {
    title: "Page by Page Learning",
    text: "Read NCERT with built-in questions for each page. Stay focused and learn better.",
    art: <DocPdfArt />,
  },
  {
    title: "Smart Question Practice",
    text: "Get multiple choice questions for every page. Track your performance and improve.",
    art: <ChecklistArt />,
  },
  {
    title: "Track & Achieve",
    text: "Monitor your progress, bookmark important pages and focus on what matters most.",
    art: <TargetArt />,
  },
];

export function StartCarousel() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const s = slides[i];
  const last = i === slides.length - 1;

  function next() {
    if (last) router.push("/sign-in");
    else setI((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <article className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-window">
        <span className="absolute right-5 top-5 text-xs font-medium text-muted" aria-hidden>{i + 1} / {slides.length}</span>
        <div className="mx-auto mt-2 h-40 w-full max-w-xs" aria-hidden>{s.art}</div>
        <h1 className="mt-5 text-xl font-semibold text-ink">{s.title}</h1>
        <p className="mt-2 text-sm leading-6 text-ink-2">{s.text}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="flex gap-1.5" aria-hidden>
            {slides.map((_, d) => <span key={d} className={cn("size-2 rounded-full transition-colors", d === i ? "w-4 bg-brand" : "bg-line")} />)}
          </span>
          <Button size="md" onClick={next}>{last ? "Get Started" : "Next"}</Button>
        </div>
      </article>
      <p className="text-center text-sm">
        <a href="/library" className="text-muted underline underline-offset-2 hover:text-ink">Skip for now — explore as a guest</a>
      </p>
    </div>
  );
}

/* ---- flat pastel arts (approximating the owner's mock) ---- */

function DocPdfArt() {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-full w-full" aria-hidden>
      <ellipse cx="100" cy="140" rx="56" ry="10" fill="var(--brand-soft)" />
      <rect x="56" y="28" width="76" height="94" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" transform="rotate(-6 94 75)" />
      <g transform="rotate(-6 94 75)">
        <g fill="var(--line)"><rect x="66" y="42" width="40" height="5" rx="2.5" /><rect x="66" y="54" width="56" height="5" rx="2.5" /><rect x="66" y="66" width="48" height="5" rx="2.5" /></g>
        <rect x="62" y="86" width="40" height="20" rx="6" fill="#dc2626" opacity="0.9" />
        <text x="82" y="100" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="system-ui, sans-serif">PDF</text>
      </g>
      <path d="M140 92 C 140 78, 148 68, 160 64" stroke="var(--good)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M160 64 C 156 52, 146 46, 132 46 C 136 58, 148 64, 160 64 Z" fill="var(--good)" opacity="0.85" />
      <path d="M160 66 C 166 52, 178 48, 190 52 C 186 64, 176 70, 166 68 Z" fill="var(--good)" />
      <ellipse cx="150" cy="136" rx="20" ry="6" fill="var(--surface-2)" />
    </svg>
  );
}

function ChecklistArt() {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-full w-full" aria-hidden>
      <ellipse cx="100" cy="140" rx="56" ry="10" fill="var(--brand-soft)" />
      <rect x="54" y="22" width="92" height="106" rx="10" fill="var(--surface)" stroke="var(--line)" strokeWidth="2" transform="rotate(3 100 75)" />
      <g transform="rotate(3 100 75)">
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <circle cx="72" cy={46 + r * 22} r="7" fill={r === 2 ? "var(--brand-soft)" : "var(--surface-2)"} />
            {r === 2 && <path d={`M69 ${46 + r * 22} l2.6 2.8 5-5.4`} stroke="var(--brand)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <rect x="86" y={43 + r * 22} width={r === 0 ? 44 : 52} height="6" rx="3" fill="var(--line)" />
            <rect x="86" y={53 + r * 22} width={34 - r * 4} height="5" rx="2.5" fill="var(--surface-2)" />
          </g>
        ))}
      </g>
      <circle cx="146" cy="112" r="16" fill="var(--good)" />
      <path d="M139.5 112 l4.5 4.8 9-9.6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetArt() {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-full w-full" aria-hidden>
      <ellipse cx="100" cy="140" rx="56" ry="10" fill="var(--brand-soft)" />
      <circle cx="92" cy="72" r="40" fill="var(--brand-soft)" />
      <circle cx="92" cy="72" r="30" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2.5" />
      <circle cx="92" cy="72" r="18" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2.5" opacity="0.8" />
      <circle cx="92" cy="72" r="6" fill="var(--brand)" />
      <path d="M92 68 L138 30" stroke="var(--ink-2)" strokeWidth="3" strokeLinecap="round" />
      <path d="M138 30 l-2 9 9 -2 z" fill="var(--ink-2)" />
      {/* rising bars */}
      <g fill="var(--line)" opacity="0.9">
        <rect x="128" y="104" width="10" height="26" rx="3" />
        <rect x="142" y="94" width="10" height="36" rx="3" fill="var(--brand)" opacity="0.35" />
        <rect x="156" y="84" width="10" height="46" rx="3" fill="var(--brand)" />
      </g>
    </svg>
  );
}
