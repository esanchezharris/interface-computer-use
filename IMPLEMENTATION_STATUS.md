# Implementation checkpoint

State: **IMPLEMENTATION_COMPLETE_WITH_EXTERNAL_GATES_PENDING**. Not submission-ready.
Branch: `build/computer-use`. Tested executable source: `b53842a0ebaf13d546119bece16cc193f293c758`.
Later packaging commits contain only documentation and reviewed safe evidence. Use
`git rev-parse HEAD` / `git status --short` for the current packaging revision and dirty state.
Read completely: BUILD_SPEC.md, CODEX_BUILD_BRIEF.md and original assignment PDF.

## Completed local work

- M0-M3: synthetic iframe app, strict contracts/artifact, real provider adapter and durable approval/budget gates, UI discovery/recording, model-free replay, policy, outcomes, bounded waits, ownership/resume and safe persistence.
- M4: seven-run evidence collection, original failures retained, concise report/defense notes, agent-operated visible UI inspection and clean-clone rehearsal. See `REPRODUCTION.md` and `evidence/README.md` for commands and A01-A20 mapping.
- `npm run verify:offline`: lint, strict types and **59/59** tests passed, 0 failed/skipped, no retries. Fresh repaired-source clone also passes 59/59 (34.043 s test duration).
- `npm run demo:replay` and `npm run demo:handoff -- --test-operator`: success in that clean clone, zero model calls and zero commits.
- Current artifact qualification: **31/31** tests, no skips/retries. Collection: `evidence/collections/ec1cf49c-f5cc-4d00-95fe-d86df4c095c6.json`.
- Malformed-input CLI exits 1 with CONTRACT_INVALID before UI work. Unauthorized `verify:live` exits 1 with MODEL_UNAVAILABLE before browser/API work. These are expected gate results, not unresolved implementation failures.

## Acceptance flags

- offline_core_passed: true (A02-A19 with development artifact; live-derived qualifications still gated)
- live_discovery_passed: false (A01; no authorized project model/key/finite budget)
- live_artifact_replay_passed: false (requires genuine discovery artifact)
- handoff_mechanism_passed: true (A13-A15; automated test_operator only)
- manual_handoff_checked: false (owner must operate the headed browser)
- clean_reproduction_passed: true (A20; fresh clone, lockfile install, 59/59 tests and both demos)

## Review and evidence

Earlier review failures and repaired regressions are summarized in `docs/QA_NOTES.md`.
The packaged-source review at `544ebb202cc3cc0ee8c5cc162a5bb64eb5cf903e` found an
unknown-click-effect policy gap. Four regressions first showed 3 failures/1 pass;
all 4 pass after the fix. The complete 59-test suite and clean reproduction were refreshed.
Exact-SHA final review reports and verdict records are retained in ignored `.runs/reviews/`.
Review coverage never upgrades unperformed live/manual gates.

## Next unmet criterion and owner actions

A01 is next: supply explicitly authorized OpenAI model/key/approval and finite call/token
budget as documented in README, then run `npm run verify:live`. Live paid requests so far: **0**.
Qualify the resulting exact artifact with
`CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact`.
The independent manual gate is `npm run demo:handoff` in a real terminal/display:
wait for HUMAN, restore with fake demo-only credential in the same window, then resume.
Review code/evidence personally before any submission-readiness claim.

No new architecture planning is needed. No intentional sandbox/browser process remains;
launchers and tests close their owned resources. Private runs and clean clones remain ignored.
No publication, push, deployment, paid resource creation or employer email occurred.
