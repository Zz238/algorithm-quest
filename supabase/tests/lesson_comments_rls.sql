-- Rollback-only integration test. No public comment survives this transaction.
begin;
insert into auth.users(id,aud,role,raw_user_meta_data) values
('7a45ce15-1031-4fff-883e-a225cda0a001','authenticated','authenticated','{"user_name":"qa-learner-a"}'),
('7a45ce15-1031-4fff-883e-a225cda0a002','authenticated','authenticated','{"user_name":"qa-learner-b"}');
set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='7a45ce15-1031-4fff-883e-a225cda0a001';
select public.algo_quest_post_comment('7a45ce15-1031-4fff-883e-a225cda0b001','12-6','事务内的公开笔记测试');
do $$
declare v jsonb; denied boolean:=false;
begin
 v:=public.algo_quest_post_comment('7a45ce15-1031-4fff-883e-a225cda0b001','12-6','事务内的公开笔记测试');
 if v->>'author_name'<>'qa-learner-a' or not (v->>'is_mine')::boolean or v?'author_id' then raise exception 'Author identity or redaction failed';end if;
 if (select count(*) from jsonb_array_elements(public.algo_quest_list_comments('12-6')->'items') i where i->>'id'='7a45ce15-1031-4fff-883e-a225cda0b001')<>1 then raise exception 'Idempotent retry duplicated a note';end if;
 begin perform public.algo_quest_post_comment(gen_random_uuid(),'12-6','Too fast');
 exception when raise_exception then if SQLERRM not like '发送太快%' then raise;end if;denied:=true;end;
 if not denied then raise exception 'Rate limit missing';end if;
 denied:=false;
 begin perform public.algo_quest_post_comment(gen_random_uuid(),'12-6',E' \n\t ');
 exception when invalid_parameter_value then denied:=true;end;
 if not denied then raise exception 'Whitespace comment accepted';end if;
 denied:=false;
 begin perform public.algo_quest_post_comment(gen_random_uuid(),'13-1','bad lesson');
 exception when invalid_parameter_value then denied:=true;end;
 if not denied then raise exception 'Invalid lesson accepted';end if;
 denied:=false;
 begin perform public.algo_quest_post_comment(gen_random_uuid(),'12-6',repeat('字',2001));
 exception when invalid_parameter_value then denied:=true;end;
 if not denied then raise exception 'Oversized body accepted';end if;
 denied:=false;
 begin perform count(*) from public.algo_quest_comments;
 exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Private author IDs are directly readable';end if;
end;$$;
set local request.jwt.claim.sub='7a45ce15-1031-4fff-883e-a225cda0a002';
do $$ declare v jsonb;begin
 if public.algo_quest_withdraw_comment('7a45ce15-1031-4fff-883e-a225cda0b001') then raise exception 'Another user withdrew the note';end if;
 select i into v from jsonb_array_elements(public.algo_quest_list_comments('12-6')->'items') i where i->>'id'='7a45ce15-1031-4fff-883e-a225cda0b001';
 if (v->>'is_mine')::boolean then raise exception 'Incorrect owner flag';end if;
end;$$;
set local role anon;
set local request.jwt.claim.role='anon';
set local request.jwt.claim.sub='';
do $$ declare v jsonb;denied boolean:=false;begin
 select i into v from jsonb_array_elements(public.algo_quest_list_comments('12-6')->'items') i where i->>'id'='7a45ce15-1031-4fff-883e-a225cda0b001';
 if v is null or v?'author_id' or v?'email' or (v->>'is_mine')::boolean then raise exception 'Anonymous public output is incorrect';end if;
 if (select revision from public.algo_quest_comment_signals where lesson_id='12-6')<1 then raise exception 'Realtime signal was not updated';end if;
 begin perform public.algo_quest_post_comment(gen_random_uuid(),'12-6','anonymous');
 exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Anonymous post was allowed';end if;
 if has_table_privilege('anon','public.algo_quest_saves','SELECT') then raise exception 'Private learning saves were exposed';end if;
end;$$;
set local role authenticated;
set local request.jwt.claim.role='authenticated';
set local request.jwt.claim.sub='7a45ce15-1031-4fff-883e-a225cda0a001';
do $$ begin
 if not public.algo_quest_withdraw_comment('7a45ce15-1031-4fff-883e-a225cda0b001') then raise exception 'Owner cannot withdraw';end if;
 if exists(select 1 from jsonb_array_elements(public.algo_quest_list_comments('12-6')->'items') i where i->>'id'='7a45ce15-1031-4fff-883e-a225cda0b001') then raise exception 'Withdrawn note remains public';end if;
end;$$;
reset role;
do $$ begin
 if not exists(select 1 from public.algo_quest_comments where id='7a45ce15-1031-4fff-883e-a225cda0b001' and withdrawn_at is not null) then raise exception 'Withdrawal must preserve the private record';end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='algo_quest_comment_signals') then raise exception 'Realtime publication missing';end if;
end;$$;
insert into public.algo_quest_comments(id,lesson_id,author_id,author_name,body,created_at)
select gen_random_uuid(),'12-5','7a45ce15-1031-4fff-883e-a225cda0a002','qa-learner-b','pagination-'||n,now()-interval '1 day'+n*interval '1 minute' from generate_series(1,21) n;
do $$ declare v jsonb;begin
 v:=public.algo_quest_list_comments('12-5','newest',0);
 if jsonb_array_length(v->'items')<>20 or v->'items'->0->>'body'<>'pagination-21' then raise exception 'Newest ordering or page size incorrect';end if;
 v:=public.algo_quest_list_comments('12-5','newest',20);
 if jsonb_array_length(v->'items')<>1 then raise exception 'Second page incorrect';end if;
 v:=public.algo_quest_list_comments('12-5','oldest',0);
 if v->'items'->0->>'body'<>'pagination-1' then raise exception 'Oldest ordering incorrect';end if;
end;$$;
rollback;
select 'PASS: public reads, authenticated writes, trusted author, no private IDs, idempotency, rate limits, validation, owner-only soft withdrawal and realtime signals. All fixtures rolled back.' as result;
