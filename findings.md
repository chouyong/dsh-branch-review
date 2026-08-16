# Findings & Decisions

## Requirements
- 产品目标：将真实相关 DSH 会话分支的比较结果转化为用户显式维护的人工决策队列。
- MVP 包含版本化记录 schema、无歧义状态、短理由、标签、外部链接、时间戳、筛选排序、会话打开和显式 JSON 导入导出。
- 删除或缺失会话必须保留记录并显示 orphaned/degraded；损坏、重复、未知 schema、写入失败和并发更新必须失败关闭且可恢复。
- 无相关分支时不显示无效入口；桌面与 390px 移动端支持键盘、Escape、焦点恢复与可读错误。
- 浏览器产物使用 `window.__ModuleLoader__.load({ id, factory })`，React/Cordis/runtime/slots/UI primitives external。
- 真实门禁要求 parent + 两个 sibling forks、至少三种决策、重载持久性、导航、导入导出、三张真实截图和一个短 GIF。
- GitHub 仓库未满 24 小时、真实功能提交不足 10 个或 Claude 未 GO 时禁止创建 PR。

## Stage 0 Research Findings
- 本目录当前只有 `docs/` 与三份规划台账，尚未初始化 Git；因此没有 source commit、remote 或 dirty-worktree 基线可记录。
- 本目录没有 `.codegraph/`；启动文档已明确授权执行 `codegraph init -i`。
- `D:\knowledgeBase` 与本仓库根部没有 `AGENTS.md` / `CLAUDE.md`；启动文档与用户提供的全局规则直接适用。
- `dsh-fork-graph` 的已验证工程规则指出 npm 发布版 `@deepseek-ai/dsh-client-ui-conversation@0.0.1-rc.1` 只声明 `conversation.session.header.actions`，没有主干才有的 `.utilities`。
- `dsh-fork-graph` 与 `dsh-fork-diff` 一致使用 `SessionListState` 的 `id` / `parentId` / `displayTitle`；Host/sidebar 的拍平条目才使用 `sessionId` / `parentSessionId`。
- 两个插件均要求客户端产物使用 `window.__ModuleLoader__.load({ id, factory })`，React、Cordis、slots/runtime/UI primitives external，并以 bundle contract 防止第二份 React。
- `dsh-fork-graph` 记录三个 npm 包的发布依赖链会触达未发布的 `@deepseek-ai/dsh-compact`，因此采用来源明确的窄本地类型契约与自包含 i18n；新插件必须重新核验实际可安装版本，不能直接按主干猜测。
- `dsh-fork-diff` 的只读事实源边界是 `sessions.list`、`sessions.open(id)` 与 `connection.api.sessions.history(...)`；本插件 v1 不复制其分页历史归一化或 diff 实现。
- `deepseek-harness` 根规则确认所有注册都是 effect，`ctx.effect()` / `ctx.on()` 与 registry `register()` 必须具备 disposer；这与本插件的精确卸载要求一致。
- GitHub CLI 当前有效登录账号为 `chouyong`；创建 owner 必须使用 API 确认值，不能从 Git config 用户名推断。
- 用户明确选择 public；`chouyong/dsh-branch-review` 已创建，GitHub API 真实 `created_at=2026-08-16T11:35:26Z`，唯一发布资格台账为 `docs/publication-eligibility.md`，`eligible_after=2026-08-17T11:35:26Z`。
- 首个提交 `fd010c4803d3aa5a13df140354d0240849ea1eeb` 已普通快进推送；scoped 本地 HEAD 与 GitHub API `refs/heads/main` 返回相同 SHA。
- Goal/hook 运行后根部出现未跟踪 `.claude/`、`.codex/`、`.meta-kim/`、`AGENTS.md`、`CLAUDE.md`、`graphify-out/`；它们不属于本次产品提交，必须保留并先读取适用规则，不能擅自清理或加入 Git。
- CodeGraph 只读索引健康：`deepseek-harness` 3839 files/39996 nodes，`dsh-session-tree` 49/951，`dsh-fork-diff` 29/305；三者均可用于结构调查。
- CodeGraph 精确确认 DSH `SessionSummary` 为 `id`, `title?`, `displayTitle`, `parentId?`, `origin?`, `running`, `blank`, `updatedAt` 等；`SessionListState` 为 host 顺序 `ids`, `byId`, `current`, `phase`, 以及 subagent/job/currentAddress 投影。插件仅消费前四个稳定字段并保持 host 顺序。
- CodeGraph 精确确认 `ISessions.list` 是 `ObservableSnapshot<SessionListState>`，`open(id: SessionId)` 要求 id 存在且未知 id 失败；同一接口还暴露 subagent、search、fork 等写/扩展能力，本插件只使用 list/open。
- 已发布 `@deepseek-ai/dsh-client-ui-conversation@0.0.1-rc.1` 需以 `conversation.session.header.actions` 为 list slot；当前 DSH 主干 `packages/client/ui-conversation/src/client/contract/slots.ts:63` 同时声明 `.utilities`，不能把主干新增 slot 当成发布版能力。
- CodeGraph 精确确认 `createSnapshotStore(init, { persist: { name } })` 委托 `attachPersistence`：浏览器从 `localStorage.getItem(name)` JSON rehydrate，并在每次更新 `localStorage.setItem(name, JSON.stringify(state))`；无 localStorage 时静默关闭，JSON/容量错误只记录 console error。
- DSH manager 的 mutation union 明确处理 `upsert`, `remove`, `status`, `activity`, `engaged`；删除会从 host 列表投影消失，插件记录不能随会话删除而静默丢失，必须降级为 orphaned。
- 只读竞品事实：`ZhengQingJing/dsh-session-tree`（⭐3）与 `Nirvana-Jie/dsh-session-tree`（⭐1）均早于本项目，使用缩进/ASCII 或 ARIA tree，而非决策队列；因此不得宣称“首个/唯一”会话树或分支评审插件。
- 发布日可见的近邻没有本插件的“keep/discard/follow-up 决策记录”语义；这只说明当前检索的低可发现性，不证明绝对不存在竞品。
- DSH 运行事实源记录的真实 home/profile 为 `D:\dsh-home` / `D:\dsh-home\profiles\web`，构建 CLI 为 `D:\knowledgeBase\deepseek-harness\apps\cli\lib\bin.js`，版本 `0.1.0-rc.5`；本插件只复用路径事实，不复用其它插件截图或 receipt。
- 已验证浏览器脚本的高信号门禁包括：根页面与插件 asset HTTP 200、served/local bundle SHA-256 相同、style 节点恰好一个、console/page/request errors 全 0、桌面与 390px 移动布局无横向溢出、真实分支交互后才截图。
- Stage 1 官方安装首次受限 shell 失败类别为 profile 临时文件创建 `EPERM`；同一命令在受控提升后成功，profile 使用 `link:D:/knowledgeBase/dsh-branch-review`，pnpm 11.7.0 supply-chain lock 检查通过。该环境修正使本次最终分类至少为 `PASS_AFTER_CHANGES`。

### Stage 0 Answers
- 可安装 UI slot：`conversation.session.header.actions`；`.utilities` 仅在主干新契约，发布版不能依赖。
- ID 边界：`SessionListState`/`SessionSummary` 使用 `id`/`parentId`；Host/sidebar 的扁平 wire entry 使用 `sessionId`/`parentSessionId`，不能混用。
- 会话 API：只读 `sessions.list` 与 `sessions.open(id)` 足够导航；本插件不 fork、不 history 读取、不恢复 Agent。
- 存储选择：评审记录使用本插件命名空间的 `localStorage`，配合严格版本化 envelope、迁移、校验、重复合并、导入预检与错误回退；不依赖 Host 私有 snapshot persistence，也不写会话正文。
- 删除/标题变化/损坏/旧版本/跨血缘/未知 schema：记录按稳定 id 保留并显示 orphaned/degraded；标题从当前摘要动态显示；损坏或未知版本拒绝导入并保留旧数据；跨血缘候选在 eligibility 纯函数中拒绝；未知 schema 不静默解释。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 先形成 Stage 0 源码与运行态证据，再确定存储和 UI slot | 避免按主干或猜测的 npm API 实现不可安装插件 |
| 记录用户输入的评审元数据，不复制会话正文 | 满足最小隐私边界与显式导出要求 |
| 发布结论仅允许 `FIRST_PASS`、`PASS_AFTER_CHANGES` 或 `FAIL` | DSH 真实门禁技能的硬性判定规则 |

## Stage 0 Evidence Preregistration
- 详细、唯一的 Stage 0→4 门禁台账位于 `docs/release-evidence.md`；本文件不重复整份契约。
- 当前 release outcome 失败关闭为 `FAIL`，PR 状态为 `WAITING_ELIGIBILITY`。
- 因初始化仓库与索引均发生在首次尝试之后，即使最终全部通过，最高只能报告 `PASS_AFTER_CHANGES`，不能报告 `FIRST_PASS`。

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 文件化规划技能的清单 locator 指向不存在的 `.system` 子目录 | 只读枚举后使用实际安装目录；完整技能内容已读取 |
| `git status` / `git remote -v` 返回“not a git repository” | 记录为首次现场事实；启动文档已授权后续初始化本地 `main`，不重复以同一前提调用 |
| 首次仓库存在性探针错误使用 owner `zhouy` | `zhouy/dsh-branch-review` 不存在；改用 `gh api user` 得到真实 owner `chouyong`，后续只核对该准确路径 |
| 推送后复核暴露 goal/hook 生成的未跟踪根部投影文件 | 保留现场；在读取新根 `AGENTS.md` / `CLAUDE.md` 后继续，产品提交不纳入这些文件 |

## Resources
- `docs/CODEX_START_PROMPT.md`
- `docs/release-evidence.md`
- `docs/publication-eligibility.md`
- `C:\Users\zhouy\.codex\skills\planning-with-files\SKILL.md`
- `C:\Users\zhouy\.codex\skills\dsh-plugin-real-release-gate\SKILL.md`
- `C:\Users\zhouy\.codex\skills\codex-claude-cli-review\SKILL.md`

## Visual/Browser Findings
- 真实 DSH `0.1.0-rc.5` 在 `http://127.0.0.1:3091` 运行，Edge `151.0.4129.86` 门禁通过；root 与 `dsh-branch-review/client.js` 均 HTTP 200，served/local bundle SHA-256 同为 `6192A6EB01F243C2EF34EEC55E560562E67377238B565DBF9535F1E61CB0C493`。
- 公开 UI 通过 `分叉会话` 建立一个 parent 与两个 sibling；插件在标题栏显示 `Branch review`，候选为 1 parent + 2 sibling；新会话基线不显示入口。
- 三种状态 `keep-left`、`keep-right`、`follow-up` 均真实保存；重载、resolved 筛选、Open session、Export metadata 和 Import metadata 通过；console/page/request failures 均为 0。
- 桌面截图首次暴露宿主 header overflow 裁切面板左侧文字；将面板改为 viewport-fixed 后重新构建并重跑门禁，最终三图与 3-frame GIF 可读且无横向溢出。
- 最终证据：`assets/branch-review-desktop.png` SHA-256 `9D71DA2D12DE452DAEB0FCDFA7AB03961ED9CD3D07E54886F87DC2FB2E9BED7C`；`assets/branch-review-decisions.png` `5E00A406CAD4F7032A599128B209BAF905A296412C51CC89803F747FBF9630BB`；`assets/branch-review-mobile.png` `2898C1E9653D49A896CCB53F59825DFC7244FBA22CB20ECED363A8B1765FF2E2`；`assets/branch-review-flow.gif` `09C211B9A10AFE1CD725945B1AD3E5947868D9D139655254AD892C32DF39E407`。
- 机器回执为 `docs/browser-gate-receipt.json`；当前 local profile 未配置模型 API key，门禁未发送消息、未读取秘密，截图中的宿主错误不属于浏览器错误。
