-- Traffic data is isolated from accounts, learning saves and public discussions.
begin;
create schema if not exists algo_quest_analytics;
revoke all on schema algo_quest_analytics from public,anon,authenticated;

create table algo_quest_analytics.settings (
 id boolean primary key default true check(id),
 salt uuid not null default gen_random_uuid(),
 last_cleanup timestamptz not null default '-infinity'
);
insert into algo_quest_analytics.settings(id) values(true);
create table algo_quest_analytics.pages (
 path text primary key, title text not null, chapter integer, chapter_title text
);
insert into algo_quest_analytics.pages(path,title,chapter,chapter_title) values
 ('/','课程目录',null,null),
 ('/glossary','术语手册',null,null),
 ('/progress','学习记录',null,null),
 ('/account','账号与云存档',null,null),
 ('/login','登录',null,null),
 ('/privacy','隐私说明',null,null),
 ('/learn/1/0','算法、输入与输出：先说清要解决什么',1,'程序与算法'),
 ('/learn/1/1','数据和位置：认识一排有编号的格子',1,'程序与算法'),
 ('/learn/1/2','执行顺序与状态：计算机会按哪一步走',1,'程序与算法'),
 ('/learn/1/3','快慢怎么比较：从数操作次数开始',1,'程序与算法'),
 ('/learn/1/4','手动累计：为什么下一步要接着旧结果算',1,'程序与算法'),
 ('/learn/1/5','回顾与边界：怎样知道办法真的可用',1,'程序与算法'),
 ('/boss/1','章节练习 · 一维数组的动态和',1,'程序与算法'),
 ('/learn/2/0','Java 程序入口：从 main 走到输出',2,'Java 识字课'),
 ('/learn/2/1','变量与类型：名字保存什么，值怎样更新',2,'Java 识字课'),
 ('/learn/2/2','赋值、比较与逻辑：分清 = 和 ==',2,'Java 识字课'),
 ('/learn/2/3','方法与返回值：把输入交进去，把结果拿回来',2,'Java 识字课'),
 ('/learn/2/4','把数组写成 Java：先会创建、再会读表达式',2,'Java 识字课'),
 ('/learn/2/5','阅读与改写：把一小段程序完整说出来',2,'Java 识字课'),
 ('/boss/2','章节练习 · 两数相加',2,'Java 识字课'),
 ('/learn/3/0','if 与 else：只有一个分支会怎样改变状态',3,'变量、判断与循环'),
 ('/learn/3/1','for 循环：初始化、判断、执行、更新',3,'变量、判断与循环'),
 ('/learn/3/2','while 与终止：循环怎样走到结束',3,'变量、判断与循环'),
 ('/learn/3/3','相邻访问的边界：i++ 与 i+1 各做什么',3,'变量、判断与循环'),
 ('/learn/3/4','跟踪表：把循环每一轮说清楚',3,'变量、判断与循环'),
 ('/learn/3/5','整数运算与条件回顾：先拆开，再组合',3,'变量、判断与循环'),
 ('/boss/3','章节练习 · 把数字变成零',3,'变量、判断与循环'),
 ('/learn/4/0','数组基础：长度、下标、访问与查找',4,'数组、字符串与查找'),
 ('/learn/4/1','下标小实验：a[i+1] 先算哪里，再读什么',4,'数组、字符串与查找'),
 ('/learn/4/2','修改、移动与复制：一条赋值不会完成交换',4,'数组、字符串与查找'),
 ('/learn/4/3','字符串与双指针：从两端检查回文',4,'数组、字符串与查找'),
 ('/learn/4/4','顺序查找：返回位置，并说明什么时候失败',4,'数组、字符串与查找'),
 ('/learn/4/5','二分查找：有序性让我们安全排除一半',4,'数组、字符串与查找'),
 ('/boss/4','章节练习 · 二分查找',4,'数组、字符串与查找'),
 ('/learn/5/0','排序先学目标：什么叫排好了',5,'排序基础：交换、冒泡与插入'),
 ('/learn/5/1','只练交换：temp 为什么不能省',5,'排序基础：交换、冒泡与插入'),
 ('/learn/5/2','冒泡排序：先走完一轮相邻比较',5,'排序基础：交换、冒泡与插入'),
 ('/learn/5/3','插入排序：拿起、右移、回填，一条一条看',5,'排序基础：交换、冒泡与插入'),
 ('/learn/5/4','回顾与对比：冒泡交换，插入移动',5,'排序基础：交换、冒泡与插入'),
 ('/learn/5/5','排序应用：为什么身高检查不是数交换次数',5,'排序基础：交换、冒泡与插入'),
 ('/boss/5','章节练习 · 高度检查器',5,'排序基础：交换、冒泡与插入'),
 ('/learn/6/0','先认识引用：一个名字怎样找到一个对象',6,'链表、栈与队列'),
 ('/learn/6/1','链表结点：数据加一个next箭头',6,'链表、栈与队列'),
 ('/learn/6/2','链表插入：先接新结点的后半段',6,'链表、栈与队列'),
 ('/learn/6/3','栈：最近放进去的，要先拿出来',6,'链表、栈与队列'),
 ('/learn/6/4','队列：排队顺序与双端操作',6,'链表、栈与队列'),
 ('/learn/6/5','括号匹配：把栈的规则用到一整道题',6,'链表、栈与队列'),
 ('/boss/6','章节练习 · 有效的括号',6,'链表、栈与队列'),
 ('/learn/7/0','键与值：用一个名字查一条记录',7,'哈希表与快速定位'),
 ('/learn/7/1','计数表：从默认0开始累计',7,'哈希表与快速定位'),
 ('/learn/7/2','Set去重：只问出现过，不必数几次',7,'哈希表与快速定位'),
 ('/learn/7/3','两数之和：把配对变成查找搭档',7,'哈希表与快速定位'),
 ('/learn/7/4','哈希碰撞：快查找也有前提和成本',7,'哈希表与快速定位'),
 ('/learn/7/5','先查还是先写：用重复值验证表的含义',7,'哈希表与快速定位'),
 ('/boss/7','章节练习 · 两数之和',7,'哈希表与快速定位'),
 ('/learn/8/0','递归：先有停止条件，再缩小问题',8,'递归、分治与回溯'),
 ('/learn/8/1','调用栈：一层返回后，回到哪一条',8,'递归、分治与回溯'),
 ('/learn/8/2','分治与归并：拆小、分别排好、再合并',8,'递归、分治与回溯'),
 ('/learn/8/3','回溯：做选择、往下走、回来撤销',8,'递归、分治与回溯'),
 ('/learn/8/4','子集与start：避免把同一组合走两次',8,'递归、分治与回溯'),
 ('/learn/8/5','选学：快速排序的分区，不急着和归并一起背',8,'递归、分治与回溯'),
 ('/boss/8','章节练习 · 子集',8,'递归、分治与回溯'),
 ('/learn/9/0','先画一棵树：根、孩子、叶子与空位置',9,'树、二叉搜索树与堆'),
 ('/learn/9/1','树的深度：先问左右孩子，再加当前这一层',9,'树、二叉搜索树与堆'),
 ('/learn/9/2','遍历顺序：先只练前序，再与中后序对照',9,'树、二叉搜索树与堆'),
 ('/learn/9/3','层序遍历：一层的队列长度要先记下来',9,'树、二叉搜索树与堆'),
 ('/learn/9/4','二叉搜索树：关系约束覆盖整个子树',9,'树、二叉搜索树与堆'),
 ('/learn/9/5','选学：堆与优先队列，先取最小不等于全部有序',9,'树、二叉搜索树与堆'),
 ('/boss/9','章节练习 · 二叉树的最大深度',9,'树、二叉搜索树与堆'),
 ('/learn/10/0','图的基本语言：顶点、边、方向与权重',10,'图、搜索与路径'),
 ('/learn/10/1','把图存起来：邻接表逐项读给你看',10,'图、搜索与路径'),
 ('/learn/10/2','BFS：发现就标记，用队列保存下一批',10,'图、搜索与路径'),
 ('/learn/10/3','DFS：沿一条路深入，结束后返回',10,'图、搜索与路径'),
 ('/learn/10/4','网格染色：这份程序使用BFS连接同色区域',10,'图、搜索与路径'),
 ('/learn/10/5','选学：非负权最短路，Dijkstra为何先处理最近的点',10,'图、搜索与路径'),
 ('/boss/10','章节练习 · 图像渲染',10,'图、搜索与路径'),
 ('/learn/11/0','贪心：先找反例，再问局部选择是否可靠',11,'贪心与动态规划'),
 ('/learn/11/1','动态规划起步：先写dp[i]到底是什么意思',11,'贪心与动态规划'),
 ('/learn/11/2','记忆化：把算过的小问题答案留下来',11,'贪心与动态规划'),
 ('/learn/11/3','从整张表到两个变量：更新顺序为什么重要',11,'贪心与动态规划'),
 ('/learn/11/4','DP回顾：含义、初值、转移、顺序、验证',11,'贪心与动态规划'),
 ('/learn/11/5','选学：0/1背包，倒序是为了不重复拿同一件',11,'贪心与动态规划'),
 ('/boss/11','章节练习 · 爬楼梯',11,'贪心与动态规划'),
 ('/learn/12/0','独立读题：输入、输出、限制和合法操作',12,'综合挑战与独立解题'),
 ('/learn/12/1','先做慢的正确办法，再与一次扫描对照',12,'综合挑战与独立解题'),
 ('/learn/12/2','不变式：min和best怎样代表所有过去方案',12,'综合挑战与独立解题'),
 ('/learn/12/3','测试设计：最小、重复、下降与极端',12,'综合挑战与独立解题'),
 ('/learn/12/4','完整题解：从自己的思路走到可执行答案',12,'综合挑战与独立解题'),
 ('/learn/12/5','基础路线总回顾：看到新题先做哪些选择',12,'综合挑战与独立解题'),
 ('/boss/12','章节练习 · 买卖股票的最佳时机',12,'综合挑战与独立解题');
create table algo_quest_analytics.visits (
 id uuid primary key, visited_at timestamptz not null default clock_timestamp(),
 day date not null, path text not null references algo_quest_analytics.pages(path),
 ip inet, source text not null default ''
);
create index traffic_visits_time on algo_quest_analytics.visits(visited_at desc,id desc);
create index traffic_visits_path on algo_quest_analytics.visits(path,visited_at desc,id desc);
create table algo_quest_analytics.daily (
 day date primary key, pv bigint not null default 0, uv bigint not null default 0
);
create table algo_quest_analytics.page_daily (
 day date not null, path text not null references algo_quest_analytics.pages(path),
 pv bigint not null default 0, uv bigint not null default 0, primary key(day,path)
);
create table algo_quest_analytics.chapter_daily (
 day date not null, chapter integer not null, pv bigint not null default 0,
 uv bigint not null default 0, primary key(day,chapter)
);
create table algo_quest_analytics.uniques (
 day date not null, scope text not null, visitor text not null, primary key(day,scope,visitor)
);
create table algo_quest_analytics.rate_limits (
 bucket timestamptz not null, key text not null, hits integer not null, primary key(bucket,key)
);
alter table algo_quest_analytics.settings enable row level security;
alter table algo_quest_analytics.pages enable row level security;
alter table algo_quest_analytics.visits enable row level security;
alter table algo_quest_analytics.daily enable row level security;
alter table algo_quest_analytics.page_daily enable row level security;
alter table algo_quest_analytics.chapter_daily enable row level security;
alter table algo_quest_analytics.uniques enable row level security;
alter table algo_quest_analytics.rate_limits enable row level security;
revoke all on all tables in schema algo_quest_analytics from public,anon,authenticated;

create function algo_quest_analytics.cleanup()
returns void language plpgsql security definer set search_path='' as $$
begin
 update algo_quest_analytics.settings set last_cleanup=clock_timestamp()
 where id and last_cleanup<clock_timestamp()-interval '1 hour';
 if not found then return;end if;
 delete from algo_quest_analytics.visits where visited_at<clock_timestamp()-interval '30 days';
 delete from algo_quest_analytics.daily where day<(clock_timestamp() at time zone 'Asia/Shanghai')::date-364;
 delete from algo_quest_analytics.page_daily where day<(clock_timestamp() at time zone 'Asia/Shanghai')::date-364;
 delete from algo_quest_analytics.chapter_daily where day<(clock_timestamp() at time zone 'Asia/Shanghai')::date-364;
 delete from algo_quest_analytics.uniques where day<(clock_timestamp() at time zone 'Asia/Shanghai')::date-1;
 delete from algo_quest_analytics.rate_limits where bucket<clock_timestamp()-interval '2 minutes';
end;$$;
revoke all on function algo_quest_analytics.cleanup() from public,anon,authenticated;

create function public.algo_quest_collect_visit(p_event uuid,p_visitor uuid,p_path text,p_source text default '')
returns boolean language plpgsql security definer set search_path='' as $$
declare
 headers jsonb:=coalesce(nullif(current_setting('request.headers',true),''),'{}')::jsonb;
 stamp timestamptz:=clock_timestamp(); d date:=(clock_timestamp() at time zone 'Asia/Shanghai')::date;
 remote_ip inet; secret uuid; visitor_hash text; ip_hash text; inserted uuid;
 is_new integer:=0; page_new integer:=0; chapter_new integer:=0; ch integer; consumed integer;
 minute_bucket timestamptz:=date_trunc('minute',clock_timestamp());
begin
 if current_setting('request.method',true) is distinct from 'POST'
 or headers->>'origin' is distinct from 'https://zz238.github.io' then return false;end if;
 if p_event is null or p_visitor is null or p_path is null or char_length(p_path)>100
 or p_source is null or char_length(p_source)>255
 or (p_source<>'' and p_source !~ '^https?://[A-Za-z0-9.-]+(:[0-9]{1,5})?$')
 then return false;end if;
 if coalesce(headers->>'user-agent','') ~* '(bot|spider|crawler|headless|lighthouse|preview)' then return false;end if;
 select chapter into ch from algo_quest_analytics.pages where path=p_path;
 if not found then return false;end if;
 -- Supabase Platform overwrites CF-Connecting-IP. Never accept IPs supplied in the request body
 -- or fall back to an untrusted, client-prepended X-Forwarded-For value.
 begin remote_ip:=nullif(headers->>'cf-connecting-ip','')::inet;exception when invalid_text_representation then return false;end;
 if remote_ip is null or masklen(remote_ip)<>(case family(remote_ip) when 4 then 32 else 128 end) then return false;end if;
 if exists(select 1 from algo_quest_analytics.visits where id=p_event) then return true;end if;
 perform algo_quest_analytics.cleanup();
 select salt into secret from algo_quest_analytics.settings where id;
 visitor_hash:=encode(sha256(convert_to(secret::text||d::text||p_visitor::text,'UTF8')),'hex');
 ip_hash:=encode(sha256(convert_to(secret::text||d::text||host(remote_ip),'UTF8')),'hex');
 insert into algo_quest_analytics.rate_limits(bucket,key,hits) values(minute_bucket,'ip:'||ip_hash,1)
 on conflict(bucket,key) do update set hits=algo_quest_analytics.rate_limits.hits+1 where algo_quest_analytics.rate_limits.hits<120
 returning hits into consumed;
 if not found then return false;end if;
 insert into algo_quest_analytics.rate_limits(bucket,key,hits) values(minute_bucket,'visitor:'||visitor_hash,1)
 on conflict(bucket,key) do update set hits=algo_quest_analytics.rate_limits.hits+1 where algo_quest_analytics.rate_limits.hits<30
 returning hits into consumed;
 if not found then return false;end if;
 insert into algo_quest_analytics.visits(id,visited_at,day,path,ip,source) values(p_event,stamp,d,p_path,remote_ip,p_source)
 on conflict(id) do nothing returning id into inserted;
 if inserted is null then return true;end if;
 insert into algo_quest_analytics.uniques(day,scope,visitor) values(d,'site',visitor_hash) on conflict do nothing;
 get diagnostics is_new=row_count;
 insert into algo_quest_analytics.daily(day,pv,uv) values(d,1,is_new)
 on conflict(day) do update set pv=algo_quest_analytics.daily.pv+1,uv=algo_quest_analytics.daily.uv+excluded.uv;
 insert into algo_quest_analytics.uniques(day,scope,visitor) values(d,p_path,visitor_hash) on conflict do nothing;
 get diagnostics page_new=row_count;
 insert into algo_quest_analytics.page_daily(day,path,pv,uv) values(d,p_path,1,page_new)
 on conflict(day,path) do update set pv=algo_quest_analytics.page_daily.pv+1,uv=algo_quest_analytics.page_daily.uv+excluded.uv;
 if ch is not null then
  insert into algo_quest_analytics.uniques(day,scope,visitor) values(d,'chapter:'||ch::text,visitor_hash) on conflict do nothing;
  get diagnostics chapter_new=row_count;
  insert into algo_quest_analytics.chapter_daily(day,chapter,pv,uv) values(d,ch,1,chapter_new)
  on conflict(day,chapter) do update set pv=algo_quest_analytics.chapter_daily.pv+1,uv=algo_quest_analytics.chapter_daily.uv+excluded.uv;
 end if;
 return true;
end;$$;
revoke all on function public.algo_quest_collect_visit(uuid,uuid,text,text) from public;
grant execute on function public.algo_quest_collect_visit(uuid,uuid,text,text) to anon,authenticated;

-- Check the immutable provider identity, not editable user_metadata or a display name.
create function public.algo_quest_traffic_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from auth.identities where user_id=auth.uid() and provider='github' and provider_id='123933729'
 );
$$;
revoke all on function public.algo_quest_traffic_is_admin() from public,anon;
grant execute on function public.algo_quest_traffic_is_admin() to authenticated;

create function public.algo_quest_traffic_report(
 p_from date,p_to date,p_chapter integer default null,p_before timestamptz default null,p_before_id uuid default null
)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 d date:=(clock_timestamp() at time zone 'Asia/Shanghai')::date;
 daily_rows jsonb; chapter_rows jsonb; detail_rows jsonb; overview jsonb; more boolean;
begin
 if not public.algo_quest_traffic_is_admin() then raise exception using errcode='42501',message='只有指定管理员可以查看客流统计。';end if;
 if current_setting('request.method',true) is distinct from 'POST' then raise exception using errcode='22023',message='请使用 POST 查询。';end if;
 if p_from is null or p_to is null or p_from>p_to or p_to>d or p_from<d-364
 or p_to-p_from>364 or (p_chapter is not null and p_chapter not between 1 and 12)
 or (p_before is null)<>(p_before_id is null)
 then raise exception using errcode='22023',message='请选择最近365天内的有效日期。';end if;
 perform algo_quest_analytics.cleanup();
 select coalesce(jsonb_agg(jsonb_build_object('day',days.day::date,'pv',coalesce(a.pv,0),'uv',coalesce(a.uv,0)) order by days.day),'[]'::jsonb)
 into daily_rows from generate_series(p_from::timestamp,p_to::timestamp,interval '1 day') days(day)
 left join algo_quest_analytics.daily a on a.day=days.day::date;
 select jsonb_build_object('pv',coalesce(sum(pv),0),'visitor_days',coalesce(sum(uv),0),'days',p_to-p_from+1)
 into overview from algo_quest_analytics.daily where day between p_from and p_to;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.pv desc,r.chapter),'[]'::jsonb) into chapter_rows from (
  select a.chapter,min(p.chapter_title) as title,sum(a.pv) as pv,sum(a.uv) as visitor_days
  from algo_quest_analytics.chapter_daily a
  join (select distinct chapter,chapter_title from algo_quest_analytics.pages where chapter is not null) p on p.chapter=a.chapter
  where a.day between p_from and p_to group by a.chapter order by pv desc,a.chapter limit 12
 ) r;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.visited_at desc,r.id desc),'[]'::jsonb) into detail_rows from (
  select v.id,v.visited_at,v.day,v.path,host(v.ip) as ip,v.source,p.title,p.chapter,p.chapter_title
  from algo_quest_analytics.visits v join algo_quest_analytics.pages p on p.path=v.path
  where v.day between p_from and p_to and (p_chapter is null or p.chapter=p_chapter)
  and v.visited_at>=greatest(p_from::timestamp at time zone 'Asia/Shanghai',statement_timestamp()-interval '30 days')
  and v.visited_at<(p_to+1)::timestamp at time zone 'Asia/Shanghai'
  and (p_before is null or (v.visited_at,v.id)<(p_before,p_before_id))
  order by v.visited_at desc,v.id desc limit 51
 ) r;
 more:=jsonb_array_length(detail_rows)>50;
 if more then detail_rows:=detail_rows-50;end if;
 return jsonb_build_object('daily',daily_rows,'chapters',chapter_rows,'totals',overview,'visits',detail_rows,'has_more',more,
 'timezone','Asia/Shanghai','detail_days',30,'aggregate_days',365,'generated_at',clock_timestamp());
end;$$;
revoke all on function public.algo_quest_traffic_report(date,date,integer,timestamptz,uuid) from public,anon;
grant execute on function public.algo_quest_traffic_report(date,date,integer,timestamptz,uuid) to authenticated;

-- Install the built-in Supabase Cron extension when available; don't alter existing jobs.
-- Cleanup also runs on ingestion/report requests (including PostgreSQL test environments).
do $$begin
 if exists(select 1 from pg_available_extensions where name='pg_cron') then
  create extension if not exists pg_cron;
 end if;
 if exists(select 1 from pg_extension where extname='pg_cron') then
  perform cron.schedule('algo-quest-traffic-retention','17 * * * *','select algo_quest_analytics.cleanup()');
 end if;
end;$$;
notify pgrst,'reload schema';
commit;
