# DSH Branch Review Release Evidence

本文件是 `dsh-branch-review` Stage 0→4 的唯一详细门禁台账。所有秘密字段一律留空或仅记录非敏感身份；不得记录、打印、哈希或提交密钥。

## Outcome

`PASS_AFTER_CHANGES` — 首次官方安装在受限 shell 因 profile 临时目录 `EPERM` 失败；受控提升后同一官方 link 安装成功。随后最新构建、真实 DSH Web、Edge 门禁、截图和 GIF 均通过。由于 GitHub 仓库尚未满 24 小时、真实功能提交尚未达到 10 个且 Claude 尚未审核，发布资格仍为 `WAITING_ELIGIBILITY`，禁止创建 PR。

## Stage 0: Preflight

### Identity

- Repository: `dsh-branch-review`
- Absolute path: `D:\knowledgeBase\dsh-branch-review`
- Initial Git state: 2026-08-16 首次预检时不是 Git 仓库；随后按启动文档授权初始化本地 `main`
- Source commit: `fd010c4` (`chore: establish branch review project contract`)
- Dirty worktree: 首个提交后需用 scoped Git 复核；`.codegraph/` 是忽略的本地生成索引
- Remotes: `origin=https://github.com/chouyong/dsh-branch-review.git`
- Plugin package/version: `dsh-branch-review@0.1.0`
- Artifact SHA-256: tarball `646938FF322075EAC5F39932A1823281315413B35FE5C0B2C49EFCF5D1AAACDC`; browser bundle `6192A6EB01F243C2EF34EEC55E560562E67377238B565DBF9535F1E61CB0C493`
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
- Production build: PASS (`npm run build`); browser bundle 34,438 bytes
- Bundle contract: PASS (`npm run test:bundle`)
- Full tests: PASS (`npm test`, 4 files / 9 tests)
- Package contract: PASS (`npm run verify:package`)
- DSH prerequisite: running official `0.1.0-rc.5` CLI at `D:\knowledgeBase\deepseek-harness\apps\cli\lib\bin.js`; PID `14080`, port `3091`
- Documented install attempt 1: failed, restricted shell `EPERM` while opening `D:\dsh-home\profiles\web\_tmp_*`; exact CLI category `pnpm failed in profile directory`
- Documented install attempt 2: passed after controlled elevation; profile dependency is `dsh-branch-review link:D:/knowledgeBase/dsh-branch-review`, pnpm `11.7.0`, supply-chain lock verified
- Tarball fallback: not used; official link install passed after environment permission correction
- Artifact identity: `dsh-branch-review-0.1.0.tgz`, 21 files, SHA-256 `646938FF322075EAC5F39932A1823281315413B35FE5C0B2C49EFCF5D1AAACDC`; `lib/client.js` SHA-256 `6192A6EB01F243C2EF34EEC55E560562E67377238B565DBF9535F1E61CB0C493`

## Stage 2: Runtime Load

- Isolated D-drive profile/home: PASS for `D:\dsh-home\profiles\web`; link dependency and lockfile were re-read after install
- Plugin client asset HTTP status: PASS, root and asset HTTP 200; served/local SHA-256 both `6192A6EB01F243C2EF34EEC55E560562E67377238B565DBF9535F1E61CB0C493`
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
- Browser receipt: `docs/browser-gate-receipt.json`, Edge `151.0.4129.86`, DSH `0.1.0-rc.5`, generated `2026-08-16T12:43:50.840Z`
- Screenshot SHA-256: desktop `6FFFFDBDAC1D4D45618FA890774EBB9DCCD87BCD1817B423EE26533C067E16B5`; decisions `E6221A75A0D997E87F50B492AB24458CFE53F3D7229D2F331B0AFBD4ED002677`; mobile `EA57B21313C049B4BAC7F8BB29489938F24195D0A73A22846728D1625E6078BD`; GIF `D0A00DD3DBCE76D9B1D6BB7FD4B55CEDD79D9B22DF7CCBAEAA4596A35418C287`

## Stage 4: Publication

- Verified documentation claims: README now links only to generated local evidence and states that GitHub Release URL is not yet available
- Commit history count and identities: 3 pushed product commits before this evidence milestone; this milestone must be committed as a real functional/documentation change, not an empty count filler
- GitHub owner/visibility/created_at/eligible_after: 以唯一台账 `docs/publication-eligibility.md` 为准
- GitHub API `created_at` and `eligible_after`: see `docs/publication-eligibility.md` (created_at recorded; 24-hour window still open)
- Claude review: not started; now eligible to begin after this evidence and the next verification commit; must use dry-run then one read-only chain
- PR status: `WAITING_ELIGIBILITY`; creation is forbidden until all gates pass
- Persistent goal: active; objective includes local Stage 0→4 closure while preserving all PR eligibility red lines

## Changes Before Pass

1. 本机技能清单中的 `planning-with-files` locator 指向不存在的 `.system` 路径；只读枚举后使用实际安装目录。
2. 本目录首次预检不是 Git 仓库；按启动文档授权初始化本地 `main`。
3. 本目录首次预检没有 CodeGraph；按启动文档授权运行 `codegraph init -i`，当前因无源码而健康索引 0 个文件。
4. 首次同名仓库探针错误使用了本地 Git 用户名推断的 owner `zhouy`；该路径不存在。随后从 GitHub API 确认真实登录 owner 为 `chouyong`，不得继续使用推断值。

以上变更意味着最终即使全部通过，也不能报告 `FIRST_PASS`；最高只能是 `PASS_AFTER_CHANGES`。
