# Live validation record

On 2026-09-08 the owner authorized reuse of the existing environment OpenAI key,
up to **USD50 total** additional usage across restarts, with **USD5** of that total
for compatibility/selection. Only this project used that authorization. The phase
is complete and closed; unused allowance is not a reason for another request.

## Observed attempts

| Purpose | Run | Actual result |
|---|---|---|
| Actual-contract compatibility | [c6c0c7b6](../evidence/c6c0c7b6-77c5-429f-8c98-3aa1fc3fc1fe/manifest.json) | One completed response chose a valid current `fill` candidate. Deliberately stopped before execution; its `aborted` manifest is not a discovery failure. |
| Genuine discovery | [fbcd21b6](../evidence/fbcd21b6-5f82-4778-a73c-09afe5559dc7/manifest.json) | One attempt, seven completed responses, six executed steps, independently verified review. |
| First changed-input keyless replay | [d57e0cfe](../evidence/d57e0cfe-79c2-4334-9d20-5584c7c2cf92/manifest.json) | Fresh child/context, provider configuration removed, model-import bomb active, zero model calls, zero commits. |

Paid request count **8**, failed paid requests **0**, SDK retries **0**. No second
model candidate or broad benchmark was used. Compatibility used the same current
observation, primitive decision schema, prompt and provider adapter as discovery.
The model received no fixture trajectory, application source or hidden state.

Discovery ran from clean source `728c1b13f94510524287f5d0ffba46748b47f296`.
The [unaltered artifact](../artifacts/prepare-transfer.json) hashes to
`294a274e3a9cfc5a48bfecd0dc655c43de46c45934c95fffddb71b0a294d269d`.
The six steps leave the already-correct account defaults untouched. Qualification
covers the documented member/account pairs and existing fault cases, not arbitrary
account permutations. Exact final replay/reproduction revisions are recorded in
[REPRODUCTION.md](../REPRODUCTION.md).

## Selection and bounds

The requested initial candidate, **gpt-5.6-sol**, was accessible and compatible.
It completed the actual contract and discovery, so no diagnosed limitation
justified trying Astra. The request uses Responses API, JSON-object output with
strict local schema validation, `reasoning.effort=low`, `service_tier=default`,
`store=false`, no hosted tools, no automatic SDK retries, and the fixed official
API origin. No shared billing settings or processing tier were changed.

| Bound | Enforced value |
|---|---:|
| Phase ceiling / selection subset | USD50 / USD5 |
| Aggregate calls across candidates and restarts | 32 |
| Input reservation per request | At most 16,384 tokens |
| Output cap used (including reasoning/formatting) | 2,000 tokens |
| Actions / decisions per discovery | 30 / 32 |
| Request / active discovery timeout | 30 s / 120 s |
| Action / condition wait | 5 s / 10 s |
| Automatic retries | 0 |

Existing durable budget machinery reserves UTF-8 request bytes plus 2,048 message
-overhead tokens and the output cap before sending. Fixed phase ledgers add the
shared USD50 ceiling and USD5 subset at a conservative **USD50 per million reserved
tokens**, sufficient for either allowed candidate at the verified Standard short
context rates. The input cap stays below the 272k long-context pricing threshold.
An exclusive lock spans each paid request. Failed or ambiguous charges remain
reserved. A persisted `assignment-20260908.closed` marker prevents further phase
requests, including after restart. New budget IDs cannot obtain a fresh shared
allowance. Do not reset or remove the original `.runs/budgets/` accounting.

## Observed usage and estimated cost

All eight responses returned usage metadata. Safe request IDs and token counts
are in the linked events; no raw prompts, responses or key values are persisted.

| Quantity | Observed total |
|---|---:|
| Input tokens | 8,870 |
| Cache-write input tokens (subset) | 5,925 |
| Cached input tokens (subset) | 0 |
| Ordinary input tokens (remainder) | 2,945 |
| Output tokens | 378 |
| Reasoning output tokens (subset) | 0 |

Verified Sol Standard rates in USD per million tokens: ordinary input **4**, cached
input **0.40**, cache writes **5**, output **20**. Estimated request cost is
`(2945*4 + 0*0.40 + 5925*5 + 378*20) / 1000000 = USD0.048965`.
Compatibility's estimated portion is USD0.006582. These are estimates from returned
usage and published rates; no invoice or billing dashboard was consulted.

The total durable reserve is **69,398 tokens / USD3.4699**, including the selection
subset **8,505 tokens / USD0.42525**. **No request has missing usage or an uncertain
failure charge**. The unused USD3.420935 difference between reserve and estimated
usage remains held conservatively rather than refunded/reset.

## Official references checked before paid execution

- [Sol model and price contract](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [Standard model pricing, including Astra](https://developers.openai.com/api/docs/pricing)
- [Caching usage partitions and cache-write charges](https://developers.openai.com/api/docs/guides/prompt-caching)
- [Reasoning/output token accounting](https://developers.openai.com/api/docs/guides/reasoning)
- [Structured outputs and JSON mode](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Responses request and processing-tier contract](https://developers.openai.com/api/reference/python/resources/responses/methods/create)

The installed OpenAI SDK 7.10.0 request and response types were also checked for
these fields. Price verification is dated to this execution; later live work must
recheck current prices and retain the original accounting.

## Remaining owner gates

`npm run demo:handoff -- --require-live` requires the owner to restore the same
headed browser and resume in the terminal; exact actions are in README. Automated
`test_operator` runs do not pass that gate. Personal code review remains pending.
Nothing was pushed, published, deployed, submitted or emailed.
