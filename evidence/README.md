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
| A11 | Pass: forbidden control, submitter override, unknown effect/type/method, miswired route, human request; commits 0 | `tests/integration/{safety,policy-effects}.test.ts`, collection policy failure |
| A12 | Pass: native confirmation dismissed, DOM dialog rejected | `tests/integration/{outcomes,safety}.test.ts` |
| A13 | Pass mechanism; **manual candidate gate pending** | `tests/integration/{handoff,review-regressions}.test.ts`, collection test_operator |
| A14 | Pass: actual pending Playwright click, late model response, finalization race | `tests/unit/ownership.test.ts`, `tests/integration/{discovery-errors,review-regressions}.test.ts` |
| A15 | Pass: wrong restored member/amount and overlapping click anchors rejected | `tests/integration/{handoff,review-regressions}.test.ts` |
| A16 | Pass: synthetic sentinels absent from persisted fields/text/URLs/human changes/model errors | `tests/integration/redaction.test.ts`, provider wire test |
| A17 | Pass: executed symbolic steps, unchanged replay bytes | `tests/integration/{slice,safety}.test.ts` |
| A18 | Pass for implemented labeling/linkage; genuine live evidence pending | manifests distinguish development-fixture, automation and test_operator; never inferred human/live |
| A19 | Pass: actual failures emit structured diagnostics/snapshots; failed persistence stops and closes | failure run directories; `tests/integration/review-regressions.test.ts` |
| A20 | Pass: clean tracked-source clone; install, 59/59 tests, keyless demos | [REPRODUCTION.md](../REPRODUCTION.md) |

The original failing attempts are retained privately. Selected safe historical failures are copied below. Their old metadata reflects the implementation at the time and is not current qualification evidence. See `docs/QA_NOTES.md` for diagnoses. No test retries, fixture-to-live relabeling, or unperformed manual checks are used to establish these statuses.

The repaired source passed **59/59** offline tests, including a second fresh clone. Final commands, exact source revisions, clean-copy results and current status are recorded in `IMPLEMENTATION_STATUS.md` and `REPRODUCTION.md`.

## Current repaired-source collection

[Collection ec1cf49c](collections/ec1cf49c-f5cc-4d00-95fe-d86df4c095c6.json) captures seven actual runs at source `b53842a0ebaf13d546119bece16cc193f293c758`. [Artifact bytes](aa3a106d-418a-412d-a280-31c16da26ff4/capability.json) hash to `ff64e8b180afac7ea8f76e41abd6c151e3fd327609c9a59c544c557184ae0e75`. Every linked replay used that hash and recorded zero model calls; all seven independent commit counters were zero.

| Case | Safe run | Actual result |
|---|---|---|
| Scripted development discovery | [aa3a106d](aa3a106d-418a-412d-a280-31c16da26ff4/manifest.json) | Success; 9 fixture decisions, 0 live requests |
| Changed-input replay | [22d5176a](22d5176a-f471-4e04-919e-b5ec9973ac1a/manifest.json) | Success |
| Business outcome | [f4f262ef](f4f262ef-9d5e-4660-bbac-5f9e07565d06/result.safe.json) | INSUFFICIENT_FUNDS |
| Bounded recovery | [1c842506](1c842506-8cbd-42c2-89e0-f2c2e420b3cf/manifest.json) | Success; one review POST |
| Hard failure | [ff0a184b](ff0a184b-4eb2-41f3-aff5-a37fb67696cf/result.safe.json) | APP_ERROR |
| Policy failure | [bcab0e95](bcab0e95-74b4-4952-8a7e-df0f462311a1/result.safe.json) | POLICY_DENIED; zero review POSTs |
| Automated handoff | [e0ad908b](e0ad908b-03e9-469b-8944-2a4833c95a63/manifest.json) | Success; test_operator |

The exact current artifact passed `CUA_TEST_ARTIFACT=evidence/aa3a106d-418a-412d-a280-31c16da26ff4/capability.json npm run test:artifact`: **31/31**, no skips/retries (24.508 s).

Discovery started clean. Later capture runs truthfully show dirty source because earlier safe evidence copies were added; executable source did not change. The second fresh-clone [replay](ed3d7a71-8e05-4dcf-8e49-14174d88ab7e/manifest.json) and [test_operator](11077b81-d9da-4d27-a1fb-e3843ecba2c8/manifest.json) runs separately record repaired source with `dirty: false`.

## Prior collection before the final policy repair

[Collection bc906ea7](collections/bc906ea7-1002-418e-8e6c-704d333ad78e.json) records seven actual UI runs. Its artifact SHA-256 is `122e42d09ac4d56fb45dac01e7a4f0f9db02ffe985a49f8753c756826ac1bf8e`. All linked replays used those exact bytes, recorded zero model calls, and the independent oracle recorded zero commits in every case.

| Case | Safe run directory | Actual result |
|---|---|---|
| Scripted development discovery | [06e36561](06e36561-042e-451e-a76d-4ed600c211c8/manifest.json) | Success; 9 fixture decisions, 0 live requests; [artifact](06e36561-042e-451e-a76d-4ed600c211c8/capability.json) |
| Changed-input replay | [bfdb659f](bfdb659f-c51b-4878-ac3d-453f569bbc51/manifest.json) | Success |
| Business outcome | [bcfdd451](bcfdd451-a3ae-49b3-88c9-2591239f8e86/result.safe.json) | INSUFFICIENT_FUNDS |
| Bounded loading recovery | [4fae5555](4fae5555-1fdc-4a2e-be54-a53ddedde8b1/manifest.json) | Success; one review POST |
| Hard failure | [b353d168](b353d168-65c7-478f-9feb-96b82d7da48e/result.safe.json) | APP_ERROR; restricted snapshot |
| Policy failure | [5a20bbdf](5a20bbdf-6d6c-460a-8a6c-856d122345dd/result.safe.json) | POLICY_DENIED; no review POST |
| Automated handoff | [d282987c](d282987c-f508-4399-b1ba-3199fe18e75a/manifest.json) | Success; test_operator |

Source revision is `f49371f9da98e23e57d3ca9c5c0575219ca0468d`. Discovery started clean. Later runs truthfully show `dirty: true` because the capture added public evidence; executable source was unchanged. The new artifact also passed `test:artifact` (27/27). The clean-reproduction demos separately record clean source: [replay](a7fe0963-3c54-42c1-bdf5-8cd33454c65b/manifest.json), [test_operator](b1af876d-0a9d-405c-bc84-ed4b27f75cf6/manifest.json).

## Fixture and historical provenance

The checked-in `artifacts/development-fixture.json` is linked to its [original executed discovery](d0765da1-6f26-45b9-b6ee-74e30c14a064/manifest.json), hash `27f1ed95476dd13c9feb522300d759ddbfda1fd9503bd93e34bd8be2f058cd54`. That run predates the first commit and honestly records `uncommitted`, dirty source.

- [Startup failure 6eeb7a1b](historical/6eeb7a1b-98d6-416e-ac6f-200353c05133/result.safe.json): TARGET_NOT_FOUND before the iframe was ready.
- [Recorder/replay failure f1df02bf](historical/f1df02bf-2c8c-4812-84f8-695ba6c66366/result.safe.json): CHECKPOINT_MISMATCH from a prematurely recorded screen.

Historical bytes are preserved, not migrated: those manifests predate the `reservedTokens` field. They were checked against the explicit older allowlisted shape before copying. They are evidence of failures and repairs, not current acceptance passes. Every public run omits full business outputs and raw model/human content.
