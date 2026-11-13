import type { QuestionPayload, QuestionType } from "@pagewise/question-schema";

export type StudyQuestion = {
  id: string; version_id: string; type: QuestionType; difficulty: "easy" | "medium" | "hard"; status: string; payload: QuestionPayload;
};
export type PageMapRow = { pdf_page: number; printed_label: string | null; kind: string };
/** `firstCorrect` is set when attempt 1 is checked and never changes: only the first attempt counts toward accuracy. */
export type QState = { chosen: number[]; checked: boolean; attemptNo: number; firstCorrect?: boolean };
export type StudyChapter = { id: string; slug: string; title: string; pageCount: number; status: "draft" | "live"; unit: string | null; pdfSha256: string | null };
