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
PORT=3001
```

`apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### Prisma + seed
```bash
pnpm --filter @swipe2win/api prisma:generate
pnpm --filter @swipe2win/api prisma:migrate
pnpm --filter @swipe2win/api prisma:seed
```

### Run apps
```bash
pnpm dev
```

- API: http://localhost:3001
- Web: http://localhost:3000


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
