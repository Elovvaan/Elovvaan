# Local PR + End-to-End Sweepstakes Runbook

This runbook covers the exact workflow requested:

1. Pull the PR locally
2. Install dependencies on your local machine
3. Run the admin dashboard
4. Run the Docker stack
5. Connect the mobile app to the local backend
6. Test the full sweepstakes loop end-to-end

## 1) Pull the PR locally

```bash
git fetch origin
git checkout <pr-branch>
git pull --ff-only
```

If you're checking out by PR number from GitHub:

```bash
git fetch origin pull/<PR_NUMBER>/head:pr-<PR_NUMBER>
git checkout pr-<PR_NUMBER>
```

## 2) Install dependencies

From repo root:

```bash
cd prize-board-app
cd backend && npm install && cd ..
cd admin && npm install && cd ..
cd mobile && flutter pub get && cd ..
```

## 3) Run admin dashboard locally

```bash
cd prize-board-app/admin
npm run dev
```

Expected URL: `http://localhost:3001`

## 4) Run Docker stack

```bash
cd prize-board-app/infra
docker compose up --build
```

Expected services:
- Backend API: `http://localhost:3000/api`
- Admin UI: `http://localhost:3001`
- Postgres + Redis available to backend via compose network

## 5) Connect mobile app to local backend

The mobile app now supports a `--dart-define` override for backend URL via `API_BASE_URL`.

### Android emulator

```bash
cd prize-board-app/mobile
flutter run --dart-define API_BASE_URL=http://10.0.2.2:3000/api
```

### iOS simulator (Mac)

```bash
flutter run --dart-define API_BASE_URL=http://localhost:3000/api
```

### Physical device

Use your machine LAN IP:

```bash
flutter run --dart-define API_BASE_URL=http://<YOUR_LAN_IP>:3000/api
```

## 6) Full sweepstakes loop (manual E2E)

Use this test flow:

1. Register user in mobile app.
2. Login and capture auth token.
3. Create board from admin (or via API with admin key).
4. Initiate payment intent.
5. Submit payment webhook completion.
6. Enter board.
7. Fill board to capacity (repeat entries).
8. Verify winner endpoint.
9. Verify notification/winner UI states in mobile and admin.

### API sanity checks (optional)

```bash
# list boards
curl http://localhost:3000/api/boards

# register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'
```

