# Evidence index

Status: **offline fixture evidence; genuine discovery and owner manual handoff are pending**.

`npm run verify:offline` runs the full offline acceptance matrix. `npm run evidence:capture` performs a new explicitly scripted development discovery against Chromium, replays that exact artifact with changed inputs, and captures selected outcomes, recovery, policy failure and a `test_operator` handoff. It makes no live model calls. Each collection file links the exact run directories and artifact; failed expected cases remain failures in their manifests. It never rewrites a run as successful.

Working runs are ignored under `.runs/`. Public run copies are validated as allowlisted manifests, events, safe results and restricted snapshots before copying. The evidence artifact is saved beside its discovery log as `capability.json`; its SHA-256 is recorded in every linked replay manifest. The demo fixture in `artifacts/` is also genuinely UI-executed development evidence, with its own discovery run ID. Hashes establish byte linkage, not authenticity of provider calls.

| Acceptance | Current qualification | Test / evidence |
|---|---|---|
| A01 | **Blocked**: no approved model/key/budget; live requests 0 | `npm run verify:live`; no live-model artifact is claimed |
| A02 | Pass with development artifact; live-artifact gate pending | `tests/integration/slice.test.ts`, collection changed-input replay |
| A03 | Pass offline: fresh subprocess, keys removed, fatal model import hook unused | `tests/unit/architecture.test.ts`, `tests/integration/safety.test.ts` |
| A04 | Pass | `tests/unit/{contract,artifact}.test.ts`, invalid discovery proposals |
| A05 | Pass: iframe plus actual nonsemantic amount field | `tests/integration/slice.test.ts` |
| A06 | Pass: all three business outcomes | `tests/integration/outcomes.test.ts`, collection business outcome |
| A07 | Pass: two bounded recoveries and exhausted deadline, one review POST each | `tests/integration/outcomes.test.ts`, collection recovery |
| A08 | Pass: distinct permission/app failures | `tests/integration/outcomes.test.ts`, collection hard failure |
| A09 | Pass: duplicate controls and duplicate frames prevent effect | `tests/integration/outcomes.test.ts` |
| A10 | Pass: wrong member/accounts/amount, malformed fee, hidden values | `tests/integration/{outcomes,safety}.test.ts` |
| A11 | Pass: forbidden control, submitter override, miswired route, human request; commits 0 | `tests/integration/safety.test.ts`, collection policy failure |
| A12 | Pass: native confirmation dismissed, DOM dialog rejected | `tests/integration/{outcomes,safety}.test.ts` |
| A13 | Pass mechanism; **manual candidate gate pending** | `tests/integration/{handoff,review-regressions}.test.ts`, collection test_operator |
| A14 | Pass: actual pending Playwright click, late model response, finalization race | `tests/unit/ownership.test.ts`, `tests/integration/{discovery-errors,review-regressions}.test.ts` |
| A15 | Pass: wrong restored member/amount and overlapping click anchors rejected | `tests/integration/{handoff,review-regressions}.test.ts` |
| A16 | Pass: synthetic sentinels absent from persisted fields/text/URLs/human changes/model errors | `tests/integration/redaction.test.ts`, provider wire test |
| A17 | Pass: executed symbolic steps, unchanged replay bytes | `tests/integration/{slice,safety}.test.ts` |
| A18 | Pass for implemented labeling/linkage; genuine live evidence pending | manifests distinguish development-fixture, automation and test_operator; never inferred human/live |
| A19 | Pass: actual failures emit structured diagnostics/snapshots; failed persistence stops and closes | failure run directories; `tests/integration/review-regressions.test.ts` |
| A20 | Pending final clean-copy rehearsal | see `REPRODUCTION.md` when completed |

The original failing attempts are retained privately. Selected safe historical failures will be copied alongside the collection and labeled separately. Their old metadata reflects the implementation at the time and is not current qualification evidence. See `docs/QA_NOTES.md` for diagnoses. No test retries, fixture-to-live relabeling, or unperformed manual checks are used to establish these statuses.

The full offline suite most recently passed **55/55** tests before packaging. Final commands, exact source revisions, clean-copy results and current status are recorded in `IMPLEMENTATION_STATUS.md` and `REPRODUCTION.md`.
