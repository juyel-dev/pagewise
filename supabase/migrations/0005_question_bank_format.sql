-- Align the schema with the owner's question-bank format (juyel-dev/neet-biology-question-bank):
-- 5 question types, per-page files named by NCERT PDF (e.g. kebo101), unit metadata, stable external ids.
alter table public.chapters add column pdf_file text, add column unit_number int, add column unit_title text;
create unique index chapters_pdf_file_key on public.chapters (pdf_file) where pdf_file is not null;

alter table public.page_map drop constraint page_map_kind_check;
alter table public.page_map add constraint page_map_kind_check
  check (kind in ('cover','front','unit_intro','content','blank','activity','summary','exercise','back'));

alter table public.questions drop constraint questions_type_check;
alter table public.questions add constraint questions_type_check
  check (type in ('single_correct','multiple_correct','multiple_statement','match_the_following','assertion_reason'));
alter table public.questions add column external_id text unique, add column topic text;

-- students read published, non-hidden questions of live chapters (answers are checked client-side for practice)
create policy questions_student_read on public.questions for select to authenticated
  using (status = 'published' and hidden = false
         and exists (select 1 from public.chapters c where c.id = chapter_id and c.status = 'live'));
create policy versions_student_read on public.question_versions for select to authenticated
  using (exists (select 1 from public.questions q join public.chapters c on c.id = q.chapter_id
                 where q.id = question_id and q.current_version_id = question_versions.id
                   and q.status = 'published' and q.hidden = false and c.status = 'live'));

-- chapter metadata
update public.chapters set slug = 'class11-bio-ch06', pdf_file = 'kebo106', unit_number = 2,
  unit_title = 'Structural Organisation in Plants and Animals' where id = 'ed3bc8a7-1ad1-58b7-b93e-21667a8ccf23';
insert into public.chapters (book_id, number, slug, title, edition, status, pdf_file, unit_number, unit_title)
values ('a1d68fbe-cff6-5acd-a8f3-c48ae7c09d1c', 1, 'class11-bio-ch01', 'The Living World', 'Reprint 2025-26', 'draft', 'kebo101', 1, 'Diversity in the Living World');
