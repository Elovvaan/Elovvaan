# Swipe2Win MVP Audit and Implementation Plan

## Phase 1 — Audit

### Current structure snapshot
- `prize-board-app/backend`: NestJS modular monolith with TypeORM + PostgreSQL, JWT auth, Stripe webhook, Redis queue wrappers.
- `prize-board-app/admin`: Next.js admin dashboard shell.
- `prize-board-app/website`: Next.js marketing site.
- `prize-board-app/mobile`: Flutter starter.
- `prize-board-app/infra`: Docker Compose and deployment manifests.

### Working areas
- Basic auth register/login and protected API routes.
- Board listing/entry flow and payment intent creation.
- Stripe webhook endpoint wired to queue flow.
- Admin and website apps are runnable foundations.

### Highest-priority gaps and risks
1. **Security/auth hardening gap**: no refresh session lifecycle, weak env validation.
2. **Payment idempotency risk**: webhook duplicate replay handling is limited to single field on `payments`.
3. **Auditability gap**: no durable audit trail for sensitive actions.
4. **DB reliability risk**: TypeORM `synchronize: true` in all environments.
5. **Target architecture mismatch**: structure is multi-app, but not yet aligned to `apps/*` + `packages/*` convention.

### Keep / Refactor / Rewrite / Defer
- **Keep**: existing modular backend modules, queue integration, current app surfaces (admin/web/mobile skeletons).
- **Refactor**: auth token/session model, payment event processing, env/config validation, docs and repo map.
- **Rewrite (only where required)**: none mandatory for immediate MVP launch path.
- **Defer (post-MVP)**: full TypeORM→Prisma migration, deep analytics pipelines, expanded anti-fraud subsystem, service decomposition.

## Phase 2 — Priority plan
1. Harden auth (refresh token sessions + revocation).
2. Add configuration validation and production-safe DB defaults.
3. Introduce `payment_events` idempotency record and processing state tracking.
4. Add `audit_logs` support and log critical auth/payment actions.
5. Update environment templates and implementation docs.
6. Validate with tests/build.

## Phase 3+4 execution status
- Completed in this iteration:
  - Refresh sessions and token rotation endpoints.
  - Payment event idempotency table + processing completion markers.
  - Global audit logging service and auth/payment audit hooks.
  - Environment validation and production `synchronize` safety guard.
  - Updated env template and docs.

## Phase 5 docs status
- This file provides the audit and execution plan baseline.
- Existing architecture/deploy docs remain valid and should be incrementally updated as modules expand.
