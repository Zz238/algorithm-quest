-- Dedicated application data. No existing tables or Auth settings are modified.
begin;

create function public.algo_quest_valid_document(value jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare field text; element jsonb; item record; d text;
begin
  if jsonb_typeof(value) is distinct from 'object' or value->'schema' is distinct from '1'::jsonb
     or jsonb_typeof(value->'progress') is distinct from 'object' or value->'progress'->'version' is distinct from '1'::jsonb
     or jsonb_typeof(value->'clocks') is distinct from 'object' then return false; end if;
  if octet_length(value::text) > 2000000 then return false; end if;
  foreach field in array array['lessons','mastery','bookmarks'] loop
    if jsonb_typeof(value->'progress'->field) is distinct from 'array' or jsonb_array_length(value->'progress'->field) > 72 then return false; end if;
    for element in select * from jsonb_array_elements(value->'progress'->field) loop
      if jsonb_typeof(element)is distinct from 'string' or (element#>>'{}') !~ '^([1-9]|1[0-2])-[1-6]$' then return false; end if;
    end loop;
    if (select count(*)<>count(distinct e) from jsonb_array_elements(value->'progress'->field) e) then return false; end if;
  end loop;
  if jsonb_typeof(value->'progress'->'bosses')is distinct from 'array' or jsonb_array_length(value->'progress'->'bosses')>12 then return false; end if;
  for element in select * from jsonb_array_elements(value->'progress'->'bosses') loop
    if jsonb_typeof(element)is distinct from 'number' or (element#>>'{}') !~ '^([1-9]|1[0-2])$' then return false; end if;
  end loop;
  if (select count(*)<>count(distinct e) from jsonb_array_elements(value->'progress'->'bosses') e) then return false; end if;
  if jsonb_typeof(value->'progress'->'bossTasks')is distinct from 'object' then return false; end if;
  for item in select * from jsonb_each(value->'progress'->'bossTasks') loop
    if item.key !~ '^([1-9]|1[0-2])$' or jsonb_typeof(item.value)is distinct from 'number' or (item.value#>>'{}') !~ '^[1-9][0-9]{0,6}$' then return false; end if;
  end loop;
  if jsonb_typeof(value->'progress'->'notes')is distinct from 'object' then return false; end if;
  for item in select * from jsonb_each(value->'progress'->'notes') loop
    if item.key !~ '^([1-9]|1[0-2])-[1-6]$' or jsonb_typeof(item.value)is distinct from 'string' or length(item.value#>>'{}')>5000 then return false; end if;
  end loop;
  if jsonb_typeof(value->'progress'->'checkins')is distinct from 'array' or jsonb_array_length(value->'progress'->'checkins')>36600 then return false; end if;
  for element in select * from jsonb_array_elements(value->'progress'->'checkins') loop
    d:=element#>>'{}';
    if jsonb_typeof(element)is distinct from 'string' or d !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or d::date::text<>d or extract(year from d::date)<1900 then return false; end if;
  end loop;
  -- A user has exactly one save row; dates inside that row must also be unique.
  if (select count(*)<>count(distinct e) from jsonb_array_elements(value->'progress'->'checkins') e) then return false; end if;
  if jsonb_typeof(value->'progress'->'dailyRead')is distinct from 'object' then return false; end if;
  for item in select * from jsonb_each(value->'progress'->'dailyRead') loop
    d:=item.key;
    if d !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or d::date::text<>d or jsonb_typeof(item.value)is distinct from 'array' or jsonb_array_length(item.value)>72 then return false; end if;
    for element in select * from jsonb_array_elements(item.value) loop
      if jsonb_typeof(element)is distinct from 'string' or (element#>>'{}') !~ '^([1-9]|1[0-2])-[1-6]$' then return false; end if;
    end loop;
  end loop;
  foreach field in array array['notes','bookmarks'] loop
    if jsonb_typeof(value->'clocks'->field)is distinct from 'object' then return false; end if;
    for item in select * from jsonb_each(value->'clocks'->field) loop
      if item.key !~ '^([1-9]|1[0-2])-[1-6]$' or jsonb_typeof(item.value)is distinct from 'string' or (item.value#>>'{}') !~ '^[0-9]{16}:[a-zA-Z0-9-]{1,64}$' then return false; end if;
    end loop;
  end loop;
  return true;
exception when others then return false;
end;
$$;

create table public.algo_quest_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  document jsonb not null check (public.algo_quest_valid_document(document)),
  revision bigint not null default 1 check (revision>0),
  updated_at timestamptz not null default now()
);

alter table public.algo_quest_saves enable row level security;
alter table public.algo_quest_saves force row level security;
revoke all on public.algo_quest_saves from anon, authenticated;
grant select, insert, update on public.algo_quest_saves to authenticated;

create policy "Read own algorithm save" on public.algo_quest_saves for select to authenticated using ((select auth.uid())=user_id);
create policy "Create own algorithm save" on public.algo_quest_saves for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Update own algorithm save" on public.algo_quest_saves for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create function public.algo_quest_save_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP='UPDATE' then NEW.revision:=OLD.revision+1; else NEW.revision:=1; end if;
  NEW.updated_at:=now();return NEW;
end;
$$;
create trigger algo_quest_save_revision before insert or update on public.algo_quest_saves for each row execute function public.algo_quest_save_revision();
revoke all on function public.algo_quest_save_revision() from public,anon,authenticated;
revoke all on function public.algo_quest_valid_document(jsonb) from public,anon;
grant execute on function public.algo_quest_valid_document(jsonb) to authenticated;

commit;
