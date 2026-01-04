# Algedi Database Package

Shared Prisma database schema and client for the Algedi Multi-Tenant E-Commerce Platform.

## Schema Overview

This package contains the unified database schema with three logical domains:

### 1. Commerce Schema
- `Tenant` - Agency/company information
- `Product` - Abstract product data (tenant-scoped)
- `Customer` - Global customer profiles
- `TenantCustomer` - Link between customers and tenants

### 2. CMS Schema
- `SiteConfig` - Tenant site configuration and theming
- `PageTemplate` - Page templates with structure JSON

### 3. Editor Schema
- `AssetDescription` - AI-generated image descriptions with embeddings
- `PromptLog` - AI prompt logs with token usage tracking

## Installation

```bash
# From monorepo root
pnpm install

# Or standalone
cd packages/db
pnpm install
```

## Usage

### Generate Prisma Client

```bash
pnpm generate
```

### Run Migrations

```bash
# Development
pnpm migrate:dev

# Production
pnpm migrate:deploy
```

### Use in Your App

```typescript
import { PrismaClient } from "@algedi/db";

const prisma = new PrismaClient();

// Example: Get products for a tenant
const products = await prisma.product.findMany({
  where: { tenantId: "your-tenant-id" }
});
```

## Environment Variables

Set `DATABASE_URL` in your `.env` file:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/algedi
```

## Multi-Tenancy

⚠️ **CRITICAL**: All queries must include `tenantId` filtering for data isolation. The schema enforces this through foreign key relationships.

## Vector Support

The `AssetDescription.embedding` field uses PostgreSQL's `vector` type. Ensure you have the `pgvector` extension installed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## License

MIT License - see [LICENSE](../LICENSE) file for details.


