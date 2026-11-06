-- 0007 · Server-side grading (decision 41, blueprint/14 §5)
-- The database decides attempts.is_correct. Client-supplied values are ignored, so no app
-- path (student web, guest sync, a future admin tool) can fake correctness.
-- Compatible with the deployed app: it still sends is_correct, the trigger overwrites it.

-- Returns true/false, or null when the attempt cannot be graded (unknown version, version does
-- not belong to the question, malformed answer). Reads any version, not only the current one,
-- so older attempts and synced guest attempts grade correctly.
create or replace function public.grade_attempt(p_question_id uuid, p_version_id uuid, p_chosen jsonb)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
  v_correct int[];
  v_chosen  int[];
begin
  select payload into v_payload
  from public.question_versions
  where id = p_version_id and question_id = p_question_id;

  if v_payload is null or jsonb_typeof(v_payload -> 'correct') is distinct from 'array' then
    return null;
  end if;
  if p_chosen is null or jsonb_typeof(p_chosen) is distinct from 'array' then
    return null;
  end if;

  select coalesce(array_agg(x::int order by x::int), '{}') into v_correct
    from jsonb_array_elements_text(v_payload -> 'correct') as t(x);
  select coalesce(array_agg(x::int order by x::int), '{}') into v_chosen
    from jsonb_array_elements_text(p_chosen) as t(x);

  return v_chosen = v_correct;
exception when others then
  return null;
end;
$$;

-- Not callable from the API: only the trigger (owner) uses it.
revoke all on function public.grade_attempt(uuid, uuid, jsonb) from public, anon, authenticated;

create or replace function public.attempts_grade_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version uuid;
  v_ok boolean;
begin
  v_version := coalesce(
    new.version_id,
    (select q.current_version_id from public.questions q where q.id = new.question_id)
  );
  v_ok := public.grade_attempt(new.question_id, v_version, new.chosen);
  if v_ok is null then
    return null;            -- ungradable attempt: skip the row instead of failing the whole batch
  end if;
  new.version_id := v_version;
  new.is_correct := v_ok;
  return new;
end;
$$;

revoke all on function public.attempts_grade_before_insert() from public, anon, authenticated;

drop trigger if exists attempts_grade on public.attempts;
create trigger attempts_grade
  before insert on public.attempts
  for each row execute function public.attempts_grade_before_insert();

-- One-time repair of history: recompute correctness for rows that can be graded.
update public.attempts a
   set is_correct = g.ok
  from (
    select id, public.grade_attempt(question_id, version_id, chosen) as ok
      from public.attempts
     where version_id is not null
  ) g
 where a.id = g.id and g.ok is not null and a.is_correct is distinct from g.ok;
