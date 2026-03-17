# Ranked Home Feed: Deterministic Validation Pass

This pass is intentionally deterministic and lightweight: use seeded users, fixed event injections, and score snapshots (`id`, `type`, `categoryId`, `score`) to verify ranking movement is explainable.

## 1) Deterministic setup (always run first)

- [ ] Run `pnpm db:setup` from repo root.
- [ ] Authenticate as seeded demo user (`demo@swipe2win.app` / `Passw0rd!`).
- [ ] Capture baseline `GET /recommendations/home` response and save top-8 items (with score + category).
- [ ] Confirm baseline feed is score-descending and stable across two repeated calls with no new events.

---

## 2) Seeded-user ranking scenarios (before/after expectations)

Use 4 deterministic scenarios.

### Scenario A — FPS-leaning seeded user (baseline confidence)

**Before telemetry action**
- FPS items should already be strong due to seeded JOIN/SAVE behavior.
- Strategy should sit below FPS when seeded negative behavior exists.

**Telemetry action**
- Post: `JOIN` on one FPS board + `SAVE` on one FPS challenge.

**After telemetry action**
- FPS category aggregate signal increases clearly.
- At least one FPS item should move up within top-5 (or reinforce #1/#2 if already there).
- Non-FPS categories should not collapse; they should only lose relative position where signal supports it.

### Scenario B — Dismiss pressure on Strategy

> UI “Dismiss” should map to a negative telemetry event (`SWIPE_LEFT` or equivalent negative event mapping).

**Before telemetry action**
- Strategy appears in mid-rank slots (commonly top-8 but not dominant).

**Telemetry action**
- Post: 3x dismiss/negative events for Strategy items (same category, different item IDs).

**After telemetry action**
- Strategy category score should decrease directionally.
- Strategy boards/challenges should drop below neutral categories with similar base quality.
- Dismissed item should be removed from immediate UI list (client behavior) and return only if score and dedupe rules allow.

### Scenario C — Sports uplift from conversion intent

**Before telemetry action**
- Sports category starts behind FPS (and often near neutral categories).

**Telemetry action**
- Post: `JOIN`, `JOIN`, `SAVE` on Sports items.

**After telemetry action**
- Sports should move into competitive top-category range (typically top-3 category signal).
- At least one Sports board/challenge should enter or move up in top-5 feed positions.
- Movement should be noticeable but not extreme (no full feed takeover from 2–3 events).

### Scenario D — Cold-start user sanity check

**Before telemetry action**
- Use a user with no behavior events.

**Telemetry action**
- None (initial load only), then add 1x `VIEW` and re-check.

**After telemetry action**
- Initial ranking should rely on non-personalized components (entry-fit, quality, fill/prize dynamics).
- Comfort-band width should separate items without producing near-identical scores.
- A single `VIEW` should cause only mild category movement; no dramatic top-rank inversion.

---

## 3) Score-debug checklist (quick explainability pass)

For the top-5 before/after snapshots, validate:

- [ ] **Event weight application:** JOIN/ACCEPT > SAVE > VIEW > DISMISS(negative) in practical impact.
- [ ] **Recency decay bounds:** newer actions matter more, but older actions still contribute non-zero weight.
- [ ] **Category preference aggregation:** positive-only top-category selection for boost eligibility is preserved.
- [ ] **Entry-fit normalization:** comfort-band-width-based normalization contributes visible but bounded separation.
- [ ] **Board/challenge parity:** category movement affects both content types directionally, not only boards.
- [ ] **No single-term domination:** any one component should not overwhelm total score beyond explainable behavior.

Heuristic to flag imbalance:
- If 1 negative event drops an item >5 feed positions, negative weight may be too dominant.
- If 3 conversion-positive events barely move rank at all, category signal may be too weak.
- If cold-start top-10 scores cluster in a tiny range (< ~2 points), non-personalized terms may be too flat.

---

## 4) Minimal deterministic tuning suggestions (only if imbalance appears)

Apply only one change at a time, then rerun Scenario A–D:

1. **If negative actions are too strong:** reduce negative event magnitude by ~10–20%.
2. **If positive conversion is too weak:** raise JOIN/ACCEPT weight slightly (small fixed increment only).
3. **If feed is too generic at cold start:** slightly increase entry-fit or prize/quality spread term.
4. **If feed overreacts to single events:** raise smoothing floor or tighten per-request category delta cap.

Guardrails:
- Keep all changes deterministic (no stochastic tie-breakers).
- Preserve explainability with explicit per-component debug output.
- Avoid adding heavy models/features; prefer scalar-weight adjustments.

---

## 5) Concise manual QA flow (ranking movement after telemetry)

1. Reset seed and login as target seeded user.
2. Record baseline top-8 (`rank`, `itemId`, `type`, `categoryId`, `score`).
3. Trigger one telemetry batch (Join/Save/Dismiss mix per scenario).
4. Reload Home and record top-8 again.
5. Verify expected directional movement:
   - Join: strongest positive uplift in target category.
   - Save: moderate positive uplift.
   - Dismiss: immediate item removal in UI + negative category pressure on reload.
6. Confirm ordering remains strictly score-descending and API/UI order matches.
7. Repeat for all scenarios; document any outlier where rank change is implausibly small or large.


## 6) Dev-only debug surface for deterministic ranking validation

Use the authenticated dev-only endpoint:

- `GET /recommendations/home/debug`

Response shape (recommended score breakdown contract):

```json
{
  "generatedAt": "2026-01-01T12:00:00.000Z",
  "metrics": {
    "skillScore": 1234.5,
    "categoryPreference": { "<categoryId>": 5.75 },
    "preferredCategoryIds": ["<categoryId>"],
    "comfortBand": { "min": 6, "max": 14, "mid": 10, "width": 8 },
    "acceptanceRate": 0.5
  },
  "rankedFeed": [
    {
      "rank": 1,
      "rankType": "BOARD",
      "id": "...",
      "categoryId": "...",
      "score": 72.1,
      "breakdown": {
        "total": 72.1,
        "raw": {
          "categoryPreference": 0.8,
          "entryFit": 0.9,
          "prizeValue": 0.7,
          "urgency": 0.6,
          "engagement": 0.5,
          "skillAffinity": 0.75
        },
        "weighted": {
          "categoryPreference": 24,
          "entryFit": 19.8,
          "prizeValue": 14,
          "urgency": 6,
          "engagement": 4,
          "skillAffinity": 7.5
        }
      }
    }
  ]
}
```

Challenge breakdown extends this with:
- `weighted.boardScore`, `weighted.rivalryStrength`, `weighted.acceptanceRate`, `weighted.socialProof`
- `boardScoreBreakdown` for the nested board-like component.

Optional lightweight logs in dev:
- Set `RECOMMENDATIONS_DEBUG_LOGS=1` to emit top-5 score preview in server logs when `/recommendations/home` runs.
- Keep disabled by default for low-noise local runs.

## 7) Repeatability / reset guidance (avoid hidden state drift)

- Always start a validation batch with `pnpm db:seed` (or `pnpm db:setup` if schema changed).
- For iterative scenario reruns on one seeded user, call `POST /recommendations/debug/reset-derived-state` before recapturing baseline.
  - This clears derived recommendation state rows (`UserSkillProfile`, `UserPreference`, `ChallengeRecommendation`, `UserRivalry`, `MatchmakingScore`) while keeping core seeded entities/events intact.
- Re-login and capture a fresh baseline from `/recommendations/home/debug` immediately after reset.

## 8) Final deterministic execution workflow (Scenarios A–D)

> Order is strict for every scenario: **reset derived state → baseline debug snapshot → telemetry events → post-action debug snapshot**.

### Scenario A request order (FPS reinforcement)

1. `POST /recommendations/debug/reset-derived-state`
2. `GET /recommendations/home/debug` (save as `A_before.json`)
3. `POST /recommendations/events` (run both payloads below, in order)
4. `GET /recommendations/home/debug` (save as `A_after.json`)

Sample telemetry payloads:

```json
{
  "eventType": "JOIN",
  "itemType": "BOARD",
  "itemId": "<fps-board-id>",
  "metadata": { "categoryId": "<fps-category-id>", "source": "deterministic-scenario-a" }
}
```

```json
{
  "eventType": "SAVE",
  "itemType": "CHALLENGE",
  "itemId": "<fps-challenge-id>",
  "metadata": { "categoryId": "<fps-category-id>", "source": "deterministic-scenario-a" }
}
```

### Scenario B request order (Strategy negative pressure)

1. `POST /recommendations/debug/reset-derived-state`
2. `GET /recommendations/home/debug` (save as `B_before.json`)
3. `POST /recommendations/events` (run all three negative payloads)
4. `GET /recommendations/home/debug` (save as `B_after.json`)

Sample telemetry payloads:

```json
{
  "eventType": "SWIPE_LEFT",
  "itemType": "BOARD",
  "itemId": "<strategy-board-id-1>",
  "metadata": { "categoryId": "<strategy-category-id>", "source": "deterministic-scenario-b" }
}
```

```json
{
  "eventType": "SWIPE_LEFT",
  "itemType": "CHALLENGE",
  "itemId": "<strategy-challenge-id-1>",
  "metadata": { "categoryId": "<strategy-category-id>", "source": "deterministic-scenario-b" }
}
```

```json
{
  "eventType": "SWIPE_LEFT",
  "itemType": "BOARD",
  "itemId": "<strategy-board-id-2>",
  "metadata": { "categoryId": "<strategy-category-id>", "source": "deterministic-scenario-b" }
}
```

### Scenario C request order (Sports uplift)

1. `POST /recommendations/debug/reset-derived-state`
2. `GET /recommendations/home/debug` (save as `C_before.json`)
3. `POST /recommendations/events` (run all three positive payloads)
4. `GET /recommendations/home/debug` (save as `C_after.json`)

Sample telemetry payloads:

```json
{
  "eventType": "JOIN",
  "itemType": "BOARD",
  "itemId": "<sports-board-id-1>",
  "metadata": { "categoryId": "<sports-category-id>", "source": "deterministic-scenario-c" }
}
```

```json
{
  "eventType": "JOIN",
  "itemType": "CHALLENGE",
  "itemId": "<sports-challenge-id-1>",
  "metadata": { "categoryId": "<sports-category-id>", "source": "deterministic-scenario-c" }
}
```

```json
{
  "eventType": "SAVE",
  "itemType": "BOARD",
  "itemId": "<sports-board-id-2>",
  "metadata": { "categoryId": "<sports-category-id>", "source": "deterministic-scenario-c" }
}
```

### Scenario D request order (Cold-start + one view)

1. Authenticate as cold-start user (no prior recommendation events)
2. `POST /recommendations/debug/reset-derived-state`
3. `GET /recommendations/home/debug` (save as `D_before.json`)
4. `POST /recommendations/events` (single `VIEW` payload)
5. `GET /recommendations/home/debug` (save as `D_after.json`)

Sample telemetry payload:

```json
{
  "eventType": "VIEW",
  "itemType": "BOARD",
  "itemId": "<neutral-board-id>",
  "metadata": { "categoryId": "<neutral-category-id>", "source": "deterministic-scenario-d" }
}
```

## 9) Before/after debug snapshot comparison checklist

Compare these fields between `*_before.json` and `*_after.json`:

- `metrics.categoryPreference` (target category directional change)
- `metrics.preferredCategoryIds` (expected category appears/disappears only when justified)
- `rankedFeed[0..7].rank`, `rankedFeed[0..7].id`, `rankedFeed[0..7].categoryId`, `rankedFeed[0..7].score`
- `rankedFeed[*].breakdown.weighted.categoryPreference`
- `rankedFeed[*].breakdown.weighted.entryFit`
- `rankedFeed[*].breakdown.weighted.engagement`
- Challenge-only additions when applicable:
  - `rankedFeed[*].breakdown.weighted.boardScore`
  - `rankedFeed[*].breakdown.weighted.acceptanceRate`
  - `rankedFeed[*].breakdown.weighted.rivalryStrength`

Pass criteria:
- Target-category items move in the expected direction.
- Non-target categories change mildly (no unexplained collapse/takeover).
- Final ordering remains score-descending.

## 10) Weight tuning signals (over-weighting vs under-weighting)

Signs a component is **over-weighted**:

- One `SWIPE_LEFT` drops an otherwise strong item >5 ranks.
- One `JOIN` flips most of top-5 into the same category immediately.
- `breakdown.weighted.categoryPreference` dominates total score for many items.

Signs a component is **under-weighted**:

- Three intentional events in one category produce negligible rank movement.
- `preferredCategoryIds` changes but top-8 composition barely changes.
- Cold-start and post-event snapshots are near-identical even for conversion events.

Short tuning guide:

1. Change one scalar weight at a time (±10–20% max per pass).
2. Re-run only the affected scenario first, then run all A–D.
3. Keep changes only if movement becomes explainable without instability.
4. Revert immediately if cold-start diversity or score-desc ordering regresses.

## 11) Concise repeatable manual QA workflow

1. Ensure dev mode and login as the scenario user.
2. Call `POST /recommendations/debug/reset-derived-state`.
3. Capture `GET /recommendations/home/debug` as baseline.
4. Send the scenario telemetry payload(s) to `POST /recommendations/events`.
5. Capture `GET /recommendations/home/debug` post-action snapshot.
6. Run the comparison checklist from Section 9.
7. Record pass/fail notes and proceed to the next scenario.
