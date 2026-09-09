# Candidate defense notes

Read the code and run the commands yourself before presenting it. These notes do not claim you wrote, understood, or manually validated anything yet.

1. **Discovery versus a macro:** `src/discovery/run.ts` asks a `Model` for each action from the current observation. `src/discovery/openai.ts` implements the real provider. `scripts/fixture-model.ts` is intentionally scripted, labeled development-only and isolated from replay. Compare the newly discovered eight steps with the separate scripted fixture; matching sequence length is not provenance. The live request/action evidence identifies which was actually model-chosen.
2. **Artifact versus a transcript:** `src/domain/artifact.ts`, `actions.ts` and `recording/recorder.ts` show symbolic inputs, strict finite declarations and completed-step recording. `src/policy/profile.ts` contains authored screen/effect knowledge. Explain what was learned versus supplied, and why the artifact hash is not a signature or proof of a model request.
3. **Targeting and correctness:** `src/surface/target.ts`, `executor.ts`, `checks.ts` own strict frame-scoped role/table targeting, pinned elements, bounded checks and independent displayed-output verification. Walk through the nonsemantic amount field. A visible review heading is insufficient.
4. **Handoff races:** `src/session/controller.ts` owns epochs and in-flight promises. `resume.ts` owns continuation checks. Explain why Promise.race alone cannot cancel Playwright, why paused model responses are discarded, and why finalization must check ownership after awaiting verification. Show the timed-out click regression and wrong-member/amount tests.
5. **Safety and observability:** policy owns allowed effects and browser routing enforces routes even for humans. `src/evidence/` parses allowlisted structures before writing. Describe the snapshot's lost richness as an intentional privacy tradeoff. Caller outputs remain a separate channel; durable cost reservations differ from observed token usage and estimated billing.

## Practice path

Run `npm run verify:offline`, `npm run demo:replay -- --require-live`, then `npm run demo:handoff -- --require-live` in a real terminal. Study one failure using the safe snapshot and JSONL, rather than relying on the green count. The assignment PDF is a local ignored reference; the original specification and build brief remain unchanged.

A small practice change: lower `MAX_AMOUNT_CENTS` in `src/domain/contract.ts`, update the bound in the input-contract test, and demonstrate that an over-limit invocation fails before a browser is created. Restore the original value or version the policy deliberately afterward. Do not weaken a negative test or allow the commit route.

## Limitations to state openly

- The replacement live artifact actively selects both account inputs and passes both directions for two members plus a changed-default/order case. The previous six-step artifact relied on defaults and is historical; its 31/31 did not cover reverse-direction behavior. This remains one synthetic account/UI domain. The development fixture remains separate.
- Automated `test_operator` evidence proves mechanism, not personal operation. The candidate must complete the headed manual check.
- Only macOS arm64/Node 24 was tested. One synthetic UI does not establish vendor/tenant portability.
- Host route policy and cooperative ownership are not an OS sandbox or an input lock. Passive application activity can continue during a handoff; resume revalidation contains that risk for this reversible demo.
- Unknown formats, effects, modals and unsupported profiles fail closed. Failed discovery gets evidence but no successful artifact.
