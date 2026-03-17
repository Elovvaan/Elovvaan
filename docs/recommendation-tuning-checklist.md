# Ranked Home Feed: Post-Boot Validation & Tuning Checklist

## 1) Validate recommendation score ordering in seeded data

- [ ] Run `pnpm db:setup` from repo root to reset + seed deterministic baseline.
- [ ] Login as `demo@swipe2win.app` (`Passw0rd!`) and call `GET /recommendations/home`.
- [ ] Confirm top feed ordering is strictly score-descending (same ordering in API and Home UI).
- [ ] Verify category alignment from seed behavior events:
  - FPS should outrank neutral categories after JOIN/SAVE signals.
  - Strategy should be deprioritized after SWIPE_LEFT.
- [ ] Confirm score ties are stable enough for UX (same result across repeated calls with unchanged data).

## 2) Check telemetry impact on future rankings

- [ ] Capture baseline top-6 feed snapshot (item id + score).
- [ ] Post 3-5 events to `/recommendations/events` for one category and reload home.
- [ ] Validate expected directional effects:
  - JOIN/ACCEPT increases category preference fastest.
  - SAVE/SWIPE_RIGHT increases category preference moderately.
  - SWIPE_LEFT/SWIPE_UP decreases category preference.
- [ ] Confirm recommendation persistence failures are warning-only and do not fail API response.

## 3) Identify weak/default scoring that makes Home generic

Watch for these anti-patterns during smoke:

- Overly broad cold-start comfort band causing near-identical entry-fit across all items.
- No negative signal handling (dismiss behavior not affecting category preference).
- Binary category boost (`preferred` vs `not preferred`) compressing score separation.

## 4) Minimal deterministic tuning changes (implemented)

These are intentionally lightweight and deterministic:

1. **Cold-start comfort band narrowed** from `[0..20]` to `[6..14]`.
2. **Telemetry weighting expanded** with positive + negative event semantics:
   - JOIN/ACCEPT: `+3`
   - SAVE/SWIPE_RIGHT: `+2`
   - VIEW/SEARCH: `+0.75`
   - SWIPE_LEFT/SWIPE_UP: `-2`
3. **Recency decay added** (newer events count more) while bounded to deterministic floor.
4. **Category boost changed from binary to weighted**, using observed category signal strength.
5. **Entry-fit now uses comfort width** instead of max fee ceiling to improve separation.

## 5) Seeded-user scenarios to test ranking quality

Use seeded data plus deterministic event injections:

### Scenario A: FPS-first engager (existing demo behavior)
- Initial behavior: VIEW/JOIN on FPS, SAVE on FPS challenge.
- Expectation: FPS board/challenge consistently in top slots.

### Scenario B: Strategy dismiss-heavy
- Post 3x `SWIPE_LEFT` events with Strategy category metadata.
- Expectation: Strategy items lose rank versus FPS/Sports.

### Scenario C: Sports conversion uplift
- Post 2x JOIN + 1x SAVE for Sports category.
- Expectation: Sports rises into top-3 categories and top feed positions.

### Scenario D: Cold-start sanity
- New user with no behavior history.
- Expectation: Feed is still score-separated by prize/fee/fill ratio, but not over-personalized.

## Concise QA plan after Join/Save/Dismiss changes

1. Snapshot current top-6 (`id`, `type`, `score`).
2. Trigger one action in UI:
   - Join -> expect same/similar items from same category to trend upward on reload.
   - Save -> expect mild upward movement.
   - Dismiss -> expect clicked item removed immediately in UI; same category should soften in next reload.
3. Reload Home and compare deltas against baseline snapshot.
4. Verify `/recommendations/events` ack and no blocking UI error.
5. Repeat once per action type; ensure ordering remains score-descending.
