# Java 在线实践与职业路线 · 分支验收说明

日期：2026-11-08。功能分支：`codex/java-practice-career`；基线：`main` 的 `2b0a796b169bfe244c6615a50ec43ad3b29e9c85`。

## 预览与合并边界

本轮只提交功能分支，由用户确认后再合并。没有部署生产网站，没有改变 Supabase 生产结构、Auth 配置、权限或统计服务。

```sh
git fetch origin
git switch codex/java-practice-career
npm ci
npm run build
npm run preview -- --port 4173
```

打开终端显示的 Vite 地址。主要入口：`/#/practice`、`/#/playground`、`/#/practice/review`、`/#/careers`。不要双击 dist/index.html；预览使用完整 Vite 构建的 index、JavaScript 分包、样式与资源。分支 CI 提供 `algorithm-quest-vite-preview` 完整 dist 产物。

默认构建已不再生成单文件 HTML。原有离线阅读仍可通过独立的 `npm run build:offline` 构建，作为兼容功能，不作为本轮预览。在线 Java 需要 HTTP/HTTPS 和首次联网加载。

## 已实现

| 范围 | 实现与验收方式 |
| --- | --- |
| 在线 Java | CheerpJ 5.0、Java 17、真实 javac 编译；完整程序实验台、方法体练习、运行示例、提交全部测试、停止、中文解释与错误行号 |
| 隔离 | 无 allow-same-origin 的 sandbox iframe；Java 在 Worker 中执行；每次提交结束销毁 Worker；只允许运行环境 CDN 网络请求；不向运行环境发送账号令牌 |
| 限制 | 初始化最多120秒、编译45秒、执行5秒、输出16KB；取消或切页清理运行环境；代码变更后不把旧结果计入新代码 |
| 练习 | 61项独立任务，默认225组测试；16项改变任务要求的复习变式，49组测试；合计274组真实JDK验证 |
| 新学 | Java起步示例可原地改写运行；学到方法后使用方法体编程；基础课新增编程入口及页内目录锚点；原有练习保留 |
| 复习 | 每天新的复习草稿；提示/参考分类、独立通过记录；1/3/7/14/30天间隔；当天重复完成不反复延长；失败当天重做 |
| 职业路线 | Java后端和算法工程师各7阶段，独立导航；每阶段包含生活引入、概念、操作步骤、实践、小测、交付清单、官方参考 |
| 后端项目 | Spring Boot 4.0.9、Java17、HTTP服务、starter/reference、6项JUnit/HTTP测试；SQL约束与事务工作单；仅监听127.0.0.1 |
| 算法项目 | Python标准库、Notebook、数据划分、线性回归、基线/指标、推荐；14项计算/HTTP测试；仅监听127.0.0.1的推荐演示服务 |
| 导航 | 全站面包屑、章节父级目录、跨标签学习位置更新；从术语等页面点击基础教学可回到之前课程；目录中标记并恢复上次章节 |
| 文档体验 | 职业阶段侧栏、页内锚点、Ctrl/⌘K或/搜索；统一搜索覆盖课程、编程、职业内容、术语和私人笔记 |
| 持久化 | 编程结果、复习日期、职业选择和阶段自评复用已有Supabase云存档；代码/工作单草稿留在本机并按账号隔离；兼容旧存档与备份 |
| UI | 延续蓝白阅读界面与4/6/8px圆角；复用既有Uiverse复选框及Morphicons真实状态；移动端单栏与阶段横向导航 |

## 教学与可信范围

浏览器判题是学习自测，测试数据和结果可被客户端查看或修改，不作为防作弊考试、证书或就业证明。曾经通过与当前失败分别表达；看过参考后完成不会记为本次独立完成。职业项目清单是学生自评，完整外部工程并未由本站替学生部署或审核。

算法工程师路线以机器学习和推荐搜索入门为主，先补Python与数学，之后再进入专门方向。Python与Notebook在学生自己的环境运行，本轮没有伪装成支持在线Python、GPU训练或任意Spring项目运行。Java在线编辑器是轻量文本编辑器，不包含完整IDE的智能补全或逐行调试器。

## 性能对照

从强制单包改为页面按需加载；抽出由源课程自动生成的轻量导航索引，正文、代码阅读器、搜索索引、职业内容、项目包和Java运行器分别加载。

| 指标 | 改前 | 改后（本轮构建测量，约值） |
| --- | ---: | ---: |
| 首页JavaScript原始大小 | 1,089.85 KB | 433 KB |
| 首页JavaScript gzip | 399.19 KB | 143 KB（减少约64%） |
| 全部JavaScript原始大小 | 1,089.85 KB | 1,250 KB |
| 全部JavaScript gzip | 399.19 KB | 488 KB |

新增课程、练习和项目使全部资源增加；首屏只需读取其中一部分。这里是构建体积测量，不是实测LCP提升，也不包含点击运行后才下载的CheerpJ/JDK CDN资源。执行 `npm run measure:build` 可复查当前数字。

已审查运行时依赖：Vue、Supabase和Morphicons均在使用；没有为了减包数字误删功能依赖，也没有新增大型编辑器或UI框架。删除了未使用的导入，移除了默认构建强制合包和自动离线文件生成。构建工具Vite与Vue插件归入devDependencies；离线校验显式使用构建链已有的同版本Rollup解析器，避免把Python示例文本误判成JavaScript导入。所有依赖继续固定版本。

## 验证与维护

- 已在浏览器验证数组求和、编译错误行、死循环超时、3/3通过、错误答案1/3通过及草稿恢复。
- 已通过274组JDK测试、14项Python测试、SQL工作单和6项Spring接口测试。
- 组件测试覆盖复习间隔、云端合并、非法路由、职业数据连接及项目ZIP/Notebook结构；浏览器回归由PR的完整Vite构建运行。
- 生产数据库保持不变。既有云存档隔离、评论、打卡与统计检查继续执行。

常用命令：`npm run lint`、`npm run format:check`、`npm run check`、`npm run check:coding`、`npm run check:careers`、`npm run test:components`、`npm run build`、`npm run test:browser`。职业项目验证需要Python、JDK17与Maven；普通网站构建与预览只需要Node。

只编辑课程与练习源文件。变更课程标题、顺序、任务或术语后运行 `npm run generate:index`；CI检查 `course-index.json` 是否与源文件一致。修改Java运行桥后运行 `npm run build:java-runner`，同时提交Java源文件与生成的JAR。

新增核心文件：`src/java/`、`src/data/coding-catalog.js`、`coding-review.js`、`career-index.js`、`career-lessons.js`、`course-index.*`、`src/career-projects/`、`src/project-export.js`、`src/coding-progress.js`、`src/pages/PracticePage.vue`、`CareerPage.vue`、`JavaPlayground.vue`，以及对应检查脚本和测试。

参考：CheerpJ官方文档、Java官方教程、Spring指南、MDN、PostgreSQL教程、Pro Git、Python官方教程、Google ML Crash Course、scikit-learn与PyTorch官方教程。正文与实践均独立编写，外部链接保留在各阶段。
