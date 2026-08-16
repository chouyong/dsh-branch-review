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

`WAITING_ELIGIBILITY`

The repository is younger than 24 hours. PR creation is forbidden until the exact `eligible_after` time has passed and all independent gates below are also true.

## Required Conjunction Before Any PR

- [ ] Current time is at or after `2026-08-17T11:35:26Z`, rechecked from GitHub API evidence
- [x] Product repository has at least 10 real, functional, reviewable commits (10 commits on `main` at `355a69d`)
- [x] Stage 0→3 real DSH gate passes with no unverified required behavior
- [x] Genuine screenshots and short GIF are present and tied to the verified artifact/runtime
- [x] Release/install source is reproducible and documentation claims are verified
- [ ] Claude final receipt has exactly one final marker: `FINAL_DECISION: GO` (R2 is `HOLD`; require a distinct R3 receipt)
- [ ] Target list contribution rules and focused diff are re-read before any awesome-list PR

Until every checkbox is independently proven, do not open a PR, merge automatically, force-push, or treat this waiting state as a blocker for continued local development.
