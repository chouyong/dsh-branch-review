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

`ELIGIBLE_FOR_PR`

The exact `eligible_after` time has passed. PR creation is allowed because every independent gate below is also true.

## Required Conjunction Before Any PR

- [x] Current time is at or after `2026-08-17T11:35:26Z` (local check `2026-08-17T22:20:10+08:00`; repository `created_at` re-read from GitHub API)
- [x] Product repository has at least 10 real, functional, reviewable commits (10 commits on `main` at `355a69d`)
- [x] Stage 0→3 real DSH gate passes with no unverified required behavior
- [x] Genuine screenshots and short GIF are present and tied to the verified artifact/runtime
- [x] Release/install source is reproducible and documentation claims are verified
- [x] Claude final receipt has exactly one final marker: `FINAL_DECISION: GO` in distinct `docs/CLAUDE_TO_CODEX_REVIEW_RECEIPT_R3.md` (R1A/R2 HOLD receipts remain preserved)
- [x] Target list contribution rules and focused diff are re-read before any awesome-list PR

Do not merge automatically or force-push. Keep each awesome-list PR limited to its contribution entry and generated/list metadata.
