# Swipe2Win Launch Readiness Checklist

## 1) Frontend integration validation

- [x] Realtime board events (`board_progress`, `board_fill_update`, `board_update`, `entry_added`, `board_full`) refresh board cards and show board-full state in UI.
- [x] Wallet ledger is rendered on user dashboard from `/api/wallet/ledger`.
- [x] Winner events (`winner_selected`) trigger winner banner updates in dashboard.
- [x] Notifications page now consumes persisted notifications and subscribes to live `push_notification` events.

## 2) Branding implementation

- [x] Added Swipe2Win logo treatment in frontend navbar and admin sidebar.
- [x] Applied purple/teal Swipe2Win colors across frontend, website, and admin global styles.
- [x] Added favicon and metadata updates for frontend (`index.html`), website (`Metadata`), and admin (`Metadata`).
- [x] Updated website brand palette to match app/admin theme.

## 3) End-to-end test scenarios (manual + automated readiness)

Full launch flow to validate during smoke testing:

1. Signup
2. Purchase credits / payment intent
3. Join board
4. Fill board to full capacity
5. Winner selected event emitted
6. Claim flow + winner confirmation
7. Wallet ledger updated
8. Notification appears in realtime UI

Suggested command for local stack validation:

```bash
cd prize-board-app/infra && docker compose up --build
```

## 4) Deployment readiness

- [x] Environment validation enforces DB, JWT secret, and Redis configuration.
- [x] Stripe webhook route is configured with raw body parsing (`/payments/webhook` + `/api/payments/webhook`).
- [x] Worker bootstrap starts queue loops and heartbeat registration.
- [x] `/api/health` checks DB, Redis, queue runtime, worker heartbeat, and queue backlog.

