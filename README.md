# Elovvaan Workspace

Main deliverable is available at `prize-board-app/`.

## Render deployment (Blueprint)

Render now auto-detects the blueprint at the repository root via `./render.yaml`.

### Services configured

- `prize-board-backend` (Docker: `prize-board-app/backend/Dockerfile`)
- `prize-board-admin` (Docker: `prize-board-app/admin/Dockerfile`)
- `prize-board-worker` (Docker: `prize-board-app/worker/Dockerfile`, backend worker command)
- `prize-board-redis`
- `prize-board-postgres`

### How to deploy on Render

1. In Render, create a **Blueprint** deployment from this repository.
2. Keep the default root (repository root). Render discovers `render.yaml` automatically.
3. Apply the blueprint and add required secret env vars when prompted (`STRIPE_*`, `FIREBASE_SERVER_KEY`, etc.).

> The root `.renderignore` reduces scan scope so Render focuses on `render.yaml` and `prize-board-app/` only.

## Local development

1. Start the local stack:

   ```bash
   cd prize-board-app/infra
   docker compose up --build
   ```

2. Verify core services:
   - Backend API: `http://localhost:3000/api`
   - Admin UI: `http://localhost:3001`

3. Run backend tests before feature work:

   ```bash
   cd prize-board-app/backend
   npm install
   npm test
   ```
