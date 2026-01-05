# Algedi

A Modular Monolith platform built with Next.js 15, featuring three standalone products: AI Editor, CMS, and Commerce Engine.

## 🏗️ Architecture

This project follows the **Full-Stack Package (FSP)** pattern, where each package is a self-contained, mountable unit of functionality. The architecture is a **Modular Monolith** - all code runs in a single Next.js server instance, but packages maintain strict boundaries.

### Three Standalone Products

1. **`packages/ai-editor`** - Generative UI, Asset Management, and Prompt Engineering
   - Full-Stack Package with UI, Server Actions, Route Handlers, and Workers
   - Independent data schema (EditorSchema)
   - Can run even if Commerce or CMS are missing

2. **`packages/cms`** - Page Hierarchy, Routing Logic, and Theme Management
   - Full-Stack Package with UI components
   - Consumes AI Editor as a dependency
   - Owns ContentSchema

3. **`packages/commerce`** - Products, Orders, Customers, and Cart
   - Headless package (pure logic & data, no UI)
   - Owns ShopSchema
   - Provides services and server actions

### Host Application

- **`apps/platform`** - The integration layer that mounts all package capabilities
  - Provides execution context (authentication, routing)
  - Mounts route handlers from packages
  - Manages environment variables and database connection

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/platform/.env.example apps/platform/.env
# Edit .env with your DATABASE_URL

# Generate Prisma clients for all packages
pnpm --filter @repo/ai-editor prisma:generate
pnpm --filter @repo/cms prisma:generate
pnpm --filter @repo/commerce prisma:generate

# Run database migrations (for each package)
pnpm --filter @repo/ai-editor prisma:migrate
pnpm --filter @repo/cms prisma:migrate
pnpm --filter @repo/commerce prisma:migrate
```

### Development

```bash
# Start all packages in development mode
pnpm dev

# Start specific package
pnpm --filter @repo/platform dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @repo/platform build
```

## 📦 Project Structure

```
/
├── apps/
│   └── platform/              # Host Application
│       ├── app/               # Next.js App Router
│       │   ├── api/           # Mounts package routes
│       │   └── [tenant]/      # Multi-tenant routing
│       └── .env               # Database URL
├── packages/
│   ├── ai-editor/             # Product 1: AI Editor
│   │   ├── src/
│   │   │   ├── components/    # React UI
│   │   │   ├── server/        # Server Actions & Route Handlers
│   │   │   ├── workers/      # BullMQ Workers
│   │   │   └── lib/          # Utilities
│   │   └── prisma/            # Own schema
│   ├── cms/                   # Product 2: CMS
│   │   ├── src/
│   │   │   ├── components/    # React UI
│   │   │   ├── server/        # Server Actions & Route Handlers
│   │   │   └── lib/          # Utilities
│   │   └── prisma/            # Own schema
│   ├── commerce/              # Product 3: Commerce (Headless)
│   │   ├── src/
│   │   │   ├── services/      # Business Logic
│   │   │   ├── server/        # Server Actions & Route Handlers
│   │   │   └── lib/          # Utilities
│   │   └── prisma/            # Own schema
│   └── ui/                    # Shared Design System
│       └── src/
│           ├── components/    # Shared UI components
│           └── lib/          # Utilities (cn, etc.)
└── docs/                      # Architecture documentation
```

## 🔌 Mounting Pattern

Packages export capabilities that the host app mounts:

### Server Actions
```typescript
// Direct import from package
import { generateText } from '@repo/ai-editor/actions';
```

### Route Handlers (Factory Pattern)
```typescript
// apps/platform/app/api/ai/[...slug]/route.ts
import { createAIHandler } from '@repo/ai-editor/api';

const handler = createAIHandler({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = handler.POST;
```

### Workers
```typescript
// apps/platform/scripts/start-worker.ts
import { createAIWorker } from '@repo/ai-editor/worker';
const worker = createAIWorker(redis);
```

## 🗄️ Data Isolation

Each package has its own Prisma schema and generates its own Prisma Client:

- **No foreign keys between packages** - Use logical linking (UUID strings)
- **Distinct table names** - Using `@@map("prefix_table")`
- **Shared DATABASE_URL** - All packages use the same database connection

### Table Naming
- Commerce: `commerce_products`, `commerce_orders`, `commerce_order_items`
- Editor: `editor_assets`, `editor_prompt_history`
- CMS: `cms_site_configs`, `cms_page_layouts`

## 📚 Documentation

- **Architecture:** `docs/architecture/` - Structure and data layer documentation
- **Design Documents:** `docs/design-documents/` - Evolution of architectural decisions
- **Quick Reference:** `docs/design-documents/QUICK-REFERENCE.md` - Key patterns and decisions

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict)
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS v4
- **Monorepo:** Turborepo + pnpm workspaces
- **Queue:** BullMQ (for async processing)
- **Validation:** Zod

## 📝 Scripts

```bash
# Development
pnpm dev              # Start all packages in dev mode

# Building
pnpm build            # Build all packages

# Linting
pnpm lint             # Lint all packages

# Formatting
pnpm format           # Format code with Prettier

# Prisma (per package)
pnpm --filter @repo/ai-editor prisma:generate
pnpm --filter @repo/ai-editor prisma:migrate
```

## 🔒 Security

- All server-side code uses `server-only` package to prevent client bundling
- Multi-tenant data isolation via PostgreSQL Row-Level Security (RLS)
- No cross-package foreign keys - logical linking only
- Environment variables managed by host app

## 🤝 Contributing

Each package is designed to be standalone and can be developed independently:

1. **AI Editor** - Can run without CMS or Commerce
2. **CMS** - Requires AI Editor, but not Commerce
3. **Commerce** - Completely independent (headless)

When making changes:
- Update the affected package's Prisma schema if needed
- Run migrations for that package
- Ensure exports are properly defined in `package.json`
- Test mounting in the host app

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Related Packages

Each package is a standalone open source project with its own repository:

- **[AI Editor (Marakk)](https://github.com/ShowingCloud/Marakk/blob/main/README.md)** - Generative UI, Asset Management, and Prompt Engineering
- **[CMS (Yan)](https://github.com/ShowingCloud/Yan/blob/main/README.md)** - Page Hierarchy, Routing Logic, and Theme Management
- **[Commerce (Yen)](https://github.com/ShowingCloud/Yen/blob/main/README.md)** - Products, Orders, Customers, and Cart

For package-specific documentation, refer to each package's repository README.

