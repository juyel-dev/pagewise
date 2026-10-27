-- 0006 · Guest mode (decisions 27–29). Guests (anon) may read live chapters, published
-- questions and the chapter PDFs. Bookmarks, attempts and reading progress stay signed-in
-- only (user_id-keyed policies in 0001 unchanged).

-- mirrors 0001: books_read / chapters_read / page_map_read / releases_read
create policy books_read_anon on public.books for select to anon using (true);
create policy chapters_read_anon on public.chapters for select to anon using (status = 'live');
create policy page_map_read_anon on public.page_map for select to anon using (true);
create policy releases_read_anon on public.content_releases for select to anon using (true);

-- mirrors 0005: questions_student_read / versions_student_read for students
create policy questions_read_anon on public.questions for select to anon
  using (status = 'published' and hidden = false
         and exists (select 1 from public.chapters c where c.id = chapter_id and c.status = 'live'));
create policy versions_read_anon on public.question_versions for select to anon
  using (exists (select 1 from public.questions q join public.chapters c on c.id = q.chapter_id
                 where q.id = question_id and q.current_version_id = question_versions.id
                   and q.status = 'published' and q.hidden = false and c.status = 'live'));

grant select on public.books, public.chapters, public.page_map, public.content_releases,
                public.questions, public.question_versions to anon;

-- storage: guests may request signed URLs of PDFs belonging to live chapters (mirrors 0003)
create policy chapter_pdfs_read_anon on storage.objects for select to anon
  using (bucket_id = 'chapter-pdfs' and exists (
    select 1 from public.chapters c where c.pdf_path = name and c.status = 'live'));
