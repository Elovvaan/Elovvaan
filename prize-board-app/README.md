# Swipe2Win App (Monorepo MVP)

This repository contains a runnable MVP for a sweepstakes board platform.

## Structure

- `backend/` NestJS API with PostgreSQL, Redis, JWT, Stripe, Socket.IO
- `mobile/` Flutter mobile client skeleton
- `admin/` Next.js + Tailwind admin dashboard
- `infra/` Docker compose setup
- `docs/` architecture notes

## Quick start

```bash
cd infra
docker compose up --build
```

Backend: `http://localhost:3000/api`
Admin: `http://localhost:3001`

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/boards`
- `GET /api/boards/:id`
- `POST /api/boards` (admin key header)
- `POST /api/boards/:id/enter`
- `POST /api/payments/create-intent`
- `POST /api/payments/webhook`
- `GET /api/boards/:id/winner`

## Environment Variables

See `backend/.env.example`.

## Testing

```bash
cd backend
npm install
npm test
```
## Additional Documentation

- `docs/architecture.md`
- `docs/app-overview.md`

