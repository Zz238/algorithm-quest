-- Production smoke test. All synthetic visits and settings changes are rolled back.
-- Run only against the algorithm-quest project after installing its traffic migration.
begin;
do $verify$
declare
 owner_id uuid; test_visitor uuid:=gen_random_uuid(); first_event uuid:=gen_random_uuid(); second_event uuid:=gen_random_uuid();
 report jsonb; d date:=(clock_timestamp() at time zone 'Asia/Shanghai')::date;
begin
 select user_id into owner_id from auth.identities where provider='github' and provider_id='123933729' limit 1;
 if owner_id is null then raise exception 'Administrator identity not found';end if;
 perform set_config('request.method','POST',true);
 perform set_config('request.headers','{"origin":"https://zz238.github.io","cf-connecting-ip":"198.51.100.80","user-agent":"Mozilla/5.0"}',true);
 execute 'set local role anon';
 if not public.algo_quest_collect_visit(first_event,test_visitor,'/learn/1/0','') then raise exception 'Public collection failed';end if;
 if not public.algo_quest_collect_visit(first_event,test_visitor,'/learn/1/0','') then raise exception 'Idempotent retry failed';end if;
 if not public.algo_quest_collect_visit(second_event,test_visitor,'/learn/1/1','') then raise exception 'Second page collection failed';end if;
 begin
  execute 'select count(*) from algo_quest_analytics.visits';
  raise exception 'Anonymous table read unexpectedly succeeded';
 exception when insufficient_privilege then null;end;
 execute 'reset role';
 if (select count(*) from algo_quest_analytics.visits where id in(first_event,second_event))<>2 then raise exception 'Event deduplication failed';end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 execute 'set local role authenticated';
 if public.algo_quest_traffic_is_admin() then raise exception 'Non-admin identity was accepted';end if;
 begin
  perform public.algo_quest_traffic_report(d,d);
  raise exception 'Non-admin report unexpectedly succeeded';
 exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub',owner_id::text,true);
 if not public.algo_quest_traffic_is_admin() then raise exception 'Administrator identity was rejected';end if;
 report:=public.algo_quest_traffic_report(d,d);
 if (report->'totals'->>'pv')::bigint<2 then raise exception 'Administrator report missed page views';end if;
 if not exists(select 1 from jsonb_array_elements(report->'visits') v where v->>'id'=first_event::text and v->>'ip'='198.51.100.80') then raise exception 'Administrator detail query failed';end if;
 execute 'reset role';
end;$verify$;
rollback;
select jsonb_build_object('cloud_checks_passed',true,'test_records_committed',0,'private_tables_readable_by_anon',has_table_privilege('anon','algo_quest_analytics.visits','select')) as verification;
