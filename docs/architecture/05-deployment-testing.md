# Phase 5: Testing & Deployment Strategy

## 1. Testing Suite (Vitest)

We need to ensure the core logic is robust before deploying.

### Task A: Infrastructure Setup

- Install `vitest` and `@testing-library/react` in the root workspace.
- Create a `vitest.config.ts` in the root that handles aliases (`@repo/*`).

### Task B: Unit Tests (High Priority)

Generate test files (`.test.ts`) for the following services. Constraint: Do not mock the database yet; test pure functions first. If DB is needed, use a mock PrismaClient.

**Commerce:** `packages/commerce/src/services/cart.ts`

- Test adding items, removing items, and calculating totals.

**AI Editor:** `packages/ai-editor/src/lib/prompt-synthesis.ts` (prompt engine)

- Test that the prompt string is constructed correctly from the component JSON.

**Multi-tenancy:** `apps/platform/middleware.ts`

- Test that it correctly parses subdomains into tenantId.

## 2. Docker Deployment (Railway/Render Compatible)

We need a single Dockerfile in `apps/platform` that builds the entire Monorepo (using Turborepo pruning) and starts the Next.js server.

### Task C: Dockerfile Configuration

Create `apps/platform/Dockerfile` following the "Turborepo Docker" guide:

- **Prune:** `turbo prune --scope=platform --docker`
- **Install:** `pnpm install`
- **Build:** `pnpm build`
- **Runner:** Use `node:18-alpine` and start `apps/platform/server.js` (Standalone mode).

### Environment Variables to Expect:

- `DATABASE_URL` (Supabase)
- `REDIS_URL` (For AI Job Queues)
- `NEXT_PUBLIC_APP_URL`
