# QA observations

Agent UI inspection on 2026-09-08 used the Codex in-app browser against an owned ephemeral loopback sandbox. Search, member detail, account table and transfer form were operated through visible controls. The rendered review showed the supplied fictional member, both account references, amount, zero fee, USD and AWAITING_CONFIRMATION with legible controls and no clipped values. The final Submit transfer control was not activated. Temporary tab and sandbox were closed. This was **agent UI inspection**, not a person completing the handoff gate; no screenshot was added to automatic run evidence.

Failures preserved during development include:

- Initial main-document readiness preceded iframe creation: TARGET_NOT_FOUND before first action. Entry navigation now waits for load.
- A click completed before navigation was visible, so a recorder captured the prior screen. Declared transition conditions now gate recording and replay.
- Observation during frame navigation lost its JavaScript context. Only recognized navigation-context errors retry observation within a deadline.
- An automated operator's URL wait already matched the expired page URL. The test now waits for the restored visible heading; the ownership/resume check was not weakened.
- Source dependency validation rejected inline TypeScript `import()` type syntax as potentially dynamic. The source now uses ordinary type imports; the no-dynamic-import assertion remains intact.

The focused adversarial review found and prompted regressions for finalization during HUMAN ownership, discovery expiry recovery, mandatory-evidence cleanup, hidden output rows, button-specific form actions, overlapping click resume anchors, checkpoint verification and manifest linkage. No test was removed or retried to obtain a pass. Current results and historical safe run IDs are indexed in `evidence/README.md`.
