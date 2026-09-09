# Computer-use transfer preparation

A local TypeScript/Node system that observes a synthetic banking UI, asks one model adapter for primitive actions, records executed symbolic steps, and replays the artifact without a model. Every run stops at review. No real banking service or data is involved.

**Current evidence status:** genuine OpenAI discovery succeeded, and its exact six-step artifact passed all 31 artifact-qualification tests. Changed-input replay runs without credentials or model imports and stops at review with zero commits. The separate development fixture and historical failures remain labeled and preserved. Owner-operated handoff and personal code review remain pending; see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) and [evidence/README.md](evidence/README.md).

## Setup and keyless demonstration

Tested on macOS arm64 with Node **24.16.0**, npm **11.13.0**, Playwright **1.63.0**, TypeScript **7.0.2**, Zod **4.5.4**, and OpenAI SDK **7.10.0**. Use Node 24.x. Other operating systems are unverified.

```bash
npm ci
npm run browser:install
npm run verify:offline
npm run demo:replay -- --require-live
npm run demo:handoff -- --require-live --test-operator
```

The demos own an ephemeral loopback server and fresh browser, then close them. They use `artifacts/prepare-transfer.json` if present; otherwise they visibly report the checked-in development fixture. `--fixture` explicitly selects that fixture. `--require-live` rejects a missing or fixture artifact before opening a browser, so the commands above cannot silently substitute one. Add `--headed` to replay to watch Chromium. `verify:offline` runs Biome, strict type checking, and Node unit/browser tests with **no retries and no paid services**. The provider adapter's wire tests use a local HTTP fixture.

## Separate app and runner

```bash
# Terminal 1; SANDBOX_PORT can select another port.
npm run sandbox

# Terminal 2; no provider credentials or initialization on this path.
npm run replay -- --artifact artifacts/prepare-transfer.json \
  --inputs examples/member-b.json --headed
```

Default origin is `http://127.0.0.1:4173`; use `--origin` on replay for another exact loopback origin. Input properties are exactly `memberId` (`M-` and three digits), `sourceAccountRef`/`destinationAccountRef` (`CHK-` or `SAV-` and three digits), and a positive integer `amountCents` up to 1,000,000. Accounts must differ. USD is fixed. UI money uses ungrouped decimal strings such as `37.50`; currency symbols, grouping, signs, exponents and fractional cents are rejected.

Successful stdout contains the full UI-extracted result for the caller. **Do not redirect that channel into public logs.** Automatic evidence under ignored `.runs/` contains only sanitized summaries. Failures return a closed code, step, allowlisted diagnostics and evidence references.

## Authorized live discovery

The authorized phase is **complete and closed**. One compatibility request and one seven-request discovery succeeded using `gpt-5.6-sol`, low reasoning, Standard (`default`) processing, and the actual JSON decision contract. No second candidate was needed. Estimated usage cost was **$0.048965**; the durable ledger retains **$3.4699** in conservative reservations, including $0.42525 for selection. These are different measures, neither an invoice. [Live validation](docs/LIVE_VALIDATION.md) records the authorization, prices, settings and counts.

The fixed OpenAI Responses adapter requires `OPENAI_API_KEY`, `CUA_API_APPROVED=true`, `CUA_MODEL`, `CUA_LIVE_PHASE=assignment-20260908`, `CUA_BUDGET_STAGE` (`selection` or `acceptance`), `CUA_BUDGET_ID`, `CUA_MAX_CALLS`, and `CUA_MAX_TOTAL_TOKENS`. `CUA_REASONING_EFFORT` defaults to `low`; `CUA_MAX_OUTPUT_TOKENS` defaults to 1000. There is no automatic `.env` loading, inherited API base URL, or authorization from credential presence. The existing environment key was reused without copying it into configuration or evidence.

Actual paid-phase commands, recorded for reproducibility, **not an instruction to spend again**:

```bash
# Authorized configuration only; this file contains no key.
set -a
source .runs/live-phase.env
set +a
npm run verify:provider
CUA_BUDGET_STAGE=acceptance npm run verify:live

# Subsequent qualification is offline and needs no approval or key.
CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact
```

The general discovery interface remains:

```bash
npm run discover -- \
  --goal "Find the supplied member and prepare the supplied transfer. Stop at review; never submit." \
  --target http://127.0.0.1:4173/app \
  --inputs examples/member-a.json --output artifacts/prepare-transfer.json --headed
```

Output files must not already exist. `verify:live` owns a fresh sandbox, performs genuine discovery and replays the saved bytes with different inputs in a keyless child guarded by a fatal model-import hook. `verify:provider` makes just one decision against a fresh live observation and deliberately stops without completing discovery.

Existing durable budgets under `.runs/budgets/` reserve every request before sending. Fixed shared ledgers enforce the $50 aggregate ceiling and $5 selection subset across budget IDs, candidates and restarts, using the verified conservative $50/million-token bound. Input reservations are capped at 16,384; this phase used 2,000 output tokens/request. Failed calls keep their reservations; SDK retries are disabled. An exclusive phase lock prevents overlapping requests, and the persisted `.closed` marker rejects further calls after qualification. Never delete/reset these files to obtain a new allowance. A fresh clone is for offline reproduction and does not carry spending authority. Additional live work requires new explicit authorization and preservation of the original accounting.

## Genuine manual handoff (owner gate)

Run this in an interactive terminal with a display:

```bash
npm run demo:handoff -- --require-live
```

The runner opens headed Chromium, reaches the mock expired session, and waits in that **same** window/context. In the terminal enter `status` and confirm `HUMAN`. In the browser enter fake credential **`demo-only`** in **Demo password**, click **Restore session**, and wait until **Prepare transfer** appears for member **M-207**. Stop touching the browser, then enter `resume`. Confirm the UI review shows **37.50 USD**, **CHK-207 → SAV-207**, fee **0.00**, and **AWAITING_CONFIRMATION**; the terminal must report success and **commits: 0**. `takeover`, `status`, `resume`, and `abort` are also available during an operator-enabled run. Duplicate/out-of-order commands fail explicitly. An incorrect restored member or changed form value cannot resume.

This is a cooperative local protocol, not an OS input lock. Request takeover before touching an active automation window. HUMAN ownership waits for the actual outstanding browser operation to settle; it does not use a timeout as pretend cancellation. Waiting expires after ten minutes. Without an operator channel the run returns `HUMAN_REQUIRED` rather than hanging. The automated `--test-operator` command is mechanism evidence only; it never counts as a person operating the browser.

## Boundaries and review

The model sees bounded visible observations and fresh candidate handles; it can click, fill/select using typed input references, wait, finish, or request a human. It receives no navigation script. The development fixture is isolated in `scripts/fixture-model.ts`. Named screen transitions, exceptions, output verification, and policy are explicitly developer-authored. The live model left the already-correct account defaults unchanged; its six-step artifact is qualified for the documented member/account pairs, not arbitrary account permutations. The recorder preserves the executed sequence and verifies conditions; it does not normalize away exploratory steps.

Role/name and table-label targets are frame-scoped and strict. An ephemeral pinned element is authorized before dispatch; it is never persisted. Exact origin/route/method interception remains active for humans, and commit routes are always blocked. Service workers, extra windows and downloads are unsupported. This is defense in depth for this curated synthetic app, not an OS sandbox or a universal browser-security guarantee.

[REPORT.md](REPORT.md) describes the design and cuts. [docs/DEFENSE_NOTES.md](docs/DEFENSE_NOTES.md) identifies code and tradeoffs to study. [BUILD_SPEC.md](BUILD_SPEC.md) is the implementation specification; [CODEX_BUILD_BRIEF.md](CODEX_BUILD_BRIEF.md) is the execution procedure. No publication, push, deployment, paid resource creation, or employer email is authorized by this repository.

[REPRODUCTION.md](REPRODUCTION.md) records the clean-clone commands and exact tested source revision. `npm run evidence:capture-live` packages the original private live run and six linked offline replay cases when those private files are available. `npm run evidence:capture` produces a new safe development-only evidence collection; it never calls a live provider or substitutes for the manual gate. See the [evidence index](evidence/README.md) for linked runs, outcomes and preserved historical failures.
