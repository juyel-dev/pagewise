-- Applied 2026-10-26 via SQL editor: remove the unreviewed development sample questions seeded by 0002.
-- No unreviewed question may exist in the app. Chapter metadata and page_map rows stay (real data).
delete from public.questions where chapter_id = 'ed3bc8a7-1ad1-58b7-b93e-21667a8ccf23';
