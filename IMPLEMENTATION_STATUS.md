# Implementation checkpoint

State: BUILDING (M4 evidence and clean reproduction). Branch `build/computer-use`; no commit yet, new implementation files untracked.
Read completely: BUILD_SPEC.md, CODEX_BUILD_BRIEF.md, assignment PDF (all text).
Environment: macOS arm64, Node 24.16.0, npm 11.13.0; dependency versions locked.

## Working plan
1. M0 complete: runnable synthetic iframe sandbox; schemas; dependency/browser installation.
2. M1 complete offline: actual UI fixture discovery and changed-input replay. Live M1 externally gated.
3. M2 and M3 complete offline: outcomes, host policy, evidence, same-session test operator and adversarial regression repairs.
4. M4 in progress: capture public safe evidence, rehearse a clean clone, finish documentation and final review.

## Observed results
- `npm run build` passes.
- Initial integrated failures preserved in `.runs/tests/`: iframe startup race and prematurely recorded navigation checkpoint. Repaired using load readiness and declared condition waits.
- Latest `npm run verify:offline`: lint, strict types and 55 tests passed, 0 failed, no retries (30.9 s).
- Provider wire tests use local HTTP fixtures; live paid requests remain 0. Concurrent reservation, retained failed-call accounting and no SDK retry pass.
- Focused review repairs verified: final ownership, discovery expiry, pending click settlement, evidence cleanup, hidden review values, submitter overrides, overlapping anchors and artifact linkage.
- `demo:replay` and `demo:handoff -- --test-operator` both succeeded, commits 0. Agent personally inspected the rendered UI; this is not owner handoff evidence.
- `npm run verify:live` exits 1 with MODEL_UNAVAILABLE before browser/API work, as expected without authorization.

## Acceptance flags
- offline_core_passed: true (55/55; evidence/README.md maps A02-A19)
- live_discovery_passed: false (external gate)
- live_artifact_replay_passed: false (depends on genuine discovery)
- handoff_mechanism_passed: true (automated test_operator only, tests/integration/handoff.test.ts)
- manual_handoff_checked: false (owner must operate headed browser)
- clean_reproduction_passed: false (M4)

API authorization: no explicit project approval/model/key/budget supplied. Live requests: 0.
`artifacts/development-fixture.json` is openly scripted development evidence, not a live-model artifact.
Processes: tests/launchers own ephemeral servers/browsers and close them. No intentionally persistent process.
Next implementation action: commit the tested source, capture safe evidence and execute the documented commands from a clean local clone (A20).
