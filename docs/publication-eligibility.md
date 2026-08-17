# Publication Eligibility

## GitHub Repository Identity

- Owner: `chouyong` (confirmed by `gh api user --jq .login`)
- Repository: `chouyong/dsh-branch-review`
- URL: `https://github.com/chouyong/dsh-branch-review`
- Visibility: `public` (explicitly selected by the user)
- GitHub API endpoint: `GET /repos/chouyong/dsh-branch-review`
- `created_at`: `2026-08-16T11:35:26Z`
- `eligible_after`: `2026-08-17T11:35:26Z` (created_at + 24 hours)
- Default branch: `main`
- Evidence command: `gh api repos/chouyong/dsh-branch-review --jq '{nameWithOwner:.full_name,visibility:.visibility,created_at:.created_at,html_url:.html_url,default_branch:.default_branch}'`

## Eligibility Status

`PRS_OPEN`

The exact `eligible_after` time passed and every independent pre-PR gate was true. Two focused pull requests are now open.

## Required Conjunction Before Any PR

- [x] Current time is at or after `2026-08-17T11:35:26Z` (local check `2026-08-17T22:20:10+08:00`; repository `created_at` re-read from GitHub API)
- [x] Product repository has at least 10 real, functional, reviewable commits (10 commits on `main` at `355a69d`)
- [x] Stage 0→3 real DSH gate passes with no unverified required behavior
- [x] Genuine screenshots and short GIF are present and tied to the verified artifact/runtime
- [x] Release/install source is reproducible and documentation claims are verified
- [x] Claude final receipt has exactly one final marker: `FINAL_DECISION: GO` in distinct `docs/CLAUDE_TO_CODEX_REVIEW_RECEIPT_R3.md` (R1A/R2 HOLD receipts remain preserved)
- [x] Target list contribution rules and focused diff are re-read before any awesome-list PR

Do not merge automatically or force-push. Keep each awesome-list PR limited to its contribution entry and generated/list metadata.

## Open Pull Requests

- `awesome-dsh-plugin/awesome-dsh-plugin#1449`: head `1f0b96b5b59fb82233c7057023ddd58439fcec34`; four allowed files; `PR check` passed. Submission gate run `32039307340` failed before evaluating the entry because the base repository's GitHub App API quota was exhausted; a fork contributor cannot rerun that workflow.
- `0xsline/awesome-deepseek-harness#371`: head `19dbc4f58cbb3a861806f813ad8179f62257c9e4`; two allowed README files; the repository reports no pull-request checks.
