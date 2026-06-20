# Co Phuc Rental ERP

ERP rental system for small and medium Vietnamese traditional costume and Ao Dai rental stores, with planned AI virtual try-on and AI-assisted damage detection.

## Architecture

```text
frontend/   Next.js + TypeScript + TailwindCSS
backend/    Node.js + NestJS + REST API + Prisma
supabase/   Supabase PostgreSQL migrations and seed SQL
docs/       Project, API, testing, and AI collaboration docs
```

Runtime flow:

```text
Next.js frontend -> NestJS REST API -> Supabase PostgreSQL
```

Supabase is used as managed PostgreSQL. The Node.js backend owns auth, roles, booking, payment, inspection, and sensitive business logic.

## MVP Tech Stack

- Frontend: Next.js, TypeScript, TailwindCSS
- Backend: Node.js, NestJS, RESTful API
- Database: Supabase PostgreSQL
- ORM: Prisma
- Auth: backend-owned JWT + RBAC
- Testing: Vitest
- AI: FastAPI/PyTorch planned after MVP skeleton
- Payment: mock first, VNPay/MoMo sandbox later

## Setup Frontend

```bash
cd frontend
pnpm install
copy .env.example .env.local
pnpm dev
```

Frontend URL:

```text
http://localhost:3000
```

Set `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=replace-with-google-client-id
```

## Setup Backend

```bash
cd backend
pnpm install
copy .env.example .env
pnpm dev
```

`pnpm dev` in `backend/` runs:

```bash
prisma generate && nest start --watch
```

Backend URL:

```text
http://localhost:4000/api
```

Set `backend/.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=replace-with-google-client-id
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Put it into `backend/.env` as `DATABASE_URL`.
4. Run SQL files in Supabase SQL Editor in this order:

```text
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_backend_security_notes.sql
supabase/migrations/003_seed_catalog.sql
```

## Root Scripts

```bash
pnpm dev:frontend
pnpm dev:backend
pnpm build:frontend
pnpm build:backend
pnpm typecheck:frontend
pnpm typecheck:backend
pnpm lint:frontend
pnpm lint:backend
pnpm test:frontend
pnpm test:backend
pnpm test
```

## Current Routes

Frontend:

- `/`
- `/catalog`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/dashboard`
- `/dashboard/customer`
- `/dashboard/staff`
- `/dashboard/manager`
- `/dashboard/admin`

Backend:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/google`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `GET /api/auth/me`
- `GET /api/garments`

## Required Docs For AI/Team Work

AI agents and teammates must read these before coding:

- [AI Working Guide](docs/ai-working-guide.md)
- [Module Boundaries](docs/module-boundaries.md)
- [API Contract](docs/api-contract.md)
- [Pull Request Checklist](docs/pull-request-checklist.md)
- [Testing Guide](docs/testing.md)
- [CI/CD](docs/ci-cd.md)

Project reference docs:

- [Project Production Use Case Spec](docs/project-production-usecase-spec.md)
- [Tech Stack MVP](docs/tech-stack-mvp.md)
- [Database Schema MVP](docs/database-schema-mvp.md)
- [Supabase Setup](docs/setup-supabase.md)
- [Team Task Breakdown](docs/team-task-breakdown.md)