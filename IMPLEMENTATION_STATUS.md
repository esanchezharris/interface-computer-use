# Implementation checkpoint

State: BUILDING (M4 final packaged-source review). Branch `build/computer-use`.
Prior tested source: `f49371f9da98e23e57d3ca9c5c0575219ca0468d`. Current uncommitted final-review repair: stricter click-effect policy, four browser regressions and qualification command coverage.
Read completely: BUILD_SPEC.md, CODEX_BUILD_BRIEF.md, assignment PDF (all text).
Environment: macOS arm64, Node 24.16.0, npm 11.13.0; dependency versions locked.

## Working plan
1. M0 complete: runnable synthetic iframe sandbox; schemas; dependency/browser installation.
2. M1 complete offline: actual UI fixture discovery and changed-input replay. Live M1 externally gated.
3. M2 and M3 complete offline: outcomes, host policy, evidence, same-session test operator and adversarial regression repairs.
4. M4 evidence, documentation and clean reproduction complete. Final packaged-source review is the next local action.

## Observed results
- `npm run build` passes.
- Initial integrated failures preserved in `.runs/tests/`: iframe startup race and prematurely recorded navigation checkpoint. Repaired using load readiness and declared condition waits.
- Latest `npm run verify:offline`: lint, strict types and 55 tests passed, 0 failed, no retries (30.9 s).
- Provider wire tests use local HTTP fixtures; live paid requests remain 0. Concurrent reservation, retained failed-call accounting and no SDK retry pass.
- Focused review repairs verified: final ownership, discovery expiry, pending click settlement, evidence cleanup, hidden review values, submitter overrides, overlapping anchors and artifact linkage.
- `demo:replay` and `demo:handoff -- --test-operator` both succeeded, commits 0. Agent personally inspected the rendered UI; this is not owner handoff evidence.
- `npm run verify:live` exits 1 with MODEL_UNAVAILABLE before browser/API work, as expected without authorization.

## Acceptance flags
- offline_core_passed: true (lint, strict types and59/59 tests, no skips/retries; 34.452 s)
- live_discovery_passed: false (external gate)
- live_artifact_replay_passed: false (depends on genuine discovery)
- handoff_mechanism_passed: true (automated test_operator only, tests/integration/handoff.test.ts)
- manual_handoff_checked: false (owner must operate headed browser)
- clean_reproduction_passed: false (refresh required after policy repair; prior clean-clone 55/55 preserved)

API authorization: no explicit project approval/model/key/budget supplied. Live requests: 0.
`artifacts/development-fixture.json` is openly scripted development evidence, not a live-model artifact.
Processes: tests/launchers own ephemeral servers/browsers and close them. No intentionally persistent process.
Evidence collection: `evidence/collections/bc906ea7-1002-418e-8e6c-704d333ad78e.json`; seven actual development UI runs, all zero commits. The new artifact passes 27/27 browser qualification tests.
Final review at `544ebb202cc3cc0ee8c5cc162a5bb64eb5cf903e` found an unknown-click-effect policy gap. Reproduced (3 failing/1 passing cases), repaired, focused checks4/4 pass. Full59-test verification passes; prior reproduction is historical until refreshed.
Next implementation action: finish59-test verification, commit policy repair, refresh evidence/reproduction and final review without repeating architectural work.
