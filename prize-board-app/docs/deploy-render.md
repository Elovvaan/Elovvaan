# Deploying Swipe2Win online (Render)

This project can be deployed online using [Render Blueprints](https://render.com/docs/blueprint-spec).

## 1) Push your repo to GitHub

Render deploys from a Git repo, so commit and push this repository first.

## 2) Update `render.yaml`

Before creating the blueprint:

- Replace `https://github.com/your-org/your-repo` with your real repo URL.
- Optionally rename services if those names are already in use.
- (Recommended) change `API_BASE_URL` and `NEXT_PUBLIC_API_BASE_URL` to your backend URL after first deploy.

## 3) Create a Blueprint on Render

1. In Render, click **New +** → **Blueprint**.
2. Select your GitHub repo.
3. Render will detect `prize-board-app/render.yaml`.
4. Confirm service creation:
   - `prize-board-backend` (web, Docker)
   - `prize-board-worker` (worker, Docker)
   - `prize-board-admin` (web, Node)
   - `prize-board-redis` (Redis)
   - `prize-board-postgres` (PostgreSQL)

## 4) Set required secrets

In the Render dashboard, set real production values for:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `FIREBASE_SERVER_KEY`

`JWT_SECRET` is auto-generated for backend in the blueprint.

## 5) Verify deployment

After deploy completes:

- Backend API: `https://<your-backend-service>.onrender.com/api`
- Admin UI: `https://<your-admin-service>.onrender.com`

Quick checks:

- `GET /api/boards`
- `POST /api/auth/register`
- Admin login flow through `/api/auth/login` route

## Notes

- The backend now supports Render's dynamic port binding via `process.env.PORT`.
- The worker shares the same image and uses `npm run start:worker`.
