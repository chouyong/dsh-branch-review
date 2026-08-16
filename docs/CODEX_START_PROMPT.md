# `dsh-branch-review` Codex 开发启动任务

你当前唯一可写的产品目录是：`D:\knowledgeBase\dsh-branch-review`。

立即开始开发，不要只输出建议或停留在规划。Codex 负责架构、实现、测试、真实部署、证据、Git 历史和 PR 准备；Claude 只在实现与证据稳定后进行独立、只读、失败关闭的技术审核，不参与编码。

## 一、目录与并行边界

- 只修改 `D:\knowledgeBase\dsh-branch-review`。
- `D:\knowledgeBase\dsh-effect-doctor` 由另一个 Codex 终端独占，禁止读取其未完成文件、修改、提交或协调其实现。
- `D:\knowledgeBase\dsh-session-tree`（插件名 `dsh-fork-graph`）、`D:\knowledgeBase\dsh-fork-diff`、`D:\knowledgeBase\deepseek-harness` 和 `D:\knowledgeBase\cordis` 仅作只读事实源，禁止修改。
- 先检查本目录、父目录和目标源码目录内适用的 `AGENTS.md` / `CLAUDE.md`，遵守更深层规则。
- 保留所有既有用户文件和脏工作树，不执行清理、reset、checkout 覆盖或跨仓迁移。

## 二、必须使用的工作流

1. 使用 `$planning-with-files`：本目录创建并持续更新 `task_plan.md`、`findings.md`、`progress.md`；先规划再改代码，错误必须记录，外部内容只写入 `findings.md`。
2. 使用 `$dsh-plugin-real-release-gate`：按 Stage 0→4 预注册并执行真实构建、安装、DSH Web、交互、截图和发布门禁，最终只能给出 `FIRST_PASS`、`PASS_AFTER_CHANGES` 或 `FAIL`。
3. 使用 `$codex-claude-cli-review`：实现、测试和证据稳定后才运行 Claude 独立审核；先 dry-run，再单链只读审核；`HOLD` 后保留 R1，修复并验证后创建 R2，不覆盖历史文件。
4. 如果本目录还没有 `.codegraph/`，本提示明确授权你运行 `codegraph init -i`。结构问题先用 CodeGraph；字符串、README 和日志才用 `rg`/直接读取。
5. 所有文本使用 UTF-8；编辑使用原生 `apply_patch`；每阶段完成后做严格 UTF-8、`git diff --check` 和定向验证。

## 三、产品目标

一句话：把相关 DSH 会话分支的比较结果变成可追踪的人工决策队列。

前两款已发布插件分别解决：

- `dsh-fork-graph`：看见分支。
- `dsh-fork-diff`：比较父、子或兄弟分支的公开历史。

本插件解决下一步：用户比较后，明确记录哪些分支保留、淘汰、待跟进，为什么，以及对应的 issue/PR 链接。

## 四、不可违反的产品边界

- 只处理真实 parent/child/sibling 血缘，不把无关会话放进默认评审候选。
- 不写 session event，不创建 fork，不恢复 Agent，不修改工作区文件，不注入 prompt，不上传会话正文。
- 不自动判断赢家，不执行 merge/cherry-pick，不把最长公共前缀声称为持久化层精确 fork boundary。
- 默认不持久化 prompt、assistant 正文、tool arguments/results、凭据、Cookie、环境变量或隐藏运行态。
- 评审理由、标签和外部链接是用户显式输入；导出必须由用户显式触发并有清晰隐私说明。
- 不修改 `dsh-fork-diff` 来偷取内部状态，也不复制其整套历史归一化/diff 实现。v1 聚焦决策记录与队列；跨插件集成只能以后通过明确、版本化、公开的 Cordis service 设计。

## 五、Stage 0 必须先回答的问题

使用 CodeGraph 核对 `deepseek-harness`、`dsh-fork-graph` 与 `dsh-fork-diff`，形成带文件/符号证据的 `findings.md`：

- 当前可安装 DSH 版本真实提供哪个 UI slot；不要只看主干而忽略 npm 发布版。
- `SessionListState` 的 `id` / `parentId` 与 Host/sidebar 的 `sessionId` / `parentSessionId` 区别。
- `ISessions.list`、`ISessions.open(id)` 和浏览器存储的实际可用性与卸载边界。
- 记录模型如何处理会话删除、标题变化、损坏/旧版本本地记录、跨血缘导入和未知 schemaVersion。
- 选择 `localStorage`、IndexedDB 或只读 Host 桥接的依据；优先最小、可迁移、可导出、卸载无残留的方案。
- 发布当天最接近的 branch review / session decision / fork annotation 竞品；无命中只能说明低可发现性，禁止宣称“首个”或“唯一”。

## 六、MVP 验收范围

- 版本化 `ReviewRecord` schema，至少包含稳定记录 ID、左右 session ID、人工状态、短理由、标签、外部链接、创建/更新时间和 schemaVersion。
- 状态语义必须无歧义。可选择 `unresolved / keep-left / keep-right / keep-both / discard-both / follow-up`，或更好的等价模型，但先写迁移和 UI 语义测试。
- 仅从真实相关分支创建评审记录；记录失去对应会话时保留但明确显示 orphaned/degraded，不静默删除。
- 本地队列支持未评审、保留、淘汰、待跟进筛选；可从记录打开对应会话。
- 支持显式 JSON 导入/导出；如做 HTML，只导出评审元数据和用户选择内容，不默认打包会话正文。
- 处理存储损坏、重复记录、未知 schema、容量/写入失败和并发标签页更新；失败关闭并可恢复。
- DSH 无相关分支时不显示无效入口；桌面和移动端都可用；支持键盘、Escape、焦点恢复和可读错误状态。
- 每个样式、listener、storage subscription 和 slot contribution 都有精确 disposer。

## 七、工程与测试门禁

- 使用真实可安装的 DSH/Cordis 包版本，必要时像前两款插件一样声明窄本地类型契约，并注明来源；不要猜测不存在的 npm 包。
- 浏览器产物必须使用 `window.__ModuleLoader__.load({ id, factory })`，React、Cordis、slots/runtime/UI primitives 必须 external，禁止打包第二份 React。
- 建立纯函数边界：记录校验/迁移、血缘 eligibility、筛选排序、序列化/导入、降级状态。
- 覆盖正常、损坏、重复、未知版本、deleted session、subagent、blank session、大量记录、移动端和卸载清理。
- 提供 typecheck、生产 build、bundle contract、定向测试和完整测试的一键 `verify` 命令。
- README 必须含痛点、真实安装、真实截图、使用说明、隐私边界、兼容版本、已知限制和与现有 share/repro/export 插件的区别。

## 八、真实运行与截图门禁

按 `$dsh-plugin-real-release-gate` 适配本产品预注册证据：

1. Stage 0：记录仓库、运行时、profile、端口、dirty state、预期无分支/有分支行为和秘密边界。
2. Stage 1：安装依赖、typecheck、build、bundle contract、全量测试；先尝试文档化安装路径，失败要保留类别，之后才允许验证 tarball fallback。
3. Stage 2：隔离 D 盘 profile 启动真实 DSH，client asset HTTP 200，style/slot 在位，console/page/request error 都为 0；卸载后贡献和监听清理。
4. Stage 3：在真实 DSH UI 创建或打开一个 parent 和两个 sibling forks，创建至少三种决策记录，验证筛选、重载持久性、打开会话、导入/导出、桌面与 390px 移动端。
5. 至少三张本插件自己的真实截图和一个短 GIF；禁止概念图、重绘或替代截图。
6. Stage 4：只用已验证事实更新文档、构件哈希、release report 和 PR 准备材料。

## 九、Claude 独立审核

- Codex 完成实现、`npm run verify`、真实 DSH 门禁和证据文件后，使用 `$codex-claude-cli-review`。
- Claude 使用 `--safe-mode`，只开放 Read/Glob/Grep；禁止 Bash、Write/Edit、Agent、WebFetch/WebSearch、Codex 或其它模型。
- 每轮单独使用 `docs/CODEX_TO_CLAUDE_REVIEW_NOTICE_R<N>.md` 与 `docs/CLAUDE_TO_CODEX_REVIEW_RECEIPT_R<N>.md`。
- 回执唯一末行必须是 `FINAL_DECISION: GO` 或 `FINAL_DECISION: HOLD`；缺失、重复或超时都失败关闭。
- Claude `GO` 只是声明范围内的技术证据；Codex 必须独立复查 diff 和最高信号测试。

## 十、Git、GitHub、10 commits 与 24 小时 PR 红线

- 可以立即初始化本地 `main` 仓库并开始真实开发提交。
- 如果 GitHub 同名远端不存在，先向用户确认 GitHub owner 和 visibility；未明确前不得自行创建公开仓库，但本地开发继续。
- 远端获准创建后，立即记录 GitHub API 的真实 `created_at` 和 `eligible_after = created_at + 24h` 到 `docs/publication-eligibility.md`，不得伪造、回填或用本地时间替代。
- 产品仓库在任何 awesome-list PR 前必须至少有 10 个真实、功能性、可审阅提交。禁止空提交、伪造时间、机械拆分同一改动或把失败噪声当提交数。
- 建议的真实里程碑提交：规则/计划与证据契约；项目/构建脚手架；类型契约与 record schema；存储/迁移；血缘 eligibility；队列模型；UI/slot；导入导出与隐私；可访问性/生命周期/bundle 测试；真实门禁文档与发布构件。实际提交按完成事实调整，不为凑数破坏原子性。
- 每个提交完成后运行对应最小验证；保持清晰历史，不强推。不要为了 awesome PR 把产品仓历史 squash 到少于 10 个提交。
- awesome-list PR 是另一仓库的聚焦贡献：重新读取当时贡献规则，只改允许的列表行/必要元数据，通常保持一个聚焦提交；不要把产品仓 10 个提交复制进列表 PR。
- 只有以下全部成立才能创建 PR：GitHub `created_at` 已满 24 小时；产品仓真实提交数 ≥10；目标列表全部规则通过；Stage 0→3 真实门禁通过；真实截图存在；release/安装源可复核；Claude 最终 `GO`；PR diff 聚焦。
- 未到 24 小时或提交数不足时，状态必须写 `WAITING_ELIGIBILITY`，继续完善测试/文档但禁止提前提必败 PR。禁止自动 merge、强推或绕过规则。

## 十一、执行节奏

- 先完成只读预检、项目规则、规划文件和 Stage 0 证据，再写实现。
- 持续推进到本地实现与真实门禁闭合；不要因等待 GitHub 24 小时而停止其它可做工作。
- 每个阶段给用户简短进度，明确已验证事实、下一步和阻塞项。
- 遇到 public repo visibility、外部 release、远端 PR 以外的授权问题才询问；普通实现决策基于源码证据自行推进。
- 现在开始执行。
