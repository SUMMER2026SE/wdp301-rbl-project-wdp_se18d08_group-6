# Testing

Vitest is configured for both frontend and backend.

## Frontend

Location: `frontend/`

```bash
pnpm test
pnpm test:watch
```

Frontend tests use:

- Vitest
- jsdom
- React Testing Library
- jest-dom matchers

Config file:

```text
frontend/vitest.config.ts
```

## Backend

Location: `backend/`

```bash
pnpm test
pnpm test:watch
```

Backend tests use Vitest with the Node environment.

Config file:

```text
backend/vitest.config.ts
```

## Root commands

From repository root:

```bash
pnpm test:frontend
pnpm test:backend
pnpm test
```

Use `pnpm test` only after both frontend and backend dependencies are installed.