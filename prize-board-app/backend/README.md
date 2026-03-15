# Swipe2Win Backend

NestJS backend for Swipe2Win with PostgreSQL, Redis-backed queue workers, Stripe payments, and Socket.IO realtime notifications.

## Setup

```bash
npm install
cp .env.example .env
npm run build
npm run start:dev
```

Worker process (required for queues):

```bash
npm run build
npm run start:worker
```

## Health and readiness

- `GET /api/health` returns readiness for:
  - DB connectivity
  - Redis connectivity
  - queue runtime and worker heartbeats

## Environment variables

Required:

- `DATABASE_URL`
- `JWT_SECRET` (>= 32 chars)
- `REDIS_URL` **or** `QUEUE_REDIS_URL`

Core:

- `PORT`
- `NODE_ENV`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL_DAYS`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FIREBASE_SERVER_KEY`

Observability:

- `SENTRY_DSN` (optional; enables sentry-ready exception capture hook)

## Realtime events

Socket events emitted by backend gateway include:

- `entry_added`
- `board_update`
- `winner_selected`
- `xp_updated`

## Admin safety endpoints

All admin endpoints require JWT + admin guard.

- `PATCH /api/admin/users/:id/suspend`
- `POST /api/admin/users/:id/wallet-adjustments`
- `POST /api/admin/users/:id/fraud-notes`
- `GET /api/admin/users/:id/fraud-notes`
- `GET /api/admin/transactions/lookup`

## Analytics queue behavior

- `POST /api/admin/analytics/aggregate` enqueues `aggregate-daily-metrics`
- worker consumes analytics jobs and upserts `daily_metrics`
- payment and winner flows emit analytics events (`payment_succeeded`, `winner_selected`, etc.)
