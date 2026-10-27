import type { QuestionPayload, QuestionType } from "@/lib/question-bank/format";

export type StudyQuestion = {
  id: string; version_id: string; type: QuestionType; difficulty: "easy" | "medium" | "hard"; status: string; payload: QuestionPayload;
};
export type PageMapRow = { pdf_page: number; printed_label: string | null; kind: string };
export type QState = { chosen: number[]; checked: boolean; attemptNo: number };
export type StudyChapter = { id: string; slug: string; title: string; pageCount: number; status: "draft" | "live"; unit: string | null };
