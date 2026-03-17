# Deterministic Scenario Result Template (A–D)

Use this template per scenario run while capturing `before` and `after` debug snapshots from `GET /recommendations/home/debug`.

## Run metadata

- Run date/time (UTC):
- Operator:
- Environment: local/dev
- App/API commit SHA:
- Seed/reset command used: `pnpm db:seed` | `pnpm db:setup`
- Scenario: `A | B | C | D`
- User email used:
- Expected target category:

## Evidence files

- Baseline snapshot: `artifacts/recommendations/scenarios/<run-id>/<scenario>/baseline.home-debug.json`
- Post-action snapshot: `artifacts/recommendations/scenarios/<run-id>/<scenario>/post.home-debug.json`
- Events sent log: `artifacts/recommendations/scenarios/<run-id>/<scenario>/events.ndjson`
- Comparison summary: `artifacts/recommendations/scenarios/<run-id>/<scenario>/comparison.md`

## Event sequence executed (strict order)

1. `POST /recommendations/debug/reset-derived-state`
2. `GET /recommendations/home/debug` (baseline)
3. `POST /recommendations/events` payload(s)
4. `GET /recommendations/home/debug` (post)

Payload IDs/item IDs used:

- 

## Lightweight comparison table

| Check | Baseline | Post-action | Delta / Observation | Result |
|---|---|---|---|---|
| Target category preference (`metrics.categoryPreference[target]`) |  |  |  | PASS/FAIL |
| Target category presence in top-5 (`rankedFeed[0..4]`) |  |  |  | PASS/FAIL |
| Non-target stability (no collapse/takeover) |  |  |  | PASS/FAIL |
| Ordering score-descending |  |  |  | PASS/FAIL |
| Movement magnitude plausible for event count |  |  |  | PASS/FAIL |

## Scenario-specific pass/fail decision

- Scenario outcome: `PASS | FAIL`
- Decision reason (1–3 bullets):
  - 

## Follow-up (only if FAIL)

- Suspected overweight/underweight signal:
- Candidate scalar weight tweak (if any, max ±10–20%):
- Re-run planned: `yes/no`
