# Focus Space

可交互的 Focus Space 架构与生成原则 demo。

版本：**v008 · 2026-11-25**

## 修改原则

[查看原则文档](PRINCIPLES.md) · [直接编辑](https://github.com/Ziyueeee/focus-space-architecture/edit/main/PRINCIPLES.md)

`PRINCIPLES.md` 是界面原则的唯一内容来源。提交到 `main` 后 GitHub Pages 自动发布，刷新 demo 即可读取最新内容；无需改 JavaScript。格式说明在文档末尾。

## v008 · 2026-11-25

- 新增 PRINCIPLES.md，完整保留三组 25 条原则及子规则。
- 页面和整组复制统一读取 Markdown；Chat 关联随文档同步。
- 顶部新增原则文档入口，支持在 GitHub 直接编辑提交。
- 增加加载与失败重试状态，移除重复的 JS 原则副本。

## v007 · 2026-11-25

- 默认进入线框视图，初始按钮状态同步。
- 保留示例切换与明确指定 `view=example` 的链接。

## v006 · 2026-11-25

- Facts 纳入 Persistent UI，统一线框与定义。
- Focus Generation 9 条原则；Active UI 8 条（含 Spatial Constraint）；Persistent UI 8 条。
- 求婚与装修 3D mock 示例，按案例选择五种模拟情境。
- 00 / 01 / 02 入口、标题整组复制、精简辅助文字。

## 运行

直接打开 GitHub Pages，或在此目录运行 `python3 -m http.server 8806`。

示例数据保存在各自浏览器中；装修模型是模拟示意图。未连接真实 AI 或外部服务。

## 发布

使用 GitHub Pages 从 `main` 根目录发布。每次上线同步页面版本、`release.json` 和此版本说明。代码发布时的文件 SHA-256 记录在 `release.json`；之后直接编辑 Markdown 的内容修订可在 GitHub 文件历史中追溯。
