# 算法之旅 · ALGO QUEST

像素 RPG 风格、面向编程零基础的算法学习网站。Vue 3 + Vite，所有课程与图解都在项目内，不需要在线 AI 服务。GitHub Pages 版公开访问；游客存档保存在浏览器，GitHub 登录后可使用 Supabase 云端存档。下载项目后也可以在本机使用。

正式网站：https://zz238.github.io/algorithm-quest/

## 账号与云端存档

导航栏的“登录 / 云存档”使用 GitHub OAuth + Supabase Auth，采用 PKCE。没有邮箱注册、验证码、邮件找回或邮件发送服务，也不申请 GitHub 仓库权限。游客可以直接学习。

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
- 下载源代码后执行 `npm ci`、`npm run dev` 可本地修改；`npm run build` 会生成 dist 和 offline.html。
- 原站点与GitHub Pages的浏览器来源不同，阅读、练习和打卡不会自动迁移。先在原站“角色记录”导出JSON，再在新站导入即可。
- 后续修改课程或样式并推送 main，会自动更新线上网站。

## 离线使用

构建后双击根目录的 **offline.html**，可离线阅读全部课程、看图解、查看 Java 逐行说明、闯关和记笔记。这里已经打包了 Vue、样式和课程，不会从 CDN 加载依赖。

离线版按自包含 HTML 方式生成，但当前自动预览环境禁止 file:// 协议，因此未自动验证双击打开；开发服务的 HTTP 方式已验证。若你的浏览器限制本地模块，请按下面的 npm 启动方式使用。

本地 HTML 与开发服务属于不同浏览器来源，进度可能分别保存。换打开方式或换电脑前，请在“角色记录”导出 JSON，再导入。浏览器限制本地保存时，网页会提示；仍可导出备份。

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

`dist/` 是生产构建目录。构建同时生成根目录 `offline.html`。dist 使用 JavaScript 模块，建议通过 `npm run preview` 访问；双击打开请使用专门的 offline.html。

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

每章末统一包含：重写的中文题目说明、原题链接、章节关联、2 个输出预测情境、1 个思路问题、3 层提示、详细步骤、正确性说明、复杂度、易错点和完整 Java 答案。第 1 章先用自然语言与图解理解累加，完整 Java 答案在通过第 2、3 章语法基础后显示。冒泡与插入在第 5 章逐节学习，归并移到第 8 章递归之后，并在这一节提供要求 O(n log n) 的 LC 912。快速排序、堆、Dijkstra、背包为选学，不阻挡基础路线闯关或打卡。

这套课程是上述十二章的完整入门路线，不是两个原站的逐页镜像，也不包含原站所有进阶专题。

32 类逐条实验支持前进、后退、自动播放和重置；数组、下标、目标等按实验类型允许修改。每帧显示当前语句、变量、数据和原因。输入数组限定为 1～6 个小整数，便于跟随；内置模型不编译任意 Java。

## 闯关与积分

- 每节三题首次全部通过后保存练习通过状态，再点“学完”首次获得 30 XP。
- 查看解答不会自动通过，答错显示具体原因，可修改后重试。
- 通过本章所有基础小节的三道练习并记录学完，两个输出预测都正确，思路问题正确，可领取 150 XP。
- 重复学习或重复通关不重复加分，答错不扣分。
- 全部课程最高 3960 XP。
- 算法小白 0 / 算法学徒 100 / 算法探索者 300 / 算法能手 700 / 算法高手 1500 / 算法大牛 3000。
- 算法大牛还需要全部 12 章通关。称号表示本课程学习进度。

网站检查的是输出预测与思路选择，不会执行或编译你输入的 Java。完整答案可以复制到力扣 Java 编辑区提交。Java 代码下载不需要联网。

## 每日阅读打卡

从导航栏进入“每日打卡”。按照浏览器当前的本地日期，今天在同一章逐节点击学习页面底部的完成按钮，读完本章全部基础小节后即可手动点亮今天的格子；已学过的章节也可重新阅读。每天最多记录一次，不影响原有积分和闯关状态。日历展示最近一年，统计当前连续、累计与最长连续天数；今天还未打卡时，当前连续天数按截至昨天计算。

日历采用贡献格样式：未打卡为浅灰格，已打卡的格子根据当天读完的章节数显示四档绿色，分别为 1 章、2 章、3 章、4 章及以上。旧版只有打卡日期的记录仍显示绿色。月份标签与周列对齐，手机端可在日历区域左右滑动。

游客的学习进度、每日阅读记录与打卡数据保存在当前浏览器；GitHub 登录后会随账号同步到云端。也可在“角色记录”中导出 JSON，并在另一台设备导入合并；旧版进度备份同样可以导入。

## 文件与后续扩展

```text
src/App.vue                 页面、世界地图、章节和统一章末闯关
src/data/course.js          课程顺序、前置关系、题解与旧进度兼容
src/data/units/*.js         72节原创讲解、术语、案例、误区与216道练习
src/data/base-course.js     原有代码与章末题数据
src/data/extra-codes.js     新增的基础Java示例与整体讲解
src/data/code-guides.js     每份 Java 示例的整体用途、输入输出与推演过程
src/data/terms.js           Java 词典
src/components/LessonFoundation.vue  基础讲解与完整案例
src/components/LessonPractice.vue    三阶练习与反馈
src/components/TraceLab.vue          可自定义输入的逐条实验
src/components/Visualizer.vue        其它概念图解
src/components/CodeReader.vue  逐行代码讲解
src/traces.js               32种具体执行追踪
src/visuals.js              其它概念图解的演示步骤
src/practice.js             按题目输出类型检查练习答案
src/logic.js                输出检查、参考算法、进度数据校验
scripts/content.py         已停用的旧生成器，保留作历史资料
scripts/check-traces.mjs    可复现随机输入与追踪状态验证
scripts/check.mjs          内容、参考算法与 Java 验证
scripts/check-guide-examples.mjs  逐个运行 Java 整体讲解中的示例
src/useCloudProgress.js    账号生命周期、分账号缓存和自动同步
src/cloud-progress.js     合并、字段修改时钟与并发版本处理
src/components/AccountPanel.vue  登录、同步状态和游客合并
supabase/migrations/      数据表、RLS 和数据格式约束
supabase/tests/           回滚式数据库隔离验证
scripts/offline.mjs        生成单文件离线版
public/answers/            适用于力扣编辑区的完整答案
java-validation/           带 Main 和辅助类型的独立 Java 验证文件
```

教学文字与练习请编辑 src/data/units/*.js；顺序、前置、章末题在 course.js。旧 content.py 已显式停用，防止覆盖新版课程。已有阅读、笔记、收藏、奖励和打卡会保留；新版练习通过状态独立保存在 mastery 字段。第5章改用LC1051，旧版闯关奖励保留，但新版题目需重新完成且不重复奖励。

新增大章节时，请保持相同 boss 数据结构：题号与链接、题意、关联、步骤、证明、复杂度、易错点、两个输入输出情境、思路问题、提示、完整逐行 Java 代码；并为新题补充 logic.js 的参考实现与 check.mjs 验证。界面会自动按同一结构显示。

当前文件夹（本次工作区）：`/workspace/sites/algorithm-quest-github`。这是本次工作区路径，并非已经写入你 Windows 电脑的磁盘。下载 ZIP 后，可将整个文件夹解压到你自己的 `D:\Projects\algo-quest-vue` 等目录。

## 验证

```bash
npm run check
npm run check:examples
npm run check:cloud
```

基础内容与参考算法检查只需要 Node。如果系统有带 jdk.compiler 模块的 JDK，还会编译全部 Java 示例，并执行十二道章末答案的 24 个情境。没有 JDK 时会明确提示跳过可选 Java 编译验证，网站仍能正常使用。

`npm run check:examples` 会使用 JDK 运行 44 份代码讲解的示例，并检查输出；没有 JDK 时会提示跳过。

`java-validation/LC题号/Main.java` 可单独编译运行：在对应文件夹执行 `javac Main.java`，然后 `java Main`。这些文件包含测试需要的 main 和 TreeNode；提交力扣请使用网页中的 Solution 答案，避免重复定义平台类型。

## 参考与来源

本次通过 Exa 搜索并阅读主要来源，参考从概念、逐步交互到练习反馈的组织方式：Hello 算法、VisuAlgo（https://visualgo.net/en/sorting/）、OpenDSA（https://opendsa.cs.vt.edu/）及 Java 官方数组教程（https://dev.java/learn/language-basics/arrays/）。

课程组织参考 Hello 算法（https://www.hello-algo.com/）与算法通关手册（https://algo.itcharge.cn/）；语法参考 Java 官方教程（https://dev.java/learn/）。讲解、图解与代码重新编写，未搬运原站整篇教程。所有章末题均保留 LeetCode 原题链接，题目要求已逐题核对。网页用自行编写的中文说明与练习情境讲解题意。

项目使用锁定版本：Vue 3.5.44、Vite 7.3.7、@vitejs/plugin-vue 6.0.10。依赖许可证见对应 npm 包。

云端功能使用锁定的 @supabase/supabase-js 2.118.0。`npm run check:cloud` 检查合并收敛、打卡去重、清空笔记与取消收藏、旧存档迁移、并发重试、保存时输入、离线恢复和切换账号时取消旧请求。GitHub Actions 在每次部署前自动执行课程检查和云端逻辑检查。真实 OAuth 首次登录仍需完成上述提供商配置后，在浏览器验证。
