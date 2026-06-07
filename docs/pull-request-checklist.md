# Pull Request Checklist

Use this checklist before asking for review or merging code.

## Required Checks

- [ ] I read `docs/ai-working-guide.md`.
- [ ] I inspected existing files in the target module before coding.
- [ ] I reused existing helpers, services, API client, and response format.
- [ ] I did not create duplicate services, DTOs, API clients, Prisma clients, or response helpers.
- [ ] I kept the change scoped to my assigned module.
- [ ] I did not modify `backend/prisma/schema.prisma` unless required.
- [ ] I did not add dependencies unless necessary.
- [ ] I added or updated Vitest tests for new logic.
- [ ] I ran relevant tests and typecheck.

## Commands

Frontend:

```bash
pnpm --dir frontend typecheck
pnpm --dir frontend test
pnpm --dir frontend build
```

Backend:

```bash
pnpm --dir backend typecheck
pnpm --dir backend test
pnpm --dir backend build
```

All tests:

```bash
pnpm test
```

## PR Description Template

```text
## Summary
- What changed?
- Which module is affected?

## Reuse / Duplication Check
- Existing files inspected:
- Existing helpers/services reused:
- New files added and why:

## API / DB Changes
- API contract changed: Yes/No
- Prisma schema changed: Yes/No
- Supabase SQL changed: Yes/No

## Tests
- Commands run:
- Result:

## Risks / Notes
- Any known limitation or follow-up?
```

## Review Rules

Tech Lead review is required for:

- Prisma schema changes
- Supabase SQL migrations
- booking availability logic
- payment/refund/penalty logic
- auth/JWT/role guard logic
- dependency changes
- shared helper changes