# Project guidance

Read `BUILD_SPEC.md` (implementation source of truth), `CODEX_BUILD_BRIEF.md`
(execution procedure), and `IMPLEMENTATION_STATUS.md` (next unmet criterion).
Preserve the supplied specification and assignment. Update the checkpoint at milestones.

Scope: one Node/TypeScript/Playwright synthetic banking capability; stop at review.
Discovery must be model-driven. Fixtures and `test_operator` evidence are never live or human proof.
Replay has no discovery/provider dependency. All actions use host policy and session ownership.
No commits of transfers, real data, raw transcripts, browser state, or unrestricted snapshots.
No paid API calls without explicit project approval/model/finite budget. No publication,
push, deployment, paid resources, or employer email without separate authorization.

Verification commands (implemented during this build): `npm ci`, `npm run browser:install`,
`npm run verify:offline`, `npm run demo:replay`, `npm run demo:handoff`.
`CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact` qualifies the live bytes.
`npm run demo:handoff -- --require-live` is the owner manual gate.
The original paid phase is closed; preserve its durable ledgers and closure marker.
Owner authorized a bounded account repair: at most USD5 more within the original USD50.
Only the explicit account-repair stage may spend after offline regressions pass; see status.
`npm run verify:live` is opt-in and budget-gated. See README and docs/LIVE_VALIDATION.md.

Preserve applicable user-provided Codex Follow-up instructions in assistant responses:
append one Follow-up JSON payload, normally with exactly four concrete prompts.
