# Contributing to Algedi

Thank you for your interest in contributing to Algedi! This document provides guidelines and information for contributors.

## Architecture Overview

Algedi is a **Modular Monolith** built with the **Full-Stack Package (FSP)** pattern. Understanding this architecture is crucial for contributing effectively.

### Key Principles

1. **Package Independence**: Each package (`ai-editor`, `cms`, `commerce`) is standalone
2. **Mounting Pattern**: Packages export capabilities, host app mounts them
3. **Data Isolation**: Each package has its own Prisma schema with distinct table names
4. **No Cross-Package Foreign Keys**: Use logical linking (UUID strings)

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd Algedi

# Install dependencies
pnpm install

# Set up environment
cp apps/platform/.env.example apps/platform/.env
# Edit .env with your DATABASE_URL

# Generate Prisma clients
pnpm --filter @repo/ai-editor prisma:generate
pnpm --filter @repo/cms prisma:generate
pnpm --filter @repo/commerce prisma:generate
```

## Package Structure

### Adding Features to a Package

When adding features, follow the FSP pattern:

1. **UI Components** → `src/components/`
2. **Server Actions** → `src/server/actions.ts`
3. **Route Handlers** → `src/server/handlers/` (use factory pattern)
4. **Workers** → `src/workers/` (only for ai-editor)
5. **Services** → `src/services/` (only for commerce)
6. **Utilities** → `src/lib/`

### Updating Package Exports

When adding new capabilities, update `package.json` exports:

```json
{
  "exports": {
    "./new-capability": "./src/path/to/capability.ts"
  }
}
```

## Database Changes

### Adding Models

1. Update the package's `prisma/schema.prisma`
2. Use distinct table names with `@@map("prefix_table")`
3. Never create foreign keys to other packages
4. Use logical linking (String IDs) instead

### Running Migrations

```bash
# For a specific package
pnpm --filter @repo/ai-editor prisma:migrate

# Create a new migration
pnpm --filter @repo/ai-editor prisma migrate dev --name migration_name
```

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Use `server-only` in all server-side files
- Use Zod for validation
- Format code with Prettier: `pnpm format`

## Testing

Before submitting:

1. Build all packages: `pnpm build`
2. Lint all packages: `pnpm lint`
3. Test in the host app: `pnpm --filter @repo/platform dev`
4. Verify Prisma clients generate correctly

## Package-Specific Guidelines

### AI Editor (`packages/ai-editor`)

- Full-Stack Package with UI, Server, and Workers
- Can run independently
- Uses BullMQ for async processing

### CMS (`packages/cms`)

- Full-Stack Package with UI and Server
- Consumes `@repo/ai-editor` as dependency
- No workers (synchronous operations)

### Commerce (`packages/commerce`)

- Headless package (no UI components)
- Pure business logic and services
- Route handlers primarily for webhooks

## Mounting in Host App

When adding new route handlers:

1. Create factory function in package: `createXHandler(config)`
2. Mount in host app: `apps/platform/app/api/x/[...slug]/route.ts`
3. Inject configuration (secrets, etc.) in host app

Example:
```typescript
// Package: packages/ai-editor/src/server/handlers/index.ts
export function createAIHandler(config: AIConfig) {
  return { POST: async (req) => { ... } };
}

// Host: apps/platform/app/api/ai/[...slug]/route.ts
import { createAIHandler } from '@repo/ai-editor/api';
const handler = createAIHandler({ apiKey: process.env.KEY });
export const POST = handler.POST;
```

## Documentation

- Update package README when adding features
- Update architecture docs if changing patterns
- Add JSDoc comments for public APIs

## Questions?

- Check `docs/design-documents/QUICK-REFERENCE.md` for patterns
- Review `docs/architecture/` for structure details
- See package-specific README files

