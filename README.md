# Computer-use transfer preparation

A local TypeScript/Node system that observes a synthetic banking UI, asks one model adapter for primitive actions, records executed symbolic steps, and replays the artifact without a model. Every run stops at review. No real banking service or data is involved.

**Current evidence status:** offline implementation is available. The included artifact is **development-fixture**, produced by a disclosed scripted model substitute against real Chromium. It is not genuine discovery. No paid model request or genuine human handoff has been performed. These remain submission gates; see [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) and [evidence/README.md](evidence/README.md).

## Setup and keyless demonstration

Tested on macOS arm64 with Node **24.16.0**, npm **11.13.0**, Playwright **1.63.0**, TypeScript **7.0.2**, Zod **4.5.4**, and OpenAI SDK **7.10.0**. Use Node 24.x. Other operating systems are unverified.

```bash
npm ci
npm run browser:install
npm run verify:offline
npm run demo:replay
npm run demo:handoff -- --test-operator
```

The demos own an ephemeral loopback server and fresh browser, then close them. They use `artifacts/prepare-transfer.json` if present; otherwise they visibly report the checked-in development fixture. `--fixture` explicitly selects that fixture. Add `--headed` to replay to watch Chromium. `verify:offline` runs Biome, strict type checking, and Node unit/browser tests with **no retries and no paid services**. The provider adapter's wire tests use a local HTTP fixture.

## Separate app and runner

```bash
# Terminal 1; SANDBOX_PORT can select another port.
npm run sandbox

# Terminal 2; no provider credentials or initialization on this path.
npm run replay -- --artifact artifacts/development-fixture.json \
  --inputs examples/member-b.json --headed
```

Default origin is `http://127.0.0.1:4173`; use `--origin` on replay for another exact loopback origin. Input properties are exactly `memberId` (`M-` and three digits), `sourceAccountRef`/`destinationAccountRef` (`CHK-` or `SAV-` and three digits), and a positive integer `amountCents` up to 1,000,000. Accounts must differ. USD is fixed. UI money uses ungrouped decimal strings such as `37.50`; currency symbols, grouping, signs, exponents and fractional cents are rejected.

Successful stdout contains the full UI-extracted result for the caller. **Do not redirect that channel into public logs.** Automatic evidence under ignored `.runs/` contains only sanitized summaries. Failures return a closed code, step, allowlisted diagnostics and evidence references.

## Authorized live discovery

The fixed adapter uses OpenAI's Responses API. It requires an explicit compatible model, project-authorized API key, approval flag, and finite budget. There is no default model, inherited API base URL, automatic `.env` loading, or inference of permission from credential presence. Review `.env.example`; export the configuration only after approval. Never use unrelated credentials.

Required variables: `OPENAI_API_KEY`, `CUA_MODEL`, `CUA_API_APPROVED=true`, `CUA_BUDGET_ID`, `CUA_MAX_CALLS`, and `CUA_MAX_TOTAL_TOKENS`. `CUA_MAX_OUTPUT_TOKENS` defaults to 1000. Caps are 32 calls, 1,000,000 reserved tokens total, and 4000 output tokens/request. These are maximum supported caps, **not approval to spend them**.

```bash
npm run discover -- \
  --goal "Find the supplied member and prepare the supplied transfer. Stop at review; never submit." \
  --target http://127.0.0.1:4173/app \
  --inputs examples/member-a.json --output artifacts/prepare-transfer.json --headed

npm run replay -- --artifact artifacts/prepare-transfer.json \
  --inputs examples/member-b.json --headed

# Alternative: owns its server, performs genuine discovery and keyless child-process replay.
npm run verify:live
```

Output files must not already exist: preserve failed attempts and version prior artifacts explicitly. `verify:live` requires the same approved environment and will fail early without it. It uses a child-process model-import bomb with provider keys removed for changed-input replay. After a genuine artifact exists, run the offline negative cases against that artifact using `CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact` before treating the live artifact as qualified.

Budgets live in `.runs/budgets/<budget-id>.json`. Each attempted request reserves its call plus UTF-8 input bytes, conservative message overhead, and capped output tokens **before sending**. Failures retain the reservation; SDK retries are disabled. Actual provider usage/request IDs are recorded only when returned. Reservation counts are not actual token usage or a dollar/billing guarantee. Configuration for an existing budget ID is immutable. Locks serialize concurrent processes; a crash-left lock or pending file fails closed and requires owner inspection. Do not delete a ledger to reset an approved budget.

## Genuine manual handoff (owner gate)

Run this in an interactive terminal with a display:

```bash
npm run demo:handoff
```

The runner opens headed Chromium, reaches the mock expired session, and waits in that **same** window/context. In the terminal enter `status` and confirm `HUMAN`. In the browser enter fake credential **`demo-only`** in **Demo password**, click **Restore session**, and wait until **Prepare transfer** appears for member **M-207**. Stop touching the browser, then enter `resume`. Confirm success at review and zero commits. `takeover`, `status`, `resume`, and `abort` are also available during an operator-enabled run. Duplicate/out-of-order commands fail explicitly. An incorrect restored member or changed form value cannot resume.

This is a cooperative local protocol, not an OS input lock. Request takeover before touching an active automation window. HUMAN ownership waits for the actual outstanding browser operation to settle; it does not use a timeout as pretend cancellation. Waiting expires after ten minutes. Without an operator channel the run returns `HUMAN_REQUIRED` rather than hanging. The automated `--test-operator` command is mechanism evidence only; it never counts as a person operating the browser.

## Boundaries and review

The model sees bounded visible observations and fresh candidate handles; it can click, fill/select using typed input references, wait, finish, or request a human. It receives no navigation script. The development fixture is isolated in `scripts/fixture-model.ts`. Named screen transitions, exceptions, output verification, and policy are explicitly developer-authored. The recorder preserves the executed sequence and verifies conditions; it does not normalize away exploratory steps.

Role/name and table-label targets are frame-scoped and strict. An ephemeral pinned element is authorized before dispatch; it is never persisted. Exact origin/route/method interception remains active for humans, and commit routes are always blocked. Service workers, extra windows and downloads are unsupported. This is defense in depth for this curated synthetic app, not an OS sandbox or a universal browser-security guarantee.

[REPORT.md](REPORT.md) describes the design and cuts. [docs/DEFENSE_NOTES.md](docs/DEFENSE_NOTES.md) identifies code and tradeoffs to study. [BUILD_SPEC.md](BUILD_SPEC.md) is the implementation specification; [CODEX_BUILD_BRIEF.md](CODEX_BUILD_BRIEF.md) is the execution procedure. No publication, push, deployment, paid resource creation, or employer email is authorized by this repository.

[REPRODUCTION.md](REPRODUCTION.md) records the clean-clone commands and exact tested source revision. `npm run evidence:capture` produces a new safe development-only evidence collection; it never calls a live provider or substitutes for the manual gate. See the [evidence index](evidence/README.md) for linked runs, outcomes and preserved historical failures.
