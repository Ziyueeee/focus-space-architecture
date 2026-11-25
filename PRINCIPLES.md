# Focus Space · 架构与生成原则

[打开 Demo](https://ziyueeee.github.io/focus-space-architecture/) · [编辑此文档](https://github.com/Ziyueeee/focus-space-architecture/edit/main/PRINCIPLES.md)

## 00 · Focus Generation

**Focus Generation Contract**

基于用户的 Goal 和已有 Context，建立一个可持续使用、随现实变化演进的 Focus，帮助用户理解、管理和推进自己关心的事情。输入可以只有一句 Goal，不要求用户预先定义完整需求。

### 1. Intent Understanding

理解用户为什么关注这件事、希望达成什么，以及在什么情境下需要使用 Focus。信息不足时保留未知，不将 AI 建议视为用户决定。

### 2. Goal-oriented Intelligence

理解信息之间的关系、依赖、变化及其对用户目标的影响。主动发现有价值的关联、机会与潜在冲突，而非仅记录和呈现信息。

### 3. Lifecycle Awareness

理解 Focus 在现实中的发展过程，包括初始化、推进、变化、搁置、完成或长期维持。从当前有用的最小结构开始，随实际需求逐步扩展，不提前生成不必要的内容。

### 4. Purpose-driven Composition

根据用户意图和实际使用需求生成 Active UI 与 Persistent UI，确保用户能够快速理解现状，并自然地查看和操作具体信息。选择最适合表达信息关系的组件与交互方式，而非强制套用固定页面模板。

### 5. Shared Context & State

所有 UI、Chat 和 Agent Work 共享底层 Focus Memory。新信息、用户操作及执行结果同步更新相关 Context 和视图。明确区分事实、建议、决定、推断与未知信息，重要变化可追溯、可纠正。

### 6. Reduce User Effort

充分利用已有 Context 和授权能力，主动承担信息整理、推算、核对、比较及可执行的工作。避免重复询问、重复输入和不必要的操作，仅在需要用户判断、补充关键事实或授权时请求介入。

### 7. Human–AI Collaboration

优先支持直接操作；需要探索、比较、解释或表达复杂意图时，通过带上下文的 Chat 协作。用户能够理解 AI 的判断与行动，并随时纠正、调整或接续。重要决定和结构变更由用户控制。

### 8. Attention Management

根据当前情境判断什么值得用户关注，以及何时、何地呈现。Active UI、Focus Cover 和 Feed 承担不同层级的注意力分配，支持跨 Focus 的优先级判断，避免重复呈现与不必要的打扰。

### 9. System Consistency

允许不同 Focus 拥有适合自身目标的信息结构与交互形式，但遵循统一的 System Shell、Component Library 和基础交互规范，保持操作体验的可预测性。

> **Understand the Intent. Shape the Experience. Evolve with Reality.**

## 01 · Active UI

**Contextual Spotlight**

由 Agent 根据当前 Context、State、时机及用户需求，主动突出此刻最值得用户关注的信息或交互，并参与跨 Focus 的全局注意力分配。

### Attention-driven

由 Agent 判断当前最值得用户关注的内容，而非展示所有未完成事项。

### Contextual & Timely

可呈现提醒、建议、重要变化、成果或下一步行动，不要求用户必须回复。根据现实情境与时间变化判断合适的呈现时机。

### Priority-aware

根据紧迫性、影响程度、情境相关性、即时使用价值及用户偏好动态评估优先级。优先级随 Context、State 和时间变化，而非固定不变。

### Cross-focus Attention

区分 Focus 内部优先级与全局优先级。进入首页的 Active UI 参与跨 Focus 的统一排序，使首页优先呈现用户此刻最值得关注的内容。

### Selective Visibility

分别判断 Active UI 是否应该生成、是否值得在首页呈现，以及在首页的排序位置。并非所有 Focus 内的 Active UI 都需要冒泡到首页。

### Selective & Ephemeral

默认保持 Quiet；根据情境出现、更新或消退。记录用户反馈与历史曝光，避免重复打扰；已解决、失效或被暂缓的内容应及时更新或退出相应展示区域。

### Spatial Constraint

Active UI 应保持紧凑，优先呈现关键信息与核心操作，避免过度占用屏幕空间。

- 在 Focus Detail 中，理想高度为页面可用视口的 1/3 以内，最大不得超过 2/3，根据内容自然适配，不强制填满。
- 在首页 Active UI List 中，采用更紧凑的表达形式，以适应跨 Focus 的信息浏览。
- 当内容超出空间限制时，优先提炼关键信息，通过 Progressive Disclosure 或 Contextual Chat 承载更多内容与复杂交互。

### Actionable when needed

<!-- chat -->

支持直接操作，或展开带有 Context 的 Chat 进行深入讨论。操作结果同步至对应 Focus Memory 和相关 UI。

> **Agent brings what matters into focus.**

## 02 · Persistent UI

**Schema-based GenUI**

基于 Focus Intent 和 Context 生成的、持续可访问的工作空间，帮助用户快速理解当前状况，并主动查看、管理和操作具体信息。

### 1. Intent-driven Generation

根据 Focus Intent、已有 Context 和 Few-shot 参考案例生成初始 UI Schema，在 Generation Contract 和 Component Library 的约束下选择合适的组件，不强制套用固定模板。

### 2. At-a-glance Understanding

确保用户进入 Focus 时，无需逐一查看详情即可快速理解当前的关键事实、状态与进展。

- 对于一体式界面，通过整体场景、对象及其关系直接传达当前状况。
- 对于模块式界面，在 Persistent UI 顶部呈现 Facts GenUI，综合概括当前状况。
- 根据数据特点选择合适的概览形式，如结构化信息、图表、时间线等；没有更合适的表达时，以简短文字兜底。

### 3. Purpose-driven Composition

根据 Focus 的信息关系和实际操作需求选择合适的信息组织方式，允许一体式与模块式 GenUI 灵活组合。

概览负责整体理解，详情负责具体信息的查看与操作。允许信息重叠，但不机械重复相同字段。

不为了视觉差异化而强制使用游戏化形式，也不为了统一结构而强制使用卡片式布局。

### 4. Stable Schema

初始 Schema 生成后持久保存，已有组件、布局及概览形式默认保持稳定，不因 Context 更新或用户重新进入 Focus 而自动重组。

### 5. Context-driven Data

新 Context 更新对应字段、组件内容及状态，确保概览与详情共享同一套底层 Memory，并同步反映最新情况，明确区分已确认、待定与未知信息。

### 6. User-controlled Structure

<!-- chat -->

用户可通过 Chat 或直接操作增加、移除、调整组件；AI 可根据需求或 Focus 阶段变化提出结构调整建议，但需用户确认。

### 7. Bidirectional Editing

<!-- chat -->

Chat 和直接操作均可修改组件数据，并保持同步。

### 8. Data–View Separation

隐藏或移除组件不等于删除底层数据。

> **Intent-driven Generation, At-a-glance Understanding, Stable Structure, Evolving Content.**

## 编辑方式

在 GitHub 中点击上方「编辑此文档」，修改后提交到 `main`。GitHub Pages 发布完成后，打开或刷新 Demo，页面与整组复制都会读取最新内容。

可直接修改标题、正文、核心原则和列表，也可以增加、移除或调整三级标题下的规则。保留三组二级标题的编号 `00`、`01`、`02`；各组开头的加粗行是副标题，结尾引用块是核心原则。标记 `<!-- chat -->` 的规则同时用于 Chat 说明，请在改名或调整顺序时保留标记。

支持普通段落、加粗、斜体、行内代码、链接和一级列表。GitHub 上提交的版本才会更新公开网页；只修改电脑里的文件时，请先提交并推送。
