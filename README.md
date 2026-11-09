# 算法之旅 · ALGO QUEST

面向编程零基础的 Java 与算法学习网站，采用浅色阅读界面、分阶段课程目录与响应式课程侧栏。Vue 3 + Vite，所有课程与图解都在项目内，不需要在线 AI 服务。GitHub Pages 版公开访问；游客存档保存在浏览器，GitHub 登录后可使用 Supabase 云端存档。下载项目后也可以在本机使用。

正式网站：https://zz238.github.io/algorithm-quest/

## 基础与进阶内容扩充（2026-11-09，功能分支）

- 参考英雄编程的四阶段学习路线，将 66 个知识点连接到已有课程或新专题；另补二进制与位运算预备篇。
- 原有 72 节逐节补充概念边界、操作条件与进阶衔接，12 章增加操作成本、应用场景和后续入口。原课程 ID、顺序与存档兼容保留。
- 新增 41 篇专题、82 道自包含自检题；先生活例子与状态推演，再概念、适用条件、变式与 Java 编程。
- 8 类实验支持修改输入后真实重新生成步骤；其他专题明确使用固定手算案例。新增 12 道 Java 任务，目前共 73 道任务、16 道复习变式、334 组 JDK 用例。
- 新增专题搜索、四阶段目录、前置回顾、面包屑、已读记录与账户隔离的本机草稿；详细说明、66 项映射和验收见 [CURRICULUM_ROADMAP_REVIEW.md](./CURRICULUM_ROADMAP_REVIEW.md)。
- 当前保留在 `codex/java-practice-career`，没有合并主分支或更新正式站点。

## Java 在线实践与职业路线（2026-11-08，功能分支）

- 新增 CheerpJ Java17 在线编译、运行示例、全部测试、错误定位、停止与超时保护；只有点击运行才加载环境。
- 当前已扩充至73项编程任务、16项复习变式，合计334组JDK测试；新学可改写完整示例，复习先独立编写。
- 独立的Java后端和算法工程师职业路线，各7阶段；配套Spring项目、SQL工作单、Python/Notebook与推荐服务。
- 新增全站面包屑、跨标签学习位置恢复、编程与职业内容搜索、文档式阶段导航。
- Vite按需分包，默认构建只生成完整dist；首页JavaScript gzip约399KB降至143KB。
- 开发与验收说明见 [JAVA_PRACTICE_CAREER_REVIEW.md](./JAVA_PRACTICE_CAREER_REVIEW.md)。当前功能等待分支预览确认后合并。

## 组件交互优化（独立分支）

基于 Uiverse 的按钮、输入和勾选交互，将 6 类 Vue 控件统一用于实验、代码、搜索、笔记与阶段项目。Morphicons 联动播放/暂停、复制/完成等真实状态；保留蓝白配色、原边框规则、触控和减少动态效果。全部控件可以离线使用。

[改动与验收](UI_INTERACTION_REVIEW.md) · [来源与许可证](THIRD_PARTY_NOTICES.md)。

## 学习流程与阅读布局（2026-11-08）

- 首页“回到上次学习”返回最近实际学习的小节、阅读位置和实验状态；“按课程顺序继续”保留独立的顺序推荐。
- 先完成打印、变量、判断 3 节 Java 起步课；其余 9 节及 3 节衔接课在主线需要时补学。已练过的内容可直接做题确认。
- 72 节先讲生活例子，把 215 张算法状态图放到对应概念旁，再进行完整实验与 Java 阅读。图解可放大；详细导读与复盘可展开。
- 右侧笔记可收起／固定，提供保存状态及内容定位链接；字号与固定偏好保存在本设备。段落链接、实验输入及步数可从笔记直接恢复。
- 编程练习库目前提供73项任务及16项复习变式，可在线真实编译运行，也可下载 `Main.java` 在本机验证。
- 最近任务、练习草稿、实验、阅读位置与项目计划保存在当前浏览器并按账号隔离；原有进度、私人笔记和复习记录继续按既有机制同步。不会将本机阅读偏好或实验输入加入客流统计。

[本轮改动与验收](./LEARNING_FLOW_REVIEW.md) · [真实零基础试学方案](./docs/BEGINNER_STUDY.md)。真人试学待招募后实施。

## 零基础学习路线（2026-11-05）

- [Java 预备课](https://zz238.github.io/algorithm-quest/#/java)：12 节短课，从打印、赋值、条件和循环，学到方法、数组、类、引用、列表与二维数组；另有两层循环、调用返回、按最后一步计数 3 节衔接课。
- 原有 72 节链接与历史记录保留。每节增加实际前置自检、课内跳转和可重做的变式题；四个阶段各有一道新情境，先选择方法再推演。
- 数字、是非和数组题直接作答；关键小节增加排序步骤、补代码、修复错误和带测试的独立 Java 编写练习。错误提示分层；看过提示的挑战和独立完成分别记录。
- 练习草稿、演示输入及步数、阅读位置保存在当前浏览器；阅读、基础练习、独立完成、笔记、复习计划和每日目标随账号存档同步。旧云端结构兼容，不需要新增迁移。
- [复习与阶段练习](https://zz238.github.io/algorithm-quest/#/review)有当天错题及隔天复习计划。学习记录内可全文搜索私人笔记，课程底部“本节讨论”仍为公开评论。

查看 [14 项改造验收](./BEGINNER_REVIEW.md) 和 [更新记录](./CHANGELOG.md)。

## 访问统计与本机后台（2026-11-03）

新增每日人数与浏览量趋势、热门章节、访问明细（时间、页面、网络出口IP、来源域名），后台只绑定本机 `127.0.0.1:4780`，通过现有 Supabase GitHub 登录核对指定管理员，不使用管理密钥。Windows 双击 `start-admin-windows.bat`，首次安装 Node.js 24 LTS 后无需安装项目依赖即可运行。详见 [后台启动与云端配置](./admin/README.md)。

网站底部新增隐私说明与统计偏好入口，注明“只用作统计网站客流量”、30天IP明细和365天匿名汇总保留期。支持本浏览器停止统计，并遵循 Do Not Track / Global Privacy Control。客流数据与学习记录和笔记分开保存。

客流采集已启用。Supabase 统计迁移、本机精确登录回调与每小时清理任务均已配置，匿名采集、管理员读取和普通账号拒绝检查通过。统计从启用时开始，不补记历史访问。后台仍需在使用者电脑上运行启动文件，详见上面的启动说明。

## 界面与练习改版（2026-11-02）

- 首页采用四阶段课程目录与下一节学习卡片；移除首页章末闯关入口、像素场景、人物动画和等级称号。章节综合练习仍在课程内，原有阅读、笔记、收藏、练习和积分记录兼容保留。
- 课程、实验、代码、练习、讨论、术语、学习记录和账号页共享配色、字号、间距、4/6/8px 圆角变量。手机正文与输入框保持 16px；代码和贡献日历各自在容器内滚动。
- 审核全部 216 道小节题和 12 道章节思路题，补全 103 道小节题及 10 道章节题的具体数据、初始状态、运算规则或边界约定。选择题与 JSON 结果题均可单独理解；原答案和选项保持一致。
- 内部导航先显示约 110ms 的点击反馈，再替换页面并用 220ms 的淡入与小幅位移动效呈现内容。最新点击覆盖未执行跳转，浏览器历史切换取消待执行导航；系统设置减少动态效果时立即切换。
- 带遮罩的章节导航保留平滑滑入、Esc 关闭、焦点限制和关闭后恢复焦点；正文为其预留位置。聚焦和选中仅切换原有边框颜色，以 0.25 秒过渡。

设计参考：[UI/UX Pro Max](https://www.uupm.cc/)、[Taste Skill](https://www.tasteskill.dev/)、[Uiverse](https://uiverse.io/)。主要界面由本项目自行实现，没有引入外部 UI 框架。顶部导航下划线改编自 [WhiteNervosa 的 Uiverse 按钮](https://uiverse.io/WhiteNervosa/popular-ladybug-27)，采用400ms中心展开动画；许可与来源见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。

## 小节笔记评论

每个学习小节底部的“本节讨论”是公开评论区，右侧为私人学习笔记。登录 GitHub 后可点击“发送评论”或按 Enter 发送，Shift + Enter 换行；输入法确认候选字时不会发送。发送后立即展示内容，支持原文预览、最新/最早排序、每页20条、失败保留分账号草稿，以及撤回本人的评论。评论按小节隔离，最多2000个字符。

评论通过 Supabase 保存，作者昵称由服务端从 GitHub 公开用户名确定。公开接口返回昵称、正文、时间和本人标记，不返回内部账号ID、邮箱或私人笔记。正文按纯文本渲染，不执行 HTML。服务器校验登录、归属、长度、小节编号，使用请求ID防止重复发送，并限制为每10秒1条、每小时最多50条。

数据库迁移 `supabase/migrations/202610310001_lesson_comments.sql` 在现有 Supabase 项目执行一次。真实评论表仅供受限函数访问，实时订阅使用另一张只含小节编号与版本号的通知表；连接中断时每20秒及页面回到前台时刷新列表。离线文件仍可记私人笔记，公开评论需联网访问正式网站。

`npm run check:comments` 验证回车与输入法、长度、重复请求、草稿、切换小节和账号等行为。`supabase/tests/lesson_comments_rls.sql` 是全部回滚的数据库安全测试，不会留下公开测试评论。评论区与全站统一采用现代浅色界面，控件聚焦仅切换原边框颜色，过渡约0.25秒，边框宽度和样式保持不变。具体更新见 [CHANGELOG.md](./CHANGELOG.md)。

实现资料通过 Exa 核对：[Supabase Realtime](https://supabase.com/docs/guides/realtime/postgres-changes)、[Vue 表单与输入法](https://vuejs.org/guide/essentials/forms.html)。

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

## 离线使用

可选执行 `npm run build:offline` 后，双击根目录的 **offline.html**，可离线阅读全部课程、看图解、查看 Java 逐行说明、闯关和记笔记。这里已经打包了 Vue、样式和课程，不会从 CDN 加载依赖。

离线版将入口脚本、样式和图解内嵌在一个文件中。持续集成检查 `file://` 下的笔记保存及 Java 下载；若你的浏览器限制本地保存或模块，请按下面的 npm 启动方式使用。

本地 HTML 与开发服务属于不同浏览器来源，进度可能分别保存。换打开方式或换电脑前，请在“学习记录”导出 JSON，再导入。浏览器限制本地保存时，网页会提示；仍可导出备份。

## 继续开发 Vue 项目

建议安装 **Node.js 24 LTS（24.12 或更新）**，本项目实际验证环境是 Node 24.22.1。

Windows：解压完整项目后，双击 `start-windows.bat`。首次会安装锁定依赖，然后打开浏览器。也可以在项目根目录的终端执行：

```bash
npm ci
npm run dev
```

默认地址为 `http://127.0.0.1:5173/`，以终端实际显示地址为准。如果端口已占用，Vite 会选择下一个可用端口。停止服务可在终端按 Ctrl+C。

macOS：在终端执行 `sh start-macos.command`，或在项目根目录执行同样的 npm 命令。

首次安装依赖需要联网；安装后课程功能不依赖外部服务。点击力扣或参考资料链接时需要联网。

## 生成生产版本

```bash
npm run build
npm run preview
```

`dist/` 是生产构建目录。默认构建不会生成单文件HTML；离线兼容版由 `npm run build:offline` 单独生成。dist 使用 JavaScript 模块，建议通过 `npm run preview` 访问；双击打开请使用专门的 offline.html。

## 十二章与章末题

| 章 | 课程 | 章末对应力扣题 |
| --- | --- | --- |
| 1 | 程序与算法 | LC 1480 一维数组的动态和 |
| 2 | Java 识字课 | LC 2235 两数相加 |
| 3 | 变量、判断与循环 | LC 1342 把数字变成零 |
| 4 | 数组、字符串与查找 | LC 704 二分查找 |
| 5 | 交换、冒泡与插入排序 | LC 1051 高度检查器 |
| 6 | 链表、栈与队列 | LC 20 有效的括号 |
| 7 | 哈希表与快速定位 | LC 1 两数之和 |
| 8 | 递归、分治与回溯 | LC 78 子集 |
| 9 | 树、二叉搜索树与堆 | LC 104 二叉树的最大深度 |
| 10 | 图、搜索与路径 | LC 733 图像渲染 |
| 11 | 贪心与动态规划 | LC 70 爬楼梯 |
| 12 | 综合挑战与独立解题 | LC 121 买卖股票的最佳时机 |

每章 6 个学习小节，共 72 节（68 节基础、4 节选学），每节配有基础、推演、应用三道练习，共 216 道，覆盖概念、生活例子、步骤、图解、易错点、复杂度与 Java 示例。共有 44 份不同 Java 程序；每份都有整体用途、输入输出、具体例子、分步过程与理解重点，全部语句带逐行说明。代码区可以点击单词查看词义。

每章末统一包含：重写的中文题目说明、原题链接、章节关联、2 个输出预测情境、1 个思路问题、3 层提示、详细步骤、正确性说明、复杂度、易错点和完整 Java 答案。第 1 章先用自然语言与图解理解累加，完整 Java 答案在练过方法、数组和循环预备课，或通过第 2、3 章语法基础后显示。冒泡与插入在第 5 章逐节学习，归并移到第 8 章递归之后，并在这一节提供要求 O(n log n) 的 LC 912。快速排序、堆、Dijkstra、背包为选学，不阻挡基础路线闯关或打卡。

这套课程是上述十二章的完整入门路线，不是两个原站的逐页镜像，也不包含原站所有进阶专题。

56 类逐条实验支持前进、后退、自动播放和重置；可切换为先预测再前进，部分实验可同步高亮代码。数组、下标、目标等按实验类型允许修改。每帧显示当前语句、变量、数据和原因。输入数组限定为 1～6 个小整数，便于跟随；内置模型不编译任意 Java。

## 闯关与积分

- “记录已读”独立保存阅读；三道基础题首次全部通过时另存练习状态。新数据挑战未用提示并答对时，才记录独立完成。
- 查看解答不会自动通过，答错显示具体原因，可修改后重试。
- 通过本章所有基础小节的三道练习并记录学完，两个输出预测都正确，思路问题正确，可领取 150 XP。
- 重复学习或重复通关不重复加分，答错不扣分。
- 全部课程最高 3960 XP。
- 算法小白 0 / 算法学徒 100 / 算法探索者 300 / 算法能手 700 / 算法高手 1500 / 算法大牛 3000。
- 算法大牛还需要全部 12 章通关。称号表示本课程学习进度。

章节基础题检查输出预测与思路选择；编程任务通过CheerpJ在浏览器真实编译和执行Java，首次加载需要联网。判题用于学习自测，不作为防作弊考试。完整答案也可复制到力扣提交，Java代码下载不需要联网。

## 账号入口与每日阅读打卡

右上角显示当前 GitHub 用户名与头像，点击进入账号与云存档；游客显示“登录”，进入仅支持 GitHub 的登录页。用户名过长时省略显示，完整名称保留在提示和无障碍标签中；头像加载失败时显示用户名首字。GitHub 官方图标链接到本仓库，悬停提示“向我们提建议”。主导航保留课程目录、术语手册、学习记录。

阅读打卡及最近一年的学习足迹在账号页。登录后可选每天 1–4 项（默认4项），已读小节、通过预备课和完成复习都可计入。按浏览器本地日期去重，同一小节的阅读与复习当天只计一次。达到目标自动打卡，调整目标不会撤销已点亮的格子；刷新、重新登录和多设备合并不会清空进度。

格子按当天学习任务数量显示深浅；达到自选目标即可点亮。旧版打卡日期与每日阅读记录继续保留，没有阅读明细的旧日期仍显示绿色。统计当前连续、累计及最长连续天数；今天尚未打卡时，当前连续天数按截至昨天计算。手机上日历区域独立横向滚动。旧的 `#/checkin` 地址自动转至账号页。

游客可保存本机学习与目标，登录并主动合并后才纳入账号的自动打卡。显式合并游客记录或导入旧备份时会保留历史数据。账号记录继续使用原 Supabase 存档格式与RLS策略，无需重新建表。自动打卡也会在账号云存档合并时校验，因此两台设备各完成2个不同小节，合并后即可点亮当天日期。

## 阅读界面与章节侧栏

首页直接展示课程范围、下一节入口及分组目录，减少居中宣传标题、重复卡片和英文装饰标签。教学讲解、Java代码、逐条实验和216道练习保留。页面延续纸色、深绿与像素标识，圆角继续统一使用4px、6px、8px变量，聚焦边框保持橙色与0.25秒过渡。

学习和闯关页右侧为默认收起的章节入口，原左侧“跳到其它章节”下拉框已移除。按钮在预留的56px边栏中；桌面展开会给面板让位，窄屏将阅读区暂时移到侧面，正文不与面板重叠。面板与全局遮罩采用0.28秒位移/淡入淡出过渡，支持按钮切换、遮罩关闭、Esc关闭、焦点限制和关闭后焦点返回。切换章节会自动关闭面板。

视觉与交互参考：

- VibeHub：https://vibe-hub.org/anti-ai-flavor （减少套话、重复嵌套卡片和无意义的装饰）。
- Taste Skill：https://www.tasteskill.dev/ （先审查原有界面，再调整布局、文字层级及动效）。
- Uiverse：https://uiverse.io/ （按钮状态、提示与过渡的参考；本项目使用自行编写的CSS）。
- Morphicons：https://www.morphicons.com/docs （使用锁定的2.0.2 Vue组件实现菜单/关闭图标过渡，启用用户减少动态效果偏好）。

GitHub图标来自官方Primer Octicons，图标及Morphicons的许可证记录在 `THIRD_PARTY_NOTICES.md`。

## 文件与后续扩展

```text
src/App.vue                 应用外壳、账号与页面入口
src/pages/                   课程目录、小节、搜索、术语、学习记录和私人笔记
src/course-route.js          旧链接兼容与非法参数校验
src/useCourseNavigation.js   路由、焦点和阅读位置恢复
src/useLearningProgress.js   阅读、练习、独立完成、复习和打卡
src/course-search.js         课程、题目、术语、代码与本机私人笔记的统一索引
src/data/course.js          课程顺序、前置关系、题解与旧进度兼容
src/data/units/*.js         72节原创讲解、术语、案例、误区与216道练习
src/data/base-course.js     章节元数据、章末题及集中 Java 示例表
src/data/extra-codes.js     新增的基础Java示例与整体讲解
src/data/code-guides.js     每份 Java 示例的整体用途、输入输出与推演过程
src/data/terms.js           Java 词典
src/components/LessonFoundation.vue  基础讲解与完整案例
src/components/LessonPractice.vue    三阶练习与反馈
src/components/TraceLab.vue          可自定义输入的逐条实验
src/components/StudyFigures.vue      小节的关键状态图解
src/components/ChapterFigures.vue    各章导读的三张概念图
src/components/CodeReader.vue        行导航、术语、全屏阅读与下载
src/traces.js / src/concept-traces.js  实验执行状态
src/lesson-demos.js / src/trace-picture.js  实验输入映射与 SVG 绘图
src/local-saves.js / src/progress-backup.js 存档诊断、导入预览与重置范围
src/practice.js             按题目输出类型检查练习答案
src/logic.js                输出检查、参考算法、进度数据校验
scripts/content.py         已停用的旧生成器，保留作历史资料
scripts/check-traces.mjs    可复现随机输入与追踪状态验证
scripts/check.mjs          内容、参考算法与 Java 验证
scripts/check-guide-examples.mjs  逐个运行 Java 整体讲解中的示例
src/useCloudProgress.js    账号生命周期、分账号缓存和自动同步
src/cloud-progress.js     合并、字段修改时钟与并发版本处理
src/components/AccountPanel.vue  登录、同步状态、游客合并与学习足迹
src/components/SiteHeader.vue    账号头像、GitHub建议链接与主导航
src/components/ReadingActivity.vue  自动打卡进度与贡献日历
src/components/ChapterDrawer.vue  右侧可折叠章节导航
src/components/UserAvatar.vue    GitHub头像与失败回退
src/account-profile.js           GitHub公开资料解析
src/account.css                 账号入口与学习记录布局
src/editorial.css               课程目录、阅读层级与侧栏动效
src/rounded-corners.css          集中管理4/6/8px圆角
supabase/migrations/      数据表、RLS 和数据格式约束
supabase/tests/           回滚式数据库隔离验证
scripts/offline.mjs        生成单文件离线版
public/answers/            适用于力扣编辑区的完整答案
scripts/generate-java-examples.mjs  按需导出独立 Main.java 文件
```

教学正文与小节练习只编辑 src/data/units/*.js；章节排序在 course.js，章末题的题干与案例在 base-course.js（LC1051 特例在 course.js）。课程只保存 codeKey，代码在集中表中维护。实际前置、预备课、变式在 data/learning-path.js、java-starter.js 和 learning-practice.js。旧 content.py 是历史资料，不参与构建，不能用来生成当前课程。已有阅读、笔记、收藏、奖励和打卡会保留；新版练习通过状态独立保存在 mastery 字段。第5章改用LC1051，旧版闯关奖励保留，但新版题目需重新完成且不重复奖励。

新增大章节时，请保持相同 boss 数据结构：题号与链接、题意、关联、步骤、证明、复杂度、易错点、两个输入输出情境、思路问题、提示、完整逐行 Java 代码；并为新题补充 logic.js 的参考实现、明确的演示模式和输入字段映射。两组章末输入的演示输出都要通过 check-branch-curriculum.mjs。

下载 ZIP 后，可将整个项目解压到自己的项目文件夹，再按上面的步骤启动。

## 验证

```bash
npm run lint
npm run format:check
npm run check
npm run check:examples
npm run check:java
npm run test:components
npm run check:cloud
npm run check:comments
npm run check:reading
```

基础内容与参考算法检查只需要 Node。检查命令只读源码；Java 编译和运行使用临时目录。只跑 Node 检查可使用 `npm run check -- --skip-java`。

浏览器回归：构建后执行 `npx playwright install chromium` 和 `npm run test:browser`。检查课程路由、七种视口、笔记与备份流程以及 `file://` 离线版。分支 CI 的 **algorithm-quest-vite-preview** 包含完整Vite dist，应使用HTTP服务预览，预览版不会启用正式站的登录与统计。

如果系统有带 jdk.compiler 模块的 JDK，还会编译全部 Java 示例，并执行十二道章末答案的 24 个情境。没有 JDK 时会明确提示跳过可选 Java 编译验证，网站仍能正常使用。

`npm run check:examples` 会使用 JDK 运行 44 份代码讲解的示例，并检查输出；没有 JDK 时会提示跳过。

运行 `npm run generate:java` 后，`java-validation/LC题号/Main.java` 可单独编译运行：在对应文件夹执行 `javac Main.java`，然后 `java Main`。这些文件包含测试需要的 main 和 TreeNode；提交力扣请使用网页中的 Solution 答案，避免重复定义平台类型。

## 参考与来源

本次通过 Exa 搜索并阅读主要来源，参考从概念、逐步交互到练习反馈的组织方式：Hello 算法、VisuAlgo（https://visualgo.net/en/sorting/）、OpenDSA（https://opendsa.cs.vt.edu/）及 Java 官方数组教程（https://dev.java/learn/language-basics/arrays/）。

课程组织参考 Hello 算法（https://www.hello-algo.com/）与算法通关手册（https://algo.itcharge.cn/）；语法参考 Java 官方教程（https://dev.java/learn/）。讲解、图解与代码重新编写，未搬运原站整篇教程。所有章末题均保留 LeetCode 原题链接，题目要求已逐题核对。网页用自行编写的中文说明与练习情境讲解题意。

项目使用锁定版本：Vue 3.5.44、Vite 7.3.7、@vitejs/plugin-vue 6.0.10。依赖许可证见对应 npm 包。

云端功能使用锁定的 @supabase/supabase-js 2.118.0。`npm run check:cloud` 检查合并收敛、打卡去重、清空笔记与取消收藏、旧存档迁移、并发重试、保存时输入、离线恢复和切换账号时取消旧请求。GitHub Actions 在每次部署前自动执行课程检查和云端逻辑检查。真实 OAuth 首次登录仍需完成上述提供商配置后，在浏览器验证。

`npm run check:reading` 验证4节阈值、重复小节、游客排除、日期切换、刷新/重新登录后的去重、颜色档位、旧历史与头像回退；账号会话检查还覆盖两台设备各2节合并后的自动打卡。


## 2026-11-04 课程与笔记更新

12 章均提供完整开篇导读，72 节均先用生活例子引入，再把对应关系、类比边界、概念、实验与代码连起来。完整 Java 默认收起；需要回顾其他程序时会明确说明用途。链表从对象、引用开始，Node 节点定义、沿 next 访问、插入和基础栈操作分别教学。

桌面宽度达到 1280px 时，私人学习笔记固定在课程右侧，并为正文预留空间。更窄屏幕使用右侧“笔记”按钮打开编辑面板；可以点遮罩或按 Esc 关闭。每节最多 5000 字，Enter 换行，输入立即保存到本机；登录后继续使用现有云同步。既有笔记无需重新导入，公开讨论保持独立。

课程逐节对应关系见 [CURRICULUM_REVIEW.md](CURRICULUM_REVIEW.md)。运行 `node scripts/check-learning-continuity.mjs` 可核对章节导读、生活例子、演示数据和关键预期结果；它已纳入 `npm run check` 与 GitHub Pages 部署检查。

## 图解与学习体验分支

课程维护说明及建议的对应验收见 [BRANCH_REVIEW.md](BRANCH_REVIEW.md)。图解使用和实验相同的默认输入和步骤状态，避免两个版本的例子各自维护。点击图解的按钮可用该组示例定位实验。正式站只从主分支部署。
