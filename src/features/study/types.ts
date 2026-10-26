export type McqPayload = { stem: string; options: [string, string, string, string]; answer: number; explanation: string; source_note?: string };
export type ContentQuestion = { id: string; version_id: string; type: "mcq"; difficulty: "easy" | "medium" | "hard"; tags: string[]; payload: McqPayload };
export type ChapterContent = { chapter: string; title: string; release: string; pages: Record<string, ContentQuestion[]> };
export type PageMapRow = { pdf_page: number; printed_label: string | null; kind: string };
export type QState = { chosen: number | null; checked: boolean; attemptNo: number };
export type StudyChapter = { id: string; slug: string; title: string; pageCount: number; status: "draft" | "live" };
