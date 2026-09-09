# Active account-binding repair

State: **ACCOUNT_REPAIR_READY_FOR_LIVE**. Starting source `60a11c4ef51c8f99cffe53119e87aa312f18fac6`, branch `build/computer-use`. Owner-review notes are preserved.

Completed: original artifact archived unchanged; reverse-direction failure retained; red regression baseline recorded; executed/checked symbolic account binding guard and discovery progress feedback implemented. Original selector/executor, policy, checkpoints, ownership and sandbox data/defaults unchanged.

Offline verification: `npm run verify:offline` passed 83/83 before one additional provider-settings regression (7/7 budget tests passed separately). Four-direction and changed-default/order UI tests pass with the explicitly scripted development artifact. Current submission artifact is still the historical six-step artifact and is NOT qualified for the corrected account contract.

Next unmet criterion: genuine non-default discovery with `examples/member-b-reverse.json` to a new candidate path; qualify those exact bytes with the expanded existing suite; only then promote. New owner authorization is USD5 additional within the original USD50 total. Original 8-call/69,398-token accounting and original closure remain intact; the new explicit account-repair stage measures all additional reservations from that retained total. No new paid request yet.

Private baseline logs: `.runs/account-repair/red-baseline.log` (3 pass, 10 fail), `red-discovery.log` (0 pass, 1 fail). Historical reverse-direction runs are public safe evidence `5606575e-f518-4ae9-8995-fbd1c77a42d1`, `5b896d02-5779-4099-b3b4-6aaaefcf064b`, `e6e28544-eaf1-4179-b8d1-e87ff35f1c6e`. Original artifact: `artifacts/historical/prepare-transfer-294a274e.json`, SHA256 `294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.

Remaining after live qualification: required-live demos, final offline verification, one clean reproduction, one focused review and final evidence/docs. Manual owner handoff and personal code review remain pending. Historical sections below retain their original results; earlier 31/31 did not cover reverse account direction.

---

# Implementation checkpoint

State: READY_FOR_OWNER_REVIEW. Branch: `build/computer-use`.
Final executable source: `fc3d888e507ee92675babc4e1682a75947c88573`.
Later commits package documentation and safe evidence only. Use `git rev-parse HEAD`
and `git status --short` for the current package revision/dirty state.
BUILD_SPEC.md, CODEX_BUILD_BRIEF.md and the original assignment PDF were read completely.

## Acceptance flags and observed proof

- offline_core_passed: true. Fresh lockfile clone: Biome, strict types, build, **65/65** tests; no failures/skips/retries.
- live_discovery_passed: true. One genuine gpt-5.6-sol attempt with seven decisions after one compatibility request; clean discovery source `728c1b13f94510524287f5d0ffba46748b47f296`.
- live_artifact_replay_passed: true. **31/31** tests on exact live bytes; fresh changed-input child with keys removed and model-import bomb; zero replay model calls and zero commits.
- handoff_mechanism_passed: true. Same-session `test_operator`, including live-derived artifact; owner operation is separate.
- manual_handoff_checked: false. Owner-operated terminal/browser check remains pending.
- personal_code_review_completed: false. Owner review remains pending.
- clean_reproduction_passed: true. Fresh local clone of final executable source, 65/65 plus 31/31 and both required-live demos. See REPRODUCTION.md for exact commands, durations and negative checks.

Artifact: `artifacts/prepare-transfer.json`, SHA-256
`294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.
Its six chosen steps preserve already-correct account defaults. The documented
member/account pairs and existing fault cases are qualified; arbitrary account
permutations are not. No hand editing or fixture substitution occurred.

## Paid phase complete and closed

8 paid requests total, 0 failed paid requests, 0 retries, 1 model candidate.
Observed tokens: 8,870 input (5,925 cache writes, 0 cached), 378 output (0 reasoning).
Estimated USD0.048965; durable reserve USD3.4699 including USD0.42525 selection.
Every response returned usage; no uncertain failure charge. The unused reserve
remains held. Original ledgers/config and closure marker remain ignored under
`.runs/`; do not reset them or make further paid requests. See docs/LIVE_VALIDATION.md.

## Evidence and review

Successful live evidence is first in `evidence/README.md`; all prior fixture runs
and historical failures remain preserved. Collection:
`evidence/collections/96325056-8e68-4296-97ec-fb11183ac97b.json`.
Clean clone/private command logs: `.reproduction/reviewer-live-fc3d888/.runs/reproduction/`.
Focused final review reports/verdicts are in ignored `.runs/reviews/ledger.jsonl`;
require the current package SHA's record, never infer coverage from an older review.
No review record upgrades owner-operated or personal-review gates.

## Next unmet acceptance criterion: owner manual handoff

Run `npm run demo:handoff -- --require-live` in an interactive terminal/display.
Confirm terminal `status` is HUMAN; restore the same browser using fake `demo-only`
in Demo password; wait for Prepare transfer / M-207; stop interacting, then `resume`.
Check review: CHK-207 → SAV-207, 37.50 USD, zero fee, AWAITING_CONFIRMATION;
terminal success and commits: 0. Then personally review code/evidence before submission.
No architectural planning, model selection or additional API spending is needed.

Launchers/tests close owned resources; private runs and clones remain ignored.
No publication, push, deployment, paid resource creation, submission or email occurred.
