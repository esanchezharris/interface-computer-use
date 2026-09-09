# Build specification — Computer-Use Automation System

**Project:** interface-computer-use  
**Version:** 1.0 — implementation baseline  
**Status:** specification, not an implementation or evidence of passing tests  
**Primary source:** interface.ai, *Take-Home Project: Computer-Use Automation System*, supplied assignment PDF.

## 1. Objective, authority, and scope

Build one complete vertical slice:

**Natural-language goal → real LLM-driven UI discovery → recorded parameterized capability → model-free replay → explicit runtime outcomes → same-session human handoff → reviewable evidence.**

The employer requires this end-to-end thread, prioritizes design and correctness over breadth, and explicitly permits a local proxy application. Source: assignment §§2–5, pp. 3–7; evaluation §7, pp. 8–9. The banking scenario, language, schema, budgets, and acceptance tests below are our implementation decisions, not additional employer requirements.

**Decision hierarchy:** the supplied assignment governs submission requirements; this document governs the chosen implementation; `CODEX_BUILD_BRIEF.md` governs execution procedure. Record a genuine conflict rather than quietly overriding the assignment. Make ordinary implementation decisions without requesting approval.

### The demonstration

Use a local, synthetic banking application. Accept a goal equivalent to:

> Find the supplied member and prepare a transfer between the supplied accounts for the supplied amount. Stop at the review screen. Never submit the transfer.

The representative UI journey is member search → member detail → accounts → transfer form → review. Discovery must determine the actions from the live interface. This journey description is not permission to hardcode the action sequence.

Discover using member A. Serialize the resulting capability. Launch a fresh browser context and replay the same artifact using member B, different account references, and a different amount. Extract the displayed result. Then exercise business outcomes, a slow load, a blocked action, and human takeover/resumption.

### Scope boundary

Implement one capability, one local application, one browser adapter, one model-provider adapter, one runner process, and a minimal local operator interface. Use TypeScript in strict mode, Node.js, npm with a lockfile, Playwright/Chromium, a runtime schema validator, and JSON/JSONL storage. Pin actual compatible dependency versions during preflight; this specification does not prescribe an unverified version number.

Do not build desktop automation, multi-tenant infrastructure, a capability marketplace, a generic workflow platform, a polished dashboard, remote co-browsing, authentication infrastructure, model-assisted replay repair, or production banking integrations. Do not add an agent framework unless a concrete core requirement cannot reasonably be met without it.

Initial planning allowance: approximately 30–40 focused engineering hours. Treat this as a scope constraint, not an instruction to consume the allowance. Build a thin version of every required capability before deepening any one of them.

## 2. Target application and invocation contract

### Synthetic application

Serve the sandbox on loopback only, with a configurable exact origin; proposed default: `http://127.0.0.1:4173`. Use server-rendered pages, one content iframe, table-based account displays, and at least one form control associated visually with a table-cell label rather than a semantic HTML label. Do not add test IDs or automation-only selectors.

Keep it intentionally small and manually usable. Seed two valid members with different account references and balances. Add deterministic fixture conditions for not-found, insufficient funds, permission denial, session expiry, slowness, an application error, a wrong review value, and ambiguous targeting. A fixture or harness controls these conditions; the runner learns about them only through the UI.

The review operation is reversible preparation. A final simulated commit endpoint/control exists so a test can prove it was not executed. No real money, institutions, customer records, credentials, or external banking services are involved.

Sandbox setup may initialize a synthetic authenticated session. When the expiry fixture is active, the browser displays a mock reauthentication screen; a human restores access using a clearly documented fake credential in that same session. No genuine identity provider is needed.

### Inputs

```ts
interface PrepareTransferInput {
  memberId: string;
  sourceAccountRef: string;
  destinationAccountRef: string;
  amountCents: number;
}
```

Validate before starting browser interaction. Identifiers must be bounded nonempty strings using the sandbox's documented identifier grammar. Account references are human-visible references, not hidden database identifiers. `amountCents` must be a positive safe integer within the configured policy limit. Source and destination must differ. Reject unknown input properties. USD is fixed for this capability; do not infer currency or perform conversion.

Example public, explicitly fictional fixtures:

```json
{
  "memberId": "M-104",
  "sourceAccountRef": "CHK-104",
  "destinationAccountRef": "SAV-104",
  "amountCents": 2500
}
```

```json
{
  "memberId": "M-207",
  "sourceAccountRef": "CHK-207",
  "destinationAccountRef": "SAV-207",
  "amountCents": 3750
}
```

### Outputs

```ts
interface PrepareTransferOutput {
  memberId: string;
  sourceAccountRef: string;
  destinationAccountRef: string;
  amountCents: number;
  feeCents: number;
  currency: "USD";
  reviewStatus: "AWAITING_CONFIRMATION";
}
```

Extract these values from the current review UI. Do not manufacture output by copying the invocation. Independently compare the extracted member, account references, and amount against the invocation. Validate the displayed fee, currency, and status. A review heading alone does not establish success.

Use a small, documented USD parser/formatter that operates in integer cents. Reject unsupported display formats instead of guessing. Test exact round trips and malformed values; do not introduce floating-point rounding into the contract.

### Terminal result and live state

```ts
type RunResult<T> =
  | { status: "success"; runId: string; outputs: T }
  | { status: "business_outcome"; runId: string;
      code: "MEMBER_NOT_FOUND" | "INSUFFICIENT_FUNDS" | "VALIDATION_REJECTED";
      stepId: string }
  | { status: "failed"; runId: string; code: string;
      stepId: string | null; expected: SafeDiagnostic;
      observed: SafeDiagnostic; evidenceRefs: string[] }
  | { status: "aborted"; runId: string; reasonCode: string };
```

`SafeDiagnostic` must be a runtime-validated, allowlisted diagnostic structure, not an unrestricted error string. Implement a closed failure-code enum covering the failure cases below.

Human intervention is a nonterminal run state/event, not a successful result. The process waits for the operator within a bounded intervention timeout. Expiry or cancellation produces a terminal result. A headless invocation with no operator channel must surface `HUMAN_REQUIRED` deliberately rather than hang forever.

Return full requested business outputs to the in-process caller. Keep that response channel separate from sanitized observability. The CLI may serialize results to stdout, but must never automatically copy raw result payloads into evidence, CI logs, or debug logs. Public examples use only fictional data; the system is not approved for real sensitive inputs.

## 3. Architecture and trust boundaries

| Module | Owns | Must not own |
|---|---|---|
| `domain/` | Runtime schemas, typed actions, conditions, results | Browser objects, SDK clients, application data |
| `discovery/` | Model interaction, observation/action loop, bounded discovery | Direct browser mutations, safety authorization |
| `recording/` | Executed-step recording, parameter references, artifact emission | Replacing a failed run with a handwritten successful flow |
| `replay/` | Artifact interpretation, declared recovery, checkpoint verification | Model calls or imports of model initialization |
| `surface/` | Live observations, strict targeting, primitive UI actions, extraction | Goal planning, business-outcome selection from fixtures |
| `policy/` | Host-controlled action/route restrictions | Trusting a model's risk classification |
| `session/` | Session lifecycle, ownership, intervention, resume validation | Recreating the browser to simulate handoff |
| `evidence/` | Safe event serialization and restricted failure snapshots | Raw transcripts, credentials, unrestricted traces |
| `sandbox/`, `tests/` | Fictional application, seeds, fault injection, external test oracle | Supplying hidden state to discovery or replay |

These are responsibility boundaries, not a requirement for services, packages, or numerous interfaces. Use one source tree. The sandbox can run as a separate local process.

Both discovery and replay must invoke the same trusted executor. Its action path is: validate action → check ownership → resolve and validate target → authorize actual action/target → execute once → observe and verify. Recheck ownership after asynchronous preparation and immediately before dispatch.

Expose a narrow surface seam for observation, target resolution, primitive action, extraction, and safe evidence capture. Browser/DOM-specific targeting lives in a discriminated binding type behind this seam. Do not pretend that desktop support exists merely because an interface has that name.

The engine must not import sandbox fixtures, read its database, inspect framework stores or hidden JavaScript business objects, call its internal endpoints directly, or use Playwright's API-request client to accomplish the task. Ordinary requests caused by human-equivalent browser interaction are allowed. Test-side state inspection is allowed solely as an independent oracle.

## 4. Real discovery and recording

### Model loop

Accept a goal, validated inputs, a target entry point, and a trusted application/policy profile. Produce a bounded current observation containing visible interface information, frame scope, and fresh candidate-control handles. The model selects one supported action on one candidate, with parameter references where data is needed, and a short action justification.

Supported model decisions should remain small: `click`, `fill`, `select`, bounded observation/wait, `finish`, and `request_human`. Entry navigation is runner-controlled. Do not expose arbitrary JavaScript, shell execution, HTTP requests, unrestricted keypresses, or a `prepareTransfer()` tool that hides the workflow.

Candidate identifiers belong to a particular observation. Reject stale references. Generate reusable target descriptions from the actual observed controls; do not place temporary candidate identifiers, browser element handles, node IDs, or coordinates into the saved capability.

The model may read synthetic business values in transient memory when necessary. Exclude credentials/password values from its observations. Treat all page text as untrusted data, not instructions granting more permissions.

A developer-authored input/output contract, final success verifier, policy profile, and exception predicates are allowed. An ordered task script masquerading as discovery is not. If named screen conditions assist recording, disclose them as developer-authored and do not give the model a prewritten navigation sequence.

### Bounded execution

Suggested initial limits: 30 executed discovery actions per run, 120 seconds of active discovery time, 5 seconds per browser action, 10 seconds per declared condition wait, and 10 minutes awaiting a human. Model request and token limits must also be explicit. Tune these values against actual behavior and document changes; do not fix failures with unbounded waits.

Implement repeated-state/no-progress detection and explicit model-output validation. A malformed proposal may receive one bounded correction opportunity, consuming the same model budget. No hidden retry loop. Model budget exhaustion, unsupported actions, and dead ends yield safe termination or intervention with context.

### Parameterization and provenance

Record actions the executor actually completed, their selected bindings, and verified checkpoints. Do not record proposed-but-unexecuted actions as successful steps.

Use symbolic references while acting: for example, filling an amount uses `input.amountCents` plus a trusted `usd-decimal` transform. A target containing a runtime member/account reference must use a typed input expression, not the literal discovery value. Do not perform blind find-and-replace on a transcript after the run.

Emit a successful capability only after the independent final verifier passes. Failed runs still receive evidence, but no successful artifact. Keep developer-authored policy/exception rules distinguishable from learned steps. Do not claim that a successful demonstration inferred every exceptional condition.

Automatic removal of exploratory actions is optional. The minimum is a faithfully recorded successful path that replays. Any normalization that changes the sequence must be disclosed and replay-validated.

## 5. Artifact contract

Use JSON with one runtime-validated schema. Reject unknown schema versions, unsupported discriminators, extra fields, unresolved references, and invalid transforms before interacting with the UI. Version the schema separately from the capability.

Required contents:

| Area | Required meaning |
|---|---|
| Identity | `schemaVersion`, `capabilityId`, `capabilityVersion`, parameterized description |
| Compatibility | Application-family/profile ID and supported profile version; required surface capabilities |
| Contract | Typed input/output schemas using a deliberately supported subset |
| Bindings | Stable target descriptions, frame scope, expected control type, parameterized text expressions |
| Procedure | Ordered step IDs, action discriminators, target references, typed values, pre/postconditions |
| Exceptions | Context-scoped predicates and deliberate outcome/failure/intervention/wait dispositions |
| Completion | Output extraction declarations and final success checks |
| Provenance | Discovery run ID, recorded origin, relevant model/source metadata, authored configuration versions |

Do not embed executable code, arbitrary expressions, model prompts, browser storage, authorization grants, or secrets. Refer to trusted runtime policy by identity/version; the artifact cannot weaken it. A host-selected profile must not be loaded from an arbitrary path supplied by the artifact.

The condition vocabulary should be finite: target visible, field/text equals a literal or typed input expression, recognized screen condition, and small conjunctions. Use a linear procedure with explicit exception handling; a general graph interpreter is unnecessary.

Illustrative step shape, to be aligned with the implemented runtime schema:

```json
{
  "id": "enter-transfer-amount",
  "action": "fill",
  "targetRef": "transfer.amount",
  "value": { "kind": "input", "name": "amountCents", "transform": "usd-decimal" },
  "preconditions": [
    { "kind": "visible", "targetRef": "transfer.amount" }
  ],
  "postconditions": [
    {
      "kind": "value-equals",
      "targetRef": "transfer.amount",
      "expected": { "kind": "input", "name": "amountCents", "transform": "usd-decimal" }
    }
  ]
}
```

Keep IDs and descriptions free of invocation values. The artifact hash identifies the exact bytes replayed; it is evidence linkage, not a security signature or proof that a live model call occurred. Replay must not mutate the artifact or silently promote human actions into it. A modified capability gets a new version/provenance relationship and fresh validation.

## 6. Targeting and deterministic replay

### Target resolution

Implement two real strategies: frame-scoped role/name targeting and a constrained table-row/nearby-visible-label strategy for the nonsemantic control. Generic structural CSS inside the latter is acceptable; arbitrary model-authored CSS/XPath or position-based targeting is not required. Prefer one well-validated binding over several weak fallbacks. Playwright's locator and actionability documentation informs this implementation choice [P1, P2].

Require a unique frame, unique scoped target, expected control kind, and relevant enabled/editable/visible state. A zero match may wait within the declared deadline. Multiple matches are `TARGET_AMBIGUOUS`; never resolve them using `.first()`, `.nth()`, force-clicking, or coordinates simply to proceed.

Resolve input-driven text as literal text, not executable selector fragments. If fallback strategies are added, use declared deterministic rules; conflicting targets fail rather than race. Revalidate on each action. A changed profile, stale candidate, or unsupported binding must degrade deliberately.

### Replay execution

Load and validate the saved artifact and invocation; check compatibility and safety configuration; create a fresh context; enter the permitted application; execute recorded steps using the shared executor; classify observed exceptions; verify completion; return extracted outputs.

Keep model SDK initialization and discovery imports out of the replay entry point and its dependency graph. Do not load a provider `.env` file as a replay side effect. Keyless replay must be a real execution against the sandbox, not playback of saved outputs.

The deterministic contract is a fixed procedure and fixed branch rules over observed state. The environment can return different balances or errors; determinism does not promise identical business outputs after the application state changes.

### Waiting, effects, and recovery

Implement condition-based waits with explicit deadlines. Waiting again is not permission to click again. A click that returned a timeout might already have caused a transition. Reconcile its postcondition first; never blindly repeat it. Version 1 needs no general action-retry engine. Retrying observation during a delayed load is sufficient to demonstrate bounded recovery.

Reconcile only declared, recognizable conditions. If success and an incompatible error condition are both visible, return `STATE_AMBIGUOUS`. Do not declare success merely because an error detector also matched a permissive fallback. Exception recognition must use the UI and the correct frame/screen scope, not test scenario flags or the server's HTTP result as a substitute for visible state.

| Observed condition | Required handling |
|---|---|
| Explicit member-not-found result | `business_outcome: MEMBER_NOT_FOUND` |
| Explicit insufficient-funds rejection | `business_outcome: INSUFFICIENT_FUNDS` |
| Other supported application validation rejection | `business_outcome: VALIDATION_REJECTED` |
| Slow but subsequently valid load | Bounded wait; log recovery; continue after checks pass |
| Load deadline exhausted / explicit app error | `LOAD_TIMEOUT` / `APP_ERROR`, safe diagnostics |
| Permission denial | `PERMISSION_DENIED`; stop, do not seek bypasses |
| Expired session | Intervention in the same browser session |
| Unexpected confirmation / unknown modal | Never accept automatically; intervene or fail safely |
| Ambiguous/missing target | `TARGET_AMBIGUOUS` / `TARGET_NOT_FOUND` after applicable wait |
| Wrong review values / invalid extraction | `CHECKPOINT_MISMATCH` / `OUTPUT_INVALID` |
| Disallowed control, route, or origin | `POLICY_DENIED` before the prohibited operation |

An unrecognized error is a failure, not an invented business outcome. Recoverable events are visible in the log even when the final result is success.

## 7. Human takeover, quiescence, and resumption

The employer requires real control transfer of the same live session, while permitting a minimal operator surface (assignment §3.6, p. 5). Use headed Chromium plus terminal commands; no dashboard is necessary.

Implement explicit ownership states:

```text
AUTOMATION → PAUSING → HUMAN → RESUMING → AUTOMATION
                                      ↘ HUMAN (validation did not pass)
Any live state → terminal abort/failure through controlled shutdown
```

On intervention, record the run/capability ID, step ID, reason, sanitized observed state, expected recovery state, and evidence reference. Expose the existing window. The controller, outside the page, owns authority.

**Transfer invariant:** grant `HUMAN` only after no automated mutating action remains in flight and no queued/stale action can execute. Stop scheduling actions, invalidate the ownership generation/epoch, and await the actual outstanding browser operation's settlement. Use explicit underlying action timeouts. A `Promise.race` timeout alone does not cancel the losing operation and does not establish quiescence.

Discard late model responses and invalidate stale action/target plans after ownership changes. If an operation cannot be settled safely within the transfer deadline, report `HANDOFF_NOT_QUIESCENT`; do not falsely report successful takeover. Passive application activity is not generally cancellable: the demo's reversible steps and resume checks bound this risk.

While `HUMAN`, the operator may interact normally with the same context/page. Capture navigation, control activation, and field-change metadata, including inside the content frame. Record field identity and the fact of change, not keypress contents, passwords, previous/new values, clipboard contents, or arbitrary element text. Context initialization scripts and bindings are possible mechanisms [P3]; injected instrumentation is not the authority source.

Provide `status`, `takeover`, `resume`, and `abort` controls. Duplicate or out-of-order commands must fail clearly without transferring ownership accidentally. Operator waiting has a separate bounded timeout from active automation time.

On `resume`, freeze manual activity through the cooperative operator protocol and re-observe. Validate the current member context, relevant form values, policy, and a declared before-step or after-step resume anchor. Continue only when exactly one safe continuation is established. Resume at the next step when the postcondition demonstrably completed; re-execute a step only where the declared state and its reversible/idempotent semantics justify that. Never automatically replay an uncertain action. Otherwise remain `HUMAN` with `RESUME_STATE_MISMATCH` or terminate explicitly.

This is a cooperative local operator model. It guarantees no scheduled automation acts during human ownership; it does not prevent a person from touching an open browser before requesting takeover, nor provide an OS-level input lock.

Automated tests may supply a `test_operator` to exercise the mechanism on the same page. That is not evidence of a person operating the browser. Label actors truthfully as `automation`, `system`, `test_operator`, or `human`. Our final release check includes a genuine manual run by the candidate; this is a chosen demonstration standard, not a claim that the PDF requires a particular video format.

## 8. Safety and data handling

### Enforcement

Apply a host-controlled allowlist for exact origins, routes/methods, primitive action types, and recognized control effects. Classify effects using trusted application configuration plus the resolved target, not a model/artifact field saying `safe`. Unknown effects are denied. Developer-authored semantic controls and route constraints are allowed; they must not encode the workflow sequence.

Permit read/navigation and reversible form preparation. Always deny final commit. Ordinary human resumption cannot authorize it. Policy remains active across handoff. Add context-level request restrictions for the supported sandbox routes so a miswired UI cannot commit a transfer merely because its label appeared safe. Test both semantic-control denial and an attempted navigation/request toward a forbidden route.

Block service workers in this controlled browser setup because Playwright documents a request-interception limitation for service-worker-handled requests [P3]. Keep the sandbox free of WebSockets, external integrations, downloads, and extra windows. Reject unsupported navigation/popups rather than expanding scope. Document that browser routing and a curated application policy are defense in depth, not an OS sandbox or a universal guarantee about arbitrary web applications.

### Persistence

Use one safe event serializer. Validate and redact before writing, not after creating a raw file. Do not persist model transcripts, credentials, auth headers, cookies, browser storage state, raw DOM/HTML, unrestricted error stacks, network bodies, or unfiltered human input. Do not enable raw Playwright traces or automatic screenshots/videos by default. Configure test reporters and sandbox access logs to avoid these leaks too.

For the mandatory richer failure signal, implement a **restricted DOM-derived snapshot**: frame hierarchy, safe route templates, element/control structure, approved static labels, visibility/enabled state, target match counts, and redaction markers. Exclude input values and unknown text. Unknown screens receive more redaction, not a full page dump. This is intentionally less visually rich than a screenshot but satisfies the chosen observability mechanism without pretending arbitrary screenshots can be made safe by a few regexes.

A synthetic-only screen recording or masked screenshot is optional. Review it separately before publication. A text grep cannot validate screenshot masking.

Never serialize arbitrary model explanations verbatim. Save a sanitized one-sentence action justification or a constrained reason code. Keep full business inputs/outputs in memory for execution/caller responses; persist only approved summaries and fixture references. Do not hash low-entropy sensitive values as a substitute for redaction.

Test secret/PII sentinels in fields, visible text, URLs, error messages, and human input. They must not appear in emitted artifacts, logs, snapshots, reports, or test-runner output. Do not introduce authentic sensitive data to prove this. State limitations honestly: this is a synthetic demonstration, not a production compliance claim, and provider-side retention is a separate concern from local logging.

## 9. Acceptance tests and evidence gates

Use focused unit tests for schemas, formatting, conditions, policy, and ownership transitions, plus browser integration tests for the actual system. CI's offline suite must not need credentials or paid services. Do not set test retries to make the acceptance suite appear green; diagnose intermittent failures and preserve failed-run evidence.

| ID | Acceptance test | Required observation |
|---|---|---|
| A01 | Live discovery | Genuine model requests drive the running UI to independently verified review; successful artifact emitted |
| A02 | Changed-input replay | Same artifact, fresh context, member B/new accounts/new amount; UI-derived outputs match |
| A03 | No-model replay | Keys absent; replay dependency boundary checked; any injected model-call bomb remains unused |
| A04 | Contract rejection | Bad input, unsupported artifact version/binding, unresolved ref rejected before UI actions |
| A05 | Legacy targeting | Real iframe and nonsemantic field exercised, not bypassed by added test IDs |
| A06 | Business outcomes | Not-found, insufficient funds, and supported validation rejection return typed outcomes |
| A07 | Transient/repeated slowness | Within-budget delay recovers; exhausted delay fails; action counters show no duplicate click |
| A08 | Permission/app errors | Distinct deliberate failures; no retries seeking another route |
| A09 | Ambiguity | Duplicate matching control or frame prevents action; no first-match workaround |
| A10 | Wrong review state | Tampered displayed member/account/amount and malformed extracted fee cannot pass checkpoint |
| A11 | Commit safety | Forbidden proposal and misdirected navigation are blocked; independent test oracle shows zero commits |
| A12 | Unexpected confirmation | System does not blindly accept an unknown modal or silently report success |
| A13 | Same-session handoff | Expiry triggers intervention; context/page identity preserved; manual/test-operator steps recorded |
| A14 | Ownership race | Takeover during pending action/model response yields no late automated mutation in `HUMAN` |
| A15 | Resume correctness | Restored expected state resumes; wrong member/values/ambiguous anchor remains paused or fails |
| A16 | Sensitive-data handling | Sentinels absent from artifacts, evidence, snapshots, and automatic diagnostic output |
| A17 | Artifact integrity | Recording contains executed symbolic steps; no discovery-value binding; replay leaves bytes unchanged |
| A18 | Honest provenance | Mock discovery, test-operator handoff, and live discovery cannot be confused in manifests |
| A19 | Failure evidence | At least one real failure emits valid structured diagnostics and a restricted UI snapshot |
| A20 | Reviewer reproduction | Documented install/offline/demo commands succeed in a clean checkout or documented clean-copy equivalent |

A01 cannot pass using a scripted model fixture. A fixture-generated capability can support development tests but must be clearly marked and must not become the submission's purported live artifact. Once live discovery works, run the keyless replay and core browser cases with the actually discovered artifact. Mutation/negative tests may derive clearly labeled copies.

The assignment's mandatory evidence is an example artifact plus discovery/replay logs, with a genuine live discovery run (assignment §4, p. 6; §6, p. 8). Our selected evidence set also includes a business outcome, bounded recovery, a hard/policy failure, and handoff/resumption.

Each run uses a fresh directory and records run ID, mode, actor kind, timestamps, source revision and dirty status, artifact hash, application/profile/policy versions, browser/runtime versions, executed-step results, and model request/usage metadata when available. Do not invent unavailable provider request IDs or claim metadata proves more than it does. Preserve failed attempts; do not overwrite evidence until only successes remain.

Use sanitized JSONL events and a sanitized terminal-result summary. Events should explain action choice, target strategy, checks, exception classification, ownership changes, and recovery. Flush before normal exit. If mandatory evidence cannot be written, stop further actions and report the persistence failure; do not silently continue an unobservable run.

## 10. Reviewer-facing files and command contract

Proposed layout; combine small modules where simpler:

```text
README.md
REPORT.md
AGENTS.md
BUILD_SPEC.md
CODEX_BUILD_BRIEF.md
IMPLEMENTATION_STATUS.md
package.json
package-lock.json
.env.example
src/{domain,discovery,recording,replay,surface,policy,session,evidence,cli}/
sandbox/
config/
examples/
artifacts/
tests/{unit,integration}/
evidence/README.md
evidence/<run-id>/{manifest.json,events.jsonl,result.safe.json,...}
docs/DEFENSE_NOTES.md
```

Private working runs belong in ignored storage; copy only reviewed, sanitized evidence into `evidence/`. Do not commit the employer's PDF by default; refer to its title/sections or keep a local ignored reference. Never commit secrets, browser profiles, dependency directories, or raw recordings.

**Implement and verify these commands; their presence here is an interface requirement, not a claim that they already exist.**

```bash
npm ci
npm run browser:install
npm run verify:offline

# Terminal 1: ordinary synthetic app, no model needed.
npm run sandbox

# Terminal 2: requires configured, authorized model API access.
npm run discover -- \
  --goal "Find the supplied member and prepare the supplied transfer. Stop at review; never submit." \
  --target http://127.0.0.1:4173/app \
  --inputs examples/member-a.json \
  --output artifacts/prepare-transfer.json \
  --headed

# Uses the artifact above, different inputs, and no model credentials.
npm run replay -- \
  --artifact artifacts/prepare-transfer.json \
  --inputs examples/member-b.json \
  --headed

# Self-contained launchers for the checked-in live artifact and expiry demo.
# These launchers own their sandbox process; avoid port conflicts.
npm run demo:replay
npm run demo:handoff
npm run verify:live
```

`verify:offline` includes formatting/lint, type checking, focused tests, and browser integration tests. No hidden live API calls. `verify:live` is opt-in and budget-gated, captures genuine discovery evidence, and validates the resulting artifact through keyless replay. Demo launchers may arrange faults in the sandbox; the engine itself must not receive the fixture's expected outcome.

`AGENTS.md` should be short: identify this specification, the execution brief, the checkpoint, the verification commands, and the scope/safety cut lines. Reference the longer documents instead of copying them into the automatically loaded instruction file [C1]. Preserve applicable pre-existing guidance.

`README.md` must provide exact setup, supported runtime, browser installation, configuration, live discovery, keyless replay, handoff instructions, and actual limitations. A public reviewer must not need an API key just to replay the checked-in live artifact.

`REPORT.md` must remain approximately 1–3 pages and use exactly the employer's seven headings:

```text
Architecture
Artifact schema
Determinism & error handling
Heterogeneity & multi-tenant
Escalation & handoff
Safety
Cuts
```

Keep the report focused on actual decisions, evidence, and trade-offs; do not substitute this longer specification for it. The exact paths/headings come from assignment §6, pp. 7–8.

`evidence/README.md` should map acceptance IDs to actual commands/run directories, clearly label simulated versus live activity, and disclose failures. `docs/DEFENSE_NOTES.md` should help the candidate explain the five hardest decisions, known limitations, and one small code change they can demonstrate; it must not invent implementation facts.

## 11. Heterogeneity and tenant reuse: design only

Describe three layers: reusable capability logic; versioned vendor/surface bindings; and tenant configuration such as entry origin and permitted specialization. Tenant configuration must not introduce arbitrary executable code or broaden host safety permissions.

Explain compatibility checking, test-based qualification of a binding change, and fail-closed behavior for unsupported app versions. A supported version string alone does not prove the screen is correct; runtime preconditions still matter. Do not claim one sandbox demonstrates actual cross-tenant reliability.

A future desktop adapter would supply accessibility/visual control bindings, input, observation, and evidence while preserving the high-level action/condition/result contract. Pixel-based targeting would require a different robustness/verification story. Keep those requirements in the design rather than shipping a nonfunctional adapter. The assignment explicitly makes desktop/multi-tenant implementation optional (§3.7, pp. 5–6).

## 12. Build order and external gates

| Milestone | Implement | Exit evidence |
|---|---|---|
| M0 — preflight | Inspect workspace, pin tools, narrow schemas, runnable minimal sandbox, model access check | Sandbox manually usable; API availability/authorization truthfully known |
| M1 — first real slice | Primitive shared executor, real model loop, recording, replay, final extraction | Live model action early; then A01–A03 when access permits |
| M2 — complete every core seam | Outcomes, policy, safe logging, minimal same-session handoff | Thin working discovery → replay → intervention path; no core requirement only a TODO |
| M3 — harden | Full acceptance matrix, race/resume tests, failure snapshots, redaction | Offline matrix passes; real-artifact cases pass where live evidence is available |
| M4 — reproduce and explain | Clean-copy run, evidence index, concise report, defense notes | Reviewer commands verified; exact remaining gates reported |

Do not wait until M4 to attempt live discovery. Equally, missing API access must not halt all implementation: complete the offline system with explicitly labeled fixtures, then leave A01/live evidence visibly incomplete.

**API gate:** choose one provider from usable, explicitly authorized configuration. If none is configured, select one conventional provider adapter, document the choice, and implement it without making paid calls. Require an explicit model identifier, credentials, approval, and a bounded call/token or spend budget before live execution. Do not infer API access or permission to spend from a chat subscription or from the mere presence of unrelated credentials. Do not print secrets or create accounts, keys, billing changes, or paid services without approval.

Count failed calls against the execution budget. Use a hard call/token bound even when reporting estimated dollar cost. Do not describe an estimated cost limiter as a guaranteed provider billing cap. Stop paid work when the approved budget is exhausted, but continue offline work. Preserve the budget accounting across automatic retries within the work session.

**Manual gate:** implement and test handoff automatically, then provide one exact manual command for the candidate's real takeover demonstration. Do not wait idly for that person during autonomous development or label automated operator actions as human evidence.

**Publication gate:** implementation authority is local. Do not create a public repository, push, deploy, or email the employer without separate explicit authorization. The assignment's eventual submission is a public repo URL emailed from the application address; it is not a zip submission (assignment §11, p. 10).

## 13. Completion and cut line

Track these flags separately: `offline_core_passed`, `live_discovery_passed`, `live_artifact_replay_passed`, `handoff_mechanism_passed`, `manual_handoff_checked`, and `clean_reproduction_passed`. Include proof references and honest false/pending values.

The implementation session is complete when all locally actionable work is done and remaining external gates are documented with exact commands. It is not automatically submission-ready. Our submission-ready gate requires all core requirements, genuine discovery evidence, keyless replay of that artifact, the selected negative cases, manual handoff verification, safe public evidence, concise documentation, and candidate review.

Only after those gates pass, optionally run a fixed-seed multi-run stability sweep using the same artifact over declared input/timing cases. Report every attempt, aggregate failures, and classify any retries. This is the one preapproved stretch; do not add another feature instead of finishing the core. Cross-tenant variants, code generation, capability catalogs, and LLM fallback remain out of scope.

## Source and technical reference notes

**Assignment basis:** supplied *Take-Home Project: Computer-Use Automation System*, especially §§3.1–3.7 (pp. 3–6), genuine discovery requirement (p. 6), complete-slice expectation (p. 7), deliverables (pp. 7–8), evaluation/cut lines (pp. 8–9), and submission (p. 10). This document paraphrases those requirements and labels our additional decisions. It does not represent employer approval of this design.

**Technical checks, consulted 2026-09-08:**

- [P1] Playwright, **Locators**: role/text/frame scoping and strict resolution. `https://playwright.dev/docs/locators`
- [P2] Playwright, **Auto-waiting**: actionability checks and bounded action behavior. `https://playwright.dev/docs/actionability`
- [P3] Playwright, **BrowserContext**: initialization scripts/bindings and request routing, including the service-worker caveat. `https://playwright.dev/docs/api/class-browsercontext`
- [C1] OpenAI, **Codex best practices**: concise repository guidance with references to task-specific documents. `https://developers.openai.com/codex/learn/best-practices`

Verify APIs against the installed, pinned dependency version while implementing. These references inform the chosen mechanism; they do not add requirements to the employer's brief.
