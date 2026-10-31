-- Public lesson discussions are separate from private learning saves.
begin;
create table public.algo_quest_comments (
  id uuid primary key,
  lesson_id text not null check (lesson_id ~ '^([1-9]|1[0-2])-[1-6]$'),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  withdrawn_at timestamptz
);
create index algo_quest_comments_lesson on public.algo_quest_comments(lesson_id,created_at desc,id desc) where withdrawn_at is null;
create index algo_quest_comments_author on public.algo_quest_comments(author_id,created_at desc);
alter table public.algo_quest_comments enable row level security;
alter table public.algo_quest_comments force row level security;
revoke all on public.algo_quest_comments from public,anon,authenticated;

-- Realtime only exposes a lesson number and revision, never account IDs or private saves.
create table public.algo_quest_comment_signals (
  lesson_id text primary key check (lesson_id ~ '^([1-9]|1[0-2])-[1-6]$'),
  revision bigint not null default 0
);
insert into public.algo_quest_comment_signals(lesson_id)
select chapter::text||'-'||lesson::text from generate_series(1,12) chapter cross join generate_series(1,6) lesson;
alter table public.algo_quest_comment_signals enable row level security;
alter table public.algo_quest_comment_signals force row level security;
revoke all on public.algo_quest_comment_signals from public,anon,authenticated;
grant select on public.algo_quest_comment_signals to anon,authenticated;
create policy "Read public discussion revisions" on public.algo_quest_comment_signals for select to anon,authenticated using (true);

create function public.algo_quest_comment_json(c public.algo_quest_comments)
returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('id',c.id,'lesson_id',c.lesson_id,'author_name',c.author_name,
 'body',c.body,'created_at',c.created_at,'is_mine',coalesce(c.author_id=auth.uid(),false));
$$;
revoke all on function public.algo_quest_comment_json(public.algo_quest_comments) from public,anon,authenticated;

create function public.algo_quest_list_comments(p_lesson text,p_order text default 'newest',p_offset integer default 0)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare items jsonb; total bigint;
begin
 if p_lesson is null or p_lesson !~ '^([1-9]|1[0-2])-[1-6]$' or p_order not in ('newest','oldest') or p_order is null
 or p_offset is null or p_offset<0 or p_offset>100000 then raise exception using errcode='22023',message='无效的评论查询。';end if;
 select count(*) into total from public.algo_quest_comments where lesson_id=p_lesson and withdrawn_at is null;
 select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'lesson_id',c.lesson_id,'author_name',c.author_name,
  'body',c.body,'created_at',c.created_at,'is_mine',coalesce(c.author_id=auth.uid(),false))),'[]'::jsonb) into items from (
  select * from public.algo_quest_comments where lesson_id=p_lesson and withdrawn_at is null
  order by case when p_order='oldest' then created_at end asc,case when p_order='newest' then created_at end desc,
  case when p_order='oldest' then id end asc,case when p_order='newest' then id end desc
  limit 20 offset p_offset
 ) c;
 return jsonb_build_object('items',items,'total',total);
end;$$;
revoke all on function public.algo_quest_list_comments(text,text,integer) from public;
grant execute on function public.algo_quest_list_comments(text,text,integer) to anon,authenticated;

create function public.algo_quest_post_comment(p_id uuid,p_lesson text,p_body text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); text_body text:=btrim(p_body,E' \t\n\r'); label text; existing public.algo_quest_comments; saved public.algo_quest_comments;
begin
 if actor is null or auth.role() is distinct from 'authenticated' then raise exception using errcode='42501',message='请先登录再发送笔记。';end if;
 if p_id is null or p_lesson is null or p_lesson !~ '^([1-9]|1[0-2])-[1-6]$' or text_body is null
 or char_length(text_body) not between 1 and 2000 or text_body !~ '[^[:space:]]' then raise exception using errcode='22023',message='请输入1至2000个字符的笔记。';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select * into existing from public.algo_quest_comments where id=p_id;
 if found then
  if existing.author_id<>actor or existing.lesson_id<>p_lesson or existing.body<>text_body then raise exception using errcode='22023',message='发送标识已使用，请重新编辑后发送。';end if;
  if existing.withdrawn_at is not null then raise exception '该笔记已撤回，请重新编辑后发送。';end if;
  return public.algo_quest_comment_json(existing);
 end if;
 if exists(select 1 from public.algo_quest_comments where author_id=actor and created_at>now()-interval '10 seconds')
 or (select count(*) from public.algo_quest_comments where author_id=actor and created_at>now()-interval '1 hour')>=50
 then raise exception using errcode='P0001',message='发送太快了，请稍后再试。';end if;
 select coalesce(raw_user_meta_data->>'user_name',raw_user_meta_data->>'preferred_username') into label from auth.users where id=actor;
 if label is null or label !~ '^[A-Za-z0-9][A-Za-z0-9-]{0,38}$' then label:='学习者';end if;
 insert into public.algo_quest_comments(id,lesson_id,author_id,author_name,body)
 values(p_id,p_lesson,actor,label,text_body) returning * into saved;
 return public.algo_quest_comment_json(saved);
end;$$;
revoke all on function public.algo_quest_post_comment(uuid,text,text) from public,anon;
grant execute on function public.algo_quest_post_comment(uuid,text,text) to authenticated;

create function public.algo_quest_withdraw_comment(p_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null or auth.role() is distinct from 'authenticated' then raise exception using errcode='42501',message='请先登录。';end if;
 update public.algo_quest_comments set withdrawn_at=now() where id=p_id and author_id=actor and withdrawn_at is null;
 return found;
end;$$;
revoke all on function public.algo_quest_withdraw_comment(uuid) from public,anon;
grant execute on function public.algo_quest_withdraw_comment(uuid) to authenticated;

create function public.algo_quest_signal_comment_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.algo_quest_comment_signals set revision=revision+1 where lesson_id=NEW.lesson_id;
 return NEW;
end;$$;
revoke all on function public.algo_quest_signal_comment_change() from public,anon,authenticated;
create trigger algo_quest_comment_changed after insert or update of withdrawn_at on public.algo_quest_comments
for each row execute function public.algo_quest_signal_comment_change();
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime')
 and not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='algo_quest_comment_signals')
 then alter publication supabase_realtime add table public.algo_quest_comment_signals;end if;
end;$$;
commit;
