# 贡献指南

欢迎修正讲解、增加反例、改进无障碍交互和贡献练习。先说明要解决的具体学习问题；保留现有课程 ID，避免破坏学习记录与深链接。

## 本地开发

按 [开发环境](docs/SETUP.md) 安装依赖。使用 `npm run dev` 预览，提交前执行 `npm run build` 及与修改有关的测试。

## 添加或修改课程

- 基础课程在 `src/data/base-course.js` 及 `src/data/units/` 中组合，章节和小节补充分别在 `chapter-depth.js`、`lesson-depth.js`。
- 专题目录在 `src/data/algorithm-roadmap.js`，正文在 `src/data/topics/`；保持目录、加载器与前置依赖一致，不创建循环依赖。
- 先给输入、初始状态与规则，再讲概念、适用条件、反例、复杂度和 Java 实现，避免依赖读者猜测题意。
- 修改目录后运行 `npm run generate:index`，提交生成的 `src/data/course-index.json`。

## 贡献练习与教学工具

- 编程任务在 `src/data/coding-catalog.js`、`topic-coding.js`；每题要有签名、范围、正常和边界用例、答案及分层提示。
- 章末配对在 `src/data/chapter-challenges.js`，保持 Easy/Medium 难度与前置说明准确，进阶题不阻塞入门学习。
- 复杂度训练在 `src/data/complexity-practice.js`，说明输入规模、基本操作、输出空间和递归栈。
- 推演必须由输入计算步骤，不能把固定截图伪装成任意代码执行器；对比模块需使用相同输入。
- 有效答题按概念、边界、复杂度分类，格式错误不计为知识错误，不用耗时直接诊断能力。

## 代码与验证

Vue 组件使用现有组合式 API 和 UI 控件，沿用主题变量、键盘交互与触屏阅读策略，移动端不加载 Monaco/CheerpJ。动画尊重减少动态效果设置。

运行 `npm run lint`、`npm run test:components`；对导航或交互改动补充精简 Playwright 验证。不要为文字修改添加无意义快照或反复全站扫描。提交前用 Prettier 格式化修改的文件。

## 数据和提交

保留旧存档兼容和账号隔离。不要提交密钥、私人笔记或测试账号。提交信息说明用户可见改动，PR 描述包含验证和已知限制。外部代码或素材必须记录来源和许可；仓库未声明统一开源许可证，不要自行推定授权范围。
