# AI Working Guide

This file is the required context for any AI agent or teammate making code changes in this repository.

## Project Summary

The project is an ERP-style rental system for Vietnamese traditional costumes and Ao Dai, with planned AI virtual try-on and AI-assisted damage detection.

Architecture:

```text
frontend/   Next.js + TypeScript + TailwindCSS
backend/    Node.js + NestJS + REST API + Prisma
supabase/   Supabase PostgreSQL SQL migrations and seed data
docs/       Project and team documentation
```

Runtime flow:

```text
Next.js frontend -> NestJS backend -> Supabase PostgreSQL
```

Supabase is used as the managed PostgreSQL database. The frontend must not connect directly to Supabase for business operations.

## Required Context Before Coding

Before implementing any task, read these files:

```text
README.md
docs/ai-working-guide.md
docs/module-boundaries.md
docs/api-contract.md
docs/database-schema-mvp.md
docs/testing.md
```

Then inspect the target module files before editing.

Examples:

Auth task:

```text
backend/src/modules/auth/
frontend/src/app/(auth)/
backend/prisma/schema.prisma
```

Catalog task:

```text
backend/src/modules/garments/
frontend/src/app/catalog/
frontend/src/lib/api.ts
```

Booking task:

```text
backend/prisma/schema.prisma
docs/api-contract.md
docs/database-schema-mvp.md
```

## Non-Negotiable Rules

1. Search existing code before creating new files.
2. Reuse existing patterns, helpers, services, DTOs, response formats, and API clients.
3. Do not create duplicate modules, services, API clients, Prisma services, or response helpers.
4. Do not modify `backend/prisma/schema.prisma` unless the task explicitly requires a database change.
5. Do not add dependencies unless there is a clear reason and the existing stack cannot solve the problem.
6. Do not call Supabase directly from the frontend for business operations.
7. Do not change global architecture without team lead approval.
8. Keep changes scoped to the assigned module.
9. Add or update Vitest tests for new logic.
10. Run the relevant typecheck and tests before reporting completion.

## Existing Shared Code To Reuse

Backend:

```text
backend/src/common/api-response.ts
backend/src/prisma/prisma.service.ts
backend/src/prisma/prisma.module.ts
```

Frontend:

```text
frontend/src/lib/api.ts
frontend/src/lib/sample-data.ts
```

Testing:

```text
frontend/vitest.config.ts
backend/vitest.config.ts
frontend/src/test/setup.ts
```

## API Response Standard

Successful response:

```ts
{
  success: true,
  data: {},
  message?: string
}
```

Error response:

```ts
{
  success: false,
  error: "ERROR_CODE",
  message: "Human readable message"
}
```

Use `backend/src/common/api-response.ts` for backend success responses.

Do not introduce alternative response shapes such as:

```ts
{ ok: true }
{ status: "success" }
{ result: data }
```

## Backend Module Pattern

Use NestJS module structure:

```text
backend/src/modules/{module}/
  {module}.module.ts
  {module}.controller.ts
  {module}.service.ts
  dto/
  *.spec.ts
```

Do not create unrelated global folders like:

```text
backend/src/controllers/
backend/src/services/
backend/src/api/
```

unless the whole team decides to refactor the architecture.

## Frontend Pattern

Use:

```text
frontend/src/app/
frontend/src/components/
frontend/src/lib/
```

Frontend API calls must go through:

```text
frontend/src/lib/api.ts
```

Do not create another API client such as:

```text
axiosClient.ts
fetcher.ts
api-client-new.ts
request.ts
```

If module-specific API functions are needed, create them under a consistent structure only after team approval, for example:

```text
frontend/src/lib/api/bookings.ts
frontend/src/lib/api/garments.ts
```

## Database Rules

The rental domain depends on physical assets, not only product templates.

Important models:

```text
Garment         = product/template
GarmentAsset    = physical rentable item
Booking         = rental order
BookingItem     = item inside booking, optionally assigned to a GarmentAsset
```

The most important business rule:

```text
A single GarmentAsset must not be double-booked for overlapping rental dates.
```

Booking availability must be enforced in backend/database logic, not only in frontend UI.

## Testing Rules

Use Vitest.

Frontend:

```bash
pnpm --dir frontend test
pnpm --dir frontend typecheck
```

Backend:

```bash
pnpm --dir backend test
pnpm --dir backend typecheck
```

Root:

```bash
pnpm test
```

Add tests for:

- auth validation
- booking availability
- asset lifecycle transitions
- penalty/refund calculations
- API helpers
- components with non-trivial UI logic

## Prompt Template For AI Agents

Use this prompt when asking an AI to work on this repo:

```text
You are working in an existing graduation project codebase.

Project:
ERP rental system for Vietnamese traditional costumes and Ao Dai with planned AI virtual try-on.

Architecture:
- frontend: Next.js + TypeScript + TailwindCSS
- backend: NestJS + REST API + Prisma
- database: Supabase PostgreSQL
- package manager: pnpm

Before coding:
1. Read README.md.
2. Read docs/ai-working-guide.md.
3. Read docs/module-boundaries.md.
4. Read docs/api-contract.md.
5. Inspect existing files in the target module.
6. Reuse existing services, DTOs, helpers, API clients, response format, and naming conventions.
7. Do not create duplicate code.
8. Do not modify Prisma schema unless required.
9. Do not add dependencies unless necessary.
10. Add or update Vitest tests.
11. Run relevant typecheck and tests.

Task:
[WRITE THE TASK HERE]

Expected output:
- Implement only the required module.
- List changed files.
- Explain how existing code was reused.
- Provide test commands and results.
```