-- Private bucket for chapter PDFs (docs/blueprint/09 §7). Never public. Staff can read all; students only live chapters.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chapter-pdfs', 'chapter-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

create policy chapter_pdfs_read on storage.objects for select to authenticated
  using (bucket_id = 'chapter-pdfs' and (public.is_staff() or exists (
    select 1 from public.chapters c where c.pdf_path = name and c.status = 'live')));
create policy chapter_pdfs_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'chapter-pdfs' and public.is_admin());
create policy chapter_pdfs_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'chapter-pdfs' and public.is_admin()) with check (bucket_id = 'chapter-pdfs' and public.is_admin());
create policy chapter_pdfs_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'chapter-pdfs' and public.is_admin());
