# Swipe2Win Rebuild (MVP)

## Phase 1: Folder Structure

```txt
swipe2win/
  apps/
    api/      # NestJS + Prisma + PostgreSQL
    web/      # Next.js user-facing app
    admin/    # Next.js admin dashboard
```

### Architecture (brief)
- **API**: NestJS REST service with JWT auth, role guard, Prisma persistence, Swagger docs.
- **Database**: PostgreSQL with Prisma models: User, Board, BoardCell, Entry.
- **Web**: Next.js app for registration, login, boards, claims, and user entries.
- **Admin**: Next.js app for board management, users view, and board entry inspection.

## Prisma Schema
- Located in `apps/api/prisma/schema.prisma`.
- Includes required enums (`Role`, `BoardStatus`) and models (`User`, `Board`, `BoardCell`, `Entry`).

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+

### Install
```bash
pnpm install
```

### Configure env files
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

### Run database migrations + generate client
```bash
pnpm --filter @swipe2win/api prisma:generate
pnpm --filter @swipe2win/api prisma:migrate
```

### Seed sample data
```bash
pnpm --filter @swipe2win/api prisma:seed
```

### Start all apps
```bash
pnpm dev
```

- API: http://localhost:3001
- API docs: http://localhost:3001/docs
- Web: http://localhost:3000
- Admin: http://localhost:3002

## Build commands
```bash
pnpm build
pnpm --filter @swipe2win/api start
pnpm --filter @swipe2win/web start
pnpm --filter @swipe2win/admin start
```

## Deployment Notes

### API on Railway
1. Create Railway project from repo.
2. Set root service path to `apps/api`.
3. Add env vars from `apps/api/.env.example`.
4. Build command: `pnpm install --frozen-lockfile && pnpm build`.
5. Start command: `pnpm start`.
6. Run `pnpm prisma:deploy && pnpm prisma:seed` one-time or via deploy job.

### Web/Admin on Vercel
1. Create Vercel project for `apps/web` and another for `apps/admin`.
2. Framework preset: Next.js.
3. Set env var `NEXT_PUBLIC_API_URL` to deployed API URL.
4. Build command default (`next build`) works.

## MVP Verification Checklist
- [ ] `GET /health` returns `{ "status": "ok" }`
- [ ] User can register/login and call `/auth/me`
- [ ] Authenticated user can list boards and claim available cells
- [ ] Claim creates an entry and increments filled cells
- [ ] User can view `/users/me/entries`
- [ ] Admin can create/update boards and list users/board entries
