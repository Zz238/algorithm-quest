-- All test identities and rows are rolled back; no emails or credentials are created.
begin;
insert into auth.users(id,aud,role) values
('7a45ce15-8881-4fff-883e-a225cda0a001','authenticated','authenticated'),
('7a45ce15-8881-4fff-883e-a225cda0a002','authenticated','authenticated');
select set_config('algo_quest.test_document', $doc${"schema": 1, "progress": {"version": 1, "lessons": ["1-1"], "mastery": [], "bosses": [], "bossTasks": {}, "notes": {"1-1": "A private note"}, "bookmarks": [], "checkins": ["2026-10-28"], "dailyRead": {}}, "clocks": {"notes": {"1-1": "0001761700000000:qa"}, "bookmarks": {}}}$doc$, true);
set local role authenticated;
set local request.jwt.claim.sub='7a45ce15-8881-4fff-883e-a225cda0a001';
set local request.jwt.claim.role='authenticated';
insert into public.algo_quest_saves(user_id,document) values (auth.uid(),current_setting('algo_quest.test_document')::jsonb);
do $$
declare denied boolean:=false; changed integer;
begin
 if (select count(*) from public.algo_quest_saves)<>1 then raise exception 'Own save cannot be read';end if;
 begin
  insert into public.algo_quest_saves(user_id,document) values ('7a45ce15-8881-4fff-883e-a225cda0a002',current_setting('algo_quest.test_document')::jsonb);
 exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Cross-account insert was allowed';end if;
 update public.algo_quest_saves set document=document where user_id=auth.uid() and revision=1;
 if (select revision from public.algo_quest_saves where user_id=auth.uid())<>2 then raise exception 'Revision did not advance';end if;
 update public.algo_quest_saves set document=document where user_id=auth.uid() and revision=1;
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'A stale revision overwrote a new save';end if;
 if public.algo_quest_valid_document('{}'::jsonb) then raise exception 'Missing fields were accepted';end if;
 if public.algo_quest_valid_document(jsonb_set(current_setting('algo_quest.test_document')::jsonb,'{progress,checkins}','["2026-10-28","2026-10-28"]'::jsonb)) then raise exception 'Duplicate check-in accepted';end if;
 if public.algo_quest_valid_document(jsonb_set(current_setting('algo_quest.test_document')::jsonb,'{progress,checkins}','["2026-02-30"]'::jsonb)) then raise exception 'Invalid date accepted';end if;
 denied:=false;
 begin
  update public.algo_quest_saves set document=jsonb_set(document,'{progress,checkins}','["2026-10-28","2026-10-28"]'::jsonb) where user_id=auth.uid();
 exception when check_violation then denied:=true;end;
 if not denied then raise exception 'The database constraint allowed duplicate dates';end if;
 if has_table_privilege('authenticated','public.algo_quest_saves','DELETE') then raise exception 'Unneeded delete privilege';end if;
end;$$;
set local request.jwt.claim.sub='7a45ce15-8881-4fff-883e-a225cda0a002';
do $$
declare changed integer;
begin
 if (select count(*) from public.algo_quest_saves)<>0 then raise exception 'Another user can read the private save';end if;
 update public.algo_quest_saves set document=document where user_id='7a45ce15-8881-4fff-883e-a225cda0a001';
 get diagnostics changed=row_count;
 if changed<>0 then raise exception 'Another user can update the private save';end if;
end;$$;
set local role anon;
set local request.jwt.claim.sub='';
set local request.jwt.claim.role='anon';
do $$
declare denied boolean:=false;
begin
 begin perform count(*) from public.algo_quest_saves;
 exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'An unauthenticated visitor could read saves';end if;
end;$$;
rollback;
select 'PASS: own save, account isolation, anonymous denial, revision checks, date validation and duplicate-day constraint; fixtures rolled back' as result;
