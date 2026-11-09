# 第三方图标

`src/components/GitHubIcon.vue` 使用 GitHub 官方 Primer Octicons 的 `mark-github-16` 图标，保留原始轮廓，仅通过 CSS 调整展示尺寸与颜色。

来源：https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg

## Primer Octicons — MIT License

Copyright (c) 2026 GitHub Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Morphicons — MIT License

`morphicons` 2.0.2 用于菜单/关闭、播放/暂停、复制/完成、笔记固定/取消固定等状态过渡。所有新增小图标路径在本项目 `src/ui-icons.js` 中定义；统一通过 `UiIcon.vue` 启用 `reducedMotion="user"`。GitHub 标志继续使用官方 Octicons，不参与变形。

来源：https://github.com/guillermolg00/morphicons

MIT License

Copyright (c) 2026 Guillermo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 2026-11-02 设计参考

初次现代界面改版通过 Exa 阅读 UI/UX Pro Max（https://www.uupm.cc/）、Taste Skill（https://www.tasteskill.dev/）与 Uiverse（https://uiverse.io/）的公开页面，用于配色、排版、布局和动效方向的参考。该次改版自行编写样式与组件，没有复制这些页面的组件源码，也没有新增 UI 框架依赖。GitHub 官方图标和已使用的 Morphicons 继续按上述许可证提供。


## Uiverse · WhiteNervosa · popular-ladybug-27

顶部主导航的中心展开下划线交互改编自用户提供的按钮代码。字体、颜色及作用范围已适配本项目，保留400ms动画和原缓动曲线。

来源：https://uiverse.io/WhiteNervosa/popular-ladybug-27

MIT License

Copyright - 2026 WhiteNervosa (WhiteNervosa)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 2026-11-08 · Uiverse 交互组件参考与适配

本轮把社区元素中的交互方式适配为项目内可复用的 Vue 控件，保留蓝白配色和原有圆角、焦点规则。未照搬整页布局，也未使用远程脚本：

| 来源 | 作者 | 适配内容 |
| --- | --- | --- |
| https://uiverse.io/cssbuttons-io/wonderful-baboon-62 | cssbuttons-io（cssbuttons.io） | 按压缩放与按钮内容层；缩小幅度调整为 0.975，使用本站单色操作色 |
| https://uiverse.io/Galahhad/breezy-wolverine-23 | Galahhad（Galahad） | 搜索图标、输入状态与容器反馈；保留可见/关联标签，增加清空并返回输入焦点 |
| https://uiverse.io/cbolson/calm-wasp-75 | cbolson（Chris Bolson） | 原生 checkbox 的自定义外观、勾选过渡与焦点反馈；本项目使用 SVG 勾线并保留完整标签点击区 |

这些页面标明 UI 元素采用 MIT 许可。下列许可文本适用于相应适配来源；本站分段切换、点击反馈、状态展示与组合方式独立实现。

Copyright - 2026 cssbuttons-io (cssbuttons.io)

Copyright - 2026 Galahhad (Galahad)

Copyright - 2026 cbolson (Chris Bolson)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## CheerpJ 5.0

Java运行环境通过官方CDN `https://cjrtnc.leaningtech.com/5.0/loader.js` 按需加载，不在仓库中再分发运行时。运行区保留Built with CheerpJ标识。许可范围以 [官方许可说明](https://cheerpj.com/docs/licensing) 为准。`src/java/Runner.java`及其JAR为本项目自行编写的教学桥接代码。

职业路线参考Spring、MDN、Java/Python、PostgreSQL、Google ML、scikit-learn和PyTorch官方资料；概念讲解、案例、项目业务代码及测试均为本项目独立编写。Spring依赖的具体许可证随Maven依赖提供。
