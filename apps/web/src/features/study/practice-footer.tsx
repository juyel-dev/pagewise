import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { KeyHint } from "@/components/ui/key-hint";
import type { PrimaryAction } from "./logic";
import { QuestionDots } from "./question-dots";
import type { StateMap } from "./logic";
import type { StudyQuestion } from "./types";

const LABEL: Record<Exclude<PrimaryAction, "none">, string> = { check: "Check", next: "Next question", summary: "Finish page", nextPage: "Next page" };

type Props = {
  questions: StudyQuestion[]; states: StateMap; index: number; onSelect: (i: number) => void;
  onPrevious: () => void; onNext: () => void;
  primary: PrimaryAction; onPrimary: () => void; canShowSource: boolean; onSource: () => void;
};

/**
 * Sticky bottom of the practice pane. Desktop: Previous · dots · Next and a key-hint row.
 * Phone: a 64 px action bar (Previous · the one big button · Show in NCERT).
 */
export function PracticeFooter({ questions, states, index, onSelect, onPrevious, onNext, primary, onPrimary, canShowSource, onSource }: Props) {
  const last = index >= questions.length - 1;
  return (
    <div className="shrink-0 border-t border-line bg-surface">
      <div className="hidden items-center justify-between gap-3 px-4 py-3 lg:flex">
        <Button variant="secondary" size="sm" disabled={index === 0} onClick={onPrevious}>Previous</Button>
        <QuestionDots questions={questions} states={states} current={index} onSelect={onSelect} />
        <Button variant={primary === "next" ? "primary" : "secondary"} size="sm" disabled={last && primary !== "next"} onClick={onNext}>Next question</Button>
      </div>
      <p className="hidden items-center justify-center gap-1.5 px-4 pb-3 text-caption text-muted lg:flex">
        <KeyHint>1</KeyHint>–<KeyHint>4</KeyHint> choose <span aria-hidden="true">·</span> <KeyHint>Enter</KeyHint> check <span aria-hidden="true">·</span> <KeyHint>N</KeyHint> next <span aria-hidden="true">·</span> <KeyHint>B</KeyHint> save <span aria-hidden="true">·</span> <KeyHint>?</KeyHint> all shortcuts
      </p>
      <div className="flex items-center gap-2 px-3 py-2 lg:hidden" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        <IconButton label="Previous question" variant="secondary" size="lg" disabled={index === 0} onClick={onPrevious}><ChevronLeft className="size-5" aria-hidden="true" /></IconButton>
        <Button size="lg" className="flex-1" disabled={primary === "none"} onClick={onPrimary} trailingIcon={primary === "next" || primary === "nextPage" ? <ChevronRight className="size-5" aria-hidden="true" /> : undefined}>
          {primary === "none" ? "Choose an answer" : LABEL[primary]}
        </Button>
        <IconButton label="Show in NCERT" variant="secondary" size="lg" disabled={!canShowSource} onClick={onSource}><ExternalLink className="size-5" aria-hidden="true" /></IconButton>
      </div>
    </div>
  );
}
