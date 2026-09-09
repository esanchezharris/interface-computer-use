# Fictional banking sandbox

`startSandbox({ port?, fault?, delayMs? })` in `server.ts` binds only to
`127.0.0.1`. The default port `0` selects an unused port for isolated tests.
The returned `origin`, `close()`, mutable `stats`, and `setFault()` are test-harness
controls. The automation engine must never import these controls or fixture data.

The normal browser entry is `/app`. Its iframe has both title and name
`Workspace`. All operations use visible forms and links; the server has no setup,
fixture, database, or introspection HTTP endpoints.

| Member | Source | Destination | Checking balance | Savings balance |
| --- | --- | --- | --- | --- |
| M-104 | CHK-104 | SAV-104 | 1850.00 USD | 4500.00 USD |
| M-207 | CHK-207 | SAV-207 | 2750.00 USD | 6250.00 USD |

Identifiers use `M-` plus three digits, or `CHK-`/`SAV-` plus three digits.
Amounts use an unsigned decimal with exactly two fraction digits. Validation
rejects repeated fields, unknown fields, equal accounts, zero amounts, and
accounts outside the current member. Only fictional USD values are supported.

Session expiry occurs once on entering `/transfer`. In the same frame, enter
the fake password **demo-only** and press **Restore session**. A successful
reauthentication redirects to the intended member's transfer page. This is
synthetic session behavior, not identity-provider integration.

Faults are listed in `data.ts`. `slow` returns a visible Loading screen after
one POST `/review`; automatic GET `/review` refreshes wait for `delayMs` (default
500). `reviewRequests` therefore measures submissions without counting
observation refreshes. `searchRequests` counts GET `/member`. `commits` counts
POST `/commit`, a deliberately present simulated final effect which automation
policy must always prevent. There are no external services or real transfers.

The modal fixture uses a native confirmation dialog. The ambiguous fixture
duplicates Search; duplicate-frame duplicates Workspace. Misdirected rewires
the Review transfer form to `/commit`. Conflicting displays both Transfer
review and Application error. Review-value fixtures change displayed data,
letting a separate UI verifier detect a mismatch.

The sandbox emits no access logs, raw errors, credentials, or network bodies.
Forms are bounded to 4096 bytes and HTML values are escaped. The fixture's
in-memory session state is discarded when its owned server closes.
