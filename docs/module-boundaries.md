# Module Boundaries

This file defines ownership boundaries so teammates and AI agents do not overwrite or duplicate each other.

## Team Ownership

| Owner | Main Scope | Avoid Touching |
|---|---|---|
| Tech Lead | architecture, Prisma schema, booking rules, API contract, review | large UI polish unless needed |
| Member 1 | auth, users, profile, role guards | booking/payment core |
| Member 2 | catalog, garment, garment asset, asset lifecycle | auth/payment core |
| Member 3 | booking, availability, double-booking prevention | AI and unrelated UI |
| Member 4 | staff operation, inspection, penalty, refund, financial management | auth/catalog core |
| Member 5 | AI try-on, image flow, damage detection, UI integration, tests | booking core without review |

The Tech Lead owns final review for:

- `backend/prisma/schema.prisma`
- booking availability logic
- API contract changes
- shared helpers
- package/dependency changes

## Backend Boundaries

Current modules:

```text
backend/src/modules/auth/
backend/src/modules/garments/
backend/src/modules/health/
backend/src/prisma/
backend/src/common/
```

Planned modules:

```text
backend/src/modules/users/
backend/src/modules/bookings/
backend/src/modules/assets/
backend/src/modules/payments/
backend/src/modules/inspections/
backend/src/modules/reports/
backend/src/modules/ai/
```

Rules:

- Put business logic in service classes.
- Put HTTP routing in controller classes.
- Put validation DTOs under `dto/`.
- Reuse `PrismaService` from `backend/src/prisma/prisma.service.ts`.
- Reuse `ok()` from `backend/src/common/api-response.ts`.
- Do not create a second Prisma client service.
- Do not create a second response helper.

## Frontend Boundaries

Current frontend structure:

```text
frontend/src/app/
frontend/src/components/
frontend/src/lib/
```

Rules:

- Route pages live under `frontend/src/app/`.
- Reusable UI components live under `frontend/src/components/`.
- Shared utilities and API helpers live under `frontend/src/lib/`.
- Use `frontend/src/lib/api.ts` for backend requests.
- Do not call Supabase directly from frontend business screens.

## Database Boundary

Do not edit database schema casually.

Files requiring Tech Lead review:

```text
backend/prisma/schema.prisma
supabase/migrations/*.sql
```

Schema changes must include:

- reason for change
- affected modules
- migration or SQL update
- Prisma update
- tests or verification steps

## Dependency Boundary

Do not add new dependencies without justification.

Before adding a dependency, answer:

1. Can this be done with existing code or platform APIs?
2. Is the dependency maintained and necessary?
3. Does it affect frontend, backend, or both?
4. Does it need documentation or setup changes?

## High-Risk Areas

Always request review for:

- booking availability and date overlap logic
- payment status and webhook logic
- refund and penalty calculations
- asset status transitions
- JWT auth and role guards
- file upload and AI image handling
- Prisma schema changes