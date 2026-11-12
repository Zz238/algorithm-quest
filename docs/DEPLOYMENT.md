# 部署与可选云存档

## 账号与云端存档

右上角“登录”及头像内的“账号与云存档”使用 GitHub OAuth + Supabase Auth，采用 PKCE。没有邮箱注册、验证码、邮件找回或邮件发送服务，也不申请 GitHub 仓库权限。游客可以直接学习。

- 登录后加载此账号独立的阅读、练习、闯关、笔记、收藏、每日阅读和打卡记录。
- 发现游客旧存档时，先询问是否合并。完成记录和日期去重；同一小节已有账号笔记时保留账号笔记，游客原存档仍保留。
- 学习修改会自动同步；离线先存到当前账号的本机缓存，联网、窗口重新聚焦或手动同步时重试。退出回到游客存档，不把账号数据写入游客存档。
- 多设备同步通过 revision 比较后写入，发生冲突会重新读取并合并。笔记和收藏有字段修改时钟，支持清空笔记、取消收藏，不会被旧设备记录重新添加。
- 完成进度按集合合并；它不是可以撤回完成状态的协作编辑器。同一笔记同时修改时，按修改时钟保留一个版本，不保留笔记历史。重要笔记仍建议导出 JSON 备份。
- 云端登录仅在正式网站开放。本机开发和 offline.html 继续使用游客存档，避免跨来源 OAuth 回调丢失 PKCE 校验。

### Supabase 配置

`src/config/cloud.js` 只包含公开的项目 URL、publishable key 和正式网站地址；浏览器需要这些值。数据库隔离依靠 RLS，不依靠隐藏前端 key。**service_role、secret key、数据库密码和 GitHub Client Secret 不能放进源代码、前端环境变量或 GitHub Pages 构建产物。**

1. 在自己的 Supabase 项目 SQL Editor 执行 `supabase/migrations/202610290001_cloud_saves.sql` 一次，创建独立的 `algo_quest_saves` 表、字段约束、版本触发器和用户隔离策略。已有该表时不要重复执行。
2. Authentication → URL Configuration 的 Site URL 和 Redirect URLs 均设为正式网站的完整根地址 `https://zz238.github.io/algorithm-quest/`；不要使用通配符。
3. 在 GitHub Developer Settings 创建 OAuth App。Homepage URL 填正式网站根地址，Authorization callback URL 填 `https://dirmhvwmvvcqgwoarlyj.supabase.co/auth/v1/callback`。
4. 把该 OAuth App 的 Client ID 和 Client Secret 直接填到 Supabase Authentication → Sign In / Providers → GitHub，并启用 GitHub。Client Secret 只在 GitHub 与 Supabase 服务端保存，不经过本仓库。
5. 正式网站点击“重新检查登录服务”，然后使用 GitHub 登录。未配置提供商时按钮会保持禁用，游客学习与本机记录不受影响。

Fork 或更换部署域名时，应使用自己的 Supabase 项目，并同步修改公开配置、OAuth callback、Site URL 和 redirect allowlist。

数据库校验脚本 `supabase/tests/cloud_saves_rls.sql` 在事务内创建两个无邮件、无密码的测试身份，检查本人读写、跨用户隔离、匿名拒绝、版本冲突、无效日期及重复日期约束，最后全部回滚。已在当前项目实际执行通过；不会留下测试用户或学习记录。

## GitHub Pages 自动部署

本仓库包含网站完整源代码。Settings → Pages → Source 选择 **GitHub Actions**，推送 main 后由 `.github/workflows/deploy-pages.yml` 自动检查、构建并发布 `dist/`。

免费个人账号使用 GitHub Pages 时需要公开仓库；将仓库改为私有会让 Pages 停用并返回 404。云端学习记录存放在 Supabase 的 RLS 隔离表中，不在源代码仓库里。

- 使用 Node.js 24，`npm ci` 安装锁定依赖。
- `vite.config.js` 的相对资源路径配合 hash 路由，支持仓库子目录访问及刷新，不需要服务器重写规则。
- 下载源代码后执行 `npm ci`、`npm run dev` 可本地修改；`npm run build` 生成完整的 Vite dist；可选离线版另用 `npm run build:offline` 生成。
- 原站点与GitHub Pages的浏览器来源不同，阅读、练习和打卡不会自动迁移。先在原站“学习记录”导出JSON，再在新站导入即可。
- 后续修改课程或样式并推送 main，会自动更新线上网站。

游客可以免登录学习，并在学习记录中通过加密数据串进行跨设备迁移。公开讨论仍需账号，不影响课程和本地练习。
