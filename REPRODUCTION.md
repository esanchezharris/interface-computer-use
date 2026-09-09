# Clean reproduction of the repaired account capability

Performed in one fresh local clone on 2026-09-08 (America/Los_Angeles) from final executable revision **`a0efd14e58a712f20d5e02970ee9f8f19c791e05`**, branch `build/computer-use`. Later packaging changes contain documentation and safe evidence only. The implementation itself was recorded at `563d3951363a19679fd8ae13ab6f5c0f4b0740c7`; the final executable revision includes the new qualified artifact.

```bash
git clone --no-local . .reproduction/account-repair-a0efd14
cd .reproduction/account-repair-a0efd14
npm ci
npm run browser:install
npm run verify:offline
CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact
npm run demo:replay -- --require-live
npm run demo:handoff -- --require-live --test-operator
```

All commands exited **0**. The clone was clean before and after every command. Provider/approval environment names containing OPENAI, ANTHROPIC, API_KEY or CUA_ were removed in the reproduction driver; only the explicit artifact path was added back for qualification. No secret, original budget ledger, paid approval file or private run was cloned. Replay made zero model calls and zero commits.

| Gate | Actual result |
|---|---|
| Lockfile install | 10 packages, 0 audit vulnerabilities |
| Browser install | Existing pinned Chromium available from machine cache |
| `verify:offline` | Biome, strict types, build; **84/84**, zero failures/skips/retries; 41.211 s test duration |
| Exact current-artifact `test:artifact` | **37/37**, zero failures/skips/retries; 28.701 s |
| Required-live replay | UI-derived matching output; [a11620ca](evidence/a11620ca-2fb5-472c-ab36-eda5012feb23/manifest.json) |
| Required-live `test_operator` | Same-session restoration and matching output; [c3cb6c43](evidence/c3cb6c43-2141-4e40-bd2c-93d46dc4c0bd/manifest.json) |
| Missing explicit artifact | `CUA_TEST_ARTIFACT=.runs/missing-artifact.json node --test dist/tests/integration/parameterization.test.js` returned expected **1 / ENOENT**, before UI work; no fixture fallback |

Both linked manifests record this exact clean revision, `origin: live-model`, zero model calls and zero reserved tokens. They link to **`4b0ffdc4c4510716f724d12e2ecc359c2b05d5bdfe98f699cf49ef3593c801e5`**, the unchanged new submission/candidate bytes. Caller outputs were checked against M-207, CHK-207 → SAV-207, 3750 cents, zero fee, USD, AWAITING_CONFIRMATION. Safe public results redact those values by design. The same artifact's four-direction and defaults/order cases ran within the 37-test qualification; no paid discovery was repeated.

Environment: macOS arm64, Node 24.16.0, npm 11.13.0, Playwright 1.63.0, Chromium 153.0.8010.12. Other platforms are untested. Actual exit/timing records and private stdout are at `.reproduction/account-repair-a0efd14/.runs/reproduction/commands.json` and sibling logs. Setup did not create a paid resource. [Current repair record](docs/ACCOUNT_REPAIR.md) and [evidence index](evidence/README.md) preserve original failed account runs and distinguish fixture/live/test_operator provenance. Owner-operated handoff was pending at this reproduction and was subsequently performed and personally verified twice at clean package `0369d808df669016564f98d3e2e1bc66e383f13d`; see [owner acceptance](evidence/owner-handoff.json). Personal code review remains pending.

## Historical reproductions below

The earlier six-step artifact and 31/31 qualification below are historical and do not cover reverse-direction account parameterization. The new 84/84 and 37/37 above supersede them for current acceptance.

---

# Clean reproduction of the live-qualified implementation

Rehearsed on 2026-09-08 (America/Los_Angeles) from executable source
`fc3d888e507ee92675babc4e1682a75947c88573`, branch `build/computer-use`.
The fresh local clone `.reproduction/reviewer-live-fc3d888` was clean before and
after every command. Later packaging commits contain only documentation and safe
evidence; executable source and the genuine artifact bytes are unchanged.

Environment: macOS arm64, Node 24.16.0, npm 11.13.0, Playwright 1.63.0,
Chromium 153.0.8010.12. Other platforms are untested. Dependencies, compiled
output, private runs, credentials and the ignored assignment PDF were excluded.
Browser installation reused the machine-wide download cache.

Actual setup commands, exit 0:

```bash
git clone --no-local . .reproduction/reviewer-live-fc3d888
npm ci --prefix .reproduction/reviewer-live-fc3d888
npm run browser:install --prefix .reproduction/reviewer-live-fc3d888
```

The lockfile install added 10 packages and reported 0 audit vulnerabilities.
The following commands ran from the clone with environment names containing
`OPENAI`, `ANTHROPIC`, `API_KEY`, or `CUA_` removed; only the explicit artifact
path was added back for qualification. No paid request occurred.

| Actual command | Exit | Observed result |
|---|---:|---|
| `npm run verify:offline` | 0 | Biome, strict types, build, **65/65** tests; 0 failures/skips/retries; test duration 31.746 s |
| `CUA_TEST_ARTIFACT=artifacts/prepare-transfer.json npm run test:artifact` | 0 | **31/31** tests against unchanged live bytes; 0 failures/skips/retries; 20.411 s |
| `npm run demo:replay -- --require-live` | 0 | Fresh changed-input UI review; 0 model calls, 0 commits |
| `npm run demo:handoff -- --require-live --test-operator` | 0 | Same-session automated handoff with live artifact; 0 model calls, 0 commits |
| `npm run replay -- --help` | 0 | Usage displayed |
| `npm run discover -- --help` | 0 | Usage and approval requirement displayed |
| `npm run replay -- --artifact artifacts/prepare-transfer.json --inputs package.json` | 1 expected | CONTRACT_INVALID before browser work |
| `npm run verify:live` | 1 expected | MODEL_UNAVAILABLE before browser/API work, because provider configuration was removed |
| `CUA_TEST_ARTIFACT=.runs/does-not-exist-live-artifact.json node --test dist/tests/integration/outcomes.test.js` | 1 expected | ENOENT before UI work; explicitly selected bytes never fall back to the fixture |

The four artifact-qualification files all import `tests/artifact-path.ts`; each
reads the selected file. The successful qualification used SHA-256
`294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.
A subprocess model-import bomb ran as part of that qualification. The required-live
CLI guards separately reject a missing artifact and a development fixture.

Safe clean-clone evidence: [replay f15c79d6](evidence/f15c79d6-b552-4641-ae71-3d706ee05bca/manifest.json)
and [test_operator 3f67bb78](evidence/3f67bb78-7cfc-4e12-899e-b5d8145de93f/manifest.json).
Both manifests show the source above, `dirty: false`, `origin: live-model`, the
same artifact hash, `modelCalls: 0` and `reservedTokens: 0`. Caller outputs were
checked against M-207, CHK-207 → SAV-207, 3750 cents, USD, zero fee and
AWAITING_CONFIRMATION. Public copies redact those outputs by design.

Private command logs, negative checks and exit/duration records remain under
`.reproduction/reviewer-live-fc3d888/.runs/reproduction/`. The linked six-case
[live collection](evidence/collections/96325056-8e68-4296-97ec-fb11183ac97b.json)
was generated by `npm run evidence:capture-live` at identical executable source.
Its manifests truthfully show dirty source after public evidence files were added.

A20 and the remaining automated live gates pass. Owner-operated handoff and
personal code review are still pending. Historical rehearsals below retain their
original gate descriptions as of their execution; they do not describe current
live status.

---

# Historical offline rehearsal before live validation

The final policy repair was rehearsed in a second fresh local clone on 2026-09-08
(America/Los_Angeles), at source `b53842a0ebaf13d546119bece16cc193f293c758`.
Branch: `build/computer-use`. The clone `.reproduction/reviewer-policy` was clean
before and after every documented command. Subsequent packaging changes contain
only documentation and safe evidence; executable source is identical.

Environment: macOS arm64, Node 24.16.0, npm 11.13.0, pinned Playwright 1.63.0,
Chromium 153.0.8010.12. Browser installation reused the machine-wide download
cache. Other platforms are untested. The clone excluded dependencies, compiled
output, private runs, credentials and the ignored assignment PDF.

From the original workspace, these exact setup commands exited 0:

```bash
git clone --no-local . .reproduction/reviewer-policy
npm ci --prefix .reproduction/reviewer-policy
npm run browser:install --prefix .reproduction/reviewer-policy
```

The lockfile install added 10 packages and reported 0 audit vulnerabilities.
The following commands ran from the clone with all environment variables beginning
`OPENAI_`, `CUA_`, `ANTHROPIC_`, and `AZURE_OPENAI_` removed:

| Actual command | Exit | Actual result |
|---|---:|---|
| `npm run verify:offline` | 0 | Biome, strict types, build, 59/59 tests; no failures, skips or retries; test duration 34.043 s |
| `npm run demo:replay` | 0 | Changed-input review, 0 model calls, 0 commits |
| `npm run demo:handoff -- --test-operator` | 0 | Same-session automated handoff, 0 model calls, 0 commits |
| `npm run replay -- --help` | 0 | Usage displayed |
| `npm run discover -- --help` | 0 | Usage and approval requirement displayed |
| `npm run replay -- --artifact artifacts/development-fixture.json --inputs package.json` | 1 expected | CONTRACT_INVALID before browser work |
| `npm run verify:live` | 1 expected | MODEL_UNAVAILABLE before browser/API work |

Safe current demo evidence: [keyless replay](evidence/ed3d7a71-8e05-4dcf-8e49-14174d88ab7e/manifest.json)
and [test_operator handoff](evidence/11077b81-d9da-4d27-a1fb-e3843ecba2c8/manifest.json).
Both have the exact repaired source SHA, `dirty: false` and `modelCalls: 0`.
Private command logs and exit/duration records remain in
`.reproduction/reviewer-policy/.runs/reproduction/`.

The current seven-run collection was generated by `npm run evidence:capture` on
this repaired source. Its exact artifact is qualified separately with:

```bash
CUA_TEST_ARTIFACT=evidence/aa3a106d-418a-412d-a280-31c16da26ff4/capability.json npm run test:artifact
```

The [current evidence index](evidence/README.md) records that command's final result.
All collections and earlier failing attempts are preserved. This completes A20 for
available offline work; genuine discovery and candidate-operated manual handoff
remain unperformed external gates. Exact owner commands are in [README.md](README.md).

---

# Prior rehearsal before final policy repair

Rehearsed on 2026-09-08 (America/Los_Angeles) in a fresh local clone:
`.reproduction/reviewer-f49371f`. Source revision was
`f49371f9da98e23e57d3ca9c5c0575219ca0468d`, branch `build/computer-use`.
The clone was clean before and after verification. It excluded dependencies,
compiled output, private runs, credentials, the assignment PDF and caches.
The later policy repair supersedes this rehearsal for current qualification; its original results are retained below.

Environment: macOS arm64, Node 24.16.0, npm 11.13.0; pinned Playwright 1.63.0
with Chromium 153.0.8010.12. `browser:install` verified the installed browser;
the machine-wide Playwright download cache was reused. Other platforms were not tested.

| Actual command | Exit | Observation |
|---|---:|---|
| `git clone --no-local . .reproduction/reviewer-f49371f` | 0 | Fresh tracked-source clone |
| `npm ci` | 0 | Lockfile install; 10 packages added, audit reported 0 vulnerabilities |
| `npm run browser:install` | 0 | Pinned Chromium available |
| `npm run verify:offline` | 0 | Biome, strict types, build, 55/55 tests; no skips/retries; 32.478 seconds test duration |
| `npm run demo:replay` | 0 | Changed-input UI result; development fixture, 0 model calls, 0 commits |
| `npm run demo:handoff -- --test-operator` | 0 | Same-session automated restoration and review; 0 model calls, 0 commits |
| `npm run replay -- --help` | 0 | Usage displayed |
| `npm run discover -- --help` | 0 | Usage and approval requirement displayed |
| `npm run replay -- --artifact artifacts/development-fixture.json --inputs package.json` | 1 expected | `CONTRACT_INVALID`, before browser creation |
| `npm run verify:live` | 1 expected | `MODEL_UNAVAILABLE`; no browser or provider request |

The verification/demo/help/negative commands ran with environment variables beginning
`OPENAI_`, `CUA_`, `ANTHROPIC_`, and `AZURE_OPENAI_` removed. A real subprocess
model-import bomb is also asserted by the offline suite. Private command logs remain
in `.reproduction/reviewer-f49371f/.runs/reproduction/`; they are not public artifacts.

Reviewed safe copies of the clean-clone demos:

- [Keyless replay](evidence/a7fe0963-3c54-42c1-bdf5-8cd33454c65b/manifest.json)
- [Automated handoff](evidence/b1af876d-0a9d-405c-bc84-ed4b27f75cf6/manifest.json)

Both manifests record the exact revision above, `dirty: false`, and `modelCalls: 0`.
Their artifact hash matches the checked-in development fixture's original discovery
manifest. The handoff actor is `test_operator`, never a claimed human.

Separate working-tree evidence commands also passed on identical executable source:

```bash
npm run evidence:capture
CUA_TEST_ARTIFACT=evidence/06e36561-042e-451e-a76d-4ed600c211c8/capability.json npm run test:artifact
```

The capture produced seven linked runs and zero commits. The newly discovered
development artifact passed 27/27 browser qualification tests, with no skips/retries
(22.976 seconds). Public file creation made later capture manifests truthfully dirty;
no executable source changed. See the [evidence index](evidence/README.md).

This rehearsal passes A20 for the available offline commands. Genuine model
discovery, qualification of its resulting artifact, and candidate-operated manual
handoff remain unperformed external gates. The exact owner commands and finite
API configuration are in [README.md](README.md).
