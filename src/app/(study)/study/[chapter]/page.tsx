import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadStudy } from "@/features/study/load";
import { StudyWorkspace } from "@/features/study/study-workspace";

export const metadata: Metadata = { title: "Study", robots: { index: false } };

type Params = { params: Promise<{ chapter: string }>; searchParams: Promise<{ p?: string }> };

export default async function StudyPage({ params, searchParams }: Params) {
  const [{ chapter }, { p }] = await Promise.all([params, searchParams]);
  const data = await loadStudy(chapter, { p, review: false });
  if (!data) notFound();
  return <StudyWorkspace {...data} />;
}
