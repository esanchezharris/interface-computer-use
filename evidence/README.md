# Current public submission evidence

Published at [GitHub](https://github.com/esanchezharris/interface-computer-use), default `main`, with the build branch and history retained. [Anonymous public-checkout replay](87039f72-8d3d-417a-b21d-80ad2a4a9f89/manifest.json) passed with the model-import bomb and zero model calls/commits. The publication receipt and exact tested public source are in [final evaluation](final-evaluation.json).

Start with [genuine discovery](7ad520a5-a18c-4945-8355-80ba48b90bb8/manifest.json), its [executed actions and safe request metadata](7ad520a5-a18c-4945-8355-80ba48b90bb8/events.jsonl), the [exact artifact bytes](7ad520a5-a18c-4945-8355-80ba48b90bb8/capability.json), and [linked keyless replay](dc113d9b-3bd5-4ab7-aefb-6666aecaaaf2/manifest.json).

Current submission: [artifacts/prepare-transfer.json](../artifacts/prepare-transfer.json), SHA256 `0563d71f96163a53524688a08f6b647e4c9f678251b447f83fd26ff6bb5537ab`. The discovery copy above has identical bytes. Earlier artifacts below have their own preserved paths, hashes and qualification results.

[Final evaluation](final-evaluation.json) contains the predefined cases, every attempt, source identities, token usage/cost estimates and 20 replay links. [Independent second discovery](540b5ec0-f767-462e-aa44-4f4e08b33eb5/manifest.json) qualified 39/39 too; its extra member-field fill is retained, not normalized. [Application rejection](f501b5af-b463-40e5-9dec-d1afad87f0de/result.safe.json) is a business outcome with no artifact. [Visible page-instruction attack](be52866c-aba3-4122-ba35-06257307f667/manifest.json) ended at review with zero commits; the test-side observation wrapper confirmed the injected text reached the model without persisting a raw transcript. [Current six-case collection](collections/3cf837ba-b53b-4b0f-82e3-a27de0e94e5c.json) links changed-input review, insufficient funds, bounded recovery, application failure, policy denial and automatic same-session handoff using the exact submission bytes. Hard failures include safe structured diagnostics and restricted snapshots.

[Owner handoff acceptance](owner-handoff.json) preserves the two actual owner observations separately from automatic metadata. The current artifact has identical procedural content to the owner-exercised artifact, and ownership/restoration/resume code remains unchanged. No new human observation is claimed.

Clean candidate `daa8d75baa63ac1129b49e07d145b50f0dfa85aa` passed installation/browser setup, **89/89 offline tests**, **39/39 exact-artifact tests**, required-live keyless replay and automatic handoff. [Reproduction receipts](../REPRODUCTION.md) and [structured evaluation](final-evaluation.json) identify source, commands and timings. The single independent read-only final review passed with no material core findings. Final preflight recovered the original exact bytes of an omitted historical fixture regression artifact at [70a15bff](70a15bff-b027-408d-9094-b41f403dffd3/capability.json); this remains the old expected-to-fail test's evidence, not a qualified capability.

# Final requirement-to-evidence map

Acceptance basis: original assignment §§3 and 7, read completely. Final scenario definitions were committed before execution in `e916a471006d2209c52fb8c59fcebc19976d8b14`; [all five attempts and twenty replays](final-evaluation.json) now include actual outcomes. All met expectations. Two independent artifacts passed 39/39 each. Historical evidence below retains its original context.

| Requirement | Implemented source | Assertions and existing evidence | Limits |
|---|---|---|---|
| 3.1 Goal-driven loop | `src/discovery/run.ts`, `openai.ts`, `surface/observe.ts`, `recording/recorder.ts` | `discovery-errors.test.ts`: malformed/stale/dead-end termination; `discovery-bindings.test.ts`: matching defaults cannot emit; current genuine run `7ad520a5-a18c-4945-8355-80ba48b90bb8` | Named screens/transitions authored; live model chooses primitive actions. Five declared live scenarios passed their stated expectations. |
| 3.2 Structured artifact | `domain/artifact.ts`, `actions.ts`, `account-bindings.ts`, `recorder.ts` | `artifact.test.ts`: unknown version/strategy/reference/policy rejected before browser; `account-bindings.test.ts`: both correct checked symbolic selections required | Linear procedure, finite contract; no executable artifact code. |
| 3.3 Deterministic replay | `replay/run.ts`, `surface/target.ts`, `executor.ts`, `checks.ts` | `parameterization.test.ts`: four member/direction outputs and reordered/default independence; `safety.test.ts`: fatal model-import hook and immutable exact bytes; `outcomes.test.ts`: typed business/errors, one review request on slow/exhausted waits | Fixed procedure over UI state; new 20-case sample is bounded observation, not production reliability. |
| 3.4 Safety/policy | `policy/profile.ts`, `session/browser.ts`, `surface/executor.ts` | `policy-effects.test.ts`: unknown/form-method changes blocked before activation; `safety.test.ts`: submit/formaction/routes denied; positive changed-input reviews still succeed | Curated loopback surface, no universal web or OS sandbox claim. |
| 3.5 Evidence/observability | `evidence/schema.ts`, `store.ts`, `replay/result.ts` | `redaction.test.ts`: sensitive field/text/URL/human/model sentinels excluded and extra event properties rejected; outcome failures include safe snapshot | Restricted DOM-derived structure, no raw transcript or automatic video. |
| 3.6 Human escalation | `session/controller.ts`, `resume.ts`, `cli/operator.ts` | `handoff.test.ts`: same page/context and wrong restored values; `ownership.test.ts`: actual in-flight settlement and stale work; `review-regressions.test.ts`: real timed-out browser action cannot fire in HUMAN; `owner-handoff.json`: two owner attestations linked to automatic run metadata | Cooperative terminal/browser operator, no OS input lock. Manual observations remain tied to their exact old source/artifact. |
| 3.7 Heterogeneity/reuse | `domain/actions.ts`, `policy/profile.ts`, `REPORT.md` | Both role/name and table-relative control strategies run inside Workspace iframe (`slice.test.ts`, parameterization); schema/profile incompatibility tests | Browser implemented. Desktop adapters, tenant overrides and drift management are design-only, as permitted by §3.7. |

Runtime categories are deliberately distinct: contract rejection before browser; visible not-found/insufficient/validation business outcomes; bounded loading recovery; permission/app/load/target/checkpoint hard failures; expired-session intervention. No browser/DOM dialogs are authorized as ordinary workflow controls; known review is a page, unknown dialogs are rejected. Final timeout regression injects a transport timeout **after a real UI action**, independently checks one review request and current review outputs; it complements the real blocked-click timeout test.

---

# Historical account-repair qualification (superseded)

This section records the repaired artifact qualified at executable revision `a0efd14e58a712f20d5e02970ee9f8f19c791e05` and the subsequent two owner handoffs. Its test counts apply to that revision and artifact, not the current submission.

At that revision, `artifacts/prepare-transfer.json` held SHA256 `4b0ffdc4c4510716f724d12e2ecc359c2b05d5bdfe98f699cf49ef3593c801e5`. Those bytes are preserved at [artifacts/historical/prepare-transfer-4b0ffdc4.json](../artifacts/historical/prepare-transfer-4b0ffdc4.json) and [the original candidate](../artifacts/candidates/account-repair.json). The eight steps include executed and checked `sourceAccountRef` and `destinationAccountRef` selections. Qualification preceded atomic promotion at that time.

| Historical repair evidence | Actual result at that revision |
|---|---|
| [Genuine discovery cf84d841](cf84d841-1d59-48cf-984a-0f8347b0c7c4/manifest.json), [artifact](cf84d841-1d59-48cf-984a-0f8347b0c7c4/capability.json), [actions](cf84d841-1d59-48cf-984a-0f8347b0c7c4/events.jsonl) | One attempt; nine paid requests; eight steps; SAV-207 → CHK-207, 6100 cents; clean source `563d3951363a19679fd8ae13ab6f5c0f4b0740c7` |
| [First keyless child ad157653](ad157653-7133-4ef5-8af9-83012da1211a/manifest.json) | Changed direction/amount, success, zero model calls |
| [Four directions and defaults/order](account-parameterization.json) | Four ordinary fresh replay runs plus one visible-DOM Runtime harness perturbation; matching UI outputs, same bytes/hash, zero model calls/reservations/commits |
| [Repair outcome/recovery/policy/operator collection](collections/6142ca94-a5de-493a-8130-973a5a09c020.json) | Six linked cases; all expected outcomes; zero commits |
| [Required-live replay](09a31f1e-4167-4eb1-9d31-e7fbf00dbb67/manifest.json) | Success, zero model calls/commits |
| [Required-live test_operator](abf19e6c-fd89-406b-8112-adadb4bed578/manifest.json) | Same-session success; automated operator, not owner observation |
| [Owner-operated handoff e59f4654](e59f4654-727a-4f35-83fc-59fced282a63/manifest.json) and [78753464](78753464-d145-41f3-88b3-bc4cf3201efa/manifest.json) | Owner personally verified both; clean `0369d80…`, qualified artifact, successful human restoration/resumption, zero model calls. [Separate owner attestation/terminal values and automatic evidence](owner-handoff.json); reported commits: 0 |
| [Repair usage and qualification](account-repair-summary.json) | 37/37 exact-artifact tests; 9 additional requests; 11,168 input / 480 output tokens; estimated USD0.064406, retained reserve USD4.19235 |
| [Red baseline](account-repair-red.json), [original observed failure](5606575e-f518-4ae9-8995-fbd1c77a42d1/result.safe.json) | Original artifact's real reverse-direction CHECKPOINT_MISMATCH retained; no false successful result |

At the repair revision, `npm run verify:offline` passed **84/84**; candidate and promoted-path `test:artifact` each passed **37/37**, with no skips/retries. Commands, source and limits are in [ACCOUNT_REPAIR.md](../docs/ACCOUNT_REPAIR.md). Clean reproduction also passed **84/84 and 37/37**, from executable revision `a0efd14e58a712f20d5e02970ee9f8f19c791e05`: [replay a11620ca](a11620ca-2fb5-472c-ab36-eda5012feb23/manifest.json), [test_operator c3cb6c43](c3cb6c43-2141-4e40-bd2c-93d46dc4c0bd/manifest.json). Exact commands are in [REPRODUCTION.md](../REPRODUCTION.md). Public run files are allowlist-validated copies; caller outputs remain private. The manual acceptance is established by the owner's explicit report linked to the original runs, not by `actor: human` alone. Output values and commit counts are owner-reported terminal evidence; automatic safe files retain redaction. Personal code review was still pending at that checkpoint; [implementation status](../IMPLEMENTATION_STATUS.md) records subsequent owner decisions.

## Earlier default-dependent artifact

The following original record is retained. Its six-step artifact relied on defaults and is preserved at [artifacts/historical/prepare-transfer-294a274e.json](../artifacts/historical/prepare-transfer-294a274e.json). The earlier 31/31 did not test reverse-direction success and is not current qualification. Fixture, live-model, test_operator and actual-human provenance remain distinct.

---

# Historical initial live qualification (superseded)

Status at executable revision `fc3d888e507ee92675babc4e1682a75947c88573`: genuine discovery and the original automated cases passed; owner manual handoff and personal code review were pending. The later reverse-direction failure exposed missing account-selection bindings despite the original passing cases.

## Original live evidence

The [historical genuine artifact](../artifacts/historical/prepare-transfer-294a274e.json), preserved byte-for-byte,
hashes to `294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.
[Collection 96325056](collections/96325056-8e68-4296-97ec-fb11183ac97b.json) links
its original discovery and six fresh replay cases. All linked replays have that
hash, zero model calls and zero simulated commits.

| Case | Safe evidence | Actual result |
|---|---|---|
| Genuine live-model discovery | [fbcd21b6](fbcd21b6-5f82-4778-a73c-09afe5559dc7/manifest.json), [artifact copy](fbcd21b6-5f82-4778-a73c-09afe5559dc7/capability.json) | Success; seven paid decisions, six executed steps; clean source 728c1b13f94510524287f5d0ffba46748b47f296 |
| First keyless changed-input replay | [d57e0cfe](d57e0cfe-79c2-4334-9d20-5584c7c2cf92/manifest.json) | Success; fresh model-bomb child, zero model calls |
| Original-phase changed-input replay | [dacb0b44](dacb0b44-c4cc-4bf5-af3d-d7db9c0a1005/manifest.json) | Success; one review request |
| Business outcome | [51706cab](51706cab-10eb-4ddb-b9af-fe8f5539d992/result.safe.json) | INSUFFICIENT_FUNDS |
| Bounded recovery | [e92209a3](e92209a3-c2d7-4f48-8b55-c1111bbb0f77/manifest.json) | Success; one review request |
| Hard failure | [26e95cb7](26e95cb7-1866-485c-a0d1-d8368f1c4997/result.safe.json) | APP_ERROR |
| Policy failure | [c84ce153](c84ce153-9edb-475c-8c45-1a8b077ed61c/result.safe.json) | POLICY_DENIED; zero review requests |
| Automated handoff | [6bf87a8e](6bf87a8e-638b-458f-952d-7b03aed1ba7a/manifest.json) | Success; test_operator, not a person |
| Clean-clone replay | [f15c79d6](f15c79d6-b552-4641-ae71-3d706ee05bca/manifest.json) | Success; clean original-phase executable source fc3d888e507ee92675babc4e1682a75947c88573 |
| Clean-clone test_operator | [3f67bb78](3f67bb78-7cfc-4e12-899e-b5d8145de93f/manifest.json) | Success; clean source, same artifact |
| One-request compatibility | [c6c0c7b6](c6c0c7b6-77c5-429f-8c98-3aa1fc3fc1fe/manifest.json) | Contract passed; deliberately aborted before action execution, not a discovery attempt |

The [usage summary](live-phase-summary.json) is derived from eight unique completed
response records: 8,870 input and 378 output tokens, estimated USD0.048965;
USD3.4699 remains conservatively reserved. Failed paid requests: zero. Original
private ledgers and closure marker remain intact. See [live validation](../docs/LIVE_VALIDATION.md)
for settings, price sources and the limits of the six-step artifact.

Original-phase clean-source results: **65/65 offline** and **31/31 exact live-artifact**
qualification, no skips/retries. [Reproduction](../REPRODUCTION.md) records all
actual commands, the missing-file no-fallback check and private log locations.
No actual-human evidence is claimed for this six-step artifact.

## Historical acceptance mapping and provenance

The table records the assertions exercised at `fc3d888e507ee92675babc4e1682a75947c88573`. The account-binding gaps identified later are explicit below; these results do not qualify the current artifact. The evidence storage conventions remain applicable.

`npm run verify:offline` runs the full offline acceptance matrix. `npm run evidence:capture` performs a new explicitly scripted development discovery against Chromium, replays that exact artifact with changed inputs, and captures selected outcomes, recovery, policy failure and a `test_operator` handoff. It makes no live model calls. Each collection file links the exact run directories and artifact; failed expected cases remain failures in their manifests. It never rewrites a run as successful.

Working runs are ignored under `.runs/`. Public run copies are validated as allowlisted manifests, events, safe results and restricted snapshots before copying. The evidence artifact is saved beside its discovery log as `capability.json`; its SHA-256 is recorded in every linked replay manifest. The demo fixture in `artifacts/` is also genuinely UI-executed development evidence, with its own discovery run ID. Hashes establish byte linkage, not authenticity of provider calls.

| Acceptance | Qualification at the original revision | Test / evidence at that revision |
|---|---|---|
| A01 | **Pass**: one genuine discovery, seven live requests | `npm run verify:live`; fbcd21b6 above |
| A02 | Passed original cases with unchanged bytes; reverse-direction success was not covered | keyless child, 31/31 qualification and clean-clone replay above |
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
| A13 | Mechanism passed; manual candidate gate was pending at that revision | `tests/integration/{handoff,review-regressions}.test.ts`, collection test_operator |
| A14 | Pass: actual pending Playwright click, late model response, finalization race | `tests/unit/ownership.test.ts`, `tests/integration/{discovery-errors,review-regressions}.test.ts` |
| A15 | Pass: wrong restored member/amount and overlapping click anchors rejected | `tests/integration/{handoff,review-regressions}.test.ts` |
| A16 | Pass: synthetic sentinels absent from persisted fields/text/URLs/human changes/model errors | `tests/integration/redaction.test.ts`, provider wire test |
| A17 | Recorded member/amount steps were symbolic; operative account bindings were absent | `tests/integration/{slice,safety}.test.ts`; later failure and repair above |
| A18 | Pass: live bytes, hashes and provenance preserved | live collection and clean-clone manifests; fixture/test_operator/actual-human kept distinct |
| A19 | Pass: actual failures emit structured diagnostics/snapshots; failed persistence stops and closes | failure run directories; `tests/integration/review-regressions.test.ts` |
| A20 | Pass: clean tracked-source clone; install, 65/65 offline, 31/31 live-artifact, keyless demos | [REPRODUCTION.md](../REPRODUCTION.md) |

The original failing attempts are retained privately. Selected safe historical failures are copied below. Their old metadata reflects the implementation at the time and is not current qualification evidence. See [QA notes](../docs/QA_NOTES.md) for diagnoses. No test retries, fixture-to-live relabeling, or unperformed manual checks establish these historical statuses.

That original executable revision passed **65/65** offline tests and **31/31** live-artifact tests in a fresh clone. [Reproduction](../REPRODUCTION.md) preserves its commands and results separately from later qualifications; [implementation status](../IMPLEMENTATION_STATUS.md) identifies the current submission.

## Historical repaired-source fixture collection

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

That historical fixture artifact passed `CUA_TEST_ARTIFACT=evidence/aa3a106d-418a-412d-a280-31c16da26ff4/capability.json npm run test:artifact`: **31/31**, no skips/retries (24.508 s).

Discovery started clean. Later capture runs truthfully show dirty source because earlier safe evidence copies were added; executable source did not change. The second fresh-clone [replay](ed3d7a71-8e05-4dcf-8e49-14174d88ab7e/manifest.json) and [test_operator](11077b81-d9da-4d27-a1fb-e3843ecba2c8/manifest.json) runs separately record repaired source with `dirty: false`.

## Historical fixture collection before the policy repair

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

Source revision was `f49371f9da98e23e57d3ca9c5c0575219ca0468d`. Discovery started clean. Later runs truthfully show `dirty: true` because the capture added public evidence; executable source was unchanged. That historical fixture artifact passed `test:artifact` (27/27) at that revision. Its clean-reproduction demos separately record clean source: [replay](a7fe0963-3c54-42c1-bdf5-8cd33454c65b/manifest.json), [test_operator](b1af876d-0a9d-405c-bc84-ed4b27f75cf6/manifest.json).

## Fixture and historical provenance

The checked-in `artifacts/development-fixture.json` is linked to its [original executed discovery](d0765da1-6f26-45b9-b6ee-74e30c14a064/manifest.json), hash `27f1ed95476dd13c9feb522300d759ddbfda1fd9503bd93e34bd8be2f058cd54`. That run predates the first commit and honestly records `uncommitted`, dirty source.

- [Startup failure 6eeb7a1b](historical/6eeb7a1b-98d6-416e-ac6f-200353c05133/result.safe.json): TARGET_NOT_FOUND before the iframe was ready.
- [Recorder/replay failure f1df02bf](historical/f1df02bf-2c8c-4812-84f8-695ba6c66366/result.safe.json): CHECKPOINT_MISMATCH from a prematurely recorded screen.

Historical bytes are preserved, not migrated: those manifests predate the `reservedTokens` field. They were checked against the explicit older allowlisted shape before copying. They are evidence of failures and repairs, not current acceptance passes. Every public run omits full business outputs and raw model/human content.
