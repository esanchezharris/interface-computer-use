# Historical account repair record

The repair below remains valid historical evidence. The final public evaluation, newly qualified artifact, retained manual acceptance and deferred walkthrough decision are indexed in [current evidence](../evidence/README.md). Its predecessor artifact is preserved at `artifacts/historical/prepare-transfer-4b0ffdc4.json`; nothing below claims the owner exercised the new discovery provenance.

---

# Account-parameterization repair record

The replacement live artifact actively selects both requested accounts and passes **37/37** exact-artifact tests. Full offline verification passes **84/84**. Owner manual handoff has subsequently passed twice; personal code review remains pending. See [owner acceptance](../evidence/owner-handoff.json). This is a correctness repair within the existing capability, synthetic application and safety policy.

## Root cause and preserved failure

The old recorder accepted any executed sequence whose current review matched the discovery invocation. It did not require operative account bindings. The original model omitted the two already-correct selects, producing six steps. Both original examples changed members while retaining CHK → SAV, which matched each member's UI defaults. Their passing results were real, but the earlier 31/31 did not test reverse-direction success.

The owner-review invocation SAV-207 → CHK-207 reached the opposite review and correctly failed final verification with `CHECKPOINT_MISMATCH`. That prevented false success but did not fulfill the advertised account input contract. The [original failure](../evidence/5606575e-f518-4ae9-8995-fbd1c77a42d1/result.safe.json) and subsequent [red regressions](../evidence/account-repair-red.json) remain historical. The original artifact is byte-for-byte at `artifacts/historical/prepare-transfer-294a274e.json`, SHA256 `294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.

Before the repair, the added tests produced **3 pass / 10 fail** (13 total, exit 1): both reverse-direction success tests, the changed-default/order case, and missing/incorrect binding qualification failed. The matching-default discovery regression separately produced **0/1**, exit 1: old discovery emitted an incomplete artifact, so the regression correctly rejected that behavior. These were genuine failing assertions, not expected-success tests changed to accept a checkpoint failure. Complete command logs remain in `.runs/account-repair/red-baseline.log` and `red-discovery.log`.

## Source and artifact binding

Implementation source: `563d3951363a19679fd8ae13ab6f5c0f4b0740c7`, clean when genuine discovery began. Final executable revision including the qualified artifact is `a0efd14e58a712f20d5e02970ee9f8f19c791e05`. Its clean-clone reproduction passed setup, 84/84 offline tests, 37/37 artifact tests and both required-live demos with no paid calls. Subsequent packaging changes contain only docs/safe evidence; see `REPRODUCTION.md`. The single focused final review is recorded by final package SHA in ignored `.runs/reviews/ledger.jsonl`; it does not complete either owner gate.

- `src/domain/account-bindings.ts:13` reads completed steps only. Each named account combobox must have an executed `select`, the correct identity-transformed input, and a same-target `value-equals` result check. Missing roles, swapped inputs/controls and missing result checks throw `RECORDING_INCOMPLETE`.
- `src/recording/recorder.ts:76` accumulates only completed steps. At line 97, `artifact()` requires both bindings before returning the serialized capability.
- `src/discovery/run.ts:71` derives `completedAccountSelections` from that record. The next request includes this truthful progress at line 95, so selecting an already-matching default need not repeat forever. The prompt requires explicit selections for both roles, including matching defaults; it supplies no selector sequence or fixture trajectory. Final UI extraction still precedes artifact emission at line 121.
- The existing `src/surface/executor.ts:59` resolves the value expression and selects by **option label**, not position. The existing selected-value postcondition checks and `src/surface/checks.ts:160` final visible-table extraction are unchanged. Member, both accounts, amount, fee validity, USD and AWAITING_CONFIRMATION are still verified. Host policy, strict target resolution, ownership/resume and redaction are unchanged.

Current submission and retained candidate have identical bytes:

`artifacts/prepare-transfer.json` and `artifacts/candidates/account-repair.json`

SHA256 **`4b0ffdc4c4510716f724d12e2ecc359c2b05d5bdfe98f699cf49ef3593c801e5`**.

| Executed step / artifact field | Target | Symbolic value and checked result |
|---|---|---|
| `steps[4]`, `step-005`, `target-005` (artifact line 316) | Workspace / combobox / Source account | `input.sourceAccountRef`, identity; matching `value-equals` |
| `steps[5]`, `step-006`, `target-006` (artifact line 369) | Workspace / combobox / Destination account | `input.destinationAccountRef`, identity; matching `value-equals`, plus retained source check |

[Live events](../evidence/cf84d841-1d59-48cf-984a-0f8347b0c7c4/events.jsonl) contain model response, action-start and action-complete for both selections. The model selected and executed them on real UI observations. The artifact was never hand-edited; schema/capability version remains 1 because the advertised contract was repaired, not expanded. Historical artifacts remain parseable but the new completion/qualification boundary rejects their missing bindings.

## Actual live and automated commands

The existing key was available in the current environment; it was neither printed nor copied. A key-free `.runs/account-repair.env` reused the established local settings and changed only the authorized stage. A strict project-local approval record at `.runs/budgets/assignment-20260908-account-repair.approved.json` fixes: original phase, account-repair stage, USD5 additional / USD50 aggregate, prior calls 8 / reserved tokens 69,398, Sol / low / 2,000 output tokens. The original closure and ledger are required and retained. This is a historical execution record, not permission to spend again.

```bash
set -a
source .runs/account-repair.env
set +a
npm run verify:live -- --inputs examples/member-b-reverse.json \
  --output artifacts/candidates/account-repair.json
```

Exit **0**; one genuine attempt, nine completed requests, eight executed actions, SAV-207 → CHK-207 for **6100 cents**, verified review and zero commits. Run `cf84d841-1d59-48cf-984a-0f8347b0c7c4`; its keyless changed-direction child is `ad157653-7133-4ef5-8af9-83012da1211a`. No failed paid attempt, compatibility request, model comparison or SDK retry occurred during repair.

All subsequent commands ran with environment names containing OPENAI, ANTHROPIC, API_KEY or CUA_ removed; only the explicit artifact path was reintroduced for qualification. Provider wire tests use a local fixture. Every command below exited **0**, without skips or test retries:

| Command | Observed result |
|---|---|
| `CUA_TEST_ARTIFACT=artifacts/candidates/account-repair.json npm run test:artifact` | 37/37; candidate hash unchanged |
| `CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact` | 37/37; same bytes after promotion |
| `npm run verify:offline` | Biome, strict types, build, 84/84 |
| `npm run demo:replay -- --require-live` | Success, run `09a31f1e-4167-4eb1-9d31-e7fbf00dbb67`, zero calls/commits |
| `npm run demo:handoff -- --require-live --test-operator` | Success, run `abf19e6c-fd89-406b-8112-adadb4bed578`, zero calls/commits; automated operator only |
| `npm run evidence:capture-live` | Original new discovery plus six linked replay/outcome/recovery/policy/test_operator runs; zero new paid calls or commits |

Promotion happened only after candidate qualification exit 0. The driver checked the qualified hash, verified the current old artifact equaled its archived bytes, wrote the candidate bytes to an exclusive temporary file and atomically replaced the submission path. A second qualification consumed the promoted file. No fixture fallback or artifact normalization was used.

The suite remains the existing `test:artifact` command, extended with `tests/integration/parameterization.test.ts`. `tests/artifact-path.ts` honors an explicit file path and does not replace missing/invalid bytes with a fixture. Existing outcome, wrong-member/source/destination/amount/fee, timeout, ambiguity, policy and handoff tests remain intact. Additional focused regressions are in `tests/unit/account-bindings.test.ts`, `tests/integration/discovery-bindings.test.ts`, `tests/unit/repair-budget.test.ts`, and the execution-progress assertions in `slice.test.ts`.

## Four-direction and initial-state qualification

Each row used a fresh browser context and exactly the same live artifact hash. Assertions compare outputs extracted from the current UI to the invocation, require fee zero/USD/AWAITING_CONFIRMATION, verify hash linkage and immutable bytes, and require zero model calls/reservations and zero simulated commits. A fatal model-import hook guards these tests. Available source balances were unchanged: M-104 CHK 185000 / SAV 450000 cents; M-207 CHK 275000 / SAV 625000 cents.

| Member | Requested source → destination | Amount | Safe run / result |
|---|---|---:|---|
| M-104 | CHK-104 → SAV-104 | $25.00 | [83d82c00](../evidence/83d82c00-9da1-49c2-98d0-94d6cf956adf/manifest.json), success |
| M-104 | SAV-104 → CHK-104 | $42.00 | [0360cd83](../evidence/0360cd83-00e6-4604-86f4-dd2973dc513d/manifest.json), success |
| M-207 | CHK-207 → SAV-207 | $37.50 | [8b37e97c](../evidence/8b37e97c-e428-49de-aa50-1f3fe2fab50f/manifest.json), success |
| M-207 | SAV-207 → CHK-207 | $61.00 | [688dfc83](../evidence/688dfc83-c5a2-44fe-8711-bb1d0d581939/manifest.json), success |
| M-207 | CHK-207 → SAV-207, changed defaults and reversed options | $52.00 | [9b4b3b41](../evidence/9b4b3b41-947b-4429-9c1e-3e1cd29bfb9e/manifest.json), success |

The fifth case uses the existing Runtime/executor harness: immediately before the first recorded transfer-screen action, it reverses the options in the visible controls and changes both selected defaults to the other existing account. It checks those changed values, then executes the unchanged artifact and extracts the review. This is explicitly **test-only visible-DOM perturbation**, not a second application or a hidden production workflow. The first four rows invoke the ordinary replay runner. See [machine-readable linkage](../evidence/account-parameterization.json) and private `submission-qualification.log`.

## Spending bounds and observed usage

Sol / low / default / 2,000 output tokens were reused because they were already validated. The API request format, processing tier, origin, retry policy and hosted-tool configuration were unchanged. Official [model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol), [Standard pricing](https://developers.openai.com/api/docs/pricing) and [cache accounting](https://developers.openai.com/api/docs/guides/prompt-caching) were rechecked before the repair call on September 8, 2026 (Los Angeles). No paid compatibility check was necessary for prompt/progress text in the existing request contract.

The existing reservation formula remains UTF-8 input bytes + 2048 overhead + capped output, at USD50 per million reserved tokens. Input reservation ≤16,384; output 2,000; request timeout 30 s; active discovery 120 s; 30 actions / 32 decisions; original shared call cap 32 across restarts; retries 0; sequential phase lock spans each request. The repair uses the original total ledger minus the fixed prior 69,398-token floor, capped at 100,000 additional reserved tokens. It cannot reset an allowance by using a new budget ID, and original selection/acceptance remain closed. Its separate `.closed` marker was written immediately after qualification/promotion.

Observed repair usage: **11,168 input** = 1,034 ordinary + 10,134 cache-write + 0 cached; **480 output**, including 29 reasoning tokens. At published USD/M rates 4 ordinary / 5 writes / 0.40 cached / 20 output, the estimate is **USD0.064406**. The [summary](../evidence/account-repair-summary.json) records observed tokens separately from estimated cost and conservative reserves.

Additional reserve: **83,847 tokens / USD4.19235**, retained in full. Aggregate: **17 requests**, 153,245 reserved tokens / **USD7.66225**, estimated spend **USD0.113371**. No missing usage or uncertain failed charge exists; retained excess above estimated use is USD4.127944 for repair and USD7.548879 aggregate. No reservation was refunded/reset. This is not a billing receipt. Paid requests have stopped.

## Owner handoff completed; personal review pending

The owner reported personally performing and verifying the command below twice. Runs `e59f4654-727a-4f35-83fc-59fced282a63` and `78753464-d145-41f3-88b3-bc4cf3201efa` both match the qualified artifact and clean package revision `0369d808df669016564f98d3e2e1bc66e383f13d`. Their original automatic records show HUMAN ownership, restoration activity, resumption, success and zero model calls/reserved tokens. Owner-supplied terminal output confirms the expected values and commits: 0. [The acceptance record](../evidence/owner-handoff.json) separates owner report from automatically recorded evidence. No repeat manual run is required.

Command actually performed by the owner, retained for reproduction:

```bash
npm run demo:handoff -- --require-live
```

In the terminal enter `status` and confirm HUMAN. In the same browser enter the synthetic credential **demo-only** in **Demo password**, click **Restore session**, and wait for **Prepare transfer / M-207**. Stop touching the browser and enter `resume` in the terminal. The new qualified artifact must produce **M-207, CHK-207 → SAV-207, 37.50 USD, fee 0.00, AWAITING_CONFIRMATION**; the terminal must report success and **commits: 0**. The runner closes its browser after verification; the terminal result preserves the UI-derived values. The owner report and these exact run IDs are now linked; automatically recorded metadata remains a separate source. Personal code review is still pending.

This proves the account contract for the existing synthetic application, not a universal account system, vendor portability or an OS input lock. Public snapshots intentionally redact business values; assertion logs remain private while expected synthetic test inputs are documented above. Source and artifact hashes establish linkage, not cryptographic proof of provider origin. Nothing was pushed, published, deployed, submitted, or emailed.
