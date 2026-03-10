# Backend repository analysis

## Backend module structure

The backend is a NestJS monolith rooted in `src/app.module.ts` with these characteristics:

- Global configuration via `ConfigModule.forRoot({ isGlobal: true })`.
- PostgreSQL access via TypeORM with entities registered in the root module.
- Redis caching utility (`RedisService`) as a shared provider.
- Domain modules imported into the root module:
  - `AuthModule`
  - `UsersModule`
  - `BoardsModule`
  - `EntriesModule`
  - `PaymentsModule`
  - `WinnersModule`
  - `NotificationsModule`

`main.ts` applies:
- global `/api` prefix,
- global validation pipe with whitelist + transform.

### Per-module responsibilities

- **auth**: register/login and JWT issuance.
- **users**: user CRUD-lite (create, find) and XP/prestige updates.
- **boards**: board list/get/create and entry-count/status transitions.
- **entries**: paid entry workflow, XP award, winner-trigger when board fills.
- **payments**: Stripe payment-intent creation + webhook-driven payment status updates.
- **winners**: winner selection/read by board.
- **notifications**: websocket event broadcasting + persisted notification creation helper.

## Database entities

The data model is centered around sweepstakes lifecycle entities:

- **User**
  - `id`, `email` (unique), `passwordHash`, `isAdmin`, `xp`, `prestigeLevel`, `createdAt`
  - relationships: one-to-many `entries`, one-to-many `payments`, one-to-many `wins`

- **Board**
  - `id`, `title`, `description`, `pricePerEntry`, `maxEntries`, `currentEntries`, `status`, `createdAt`
  - `status` enum: `OPEN | FULL | CLOSED`
  - relationships: one-to-many `entries`, one-to-many `payments`, one-to-many `winners`

- **Payment**
  - `id`, `stripePaymentIntentId`, `amount`, `status`, `createdAt`
  - `status` enum: `PENDING | SUCCEEDED | FAILED`
  - many-to-one to `user` and `board`, one-to-many to `entries`

- **Entry**
  - `id`, `createdAt`
  - many-to-one to `user`, many-to-one to `board`, many-to-one to `payment`

- **Winner**
  - `id`, `createdAt`
  - many-to-one to `board`, one-to-one to `entry`, many-to-one to `user`

- **Notification**
  - `id`, `userId`, `type`, `message`, `read`, `createdAt`

### Data/migration state

- A SQL migration exists but only enables UUID extension (`001_init.sql`).
- Runtime schema generation currently depends on TypeORM `synchronize: true`.

## API endpoints (HTTP + websocket)

Because `main.ts` applies a global prefix, all HTTP endpoints are under `/api`.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users

- `GET /api/me` (JWT required)

### Boards

- `GET /api/boards`
- `GET /api/boards/:id`
- `POST /api/boards` (JWT + admin guard)

### Entries

- `POST /api/boards/:id/enter` (JWT required)

### Payments

- `POST /api/payments/create-intent` (JWT required)
- `POST /api/payments/webhook`

### Winners

- `GET /api/boards/:id/winner`

### Websocket events (Socket.IO gateway)

Broadcast events currently include:
- `board_update`
- `entry_added`
- `board_full`
- `winner_selected`
- `push_notification`
- `xp_updated`

## Missing production functionality for a sweepstakes board platform

### Critical security and integrity gaps

1. **Webhook trust boundary is incomplete**
   - Stripe webhook processing accepts event type + intent ID from request body and does not verify Stripe signatures.
   - Missing idempotency handling for repeated webhook deliveries.

2. **Race conditions around board fill + winner finalization**
   - Entry creation, board increment, possible winner selection, and board close are not wrapped in a DB transaction.
   - Concurrent entries can overfill or create timing anomalies.

3. **Schema/migrations are not production-safe yet**
   - Reliance on `synchronize: true` and minimal migration history.
   - Missing explicit constraints/indexes for high-value invariants.

4. **Authorization depth is limited**
   - Only a basic admin guard from JWT claim exists; no richer role/permission model, token lifecycle, or revocation.

### Product/API completeness gaps

5. **Notification product surface is incomplete**
   - Notifications can be saved but there are no REST endpoints for inbox listing, read/unread updates, or pagination.
   - Websocket events are globally emitted instead of user/room scoped channels.

6. **Board lifecycle operations are minimal**
   - No update/archive/delete/scheduling endpoints.
   - No robust lifecycle states beyond `OPEN/FULL/CLOSED` and no admin workflow tooling.

7. **User account management is minimal**
   - No password reset/change flows, profile update endpoints, email verification, or account lockout handling.

8. **Operational observability is missing**
   - No health/readiness endpoints, structured logging standard, distributed tracing, or domain audit log stream.

9. **Abuse and fraud controls are absent**
   - No rate limiting/anti-bot controls on login/payment/entry routes.
   - No risk flags or device/session intelligence for suspicious behavior.

10. **Public API ergonomics are incomplete**
    - No documented OpenAPI/Swagger contract.
    - No pagination/filtering/search for board browsing.
    - No versioning strategy for backward compatibility.

### Suggested implementation order (production hardening)

1. Secure webhook verification + idempotency.
2. Add transactional entry/winner pipeline with row-level locking.
3. Replace `synchronize: true` with migration-driven schema management.
4. Add rate limiting + auth/session hardening.
5. Implement notification inbox/read APIs and socket room scoping.
6. Expand board and user lifecycle endpoints.
7. Add observability baseline (health checks, logs, metrics, tracing).
