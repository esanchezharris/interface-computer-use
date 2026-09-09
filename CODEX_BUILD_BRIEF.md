# Autonomous Codex execution brief

Use this in the dedicated `interface-computer-use` workspace with `BUILD_SPEC.md` available. The supplied assignment PDF may be kept as a local ignored reference. This brief authorizes work by the coding agent in that workspace; it is not a statement that any implementation has already been performed.

---

You are the implementation engineer for my interface.ai Computer-Use Automation System take-home. Build the system defined in `BUILD_SPEC.md` and leave a working, tested, evidence-backed repository that I can inspect and defend.

This is an execution task, not a request for another plan. Inspect the workspace, establish a short working plan, and start implementing in this session. Continue through implementation, testing, repair, documentation, and reproduction without waiting for my approval after routine milestones.

## 1. Read first and preserve scope

Read `BUILD_SPEC.md` completely. Read the original assignment if available, then existing `AGENTS.md`, project documentation, repository status, and any implementation checkpoint. The employer brief governs required deliverables; the build specification governs our design choices; this brief governs how you work.

The frozen scope is a TypeScript/Node/Playwright implementation with one local synthetic banking UI, one real LLM-discovered prepare-transfer-to-review capability, a typed artifact, strictly model-free replay, explicit outcomes, enforceable policy, safe evidence, and same-live-session human handoff. No transfer is ever submitted.

Do not implement a prewritten task script and call it discovery. Do not build a generic platform, remote operator dashboard, desktop adapter, multi-tenant infrastructure, or model-assisted replay fallback. Use the specification's acceptance matrix as the definition of implementation completeness.

## 2. Authority and decisions

You may create and edit project files, install ordinary project dependencies, run local browsers and sandbox services, execute tests, inspect official technical documentation, refactor within scope, and make focused local commits. Work only in this dedicated workspace. Preserve unrelated/pre-existing changes; inspect before modifying. Do not reset, stash, delete, or overwrite user work to obtain a clean tree.

Check `pwd`, git status, available runtime/package manager/browser tools, and relevant configuration before acting. Initialize an empty workspace as needed. Use a descriptive local branch where appropriate; do not disrupt an existing branch containing my work. Stage only intended files and inspect for secrets before commits. Never kill a process you did not start simply because it occupies your preferred port.

Resolve ordinary engineering details yourself: dependency versions, small module boundaries, supported schema subset, test tooling, and the single provider adapter. Record material trade-offs briefly. Do not ask me to choose between equivalent technical options.

Do not publish, push, deploy, create paid resources, change billing, or email the employer. Do not access real banking systems or real customer data. Do not obtain or reveal credentials from unrelated files, browser sessions, or keychains.

Paid model calls require explicitly authorized provider/model configuration and a finite budget. Mere credential presence is not approval. Reuse only authorized project credentials, never print them, and account for failed calls. Do not manufacture a dollar-cost guarantee from an estimate. Missing credentials or approval block live calls, not the remainder of the build.

## 3. Begin with observable progress

In the first work block, inspect the repository, create or update a concise `IMPLEMENTATION_STATUS.md`, establish a runnable minimal sandbox and schemas, and verify whether live API use is available and authorized. Pin actual compatible versions and write an honest `.env.example`. Create or carefully update a short `AGENTS.md` pointing to the specification, this brief, the checkpoint, and real verification commands; do not paste the entire specification into it.

Get a real model action against the live UI working early when authorized, then extend it into complete discovery → artifact → replay. Do not postpone all live integration until the end. Do not spend the opening session on an elaborate folder hierarchy, infrastructure, styling, or dozens of isolated abstractions.

If live access is unavailable, implement a clearly marked model fixture for development tests and keep moving. Record that A01 and genuine evidence remain blocked. A fixture is never a replacement for the required live discovery submission.

Implement a thin instance of every core requirement before polishing any individual part. A working UI macro without error handling or handoff is not a complete vertical slice.

## 4. Execute the milestones without approval pauses

Follow M0–M4 from `BUILD_SPEC.md`. At each meaningful milestone: implement, run the smallest relevant checks, inspect the actual UI/evidence, repair defects, run the broader suite, update the checkpoint, and continue.

Do not end your response after creating a plan, scaffolding the repository, completing the first milestone, or saying the next step is to run tests. Run them. Do not send me ordinary compiler errors, selector failures, missing imports, or test failures as permission questions. Investigate and fix them within the current scope.

Keep experiments bounded. After repeated attempts with the same failure signature, change the diagnosis or simplify the implementation; do not burn the API budget repeating identical calls. Do not weaken an assertion or delete a negative case just to make the build green. A test may change when its expectation is genuinely wrong; record the reason and preserve the underlying requirement.

Do not widen scope as a reward for passing a milestone. The only preapproved stretch, after core and evidence gates are satisfied, is the specified fixed-seed replay stability sweep. Skip it when core work still needs attention.

## 5. Non-negotiable implementation invariants

**Discovery authenticity.** The LLM decides the next primitive UI action from a current observation. A model call wrapping an otherwise hardcoded workflow does not qualify. The recorder serializes executed steps and symbolic parameter references, with disclosed developer-authored safety and exception configuration. Final success is independently checked.

**UI-only execution.** Discovery/replay cannot read fixture state, import the sandbox database, call hidden application endpoints directly, or inspect application stores. Test code may seed faults and inspect the resulting server state as an independent oracle. The core engine must not receive a scenario name that tells it which outcome to return.

**Replay independence.** Separate the replay entry point and dependency graph from discovery/model initialization. Replay the saved live artifact in a fresh context with different inputs and no model key. Assert model-call count zero and test the architecture, not merely a printed claim. Never rewrite the artifact or return cached discovery results during replay.

**Target integrity.** Use unique frame-scoped targets and a real relative/table strategy for the deliberately nonsemantic control. No test IDs, first-match shortcuts, force clicks, coordinates, or arbitrary model-authored code to rescue an ambiguous step. A wrong review value must fail even when the expected heading is visible.

**Bounded effects.** Condition waits may retry observations. An uncertain click may already have executed; never blindly repeat it. Keep explicit active-run, action, model, and intervention budgets. Distinguish expected business outcomes, recoverable conditions, and hard failures.

**Policy authority.** The model and artifact do not decide their own permissions. Host policy checks resolved controls/routes before execution. Commit remains forbidden across discovery, replay, and human resumption. Prove zero commits with the independent sandbox oracle, including a deliberately forbidden proposal/misdirected route.

**Real ownership.** Pause scheduling, invalidate stale work, and settle the underlying in-flight action before granting human ownership. A `Promise.race` timeout is not cancellation. Drop late model responses after takeover. Preserve the same context/page. Revalidate a declared safe continuation on resume; never just increment the step index.

**Honest human evidence.** Use `test_operator` for automated handoff tests. Do not label them as a real human session. Provide the exact headed-browser command and steps for my final manual check. Implement everything else without waiting for me to perform that check.

**Safe persistence.** All automatic evidence goes through the redactor/allowlisted serializer. No raw model transcripts, password values, browser state, unfiltered errors, arbitrary snapshots, or automatically saved traces. Implement the restricted DOM-derived failure signal. Test synthetic sensitive sentinels across artifact/log/snapshot/test-output paths. Never fabricate evidence.

## 6. Review and repair discipline

Use one main implementation thread. Parallelize only genuinely independent work with disjoint file ownership. Do not have multiple agents simultaneously rewriting the central schema/executor/session controller. Subagents are optional; their absence is not a blocker.

After the complete thin slice works, perform a focused adversarial review of the artifact contract, UI-only boundary, error handling, policy, and ownership/resume behavior. Reproduce findings with tests and repair them. Run one final review after packaging. Do not create a recurring multi-agent approval ceremony around every small change.

The review must try to falsify these claims: the model really selected actions; replay has no model path; changed inputs affect UI-derived outputs; an ambiguous control cannot trigger the wrong action; a timed-out operation cannot fire after human takeover; a wrong restored member cannot resume; commit is blocked; and no sensitive sentinel reaches persisted evidence.

Inspect actual diffs and outputs. A helper's summary, a zero exit code, or a large count of passing unit tests is not proof of the whole system. Keep separate statuses for offline core, live discovery, live-artifact replay, handoff mechanism, manual handoff, and clean reproduction.

## 7. Documentation and evidence are implementation work

Implement and verify the command contract in `BUILD_SPEC.md`, including `verify:offline`, `discover`, `replay`, `demo:replay`, `demo:handoff`, and opt-in `verify:live`. Commands in documentation must match reality. Keep offline verification independent of paid services.

Produce `/README.md`, `/REPORT.md`, and `/evidence/`. The report uses exactly these headings: Architecture; Artifact schema; Determinism & error handling; Heterogeneity & multi-tenant; Escalation & handoff; Safety; Cuts. Keep it approximately 1–3 pages and grounded in actual implementation, not future claims.

Capture live discovery when authorized and available. Replay that actual artifact with changed inputs and no key. Preserve failed attempts and clearly distinguish real discovery, development fixtures, automatic operator tests, and manual evidence. Record real source revision/dirty state and artifact hashes. Do not invent request IDs, results, timestamps, commands run, or stability statistics.

Prepare a short evidence index mapping acceptance IDs to tests/run directories. Write concise `docs/DEFENSE_NOTES.md` explaining the main code boundaries, hardest decisions, limitations, and one small change I can practice. Do not present me as understanding or having personally run code I have not reviewed.

Rehearse the reviewer path in a clean checkout/copy that excludes dependencies, caches, private state, and working run artifacts. Install from the lockfile and execute the documented offline/keyless commands. Describe the exact environment actually tested; do not claim untested platform support.

## 8. Checkpoint and interruption protocol

Update `IMPLEMENTATION_STATUS.md` after milestones and before a context/tool/time limit, not after every small command. Keep it compact and actionable. Include current revision and dirty state, files changed, completed acceptance IDs with proof, exact failing command/signature, live/API budget status without secrets, pending external gates, processes you started, and the single next implementation action.

When continuing an interrupted session, read this checkpoint, inspect the current repository, and resume from the next unmet acceptance criterion. Do not restart architectural planning or replace working code merely because context changed.

Do not promise unattended execution beyond the actual session or available tools. When the environment imposes a stop, leave a truthful checkpoint and runnable next command. Preserve safe evidence and shut down only processes you own when appropriate.

## 9. Legitimate blockers versus reasons to continue

Pause only the affected work for unavailable/unapproved API access, an exhausted paid-call budget, an unavailable display required for a manual run, external network/tool permission denial, an unavoidable destructive conflict, or a decision that materially changes the agreed goal/safety boundary. Continue independent work immediately.

Ask a question only when an unresolved user decision actually prevents safe progress and cannot be handled by the specification's default. Bundle remaining external requirements into the final handoff instead of interrupting me repeatedly. Never claim `SUBMISSION_READY` while genuine discovery evidence or another release gate is missing.

Normal uncertainty, a failed test, missing scaffolding, or an engineering choice between equivalent libraries is not a blocker. Diagnose, choose, implement, test, and continue.

## 10. Final handoff

Conclude after the local implementation/verification work is complete, or a genuine environment limit prevents further useful work. Report:

1. What exists and the actual branch/revision/working-tree state.
2. The exact setup, keyless demo, live discovery, and manual handoff commands.
3. An acceptance summary separating passed, failed, blocked, and untested items, with evidence paths.
4. Whether genuine live discovery occurred and whether the resulting artifact replayed with changed inputs and zero model calls.
5. Which handoff evidence is automated versus genuinely manual.
6. Remaining limitations and the smallest owner action needed for each external gate.

Use `IMPLEMENTATION_COMPLETE_WITH_EXTERNAL_GATES_PENDING` when all available local work is done but external checks remain. Use `READY_FOR_OWNER_REVIEW` when implementation/evidence gates pass. Neither label authorizes publication or email submission.

Start now: inspect the workspace, read the specification, write the short checkpoint, and implement the first executable slice. Continue until the agreed work is done or a genuine stop condition is reached.
