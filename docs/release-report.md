# dsh-branch-review Release Report

## Current Outcome

`PASS_AFTER_CHANGES` for the local Stage 0→3 implementation and real DSH gate. The first documented official install attempt failed because the restricted shell could not create profile temporary files (`EPERM`); the same official link install passed after controlled elevation. This classification is fail-closed and is not a PR or production approval.

## Verified Artifact

- Package: `dsh-branch-review@0.1.0`
- Tarball: `dsh-branch-review-0.1.0.tgz`, SHA-256 `47D8CA9DF4895DD7CB22D216691EAB0076AD1E32DE57EF873E943CABDDE158A9`
- Browser bundle: `lib/client.js`, SHA-256 `576A793485160CF30BBCF0F0C29AF06CB1EAD611BAF883261C49B5A9A761B733`
- `npm run verify`: typecheck, production build, 4 test files / 17 tests, bundle contract and package contract all pass

## Real Runtime

- DSH: `0.1.0-rc.5`, `D:\knowledgeBase\deepseek-harness\apps\cli\lib\bin.js`
- Profile/home: `D:\dsh-home\profiles\web` / `D:\dsh-home`
- DSH PID/port: `14080` / `http://127.0.0.1:3091`
- Edge: `151.0.4129.86`, headless, viewport `1440x1000` and `390x844`
- Root and plugin asset returned HTTP 200; served/local bundle hashes match; console, page and request failures are all zero
- Remove/restart proof passed: after official CLI removal, root remained HTTP 200 but had no plugin boot asset, style node, or `Branch review` trigger; the same official link install restored the plugin before the final gate.
- The profile has no model API key. The gate sends no messages and does not read or record secrets; visible host session errors are existing DSH session state and not browser errors.

## Real Branch Review

The public DSH UI created one parent and two sibling forks using `分叉会话`. The plugin exposed three eligible candidates, recorded `keep-left`, `keep-right` and `follow-up`, persisted them through reload, filtered resolved records, opened a session, and completed an explicit metadata export/import round-trip. A fresh `新会话` hid the trigger. Desktop and mobile screenshots have no horizontal overflow.

Evidence files:

- [`docs/browser-gate-receipt.json`](./browser-gate-receipt.json)
- [`assets/branch-review-desktop.png`](../assets/branch-review-desktop.png)
- [`assets/branch-review-decisions.png`](../assets/branch-review-decisions.png)
- [`assets/branch-review-mobile.png`](../assets/branch-review-mobile.png)
- [`assets/branch-review-flow.gif`](../assets/branch-review-flow.gif)

## Publication Hold

GitHub repository creation was verified at `2026-08-16T11:35:26Z`; `eligible_after` is `2026-08-17T11:35:26Z`. The product history now has 14 real functional/documentation commits, but Claude R2 returned `FINAL_DECISION: HOLD`; preserve R1A/R2 receipts and require a new independent R3 `GO` before any publication consideration. Keep `docs/publication-eligibility.md` at `WAITING_ELIGIBILITY`; do not create a PR, merge automatically, or force-push.
