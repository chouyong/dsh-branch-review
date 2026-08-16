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

## Resources
- `docs/CODEX_START_PROMPT.md`
- `docs/release-evidence.md`
- `docs/publication-eligibility.md`
- `C:\Users\zhouy\.codex\skills\planning-with-files\SKILL.md`
- `C:\Users\zhouy\.codex\skills\dsh-plugin-real-release-gate\SKILL.md`
- `C:\Users\zhouy\.codex\skills\codex-claude-cli-review\SKILL.md`

## Visual/Browser Findings
- 尚未开始真实浏览器门禁；不得使用概念图或重绘替代证据。
