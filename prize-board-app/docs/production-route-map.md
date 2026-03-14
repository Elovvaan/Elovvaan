# Production API Route Map

Base URL:

- `https://prize-board-backend-production-5ac2.up.railway.app/api`

Relative route paths:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /boards`
- `GET /boards/:id`
- `POST /boards/:id/enter`
- `GET /boards/:id/activity`

Controller mapping in backend source:

- `HealthController` → `/health`
- `AuthController` → `/auth/register`, `/auth/login`
- `BoardsController` → `/boards`, `/boards/:id`, `/boards/:id/activity`
- `EntriesController` → `/boards/:id/enter`

Notes:

- `main.ts` sets Nest global prefix to `api`, which makes all listed paths relative to `/api`.
- `HealthController` is registered in `AppModule`.
