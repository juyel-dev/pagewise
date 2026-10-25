-- PageWise initial schema (blueprint 03 + 09). Forward-only. Apply to a dev project first.
-- Every user-owned table references auth.users ON DELETE CASCADE so account deletion removes all data.

-- ---------- identity ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  class text check (class in ('11','12','dropper')),
  neet_year int,
  language text not null default 'en',
  is_minor boolean not null default false,
  consent_status text not null default 'not_required'
    check (consent_status in ('not_required','pending','verified','withdrawn')),
  daily_goal int not null default 20 check (daily_goal between 1 and 500),
  prefs jsonb not null default '{}'::jsonb,
  role text not null default 'student' check (role in ('student','reviewer','admin')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.parental_consents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  parent_email_hash text not null,
  token_hash text not null,
  requested_at timestamptz not null default now(),
  verified_at timestamptz,
  withdrawn_at timestamptz
);

-- ---------- catalogue ----------
create table public.books (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  class text not null check (class in ('11','12')),
  title text not null,
  edition text,
  edition_year int
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  number int not null,
  slug text not null unique,
  title text not null,
  pdf_path text,            -- private storage object path (never a public URL)
  pdf_sha256 text,
  edition text,
  page_count int,
  status text not null default 'draft' check (status in ('draft','live')),
  unique (book_id, number)
);

create table public.page_map (
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  pdf_page int not null,
  printed_label text,
  kind text not null default 'content'
    check (kind in ('cover','front','content','blank','activity','summary','exercise','back')),
  has_figure boolean not null default false,
  notes text,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  primary key (chapter_id, pdf_page)
);

-- ---------- content ----------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  pdf_page int not null,
  type text not null check (type in ('mcq','assertion_reason','statements','match')),
  difficulty text check (difficulty in ('easy','medium','hard')),
  tags text[] not null default '{}',
  status text not null default 'draft'
    check (status in ('draft','auto_checked','in_review','published','flagged','retired')),
  auto_check_failed boolean not null default false,
  current_version_id uuid,
  hidden boolean not null default false,
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  retired_at timestamptz
);
create index questions_chapter_page on public.questions (chapter_id, pdf_page, status);

create table public.question_versions (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  lang text not null default 'en',
  version int not null,
  payload jsonb not null,
  source_note text,
  prompt_version text,
  model_id text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (question_id, lang, version)
);
alter table public.questions
  add constraint questions_current_version_fk foreign key (current_version_id) references public.question_versions(id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  question_version_id uuid not null references public.question_versions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  decision text not null check (decision in ('approved','edited','rejected','escalated')),
  reason text,
  checklist jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.content_releases (
  id uuid primary key default gen_random_uuid(),
  content_version text not null unique,
  manifest jsonb not null,
  created_by uuid references auth.users(id),
  git_sha text,
  created_at timestamptz not null default now()
);

-- ---------- student activity ----------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  version_id uuid references public.question_versions(id),
  chosen jsonb,
  is_correct boolean not null,
  time_ms int,
  attempt_no int not null default 1 check (attempt_no >= 1),
  source text,
  release text,
  created_at timestamptz not null default now(),
  unique (user_id, question_id, attempt_no)
);
create index attempts_user_time on public.attempts (user_id, created_at);
create index attempts_question on public.attempts (question_id);

create table public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('wrong_answer','ambiguous','outside_page','typo','other')),
  note text check (char_length(note) <= 500),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create unique index reports_one_open_per_user on public.reports (user_id, question_id) where status = 'open';
create index reports_status on public.reports (status, created_at);

create table public.reading_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  last_page int not null default 1,
  pages_seen int[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

create table public.daily_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  answered int not null default 0,
  correct int not null default 0,
  seconds int not null default 0,
  primary key (user_id, day)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  at timestamptz not null default now()
);

-- ---------- helpers ----------
create function public.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'student')
$$;
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.my_role() in ('reviewer','admin')
$$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.my_role() = 'admin'
$$;
revoke all on function public.my_role(), public.is_staff(), public.is_admin() from public, anon;
grant execute on function public.my_role(), public.is_staff(), public.is_admin() to authenticated;

-- profile row for every new auth user
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- distinct open reporters -> report_count; hide at threshold (default 3)
create function public.refresh_report_count() returns trigger
language plpgsql security definer set search_path = '' as $$
declare qid uuid; n int;
begin
  qid := coalesce(new.question_id, old.question_id);
  select count(distinct user_id) into n from public.reports where question_id = qid and status = 'open';
  update public.questions
     set report_count = n,
         hidden = hidden or n >= 3,
         status = case when n >= 3 and status = 'published' then 'flagged' else status end
   where id = qid;
  return null;
end $$;
create trigger reports_refresh after insert or update or delete on public.reports
  for each row execute function public.refresh_report_count();

-- audit helper used by reviewer/admin server actions
create function public.write_audit(p_action text, p_entity text, p_entity_id text, p_before jsonb, p_after jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log (actor_id, action, entity, entity_id, before, after)
  select auth.uid(), p_action, p_entity, p_entity_id, p_before, p_after where public.is_staff()
$$;
revoke all on function public.write_audit(text,text,text,jsonb,jsonb) from public, anon;
grant execute on function public.write_audit(text,text,text,jsonb,jsonb) to authenticated;

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.parental_consents enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.page_map enable row level security;
alter table public.questions enable row level security;
alter table public.question_versions enable row level security;
alter table public.reviews enable row level security;
alter table public.content_releases enable row level security;
alter table public.attempts enable row level security;
alter table public.bookmarks enable row level security;
alter table public.reports enable row level security;
alter table public.reading_progress enable row level security;
alter table public.daily_stats enable row level security;
alter table public.audit_log enable row level security;

-- profiles: read/update self (only safe columns, see grants), admin reads all
create policy profiles_select_self on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- catalogue: signed-in read, admin write
create policy books_read on public.books for select to authenticated using (true);
create policy books_admin on public.books for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy chapters_read on public.chapters for select to authenticated using (status = 'live' or public.is_staff());
create policy chapters_admin on public.chapters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy page_map_read on public.page_map for select to authenticated using (true);
create policy page_map_staff on public.page_map for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- content: staff only (students read the static export)
create policy questions_staff on public.questions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy versions_staff on public.question_versions for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy reviews_insert on public.reviews for insert to authenticated with check (public.is_staff() and reviewer_id = auth.uid());
create policy reviews_read on public.reviews for select to authenticated using (reviewer_id = auth.uid() or public.is_admin());
create policy releases_read on public.content_releases for select to authenticated using (true);
create policy releases_admin on public.content_releases for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- student activity: own rows only
create policy attempts_select on public.attempts for select to authenticated using (user_id = auth.uid());
create policy attempts_insert on public.attempts for insert to authenticated with check (user_id = auth.uid());
create policy bookmarks_all on public.bookmarks for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy reading_all on public.reading_progress for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy daily_all on public.daily_stats for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- reports: students insert/read own; staff read and resolve all
create policy reports_insert on public.reports for insert to authenticated with check (user_id = auth.uid());
create policy reports_select on public.reports for select to authenticated using (user_id = auth.uid() or public.is_staff());
create policy reports_staff_update on public.reports for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- audit: admin read; writes only through write_audit()
create policy audit_admin_read on public.audit_log for select to authenticated using (public.is_admin());
-- parental_consents: no policies => no client access (service role only)

-- ---------- privileges (defence in depth) ----------
revoke all on all tables in schema public from anon, authenticated;
grant select on public.books, public.chapters, public.page_map, public.content_releases to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, class, neet_year, language, daily_goal, prefs, onboarded_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.questions, public.question_versions to authenticated;
grant insert, update, delete on public.books, public.chapters, public.content_releases to authenticated;
grant insert, update, delete on public.page_map to authenticated;
grant select, insert on public.reviews to authenticated;
grant select, insert on public.attempts to authenticated;
grant select, insert, update, delete on public.bookmarks, public.reading_progress, public.daily_stats to authenticated;
grant select, insert, update on public.reports to authenticated;
grant select on public.audit_log to authenticated;
