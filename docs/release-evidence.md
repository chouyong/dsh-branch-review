# DSH Branch Review Release Evidence

本文件是 `dsh-branch-review` Stage 0→4 的唯一详细门禁台账。所有秘密字段一律留空或仅记录非敏感身份；不得记录、打印、哈希或提交密钥。

## Outcome

`FAIL` — Stage 0 尚在进行，任何必需门禁未验证前均失败关闭。最终只允许改为 `FIRST_PASS` 或 `PASS_AFTER_CHANGES`，并必须列出首次尝试后的全部变更。

## Stage 0: Preflight

### Identity

- Repository: `dsh-branch-review`
- Absolute path: `D:\knowledgeBase\dsh-branch-review`
- Initial Git state: 2026-08-16 首次预检时不是 Git 仓库；随后按启动文档授权初始化本地 `main`
- Source commit: `fd010c4` (`chore: establish branch review project contract`)
- Dirty worktree: 首个提交后需用 scoped Git 复核；`.codegraph/` 是忽略的本地生成索引
- Remotes: `origin=https://github.com/chouyong/dsh-branch-review.git`
- Plugin package/version: 待实现
- Artifact SHA-256: 待 Stage 1 构建
- DSH source/executable: 待核验
- Effective DSH home/profile: 待核验；必须位于隔离的 D 盘路径
- Relay base URL/model discovery endpoint/web port: 待核验；不得记录秘密值

### Storage Roots

- Product source: `D:\knowledgeBase\dsh-branch-review`
- Read-only DSH source: `D:\knowledgeBase\deepseek-harness`
- Read-only prior plugins: `D:\knowledgeBase\dsh-session-tree`, `D:\knowledgeBase\dsh-fork-diff`
- Forbidden concurrent workspace: `D:\knowledgeBase\dsh-effect-doctor`，本任务不读取、不修改、不协调
- Package store/build cache/DSH home: 待 Stage 1/2 选择并验证实际生效路径

### Secret Boundary

- API key, Cookie, credential, environment value, prompt/session body must never appear in chat, command arguments, evidence, screenshots, Git, hashes, or logs.
- 如真实运行需要密钥，只允许通过可见交互凭据窗口注入到单一授权子进程。

### Expected UI Behavior

- No related branch: 不显示无效入口；eligible trigger count 为 0 是有效基线。
- Related branches: 只允许真实 parent/child/sibling 血缘创建评审记录，不包含无关会话。
- Missing/deleted session: 保留记录并明确显示 orphaned/degraded，不静默删除。
- Unknown/corrupt record: 失败关闭、显示可恢复错误，不把未知 schema 自动解释为当前版本。
- Uninstall: 精确移除 slot、style、listener、storage subscription 和其它 effect contribution；评审数据的卸载行为需在存储方案确定后明确并验证。

### Stage 0 Required Source Questions

- [x] 当前可安装 DSH 版本真实提供的 UI slot：`conversation.session.header.actions`；`.utilities` 仅见主干
- [x] `SessionListState.id/parentId` 与 Host/sidebar `sessionId/parentSessionId` 的区别
- [x] `ISessions.list`、`ISessions.open(id)` 与浏览器存储的可用性和卸载边界
- [x] 删除、标题变化、损坏/旧记录、跨血缘导入与未知 schemaVersion 的处理策略
- [x] `localStorage`、IndexedDB 或只读 Host 桥接的选择依据：本插件 namespace localStorage + strict envelope
- [x] 发布当日 branch review / session decision / fork annotation 竞品检索事实

## Stage 1: Build and Install

- Dependency command and flags: 待项目规则和真实包版本核验
- Typecheck: pending
- Production build: pending
- Bundle contract: pending
- Full tests: pending
- DSH prerequisite build: pending
- Documented install attempt: pending；必须先执行并保留首次结果类别
- Tarball fallback: not authorized by failure evidence yet
- Artifact identity: pending

## Stage 2: Runtime Load

- Isolated D-drive profile/home: pending
- Plugin client asset HTTP status: pending
- Style node and slot presence: pending
- Console errors: pending
- Page errors: pending
- Failed requests: pending
- Disposer/uninstall result: pending
- No-related-branch trigger count: pending

## Stage 3: Real Branch Review

- Parent conversation: pending
- Sibling fork A/B and shared-parent proof: pending
- Three distinct decision states: pending
- Filter/reload/open-session/import/export results: pending
- Desktop and 390px mobile results: pending
- Genuine screenshot paths and capture attempt: pending
- Short GIF path and capture attempt: pending

## Stage 4: Publication

- Verified documentation claims: pending
- Commit history count and identities: pending
- GitHub owner/visibility/created_at/eligible_after: 以唯一台账 `docs/publication-eligibility.md` 为准
- GitHub API `created_at` and `eligible_after`: see `docs/publication-eligibility.md` (created_at recorded; 24-hour window still open)
- Claude review: not started; prohibited until implementation and evidence stabilize
- PR status: `WAITING_ELIGIBILITY`; creation is forbidden until all gates pass
- Persistent goal: active; objective includes local Stage 0→4 closure while preserving all PR eligibility red lines

## Changes Before Pass

1. 本机技能清单中的 `planning-with-files` locator 指向不存在的 `.system` 路径；只读枚举后使用实际安装目录。
2. 本目录首次预检不是 Git 仓库；按启动文档授权初始化本地 `main`。
3. 本目录首次预检没有 CodeGraph；按启动文档授权运行 `codegraph init -i`，当前因无源码而健康索引 0 个文件。
4. 首次同名仓库探针错误使用了本地 Git 用户名推断的 owner `zhouy`；该路径不存在。随后从 GitHub API 确认真实登录 owner 为 `chouyong`，不得继续使用推断值。

以上变更意味着最终即使全部通过，也不能报告 `FIRST_PASS`；最高只能是 `PASS_AFTER_CHANGES`。
