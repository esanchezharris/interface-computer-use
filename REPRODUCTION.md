# Clean reproduction

Rehearsed on 2026-09-08 (America/Los_Angeles) in a fresh local clone:
`.reproduction/reviewer-f49371f`. Source revision was
`f49371f9da98e23e57d3ca9c5c0575219ca0468d`, branch `build/computer-use`.
The clone was clean before and after verification. It excluded dependencies,
compiled output, private runs, credentials, the assignment PDF and caches.
Later packaging commits contain documentation and sanitized evidence only.

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
