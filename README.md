# Swipe2Win Rebuild Foundation (Phase 1 + Phase 2)

This repository now focuses on the foundation rebuild only:
- **Phase 1:** monorepo baseline, auth, users/profile, wallet
- **Phase 2:** boards module, board listing/details, and board join flow

Advanced AI/recommendations/creator-economy modules are intentionally deferred.

## Monorepo structure

```txt
apps/
  api/                      # NestJS backend
    prisma/
      schema.prisma         # Prisma models
      seed.ts               # Local seed script
    src/
      app.module.ts
      auth/
      users/
      profiles/
      wallet/
      boards/
      prisma/
      common/
      health/

  web/                      # Next.js frontend
    src/app/
      page.tsx              # Foundation landing
      auth/login/
      auth/register/
      boards/
      boards/[id]/
      profile/
      wallet/
    src/components/
      bottom-nav.tsx
      board-join-button.tsx
```

## Backend setup (NestJS)

Implemented modules:
- `AuthModule` (`/auth/register`, `/auth/login`, `/auth/refresh`)
- `UsersModule` (`/users/me`)
- `ProfilesModule` (`/profile/me`)
- `WalletModule` (`/wallet`, `/wallet/transactions`, `/wallet/deposit`, `/wallet/withdraw`)
- `BoardsModule` (`/boards`, `/boards/:id`, `/boards/:id/join`)

`AppModule` currently wires only the foundation + boards modules.

## Frontend setup (Next.js)

Implemented screens for this phase:
- `/` landing/start page
- `/auth/login`
- `/auth/register`
- `/boards`
- `/boards/[id]`
- `/profile`
- `/wallet`

The board detail screen supports joining a board via API token auth.

## Prisma schema (foundation-compatible)

Current schema includes foundational models used now and keeps compatibility for future phases:
- `User`, `Profile`, `RefreshToken`
- `Wallet`, `WalletTransaction`
- `Category`, `Board`, `BoardEntry`, `BoardPrize`

Future-phase models remain in schema for forward compatibility, but are not wired into runtime modules.

## Board join flow

`POST /boards/:id/join` performs, in one transaction:
1. Validate board is open and not full
2. Validate user has not already joined
3. Validate wallet and sufficient funds
4. Create `BoardEntry`
5. Increment `filledSpots` and mark board `FULL` when needed
6. Deduct wallet balance and write `WalletTransaction` (`ENTRY_FEE`)

## Seed data

`apps/api/prisma/seed.ts` now creates:
- categories (`FPS`, `Sports`, `Strategy`)
- demo user (`demo@swipe2win.app` / `Passw0rd!`)
- demo profile + wallet
- 3 open boards for local testing

## Local setup instructions

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

### Install dependencies
```bash
pnpm install
```

### Environment variables
Create env files:

`apps/api/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swipe2win"
JWT_SECRET="dev-secret"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

`apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Prisma + seed
```bash
pnpm db:setup
```

### Run apps
```bash
pnpm dev:all
```

- API: http://localhost:3001
- Web: http://localhost:3000
- Admin: http://localhost:3002


## pnpm workspace recovery (install/build failures)

Run these from repository root if install/build is failing due to proxy/registry/package-manager drift.

```bash
# 1) verify toolchain
node -v
corepack enable
corepack prepare pnpm@9.12.2 --activate
pnpm -v

# 2) verify registries and local npm config
pnpm config get registry
npm config get registry
cat .npmrc
cat pnpm-workspace.yaml

# 3) clean mixed package-manager state (monorepo root + workspace apps)
find . -maxdepth 3 -name node_modules -type d -prune -exec rm -rf {} +
rm -f package-lock.json yarn.lock npm-shrinkwrap.json
rm -f apps/*/package-lock.json apps/*/yarn.lock apps/*/npm-shrinkwrap.json
rm -f pnpm-lock.yaml

# 4) install + build + run
pnpm install
pnpm build
pnpm dev
```

If your shell exports a broken proxy, clear it for the pnpm commands:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u npm_config_http_proxy -u npm_config_https_proxy pnpm install
```

Expected filters in this monorepo:

```bash
pnpm --filter @swipe2win/api build
pnpm --filter @swipe2win/web build
pnpm --filter @swipe2win/admin build
```

## First local runtime validation (after `pnpm install` works)

Run **all commands from repo root**:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:setup
```

Start services (separate shells, from root):

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:admin
```

Validation flow for recommendations and feed:

1. Register/login from web (`/auth/register` or `/auth/login`) to get a local session token.
2. Verify home recommendations API returns feed data (`GET /recommendations/home`) while authenticated.
3. Trigger interaction logging via UI actions (join/save/dismiss) and verify events are accepted (`POST /recommendations/events`).
4. Confirm boards list and board detail pages still work with seeded data.


Quick recommendation API smoke payload (`POST /recommendations/events`):

```json
{
  "eventType": "JOIN",
  "itemType": "BOARD",
  "itemId": "<board-or-challenge-id>",
  "metadata": { "categoryId": "<category-id>", "source": "home-feed" }
}
```

Expected minimum home response shape (`GET /recommendations/home`):

```json
{
  "metrics": {},
  "feed": [
    {
      "type": "BOARD",
      "score": 73.12,
      "item": { "id": "...", "title": "...", "category": { "id": "...", "name": "..." } }
    }
  ],
  "rankedBoards": [],
  "rankedChallenges": []
}
```

Manual QA checklist (ranked Home feed):

1. Home shows a loading message before the feed appears.
2. Home shows a friendly empty state when no feed items are returned.
3. Home still renders if one or more feed items are malformed (invalid items are dropped).
4. Clicking Join/Save/Dismiss logs an event; failed event logging shows a non-blocking warning.
5. Dismiss removes an item from the rendered list and ranking order stays score-descending.

Useful one-off root commands:

```bash
pnpm db:setup
pnpm --filter @swipe2win/api dev
pnpm --filter @swipe2win/web dev
```
