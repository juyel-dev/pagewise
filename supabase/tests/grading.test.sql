-- Run from the repo root against an EMPTY Postgres: psql -f supabase/tests/grading.test.sql
-- Builds a minimal stub schema, applies migration 0007, asserts grading behaviour (decision 41).
\set ON_ERROR_STOP on
create schema auth; create table auth.users(id uuid primary key);
create role anon; create role authenticated;
create table public.questions(id uuid primary key, current_version_id uuid);
create table public.question_versions(id uuid primary key, question_id uuid not null references public.questions(id), payload jsonb not null);
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id),
  version_id uuid references public.question_versions(id),
  chosen jsonb, is_correct boolean not null, time_ms int,
  attempt_no int not null default 1 check (attempt_no >= 1), source text, release text,
  created_at timestamptz not null default now(), unique (user_id, question_id, attempt_no));
insert into auth.users values ('00000000-0000-0000-0000-0000000000a1');
insert into public.questions values ('00000000-0000-0000-0000-0000000000b1', null), ('00000000-0000-0000-0000-0000000000b2', null);
insert into public.question_versions values
 ('00000000-0000-0000-0000-0000000000c1','00000000-0000-0000-0000-0000000000b1','{"correct":[1]}'),
 ('00000000-0000-0000-0000-0000000000c2','00000000-0000-0000-0000-0000000000b1','{"correct":[2]}'),
 ('00000000-0000-0000-0000-0000000000c3','00000000-0000-0000-0000-0000000000b2','{"correct":[0,2]}');
update public.questions set current_version_id='00000000-0000-0000-0000-0000000000c2' where id='00000000-0000-0000-0000-0000000000b1';
-- history seeded BEFORE the migration: one faked row (client said correct, it is not)
insert into public.attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values
 ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-0000000000b2','00000000-0000-0000-0000-0000000000c3','[1]',true,9);
\i supabase/migrations/0007_server_side_grading.sql
do $$ declare r record; u uuid := '00000000-0000-0000-0000-0000000000a1';
 q1 uuid := '00000000-0000-0000-0000-0000000000b1'; q2 uuid := '00000000-0000-0000-0000-0000000000b2';
begin
 assert (select is_correct from attempts where attempt_no=9) = false, 'history repaired';
 -- client lies: says correct, answer wrong on old version c1 (correct=[1]) -> chosen [2]
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q1,'00000000-0000-0000-0000-0000000000c1','[2]',true,1);
 assert (select is_correct from attempts where attempt_no=1)=false, 'lie overwritten (old version)';
 -- honest correct answer on old version
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q1,'00000000-0000-0000-0000-0000000000c1','[1]',false,2);
 assert (select is_correct from attempts where attempt_no=2)=true, 'true answer stored as correct';
 -- null version resolves to current version c2 (correct=[2])
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q1,null,'[2]',false,3);
 assert (select version_id from attempts where attempt_no=3)='00000000-0000-0000-0000-0000000000c2','null version resolved';
 assert (select is_correct from attempts where attempt_no=3)=true,'graded on current version';
 -- multiple correct, order independent
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q2,'00000000-0000-0000-0000-0000000000c3','[2,0]',false,1);
 assert (select is_correct from attempts where user_id=u and question_id=q2 and attempt_no=1)=true,'multi order independent';
 -- partial multi is wrong
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q2,'00000000-0000-0000-0000-0000000000c3','[0]',true,2);
 assert (select is_correct from attempts where user_id=u and question_id=q2 and attempt_no=2)=false,'partial wrong';
 -- version of another question -> row skipped
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q1,'00000000-0000-0000-0000-0000000000c3','[0]',true,4);
 assert not exists(select 1 from attempts where question_id=q1 and attempt_no=4),'mismatched version skipped';
 -- garbage chosen -> skipped, no exception
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values (u,q1,'00000000-0000-0000-0000-0000000000c2','["x"]',true,5);
 assert not exists(select 1 from attempts where question_id=q1 and attempt_no=5),'garbage skipped';
 -- bulk upsert with one bad row does not fail the batch; duplicates ignored
 insert into attempts(user_id,question_id,version_id,chosen,is_correct,attempt_no) values
   (u,q1,'00000000-0000-0000-0000-0000000000c2','[2]',false,6),
   (u,q1,'00000000-0000-0000-0000-0000000000c3','[0]',true,7),
   (u,q1,'00000000-0000-0000-0000-0000000000c2','[2]',false,6)
 on conflict (user_id,question_id,attempt_no) do nothing;
 assert (select count(*) from attempts where question_id=q1 and attempt_no in (6,7))=1,'batch continued';
 -- grade_attempt not callable by API roles
 assert not has_function_privilege('authenticated','public.grade_attempt(uuid,uuid,jsonb)','execute'),'not exposed';
 assert not has_function_privilege('anon','public.grade_attempt(uuid,uuid,jsonb)','execute'),'not exposed anon';
 raise notice 'ALL GRADING TESTS PASSED';
end $$;
