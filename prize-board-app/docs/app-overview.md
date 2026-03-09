# Swipe2Win App Overview

This document provides a practical overview of the MVP and a request-flow walkthrough from user actions to backend processing.

## What this app is

Swipe2Win is a sweepstakes board platform organized as a monorepo with four parts:

- `backend/` - NestJS API (auth, boards, entries, payments, winners, notifications)
- `mobile/` - Flutter client skeleton
- `admin/` - Next.js admin dashboard
- `infra/` - Docker Compose stack (Postgres, Redis, backend, admin)

## High-level architecture

- **Backend (NestJS)**
  - Runs under `/api`
  - Uses TypeORM + PostgreSQL for persistence
  - Uses Redis for caching/infra support
  - Uses JWT for auth and Socket.IO for real-time events
- **Mobile (Flutter)**
  - Route-based app shell for login/register/home/boards/winner/profile/notifications
  - Calls backend REST API via Dio
- **Admin (Next.js)**
  - Dashboard, boards, winners pages for operators
  - Current MVP pages are scaffold-level placeholders
- **Infra**
  - One command boot via Docker Compose

## Core backend modules

- **Auth**: register/login and JWT issuance
- **Boards**: list boards, get board by ID, create board (admin key header)
- **Entries**: enter a board with a user and payment reference
- **Payments**: create payment intent and process webhook completion
- **Winners**: read winner for a board
- **Notifications**: broadcasts updates over Socket.IO

## Main data entities

- **User**: account identity used for auth and ownership
- **Board**: prize listing with status and available spots
- **Entry**: a user participation record in a board
- **Payment**: payment lifecycle tracking for entry purchases
- **Winner**: selected winner record for a completed board
- **Notification**: persisted event/notification data

## Request-flow walkthrough

### 1) User registration/login

1. Mobile app posts credentials to `POST /api/auth/register` or `POST /api/auth/login`.
2. Backend validates input and credentials.
3. Backend returns a JWT access token.
4. Mobile stores token and uses it for authenticated requests.

### 2) Browse available boards

1. Mobile calls `GET /api/boards`.
2. Backend returns board list with status + spots metadata.
3. User opens a board using `GET /api/boards/:id`.

### 3) Enter a board (payment + entry)

1. Mobile requests a payment intent via `POST /api/payments/create-intent`.
2. Payment provider confirms payment; backend receives `POST /api/payments/webhook`.
3. Mobile (or backend workflow) submits entry to `POST /api/boards/:id/enter`.
4. Backend creates entry, increments board occupancy, and may mark board full.
5. Notifications gateway emits events like `entry_added` / `board_full`.

### 4) Winner resolution

1. When board closes, winner selection is recorded (module workflow).
2. Winner event is broadcast via Socket.IO (`winner_selected`).
3. Clients fetch winner data via `GET /api/boards/:id/winner`.

## Local runbook

```bash
cd prize-board-app/infra
docker compose up --build
```

- Backend API: `http://localhost:3000/api`
- Admin UI: `http://localhost:3001`

## MVP maturity snapshot

- Backend contains primary domain/API scaffolding and persistence wiring.
- Mobile and Admin are wired but still UI-skeleton heavy.
- This is a solid foundation for iterative feature hardening (auth guards, richer admin workflows, end-to-end payment orchestration, and production-grade observability).
