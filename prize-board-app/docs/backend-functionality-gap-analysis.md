# Repository Structure and Backend Functionality Gap Analysis

## Repository structure

- `backend/`: NestJS API service with TypeORM entities, REST controllers, JWT auth, Socket.IO gateway, Redis helper, and Stripe integration scaffolding.
- `mobile/`: Flutter client shell with route screens and placeholder API service (`ApiService`) but minimal data integration.
- `admin/`: Next.js admin interface with static pages for dashboard, boards, and winners.
- `website/`: Next.js marketing/legal/public pages (how it works, legal docs, download, winners, boards).
- `infra/`: Docker Compose setup for local orchestration.
- `docs/`: Architecture and overview docs; this file adds a backend gap inventory.

## Backend modules implemented

- `auth`: register/login with bcrypt + JWT issuance.
- `users`: lookup and XP/prestige updates.
- `boards`: list/get/create boards and increment spots.
- `entries`: entry creation workflow, XP award, winner selection trigger when full, websocket broadcasts.
- `payments`: Stripe payment intent creation and simple success marking.
- `winners`: random winner selection and winner read by board.
- `notifications`: Socket.IO gateway broadcasting app events.

## Missing or incomplete backend functionality

### 1) Authentication and authorization hardening

- No role model (admin vs player) in the `User` entity and no RBAC guard/decorator system.
- Admin board creation relies on hardcoded header `x-admin-key: dev-admin` instead of secure auth/roles.
- JWT secret presence is not validated at bootstrap; missing secret can silently break security guarantees.
- No token refresh/revocation/session handling.
- No rate limiting / brute-force protection for login and register endpoints.

### 2) Input validation and API contract completeness

- Several mutable endpoints use ad-hoc body types rather than DTO classes with class-validator:
  - `POST /boards/:id/enter`
  - `POST /payments/create-intent`
  - `POST /payments/webhook`
- No pagination/filter/search contracts for `GET /boards`.
- No formal API versioning or OpenAPI/Swagger docs for client integration.

### 3) Entries domain integrity

- Entry creation does **not** enforce critical business rules:
  - board must be `LIVE` (or otherwise explicitly enterable),
  - board must not already be full,
  - one user/spot policy (duplicate entries per board) if required,
  - payment must belong to the same user,
  - payment must be `SUCCEEDED` before entry creation.
- Spot increments are not transactional/locked, so concurrent entries can overfill boards.
- Winner selection and board finalization are not wrapped in a transaction.
- Board status is never moved to `COMPLETED` after winner creation.

### 4) Payment reliability and compliance gaps

- Stripe webhook endpoint accepts arbitrary JSON body and marks payment succeeded without signature verification.
- No handling for failed/canceled/refunded/chargeback payment events.
- No idempotency protections for webhook re-delivery.
- No link between payment intent metadata and specific board/entry intent for reconciliation.
- No currency validation or minimum/maximum amount controls beyond basic number input.

### 5) Notifications subsystem incompleteness

- `Notification` entity exists but is never written to/read from by any service/controller.
- No REST endpoint for user notification inbox, read/unread state changes, or pagination.
- Socket broadcasts are global (`server.emit`) and not scoped to rooms/users, risking cross-user leakage.
- No delivery retries, push provider integration (APNs/FCM), or notification preference management.

### 6) Users and profile capabilities missing

- Only `/me` read endpoint exists; no profile update, password reset/change, account state controls.
- XP/prestige model is simplistic; no XP ledger/audit trail.
- No anti-fraud/account risk signals (device/IP/session tracking).

### 7) Board lifecycle and operations gaps

- Board creation always sets status to `LIVE`; no scheduling or admin transitions (`UPCOMING` -> `LIVE` -> `FULL` -> `COMPLETED`).
- No update/archive/delete endpoints for boards.
- No board-level analytics endpoint (fill rate, conversion, revenue).
- Redis cache invalidation is incomplete (`boards:list` cache is set but not invalidated on create/update).

### 8) Winners and fairness controls

- Winner selection uses `Math.random()` without cryptographic strength or auditable RNG strategy.
- No reroll/dispute flow or immutable winner confirmation pipeline.
- No public fairness proof artifacts beyond raw stored JSON string.

### 9) Persistence and migration maturity

- SQL migration only creates UUID extension; table definitions rely on `synchronize: true`.
- Production-safe migration history and rollback scripts are missing.
- No explicit DB constraints for key business invariants (e.g., unique entry rules, indexed status queries).

### 10) Observability, resiliency, and operations

- No structured logging, request correlation IDs, metrics, tracing, or audit logs.
- No global exception filter mapping domain errors to stable API responses.
- No health/readiness endpoints for infrastructure checks.
- Redis and Stripe failures are not gracefully degraded with retries/circuit-breakers.

### 11) Security and platform protections

- No CORS origin restrictions strategy per environment.
- No CSRF consideration for webhook/admin workflows where relevant.
- No API throttling, abuse prevention, or bot mitigation for high-value sweepstakes actions.
- No secrets validation policy at startup (required env var enforcement).

### 12) Product integration gaps (backend vs clients)

- Admin pages are static placeholders and have no authenticated backend integration for dashboard metrics, board creation, or winner management.
- Flutter API client is effectively a base URL holder and does not implement typed calls for auth, boards, entries, payments, winners, and notifications.
- Missing backend endpoints to satisfy likely admin widgets:
  - aggregate KPI metrics,
  - event feed/history,
  - board detail drill-down with entries/payment status,
  - winner moderation workflow.

## Suggested implementation priority (high to medium)

1. Enforce payment + entry invariants with DB transaction + locking and proper status checks.
2. Secure payments webhook with Stripe signature verification + idempotency.
3. Replace header-based admin auth with role-based JWT guards.
4. Implement DTO validation for all write endpoints and standardized error responses.
5. Add notification persistence/read APIs + scoped socket rooms.
6. Add migration-driven schema management and remove `synchronize: true` for non-dev environments.
7. Add observability baseline (health checks, structured logs, metrics).
