# Architecture

One Node process owns a Chromium context, session controller, trusted executor and evidence writer. A separate loopback HTTP server implements the fictional bank. Discovery receives bounded visible observations and fresh candidate IDs, asks the OpenAI adapter for a primitive decision, and delegates execution. Recording persists only completed, verified steps with typed input references. Replay interprets the JSON artifact through the same executor without importing discovery or the provider. A subprocess import bomb and source dependency test enforce this boundary.

The browser seam owns observation, strict target resolution, primitive actions and UI extraction. Domain schemas own contracts. Host policy owns permission; neither the model nor the artifact grants it. Sandbox fixtures and the server-state oracle belong to tests and launchers. The runner never reads them. Node's HTTP server, Zod, Playwright and JSON/JSONL are sufficient; an agent framework would add indirection without solving another requirement.

The checked-in demonstration uses a clearly labeled scripted model fixture against a real UI. The real provider loop and budget gate are implemented and wire-tested locally, but genuine paid discovery remains unavailable without explicit authorization/configuration. Fixture evidence does not satisfy that requirement.

# Artifact schema

Schema version and capability version are separate. A strict artifact contains profile/policy compatibility, a deliberately finite input/output contract subset, frame-scoped bindings, ordered step IDs, typed actions, pre/postconditions, authored exception dispositions, output extraction/check declarations and provenance. Unknown fields/discriminators, invalid transforms and unresolved references fail before browser creation. Saved bytes are hashed for linkage, not authentication.

Bindings support exact role/name and a constrained visible table-label strategy. The amount control has no semantic label or automation ID. Invocation-dependent values are symbolic while executing; there is no transcript search-and-replace. Parameter references are restricted to identifiers and the integer-cent USD transform. Named screen transitions, member checkpoints, exception rules and completion checks are developer-authored application knowledge, not claimed discoveries. They do not give the model an ordered journey. The recorder preserves the chosen sequence and never stores browser handles, candidate IDs, raw explanations or code.

# Determinism & error handling

Replay fixes both the procedure and branch rules. It resolves each current target uniquely, verifies visible/enabled/type state, authorizes the actual control effect, dispatches once, and verifies declared conditions. A pinned ephemeral element avoids silently retargeting a replacement node; route interception independently blocks forbidden effects. Navigation-context replacement can retry observation within a deadline. Waiting never authorizes another click. Uncertain effects reconcile only declared postconditions.

Not-found, insufficient funds and supported validation rejection return business outcomes. Permission denial, explicit app errors, exhausted load deadlines, ambiguity, wrong review values and policy denial are distinct failures. Native or DOM confirmations are never accepted automatically. Multiple incompatible screen conditions fail closed. Completion extracts unique visible table values, validates cents/fee/currency/status, and independently compares member, both account references and amount with the invocation. A heading alone cannot pass.

Defaults bound discovery to 30 actions, 32 model decisions, 120 seconds of active time, 5 seconds/action and 10 seconds/condition wait. Provider requests have at most 30 seconds and durable call/token reservations; failed calls count and automatic SDK retries are disabled. Reserved tokens are a conservative allowance, distinct from actual returned usage and from billing.

# Heterogeneity & multi-tenant

Three conceptual layers separate capability logic, versioned vendor/surface bindings and tenant configuration such as the exact entry origin. Only this synthetic profile is implemented. An unsupported profile version fails before execution, while runtime conditions continue to check supported versions. Binding changes require fresh browser qualification and provenance; tenant overrides cannot install code or broaden host permissions.

A future desktop surface would replace DOM bindings/observation/actions with accessibility or visual equivalents while preserving action/result semantics. Coordinates need a different targeting and verification argument. One iframe/table sandbox demonstrates a legacy-web mechanism, not actual cross-tenant or desktop reliability. Those implementations are intentionally absent.

# Escalation & handoff

Ownership follows AUTOMATION → PAUSING → HUMAN → RESUMING. Takeover invalidates the epoch, stops scheduling, and waits for the underlying operation's actual settlement before granting HUMAN. A settlement deadline failure cannot claim takeover. Late model responses and queued plans are discarded. Ownership is rechecked after asynchronous preparation and final verification, so successful completion cannot close a human-owned browser.

An expired session can be restored in the same page/context via a fake credential. The terminal exposes status, takeover, resume and abort. Resume reobserves member/form state against declared anchors; overlapping click anchors or mismatched state remain paused. An already-satisfied idempotent fill/select may advance. Manual task actions are not silently promoted to learned steps. Operator telemetry records navigation, activation and field-change metadata without contents. Ten minutes of intervention time is separate from active discovery time. This cooperative protocol does not prevent a person touching the browser before requesting ownership. Automated operator tests pass; genuine candidate-operated evidence is still required.

# Safety

The exact loopback origin, routes/methods and known control effects form the host allowlist. Reads and reversible preparation are permitted; final commit is always denied, including after human resumption. Semantic checks catch miswired submitters and context routing blocks the endpoint itself. Tests inspect only the sandbox's independent commit counter. Service workers are blocked; extra windows and downloads are rejected. These controls are specific to the curated application and are not an OS sandbox.

Runtime-validated allowlists cover artifacts, events, manifests, result summaries and restricted DOM snapshots. Snapshots retain route templates, frame/control structure, static labels and match counts; field values and unknown text are redacted. There are no automatic screenshots, raw traces, browser storage exports or model transcripts. Caller stdout is deliberately separate and may contain the requested synthetic outputs. Sentinel tests exercise visible text, fields, URLs, human changes, model errors and persisted artifacts. Mandatory persistence failure stops further actions and closes the runtime. Provider retention is separate; the adapter requests `store: false` without claiming that this defines every provider retention policy.

# Cuts

There is one capability, application, browser adapter and provider. No desktop implementation, tenant infrastructure, remote co-browsing, authentication service, model-assisted replay repair, generic graph language or polished dashboard was built. Successful paths are not automatically shortened. The optional stability sweep is deferred until genuine discovery and manual gates pass.

The remaining submission work is external: authorize a compatible model and finite API budget, capture genuine discovery, qualify that exact artifact through keyless replay and negative cases, then perform the real manual handoff and candidate review. Source, fixtures, tests and safe evidence are useful independently, but they are not a substitute for those gates. Publication and employer email remain separately authorized actions.
