-- 仅在本机独立测试数据库使用；全部样例为合成数据。
begin;
create temporary table learning_records (
 user_id integer not null,
 lesson text not null,
 completed boolean not null default false,
 primary key(user_id, lesson)
);
insert into learning_records values (7,'arrays',true),(7,'hash',false),(8,'arrays',false);
-- 任务1：仅查询用户7的已完成课程。预期只有 arrays。
select lesson from learning_records where user_id=7 and completed=true order by lesson;
-- 任务2：每位用户完成数量，预期 (7,1)、(8,0)。
select user_id, count(*) filter(where completed) as done from learning_records group by user_id order by user_id;
-- 任务3：重复键以更新方式处理，不产生第二条记录。
insert into learning_records values (7,'arrays',false)
 on conflict(user_id,lesson) do update set completed=excluded.completed;
-- 任务4：保存点后修改，再回滚这次修改。
savepoint before_hash;
update learning_records set completed=true where user_id=7 and lesson='hash';
rollback to before_hash;
-- 预期 false。
select completed from learning_records where user_id=7 and lesson='hash';
rollback;
