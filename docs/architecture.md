# 架构与失败关闭

## 数据流

```text
DSH sessions.list
        │ ids / byId / current
        ▼
lineage.findRelatedSessions ── true parent/child/sibling candidates
        │
        ├── DecisionQueue UI ── explicit status/reason/tag/link input
        │                         │
        │                         ▼
        └────────────────────── ReviewStore
                                  │
                                  └── localStorage dsh-branch-review.records.v1
```

插件只消费 `SessionListState` 的 `ids`、`byId` 和 `current`。`SessionSummary` 的 `id`/`parentId` 是候选资格事实；Host/sidebar wire 条目的 `sessionId`/`parentSessionId` 不进入本插件契约。`sessions.open(id)` 只用于用户点击后的导航。

## ReviewRecord

`ReviewRecord` 的 `schemaVersion` 当前为 `1`。记录 ID 由浏览器 UUID（不可用时使用单进程 fallback）生成；左右 session ID、状态、理由、标签、外部链接、创建时间和更新时间构成用户可审阅元数据。记录以 pair 去重，较新的 `updatedAt` 胜出；同时间用记录 ID 保持确定性。

schema `0` 只作为显式迁移输入，支持旧字段 `id/left/right/decision/labels/links`。未知版本、缺字段、相同左右 ID、非法状态、倒序时间或非法链接都会拒绝，旧快照不会被覆盖。

## 血缘资格

当前会话必须存在、不是 subagent、不是 blank。候选按 host 的 `ids` 顺序分组为 sibling → parent → child，每个候选去重。候选必须是直接共享 parent、直接 parent 或直接 child；不使用最长公共前缀，不声称精确持久化 fork boundary。缺失会话的已有记录保留为 orphaned；同一左右 ID 是 degraded 数据。

导入时，如果左右会话都仍在当前列表中，调用方必须用同一 lineage 纯函数验证；任一 pair 不合格则整批拒绝。任一侧已删除则允许保留为 orphaned，等待用户恢复上下文或手工处理。

## 存储与并发

`ReviewStore` 把完整 envelope 写入 `localStorage`，不使用 Host 私有 snapshot store。浏览器不可用时只保留当前内存状态；读取 JSON 损坏、未知 schema 或容量失败只更新可读错误，不丢弃当前记录。跨标签页 `storage` 事件按 key 重载；清空事件会清空当前快照。每个订阅和监听器都有明确 disposer。

## UI 生命周期

`apply()` 创建一个 store，注册 stylesheet effect 和 `conversation.session.header.actions` slot contribution。slot 注册、样式 holder、storage subscription、pointer/keydown listeners 和 React effect 均有精确逆操作。无真实相关候选且无现有记录时，组件返回 `null`，不显示无效入口。Escape 关闭面板，微任务恢复 trigger 焦点；面板在 390px 下切换为固定单栏。

## Bundle 与安装

Node 入口只为 DSH 模块扫描存在；浏览器入口由 tsdown 生成 CJS 闭包工厂，调用 `window.__ModuleLoader__.load({ id, factory })`。React、Cordis、slots、runtime 和 DSH UI primitives 进入 external allowlist，避免第二份 React。`npm run test:bundle` 在产物上检查 loader、插件 ID、宿主 React 和无内嵌 React runtime。

## 明确不做

本版本不读取 history，不上传正文，不写 session event，不创建 fork，不恢复 Agent，不修改工作区文件，不自动判断赢家，不执行 merge/cherry-pick，不把导出元数据伪装为会话备份，也不宣称竞品首个或唯一。
