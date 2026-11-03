# 算法之旅 · 本机访问统计后台

查看每日访问人数（UV）与浏览量（PV）、热门章节、访问时间、网络出口 IP 和来源网站。统计从启用时开始，不补记历史访问。

**当前项目已完成云端配置并启用采集（2026年11月3日）。** 以下Windows启动步骤可直接使用；“首次启用云端统计”供新项目部署时参考，无需在当前项目重复执行迁移。

## 在 Windows 电脑上打开

1. 从 [GitHub 下载项目 ZIP](https://github.com/Zz238/algorithm-quest/archive/refs/heads/main.zip)，先解压到一个固定目录。请勿在压缩包里直接启动。
2. 安装 [Node.js 24 LTS](https://nodejs.org/)。如果已安装符合项目要求的 Node.js，无需重新安装。
3. 双击项目根目录的 `start-admin-windows.bat`，会打开 `http://127.0.0.1:4780/`。
4. 点击“使用 GitHub 登录”，使用 **Zz238** 登录。

后台无需 `npm install`，只使用 Node.js 内置模块。macOS 可运行 `start-admin-macos.command`，或在项目目录运行 `node admin/server.mjs --open`；Linux 也可使用该命令。

启动窗口需要保持打开。关闭窗口或按 Ctrl+C 停止服务；下次双击即可再次打开。若端口已被占用，先检查是否已经启动。固定端口是 OAuth 回调的一部分，不要随意更改。

**本项目中的启动验证发生在开发环境，不等于已经在你的电脑上安装或启动服务。** 必须在要使用的电脑上执行上面的启动步骤。

## 首次启用云端统计（网站维护者执行一次）

使用现有 Supabase 项目 `dirmhvwmvvcqgwoarlyj`。不要填写或上传 service-role、secret key、数据库密码、GitHub Client Secret。

1. 应用 `supabase/migrations/20261103092159_traffic_analytics.sql`。该迁移只新增 `algo_quest_analytics` 私有 schema 与三个受控 RPC，不改学习存档、评论或现有账户数据。可通过 Supabase 迁移工具，或在项目 SQL Editor 中完整执行该文件。
2. 在 Supabase **Authentication → URL Configuration → Redirect URLs** 添加这个**精确地址**：

   ```text
   http://127.0.0.1:4780/auth/callback
   ```

   保留现有 `Site URL` 和生产站点回调地址。只增加这一条，不使用通配符，不需要修改 GitHub OAuth App 的 Supabase 回调，不需要邮件发送服务。
3. 确认以下只读检查通过：

   ```sql
   select to_regclass('algo_quest_analytics.visits') is not null as analytics_installed;
   select count(*) as course_pages from algo_quest_analytics.pages;
   select jobname, schedule, active from cron.job where jobname='algo-quest-traffic-retention';
   ```

   页面清单应有 90 项：6个普通页面、72个课程小节、12个章节练习。定时清理任务应启用，按小时执行。若使用自行托管且不支持 Cron 的环境，需另行安排 `select algo_quest_analytics.cleanup()` 的小时任务；请求时清理只是兜底。
4. 上述检查通过后，将 `src/config/cloud.js` 中的 `TRAFFIC_ENABLED` 改为 `true`，再发布网站前端。真实读者浏览正式站点即可产生记录。本机预览、离线文件、自动化测试、未知路由、不跟踪浏览器及选择停止统计的浏览器不会发送记录。

## 数据口径

| 指标 | 计算方式 |
| --- | --- |
| 每日人数 UV | 同一浏览器当天的随机编号去重；每天按北京时间更换编号 |
| 访客人次 | 所选范围内的每日 UV 相加，不表示跨日期去重的自然人数 |
| 页面浏览量 PV | 在正式站点打开页面或切换到一个有效路由，停留约0.8秒后记录一次；快速切换会取消前一条待发送记录 |
| 热门章节 | 小节页面与章节练习的 PV 按章合计；章节访客人次按日、按章去重后相加 |
| 来源 IP | Supabase Platform 覆写的 `CF-Connecting-IP`；可能是共享网络、代理或 VPN 出口 |
| 来源网站 | `document.referrer` 的 origin，不保存路径、搜索词、query 或 hash；浏览器未提供则显示“直接访问 / 浏览器未提供” |

浏览器编号不关联 GitHub 账号、答案、评论或笔记。清理浏览器存储、换设备、隐私设置、网络中断、统计拦截器都可能导致估算偏差。不是服务器日志，也不是反作弊或安全审计系统。公开采集端点无法证明请求一定来自真人；来源校验与限速减少滥用，但不应把统计当作可审计的精确人数。

## 本机限制与权限

- 服务只绑定 `127.0.0.1:4780`，同时核对 Host、远端回环地址、同源 POST 和 Fetch Metadata，不提供跨域访问。不会监听 `0.0.0.0`、局域网或公网地址。
- 页面只存在于本机服务。GitHub Pages 不包含后台页面或后台入口；后台源码公开不等于数据公开。
- 登录使用 Supabase GitHub OAuth PKCE。校验码、访问令牌和刷新令牌仅保存在本机服务内存，不写入磁盘、浏览器存储或网页脚本。浏览器仅接收随机 HttpOnly、SameSite=Lax 会话 Cookie；本机登录最多保持8小时。
- 数据库每次报告查询都会核对 `auth.identities` 中不可由用户随意修改的 GitHub provider ID：`123933729`（仓库所有者 Zz238）。不依赖可编辑的用户名或 `user_metadata`。
- 游客、普通 GitHub 用户和仅持有公开 publishable key 的调用者不能读取明细、汇总、盐或私有表。所有私有表同时启用 RLS 并撤销公开角色权限。
- “仅本机访问”指不接受其他设备的网络连接，不绑定某个硬件序列号。若你主动在另一台电脑运行同一程序并使用管理员 GitHub 登录，也能查看自己的网站统计。

## 保留与清理

- 含完整 IP 的访问明细保留30天；Cron 每小时清理一次到期记录，查询接口立即排除超过30天的明细。
- 日、页面和章节汇总保留365个自然日，不含完整 IP。匿名去重摘要只保留最近两天，且使用按天加盐的摘要，不能跨日期关联。
- 限速计数器按分钟分桶，小时清理任务删除超过两分钟的分桶；不保留原始 IP，只使用按日加盐摘要。单浏览器每分钟最多30条、单出口 IP 每分钟最多120条，超限忽略，不重试轰炸。
- 采集与管理员读取也会触发按小时节流的清理，作为定时任务的兜底。
- `/privacy` 与网站底部披露用途和保留规则，遵循 Do Not Track / Global Privacy Control，并提供本浏览器停止统计选项。停止只影响后续采集，不抹除已有匿名汇总。

## 验证

```bash
npm ci
npm run check:analytics
```

测试在独立 PostgreSQL WASM 实例中执行真实迁移和权限查询，并验证回环 HTTP 服务、PKCE、会话隔离、日期去重、重复请求、限速、分页及清理。测试不连接生产数据库，也不写入真实访问或评论。

## 常见问题

- **登录跳回公开网站**：检查 Redirect URLs 是否精确包含上述地址；不要把生产 Site URL 改成本机地址。后台登录失败时，Supabase 默认可能退回 Site URL。
- **统计数据库尚未安装**：先执行迁移，再刷新后台；不要为解决错误开放所有表或提供 service-role key。
- **没有访问记录**：确认数据库已安装、前端已发布，并使用正常浏览器访问正式网站。测试和本机预览不会产生访问记录。
- **较早日期没有明细**：明细仅30天；365天内的匿名汇总仍可查看。
- **数据没有自动刷新**：点击“查询 / 刷新”。后台有意不后台轮询，以减少数据库请求。
- **其他 GitHub 账号不能登录后台**：这是预期行为。公开课程和讨论区仍可使用其他账号，后台只允许指定管理员。

## 当前部署校验记录

- Supabase迁移版本 `20261103092159`，90个有效页面，8张启用RLS的私有统计表。
- 小时清理任务 `algo-quest-traffic-retention` 已启用，Cron表达式 `17 * * * *`。
- 本机回调 `http://127.0.0.1:4780/auth/callback` 已添加，生产Site URL和原有回调保留。
- 线上数据库角色测试已验证匿名写入、事件重放去重、管理员报告和普通账号拒绝；合成访问在同一事务中回滚，不计入真实统计。可复查 `supabase/tests/traffic_analytics_deployment.sql`。
- REST检查：无效页面采集返回false；仅持公开publishable key的调用者读取管理员接口被拒绝。
- Supabase安全顾问中，[RLS无策略提示](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)对应私有表的默认拒绝策略；[匿名SECURITY DEFINER接口提示](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)对应有校验与限速的公开采集接口。报告接口另有不可修改GitHub身份校验；不应为消除提示而开放私有表。
