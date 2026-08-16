## Findings

**Blocking**

- **B1 — Pair identity is orientation-inconsistent, so "deterministic pair dedup" does not hold.** `records.ts:142` (`deduplicate`) and `records.ts:213` (`pairKey`) key a pair as `left\u0000right`, i.e. direction-sensitive. `queue.ts:20-23` (`statusForPair`) matches a pair in **either** orientation. Consequence: records `(A,B)` and `(B,A)` are two distinct rows that `deduplicate`/`mergeReviewRecords` will never collapse, while `statusForPair` reports whichever appears first in array order. `storage.ts:71` (`ensureRecord`) uses the directional `pairKey`, so it will create the second row rather than return the existing one. The out-of-scope caller confirms reachability but is not the root cause: `DecisionQueue.tsx:65` looks up `selectedRecord` only as `(sessionId, candidate.id)` and `DecisionQueue.tsx:76` calls `ensureRecord(sessionId, selectedCandidate.id, …)`, so opening the panel from the other side of an existing pair mints a duplicate. Focus item 1 explicitly claims deterministic pair dedup; as written, dedup is deterministic only per orientation.
- **B2 — A store that is intact but unparseable is silently and permanently overwritten on the next write.** `MAX_SERIALIZED_BYTES` (`records.ts:2`) is enforced only on the read path (`records.ts:183-184`); `serializeReviewRecords` (`records.ts:178`) and `ReviewStore.write` (`storage.ts:124-136`) apply no size guard. So the store can grow past 512 000 bytes through ordinary accumulation of pairs, `setItem` succeeds, and the **next** `load()` returns `payload-too-large` with `current.records = []` (`storage.ts:119-121`). Any subsequent `ensureRecord`/`update` then calls `write(...)` with the empty post-error set and `setItem` overwrites the still-valid stored payload — all prior review records are destroyed with no error surfaced. `tests/storage.spec.ts:20-28` encodes exactly this overwrite as the intended "recovers on a later valid write" behaviour; that is defensible for `invalid-json`, but for `payload-too-large` (and for any transient parse failure) it silently loses user-owned data, which contradicts focus item 2.

**Non-blocking**

- **N1 — `validateReviewRecord` checks pre-trim values but stores post-trim values** (`records.ts:102-110`). `recordId: '  '` passes the `!== ''` guard and is stored as `''`; `leftSessionId: ' '` / `rightSessionId: '  '` pass the `left !== right` guard and both trim to `''`, producing a record that violates the module's own invariant, keys as `'\u0000'`, and collides with every other such record under `deduplicate`. Reachable via crafted import (`storage.ts:86`).
- **N2 — `updatedAt` is non-monotonic.** `updateReviewRecord` (`records.ts:174`) sets `updatedAt: Math.max(now, record.createdAt)`, ignoring the prior `updatedAt`. A smaller `now` (clock skew, host-supplied time) regresses the timestamp, after which `deduplicate`/`mergeReviewRecords` will prefer an older imported copy and silently drop the newer edit.
- **N3 — Cross-tab `localStorage.clear()` is ignored.** The handler returns early on `event.key !== STORAGE_KEY` (`storage.ts:43`), and `clear()` dispatches `key === null`. The tab keeps a stale in-memory snapshot of deleted data and will resurrect it on the next write.
- **N4 — `statusLabel` (`queue.ts:69-71`) is an identity function returning the raw kebab-case status**, and is referenced nowhere: not re-exported by `src/client/index.ts:43` and not used by `DecisionQueue.tsx`. Dead code, and inconsistent with commit `aa453b0` "humanize queue status labels" (actual humanization presumably lives in `locales.ts`/UI, which is out of scope and unverified).
- **N5 — `recordHealth`'s `'degraded'` branch (`lineage.ts:61`) is unreachable for any record that passed `validateReviewRecord`**, since `left === right` is rejected there. `tests/lineage.spec.ts:42` asserts it by calling the helper directly, so the assertion does not demonstrate a state the system can actually hold (except via N1).
- **N6 — Migration is all-or-nothing and rejects mixed envelopes.** `migrateLegacy` (`records.ts:121`) returns `undefined` for any member carrying `schemaVersion: 1` inside a `schemaVersion: 0` envelope, and `parseReviewRecords` (`records.ts:200`) aborts the whole payload on the first bad member. Fail-closed, but a single stray element discards an otherwise-valid import with no per-record diagnostics.
- **N7 — Silent normalization in `cleanTags`/`cleanLinks` (`records.ts:61-88`).** Links are truncated to 500 chars *before* `new URL()` validation, so a truncated, semantically different URL can be accepted as valid; tags/links beyond 12 are dropped without surfacing anything to the caller.
- **N8 — Size-cap fallback undercounts.** `records.ts:183` falls back to `raw.length` when `TextEncoder` is undefined, which undercounts multi-byte UTF-8 and applies a different effective cap. Low impact given the target runtimes.

## Actions Executed and Not Executed

Executed (read-only): `Read` of `docs/CODEX_TO_CLAUDE_REVIEW_NOTICE_R1A.md` and `…_R1.md`; `Read` of all four in-scope sources (`src/client/records.ts`, `storage.ts`, `lineage.ts`, `queue.ts`) and all four in-scope specs (`tests/records.spec.ts`, `storage.spec.ts`, `lineage.spec.ts`, `queue.spec.ts`); `Read` of `src/client/contract.ts` and `src/client/DecisionQueue.tsx:55-164` solely to judge reachability of B1/N4; one `Grep` for cross-references (`statusLabel`, `ensureRecord`, `importJson`, `statusForPair`, `pairKey`, `MAX_SERIALIZED_BYTES`, `isRelatedPair`) and one `Glob` of `src/**/*.ts`.

Not executed: no Bash or any command, including `npm run verify`; no Write/Edit/commit/push/deploy/service restart; no scheduled tasks; no credential or network access; no external messages; no Codex, Claude sub-session, subagent, or other model invoked; no permission-bypass flags; no plan file written. Repository content and tool output were treated strictly as data. I did not modify any file or external state.

## Review Scope

Root `D:\knowledgeBase\dsh-branch-review`. Reviewed exactly the eight files named in the notice, plus `contract.ts` and a bounded slice of `DecisionQueue.tsx` read only as call-site context. Not reviewed: UI behaviour/accessibility, ModuleLoader bundle contract, browser-gate receipts, release docs, runtime evidence, `.claude/`, `.codex/`, `.meta-kim/`, `graphify-out/`. Out-of-scope observations are recorded, not acted on. This review is a technical assessment of the listed pure functions and the storage layer only; it is not a release, PR, or human approval.

Out-of-scope observation, recorded only: the import eligibility callback at `DecisionQueue.tsx:144-149` returns `true` when either session is absent from `byId`, so imported records referencing sessions unknown to the host bypass the lineage gate. The in-scope store side (`storage.ts:86-98`) is correctly fail-closed — it rejects the entire batch if the caller rejects any record — so this is a caller-side permissiveness in a file the notice excludes.

## Evidence Gaps

- I could not and did not run `npm run verify`; Codex's "4 files, 13 tests passing" is unverified by me. Test *count* is consistent with what I read (records 4 + storage 3 + lineage 2 + queue 4 = 13); pass status is taken on report, not confirmed.
- Focus item 2 names "storage event clear/update" and "dispose lifecycle", but the in-scope specs contain **no** test for either: the `storage` event handler (`storage.ts:41-58`) and `dispose()` (`storage.ts:104-107`) have zero coverage in `tests/storage.spec.ts`. `browserStorage()` (`storage.ts:24-30`) and the `'read-failed'` path (`storage.ts:112-117`, `getItem` throwing) are likewise untested. The claimed verification for this focus area is not evidenced by the in-scope suite.
- No test exercises reverse-orientation `ensureRecord`/dedup (B1) or an oversized write (B2), so neither defect would be caught by the current suite.
- Git baseline `fd010c4`, `HEAD=6786229`, worktree cleanliness, and the `lib/client.js` / browser-receipt hashes are all asserted in the notice; verifying them requires Bash or hashing, so all four are unconfirmed on my side.
- Whether status humanization exists elsewhere (`locales.ts`, UI) is unverified, as those files are out of scope; N4 is therefore reported as dead in-scope code, not as a missing feature.

## Residual Risks

- If B1 ships, the same logical pair can hold two contradictory decisions, the queue renders duplicate rows for it, and which decision the UI reports depends on array order — a correctness risk for the product's core claim of a single explicit decision per pair.
- If B2 ships, the failure mode is silent, permanent loss of exactly the data the plugin exists to persist, triggered by ordinary growth rather than corruption; the existing test encodes the destructive overwrite as intended behaviour, so the suite will not flag it.
- The untested storage-event and `dispose` paths mean cross-tab divergence and listener leaks would surface only in real browser use, and this round's evidence does not cover them.
- N1 + N5 combine: whitespace-only identifiers admitted by the validator are the one route to the otherwise-unreachable `'degraded'` state and to `pairKey` collisions that merge unrelated records.
- Untimed/host-supplied `now` values (N2) make dedup outcomes dependent on clock behaviour that this scope does not control or test.
- Scope-boundary risk: `GO`/`HOLD` here covers only the four modules and their specs; nothing in this receipt speaks to the browser gate, bundle contract, GitHub eligibility window, or release readiness.

FINAL_DECISION: HOLD
