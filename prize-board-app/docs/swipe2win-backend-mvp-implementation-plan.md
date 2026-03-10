# Swipe2Win Backend MVP Implementation Plan

## Goal
Deliver a production-ready backend MVP flow where:
1. users pay for an entry,
2. successful payments become board entries exactly once,
3. winners are selected fairly and idempotently,
4. clients receive reliable realtime state updates.

## Current Baseline (from code)
- Payment intents are created and stored, and webhook events can mark payment status. `processWebhook` currently trusts a simplified event payload and does not verify Stripe signatures.
- Entry creation validates board status + payment success, then increments board entry count and triggers winner selection when full.
- Winner selection is random over entries and idempotent by checking for an existing winner.
- Realtime updates use a global Socket.IO broadcast with events such as `entry_added`, `board_update`, and `winner_selected`.

## Step-by-Step Plan

### Phase 0 — Preconditions and Design Lock
1. **Freeze the MVP transaction contract**
   - Define exact lifecycle states:
     - `payment`: `PENDING -> SUCCEEDED|FAILED`
     - `board`: `OPEN -> FULL -> CLOSED` (or simplify to `OPEN -> CLOSED` with explicit `isFull`)
     - `entry`: created only from a succeeded payment.
   - Decide one authoritative trigger to create entries:
     - **Option A (recommended):** webhook-driven finalization endpoint/service.
     - Option B: client calls enter endpoint after confirmed payment (current pattern).

2. **Define idempotency invariants**
   - One payment intent must map to at most one payment record.
   - One successful payment must map to at most one entry.
   - One board can have at most one winner.

3. **Document event contract for clients**
   - Event names, payload shapes, and delivery order expectations.
   - Distinguish broadcast scope: global vs board-room vs user-room.

---

### Phase 1 — Payment Hardening (Critical Path)
4. **Implement Stripe webhook signature verification**
   - Read raw request body and verify using webhook signing secret.
   - Reject unsigned/invalid webhook requests with 400.

5. **Persist raw webhook event IDs for replay safety**
   - Add table/entity for processed webhook events (`provider`, `event_id`, `processed_at`).
   - Ignore duplicates by unique index on (`provider`, `event_id`).

6. **Harden `create-intent` flow**
   - Validate board is `OPEN` and has capacity before creating intent.
   - Include metadata keys used for reconciliation (`userId`, `boardId`, `version`).
   - Store idempotency key for client retries.

7. **Implement payment reconciliation rules**
   - On `payment_intent.succeeded`, mark payment succeeded and enqueue/finalize entry creation.
   - On `payment_intent.payment_failed`/`canceled`, mark payment failed and emit user notification event.
   - If webhook references unknown payment intent, record for investigation and return 200 (to avoid provider retry storms).

8. **Add operational observability for payments**
   - Structured logs with correlation IDs (`requestId`, `paymentIntentId`, `boardId`, `userId`).
   - Metrics counters: intents created, webhook verified, webhook failed, payment success/failure rate.

---

### Phase 2 — Entry Finalization and Concurrency Safety
9. **Move entry creation into a transaction boundary**
   - In a DB transaction:
     - lock target board row (`SELECT ... FOR UPDATE`),
     - assert board still accepts entries,
     - assert payment is succeeded,
     - assert no existing entry for payment,
     - create entry,
     - increment entry count.

10. **Enforce uniqueness at database level**
   - Unique index on `entries.payment_id`.
   - Optional composite unique index on (`entries.board_id`, `entries.user_id`, `entries.payment_id`) if policy needs it.

11. **Handle overfill and race conditions**
   - If board reaches capacity during concurrent requests, reject late entries with clear business error.
   - Ensure increments are atomic and never exceed `max_entries`.

12. **Define single writer for board status transitions**
   - Status transitions happen only from entry-finalization workflow.
   - Remove/avoid scattered status updates from multiple services where possible.

---

### Phase 3 — Winner Selection Reliability and Fairness
13. **Trigger winner selection only once per board-full transition**
   - Use transaction lock + winner uniqueness constraint (`winners.board_id` unique).
   - If duplicate trigger occurs, return existing winner.

14. **Make randomness auditable for MVP**
   - Record winner selection metadata:
     - candidate entry count,
     - timestamp,
     - RNG source (e.g., Node crypto random bytes mapped to index).
   - Keep algorithm simple but deterministic enough for internal audit replay.

15. **Guarantee post-selection consistency**
   - In one flow: select winner -> persist winner -> close board -> emit events.
   - On partial failure after DB commit, use outbox/queue retry for missed events.

16. **Add admin-read APIs for traceability**
   - Board winner audit endpoint: payment, entry, and timestamp lineage.
   - Useful for support disputes in MVP.

---

### Phase 4 — Realtime Event Architecture
17. **Introduce Socket.IO rooms**
   - `board:{boardId}` room for board-specific updates.
   - `user:{userId}` room for personal updates (`xp_updated`, payment issues).
   - Keep global broadcasts only for public discovery feeds if needed.

18. **Standardize event envelope**
   - Emit consistent shape:
     - `type`, `version`, `occurredAt`, `correlationId`, `payload`.
   - Enables backward-compatible client evolution.

19. **Add delivery resiliency for critical events**
   - Persist critical notifications (entry confirmed, winner selected) and expose fetch endpoint.
   - Clients reconcile realtime with polling on reconnect.

20. **Define event ordering and duplication policy**
   - At-least-once delivery assumption.
   - Clients must deduplicate by `eventId` and refetch board snapshot when sequence gaps are detected.

---

### Phase 5 — Testing and Validation
21. **Unit tests**
   - Payment status transitions.
   - Entry service idempotency and validation paths.
   - Winner selection idempotency + empty-entry behavior.

22. **Integration tests (DB + webhook + socket)**
   - Simulate Stripe webhook success/failure.
   - Verify one payment => one entry under concurrent calls.
   - Verify board full => one winner and proper status transitions.
   - Verify events emitted to correct rooms.

23. **Concurrency tests**
   - Burst N simultaneous successful entry finalizations near capacity.
   - Assert no overfill and no duplicate winner.

24. **Manual MVP acceptance checklist**
   - Happy path from payment intent -> webhook -> entry -> board full -> winner event.
   - Failure path with declined card.
   - Client reconnect path with missed realtime events.

---

### Phase 6 — Rollout and Operations
25. **Feature-flag critical transitions**
   - Toggle webhook-driven entry finalization by environment.
   - Shadow mode: process webhook and compare with existing flow before cutover.

26. **Runbook + alerts**
   - Alert on webhook verification failures, payment-entry mismatches, and winner selection errors.
   - Add runbook steps for replaying missed webhook events and rebuilding event streams.

27. **Go-live sequence**
   - Deploy schema migrations first.
   - Deploy backend with dual-path compatibility.
   - Switch on webhook-finalization flag.
   - Monitor metrics for 24–48 hours.

## Suggested Implementation Order (Practical Sprint Sequence)
1. Signature verification + webhook idempotency.
2. Transactional entry finalization + DB uniqueness constraints.
3. Winner uniqueness/locking and auditable randomness metadata.
4. Realtime rooms + standardized event envelope.
5. Integration + concurrency tests.
6. Feature-flagged rollout and operational runbooks.

## MVP Definition of Done
- No unverified webhook can mutate payment state.
- A succeeded payment produces exactly one entry (even with retries/races).
- A full board produces exactly one persisted winner.
- Clients reliably receive (or can reconcile) entry and winner updates.
- Automated tests cover happy path + high-risk race conditions.
