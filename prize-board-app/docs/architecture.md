# Swipe2Win MVP Architecture

- **Backend (NestJS):** REST + Socket.IO API, Stripe payment intents, TypeORM/PostgreSQL persistence.
- **Mobile (Flutter):** JWT auth, board browsing/entry, winner updates via WebSocket.
- **Admin (Next.js):** board operations and winner oversight.
- **Infra:** Docker compose for local development with PostgreSQL and Redis.
