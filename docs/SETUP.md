# 开发环境与本地使用

## 离线使用

可选执行 `npm run build:offline` 后，双击生成的 **offline.html**，可离线阅读全部课程、看图解、查看 Java 逐行说明、闯关和记笔记。这里已经打包了 Vue、样式和课程，不会从 CDN 加载依赖。

离线版将入口脚本、样式和图解内嵌在一个文件中。持续集成检查 `file://` 下的笔记保存及 Java 下载；若你的浏览器限制本地保存或模块，请按下面的 npm 启动方式使用。

本地 HTML 与开发服务属于不同浏览器来源，进度可能分别保存。换打开方式或换电脑前，请在“学习记录”导出 JSON，再导入。浏览器限制本地保存时，网页会提示；仍可导出备份。

## 开发启动

Node.js 需要满足 package.json 的 engines 条件：20.19+ 或 22.12+；建议使用受支持的 LTS 版本。在项目根目录的终端执行：

```bash
npm ci
npm run dev
```

默认地址为 `http://127.0.0.1:5173/`，以终端实际显示地址为准。如果端口已占用，Vite 会选择下一个可用端口。停止服务可在终端按 Ctrl+C。

首次安装依赖需要联网；安装后课程功能不依赖外部服务。点击力扣或参考资料链接时需要联网。

## 生成生产版本

```bash
npm run build
npm run preview
```

`dist/` 是生产构建目录。默认构建不会生成单文件HTML；离线兼容版由 `npm run build:offline` 单独生成。dist 使用 JavaScript 模块，建议通过 `npm run preview` 访问；双击打开请使用专门的 offline.html。

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
npm run check:coding
npm run check:topics
```

基础内容与参考算法检查只需要 Node。检查命令只读源码；Java 编译和运行使用临时目录。只跑 Node 检查可使用 `npm run check -- --skip-java`。

浏览器回归：构建后执行 `npx playwright install chromium` 和 `npm run test:browser`。检查课程路由、七种视口、笔记与备份流程以及 `file://` 离线版。分支 CI 的 **algorithm-quest-vite-preview** 包含完整Vite dist，应使用HTTP服务预览，预览版不会启用正式站的登录与统计。

如果系统有带 jdk.compiler 模块的 JDK，还会编译全部 Java 示例，并执行十二道章末答案的 24 个情境。没有 JDK 时会明确提示跳过可选 Java 编译验证，网站仍能正常使用。

`npm run check:examples` 会使用 JDK 运行 44 份代码讲解的示例，并检查输出；没有 JDK 时会提示跳过。

运行 `npm run generate:java` 后，`java-validation/LC题号/Main.java` 可单独编译运行：在对应文件夹执行 `javac Main.java`，然后 `java Main`。这些文件包含测试需要的 main 和 TreeNode；提交力扣请使用网页中的 Solution 答案，避免重复定义平台类型。
