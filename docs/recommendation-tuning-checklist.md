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
