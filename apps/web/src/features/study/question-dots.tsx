import { isCorrect } from "@pagewise/question-schema";
import { cn } from "@/lib/cn";
import type { StateMap } from "./logic";
import type { StudyQuestion } from "./types";

/** One dot per question: current, answered right (✓), answered wrong (×), or not answered (•). Each dot jumps to its question. */
export function QuestionDots({ questions, states, current, onSelect }: { questions: StudyQuestion[]; states: StateMap; current: number; onSelect: (index: number) => void }) {
  return (
    <ol aria-label="Question progress" className="flex items-center gap-1.5">
      {questions.map((q, i) => {
        const s = states[q.id];
        const correct = Boolean(s?.checked && isCorrect(s.chosen, q.payload.correct));
        const incorrect = Boolean(s?.checked && !correct);
        const status = correct ? "answered correctly" : incorrect ? "answered incorrectly" : "not answered";
        const isCurrent = i === current;
        return (
          <li key={q.id}>
            <button type="button" aria-current={isCurrent ? "step" : undefined} aria-label={`Go to question ${i + 1}, ${isCurrent ? "current, " : ""}${status}`} title={`Question ${i + 1}: ${status}`} onClick={() => onSelect(i)}
              className={cn("grid size-7 place-items-center rounded-full border text-caption transition-colors pointer-coarse:size-9",
                isCurrent ? "border-brand bg-brand-soft text-brand-text" : correct ? "border-good bg-good-soft text-good" : incorrect ? "border-bad bg-bad-soft text-bad" : "border-line bg-surface text-muted")}>
              {correct ? "✓" : incorrect ? "×" : isCurrent ? String(i + 1) : "•"}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
