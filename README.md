# Computer-use transfer preparation

A working, deliberately small computer-use system: a model observes a fictional banking UI, chooses primitive actions, and records a reusable JSON capability. Replay runs that capability in a fresh browser **without a model or API key**, selects the supplied accounts, and verifies the displayed review. It never submits a transfer.

The application is one local synthetic sandbox with two members, a Workspace iframe, and a table-relative amount field. No real banking service, customer data, or credentials are used.

## Run the demonstration

Node **24.x** is required. Tested on macOS arm64 with Node 24.16.0, npm 11.13.0, Playwright 1.63.0 and Chromium 153.0.8010.12. Other platforms are unverified.

```bash
npm ci
npm run browser:install
npm run demo:replay -- --require-live
# Add --headed to watch the browser.
npm run demo:handoff -- --require-live --test-operator

npm run verify:offline
CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact
```

The demos own an ephemeral loopback server and a fresh Chromium context, then close both. `--require-live` rejects missing or fixture artifacts before opening a browser. Qualification consumes the explicitly named bytes and cannot silently fall back. The offline suite has no paid requests or test retries.

Expected replay result: **M-207, CHK-207 → SAV-207, 37.50 USD, fee 0.00, AWAITING_CONFIRMATION**, with success and **commits: 0**. Values are extracted from the current UI and compared with the invocation. Caller stdout includes the full synthetic result; automatic evidence under ignored `.runs/` redacts values. Do not redirect real sensitive caller output into public logs.

## Inspect the submission

- [Qualified artifact](artifacts/prepare-transfer.json): SHA256 `0563d71f96163a53524688a08f6b647e4c9f678251b447f83fd26ff6bb5537ab`.
- [Current live discovery](evidence/7ad520a5-a18c-4945-8355-80ba48b90bb8/manifest.json), [executed decisions](evidence/7ad520a5-a18c-4945-8355-80ba48b90bb8/events.jsonl), and [linked changed-input replay](evidence/dc113d9b-3bd5-4ab7-aefb-6666aecaaaf2/manifest.json).
- [Evidence index and requirement map](evidence/README.md), [declared cases and all final evaluation attempts](evidence/final-evaluation.json), [concise design report](REPORT.md), and [clean reproduction](REPRODUCTION.md).
- [Owner-operated handoffs](evidence/owner-handoff.json): two actual owner attestations, separately linked to automatically recorded events.

Final evaluation: three differently phrased genuine discoveries succeeded; application validation returned its expected business outcome without emitting a capability; visible page instructions to submit were ignored and the run stopped at review. Two independently discovered artifacts each passed **39/39** qualification tests. The final artifact passed **20/20** declared fresh-session replays across both members/directions, amounts, reversed options/changed defaults and loading delays, with zero replay model calls and commits. This is a limited observed sample, not production reliability or exhaustive coverage.

## Supply other supported inputs

```bash
# Terminal 1
npm run sandbox
# Terminal 2
npm run replay -- --artifact artifacts/prepare-transfer.json \
  --inputs examples/member-b.json --headed
```

Default origin is `http://127.0.0.1:4173`; `--origin` selects another exact loopback origin. Input fields are `memberId` (`M-` and three digits), distinct `sourceAccountRef`/`destinationAccountRef` (`CHK-` or `SAV-` and three digits), and positive integer `amountCents` up to 1,000,000. USD is fixed. The sandbox contains M-104 and M-207, each with matching CHK and SAV accounts. Either direction is supported when funded. Validation of input syntax is separate from visible application business outcomes and account availability.

Both account selections are actual recorded `select` actions bound to invocation input names. Final checkpoint references or matching defaults alone cannot qualify discovery. Review verification checks member, both accounts, amount, fee, currency and review-only status. The historical default-dependent artifact and its reverse-direction failure are preserved in [account repair evidence](docs/ACCOUNT_REPAIR.md); the old 31-test result did not cover that defect.

## Genuine live discovery and API configuration

Replay needs no provider configuration. Live discovery requires OpenAI API access and explicit budget approval. Supply `OPENAI_API_KEY` through the shell or a local secret manager; there is no automatic `.env` loading. Never commit a key. A fresh reviewer environment can use this bounded configuration:

```bash
# OPENAI_API_KEY must already be exported; these settings contain no credential.
export CUA_API_APPROVED=true CUA_MODEL=gpt-5.6-sol
export CUA_LIVE_PHASE=assignment-20260908 CUA_BUDGET_STAGE=acceptance
export CUA_BUDGET_ID=live-sol-20260908 CUA_MAX_CALLS=32
export CUA_MAX_TOTAL_TOKENS=1000000 CUA_MAX_OUTPUT_TOKENS=2000
export CUA_REASONING_EFFORT=low
npm run verify:live -- \
  --goal 'Prepare the supplied transfer and stop at review; never submit.' \
  --inputs examples/member-a.json --output artifacts/candidates/reviewer.json
CUA_TEST_ARTIFACT=artifacts/candidates/reviewer.json npm run test:artifact
```

The output file must not exist. `verify:live` starts its own sandbox, performs real discovery, then invokes a keyless changed-input replay child with a fatal model-import hook. The general interface is `npm run discover -- --goal 'Prepare the supplied transfer for review only.' --target http://127.0.0.1:4173/app --inputs examples/member-a.json --output artifacts/candidates/other.json --headed` against an already running sandbox.

Discovery bounds actions, decisions, active time, requests and tokens. Requests are sequential, use Standard processing with no hosted tools, and have a 30-second timeout with SDK retries disabled. Durable ledgers reserve conservative costs before sending and retain failed or uncertain request reservations within the $50 aggregate ceiling. Existing closed stages reject further sends; never reset ledgers to obtain another allowance. See [configuration details and historical provenance](docs/LIVE_VALIDATION.md) and [recorded usage, cost estimates and retained reservations](evidence/final-evaluation.json).

## Demonstrate human handoff

```bash
npm run demo:handoff -- --require-live
```

In the terminal enter `status` and confirm `HUMAN`. In the **existing browser window**, enter fake credential **demo-only** in **Demo password**, click **Restore session**, and wait for **Prepare transfer / M-207**. Stop touching the browser, then enter `resume` in the terminal. Expect the same review values listed above and **commits: 0**. The runner closes the window after verification. `takeover`, `status`, `resume`, and `abort` are available; duplicate/out-of-order commands fail explicitly.

The owner performed and verified this flow twice on the earlier qualified artifact. Those observations remain tied to their actual run IDs/source/hash. The final artifact's procedure, bindings and checkpoints are identical after excluding discovery provenance, and the ownership/restoration/resume implementation is unchanged. No new human run is claimed. `--test-operator` is automatic mechanism evidence, never owner observation.

## Boundaries

Policy is host-controlled: exact origin/routes/methods and known control effects, with commit always denied. Targets must be unique, visible and of the expected kind; the model cannot supply arbitrary selectors or code. Replay has no provider dependency or model fallback. Takeover invalidates stale work and waits for actual in-flight operations; resume validates the same session's declared anchors. This is a cooperative local protocol, not an OS input lock.

Evidence uses strict allowlists and restricted DOM-derived snapshots, not raw DOM, transcripts, browser storage, screenshots or video. Provider retention is a separate concern (`store: false` is requested). The browser adapter is implemented; desktop and multi-tenant extensions are design-only. No universal website safety or production-bank qualification is claimed. [BUILD_SPEC.md](BUILD_SPEC.md), [CODEX_BUILD_BRIEF.md](CODEX_BUILD_BRIEF.md), and [status](IMPLEMENTATION_STATUS.md) preserve the implementation decisions and history.
