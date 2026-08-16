# DSH Branch Review Release Evidence

本文件是 `dsh-branch-review` Stage 0→4 的唯一详细门禁台账。所有秘密字段一律留空或仅记录非敏感身份；不得记录、打印、哈希或提交密钥。

## Outcome

`PASS_AFTER_CHANGES` — 首次官方安装在受限 shell 因 profile 临时目录 `EPERM` 失败；受控提升后同一官方 link 安装成功。随后最新构建、真实 DSH Web、Edge 门禁、截图和 GIF 均通过；R1A/R2 HOLD 已修复，R3 独立只读审核为 `GO`。由于 GitHub 仓库尚未满 24 小时且目标列表规则尚未重读，发布资格仍为 `WAITING_ELIGIBILITY`，禁止创建 PR。

## Stage 0: Preflight

### Identity

- Repository: `dsh-branch-review`
- Absolute path: `D:\knowledgeBase\dsh-branch-review`
- Initial Git state: 2026-08-16 首次预检时不是 Git 仓库；随后按启动文档授权初始化本地 `main`
- Source commit: `0fba29e` (`fix: orient reverse decision controls`)
- Dirty worktree: 首个提交后需用 scoped Git 复核；`.codegraph/` 是忽略的本地生成索引
- Remotes: `origin=https://github.com/chouyong/dsh-branch-review.git`
- Plugin package/version: `dsh-branch-review@0.1.0`
- Artifact SHA-256: tarball `47D8CA9DF4895DD7CB22D216691EAB0076AD1E32DE57EF873E943CABDDE158A9`; browser bundle `576A793485160CF30BBCF0F0C29AF06CB1EAD611BAF883261C49B5A9A761B733`
- DSH source/executable: source `D:\knowledgeBase\deepseek-harness`, built CLI `D:\knowledgeBase\deepseek-harness\apps\cli\lib\bin.js`, version `0.1.0-rc.5`
- Effective DSH home/profile: `D:\dsh-home` / `D:\dsh-home\profiles\web`; profile manifest contains `dsh-branch-review` as a link dependency and the existing read-only `dsh-fork-graph` fixture
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

- Dependency command and flags: `npm install --ignore-scripts --legacy-peer-deps`; added dev-only `playwright-core`, `pngjs`, `gif-encoder-2` for the browser gate
- Typecheck: PASS (`npm run typecheck`)
- Production build: PASS (`npm run build`); browser bundle 39,727 bytes
- Bundle contract: PASS (`npm run test:bundle`)
- Full tests: PASS (`npm test`, 4 files / 17 tests)
- Package contract: PASS (`npm run verify:package`)
- DSH prerequisite: running official `0.1.0-rc.5` CLI at `D:\knowledgeBase\deepseek-harness\apps\cli\lib\bin.js`; PID `14080`, port `3091`
- Documented install attempt 1: failed, restricted shell `EPERM` while opening `D:\dsh-home\profiles\web\_tmp_*`; exact CLI category `pnpm failed in profile directory`
- Documented install attempt 2: passed after controlled elevation; profile dependency is `dsh-branch-review link:D:/knowledgeBase/dsh-branch-review`, pnpm `11.7.0`, supply-chain lock verified
- Tarball fallback: not used; official link install passed after environment permission correction
- Artifact identity: `dsh-branch-review-0.1.0.tgz`, 21 files, SHA-256 `47D8CA9DF4895DD7CB22D216691EAB0076AD1E32DE57EF873E943CABDDE158A9`; `lib/client.js` SHA-256 `576A793485160CF30BBCF0F0C29AF06CB1EAD611BAF883261C49B5A9A761B733`

## Stage 2: Runtime Load

- Isolated D-drive profile/home: PASS for `D:\dsh-home\profiles\web`; link dependency and lockfile were re-read after install
- Plugin client asset HTTP status: PASS, root and asset HTTP 200; served/local SHA-256 both `576A793485160CF30BBCF0F0C29AF06CB1EAD611BAF883261C49B5A9A761B733`
- Style node and slot presence: PASS, `#dsh-branch-review-style` count 1 and visible `Branch review` slot trigger
- Console errors: PASS, 0
- Page errors: PASS, 0
- Failed requests: PASS, 0
- Disposer/uninstall result: PASS; after official CLI remove and DSH restart, root remained HTTP 200 with no `dsh-branch-review` asset, style node, or `Branch review` trigger; official link install then restored the plugin and this gate passed again
- No-related-branch trigger count: PASS, fresh `新会话` has no `Branch review` trigger

## Stage 3: Real Branch Review

- Parent conversation: PASS, real UI title `FORK_DIFF_GATE_PARENT_20260816 请给出`
- Sibling fork A/B and shared-parent proof: PASS, DSH public `分叉会话` menu created two siblings; queue exposed 1 parent + 2 sibling candidates
- Three distinct decision states: PASS, `keep-left`, `keep-right`, `follow-up`
- Filter/reload/open-session/import/export results: PASS, resolved filter retained 2 records; reload persisted all 3; navigation and metadata round-trip passed
- Desktop and 390px mobile results: PASS, no horizontal overflow; mobile panel bounded to 390x844
- Genuine screenshot paths and capture attempt: PASS, `assets/branch-review-desktop.png`, `assets/branch-review-decisions.png`, `assets/branch-review-mobile.png`
- Short GIF path and capture attempt: PASS, `assets/branch-review-flow.gif`, 3 real Edge frames
- Browser receipt: `docs/browser-gate-receipt.json`, Edge `151.0.4129.86`, DSH `0.1.0-rc.5`, generated `2026-08-16T13:39:35.896Z`
- Screenshot SHA-256: desktop `DA74A3FE95503B5A259A77166392A4AC1DDD50999B348E68CA06EA14BAA5151D`; decisions `458114A1360126D43A64980B5E6FD411BBE6AF37FC21CAF2878CABD935818E4A`; mobile `13AA8DF909CCB01541EBB5202915B291FBB06B9D3A26599B32BCF8B419884F75`; GIF `4FECACDC86B9CB8A25501CD6F9E692C28AE9D3767FDC0799E8F5E85CEB998D5E`

## Stage 4: Publication

- Verified documentation claims: README now links only to generated local evidence and states that GitHub Release URL is not yet available
- Commit history count and identities: 18 real functional/documentation commits are present through `064fa35`; R1A/R2 HOLD and R3 GO receipts are preserved as separate files
- GitHub owner/visibility/created_at/eligible_after: 以唯一台账 `docs/publication-eligibility.md` 为准
- GitHub API `created_at` and `eligible_after`: see `docs/publication-eligibility.md` (created_at recorded; 24-hour window still open)
- Claude review: R1 broad `NO_RESULT_TIMEOUT`, R1A `HOLD`, R2 `HOLD`, R3 `GO`; each notice/receipt is preserved and R3 is limited to the reverse-orientation/storage repair scope
- PR status: `WAITING_ELIGIBILITY`; creation is forbidden until all gates pass
- Persistent goal: active; objective includes local Stage 0→4 closure while preserving all PR eligibility red lines

## Changes Before Pass

1. 本机技能清单中的 `planning-with-files` locator 指向不存在的 `.system` 路径；只读枚举后使用实际安装目录。
2. 本目录首次预检不是 Git 仓库；按启动文档授权初始化本地 `main`。
3. 本目录首次预检没有 CodeGraph；按启动文档授权运行 `codegraph init -i`，当前因无源码而健康索引 0 个文件。
4. 首次同名仓库探针错误使用了本地 Git 用户名推断的 owner `zhouy`；该路径不存在。随后从 GitHub API 确认真实登录 owner 为 `chouyong`，不得继续使用推断值。

以上变更意味着最终即使全部通过，也不能报告 `FIRST_PASS`；最高只能是 `PASS_AFTER_CHANGES`。
