# Elovvaan Workspace

Main deliverable is available at `prize-board-app/`.

## What's next

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
