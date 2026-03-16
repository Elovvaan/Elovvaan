# Swipe2Win MVP Rebuild

## 1) Proposed Architecture

### Stack
- Frontend: Next.js 14 + TypeScript + TailwindCSS
- Backend: NestJS 10 + TypeScript
- Database: PostgreSQL + Prisma
- Cache-ready layer: Redis (env/config ready)
- Auth: JWT access tokens + refresh tokens persisted in DB
- State management: React Query + server/component local state

### Monorepo Layout
```txt
apps/
  api/                # NestJS API
    prisma/
      schema.prisma
      seed.ts
    src/
      auth/
      users/
      wallet/
      boards/
      challenges/
      arena/
      recommendations/
      profiles/
      leaderboard/
      common/
      prisma/
  web/                # Next.js mobile-first app
    src/app/
      auth/login
      auth/register
      onboarding
      arena
      boards
      boards/[id]
      challenges/[id]
      create
      profile
      wallet
      page.tsx        # Swipe home feed
    src/components/
      bottom-nav.tsx
      swipe-card.tsx
```

### System Design
- Modular REST backend with isolated service layers per domain.
- Prisma models structured for transactional wallet/entry/payout workflows.
- Deterministic recommendation scoring for MVP AI layer.
- Feed/arena endpoints designed for future ranking pipelines and realtime events.
- UI organized around mobile-first bottom-nav architecture and swipe cards.

## 2) Database Schema Design

Prisma models include:
- Auth/User: `User`, `Profile`, `RefreshToken`
- Wallet: `Wallet`, `WalletTransaction`
- Boards: `Board`, `BoardEntry`, `BoardPrize`
- Challenges: `Challenge`, `ChallengeParticipant`, `ChallengeResult`
- Discovery: `Category`, `Tag`, `FeaturedContent`, `SavedItem`
- AI/Recommendation: `UserSkillProfile`, `UserPreference`, `MatchmakingScore`, `ChallengeRecommendation`, `UserRivalry`, `UserBehaviorEvent`

See full schema in `apps/api/prisma/schema.prisma`.

## 3) API Modules + Endpoints

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`
- User: `/users/me`
- Wallet: `/wallet`, `/wallet/transactions`, `/wallet/deposit`, `/wallet/withdraw`
- Boards: `/boards`, `/boards/:id`, `/boards/:id/join`
- Challenges: `/challenges`, `/challenges/:id`, `/challenges/:id/accept`
- Arena: `/arena/feed`
- Recommendations: `/recommendations/home`, `/recommendations/boards`, `/recommendations/challenges`
- Profile: `/profile/me`
- Leaderboard scaffold: `/leaderboard`

## 4) Frontend Screens

Implemented routes:
- `/` (swipe home feed)
- `/arena`
- `/boards`
- `/boards/[id]`
- `/challenges/[id]`
- `/create`
- `/profile`
- `/wallet`
- `/onboarding`
- `/auth/login`
- `/auth/register`

## 5) Setup Instructions

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+
- Redis (optional for now, required for future queue/caching)

### Install
```bash
pnpm install
```

### Configure env
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### Prisma + seed
```bash
pnpm --filter @swipe2win/api prisma:generate
pnpm --filter @swipe2win/api prisma:migrate
pnpm --filter @swipe2win/api prisma:seed
```

### Run
```bash
pnpm dev
```

- API: http://localhost:3001
- API docs: http://localhost:3001/docs
- Web: http://localhost:3000

## 6) Phased Build Strategy Mapping
- Phase 1: foundation/auth/profile/wallet ✅ scaffolded
- Phase 2: boards + join + transaction integration ✅ scaffolded
- Phase 3: 1v1 challenges + accept + results + history ✅ scaffolded
- Phase 4: arena directory + sections + discovery endpoint ✅ scaffolded
- Phase 5: deterministic recommendation engine + ranked feeds ✅ scaffolded
- Phase 6: docs + seed + environment setup ✅ scaffolded

This codebase is now structured for future creator arenas, realtime events, anti-cheat workflows, payouts, notifications, and admin/ops services.
