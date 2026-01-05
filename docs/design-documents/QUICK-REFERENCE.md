# Quick Reference: Design Decisions

## 🎯 Current Architecture (Authoritative)

**Primary Document:** `design-document-v4.md`

### Core Pattern: Full-Stack Package (FSP)
- Packages contain UI + Server Logic + Workers + Data Schema
- Host app (`apps/platform`) mounts capabilities, doesn't own logic
- No separate backend services - everything in packages

### Three Products
1. **`packages/ai-editor`** - Generative UI, Assets, Prompts
2. **`packages/cms`** - Pages, Routing, Themes
3. **`packages/commerce`** - Products, Orders, Cart

---

## 📦 Package Structure (FSP Pattern)

```
packages/ai-editor/
├── src/
│   ├── components/        # React UI (Client + Server)
│   ├── server/
│   │   ├── actions.ts     # 'use server' functions
│   │   └── handlers/      # Route factories
│   ├── workers/          # BullMQ definitions
│   └── lib/              # Utilities
└── prisma/               # Own schema
```

**Key:** Package exports capabilities, host mounts them.

---

## 🔌 Mounting Patterns

### Server Actions
```typescript
// Package exports
'use server'
export async function generateText(input: string) { ... }

// Host uses directly
import { generateText } from '@repo/ai-editor/actions';
```

### Route Handlers (Factory Pattern)
```typescript
// Package: createAIHandler(config)
export function createAIHandler(config: AIConfig) {
  return {
    POST: async (req) => { ... },
    GET: async (req) => { ... }
  };
}

// Host: apps/platform/app/api/ai/[...slug]/route.ts
import { createAIHandler } from '@repo/ai-editor/api';
const handler = createAIHandler({ apiKey: process.env.KEY });
export const POST = handler.POST;
```

### Workers (Factory Pattern)
```typescript
// Package: createAIWorker(connection)
export function createAIWorker(connection) {
  return new Worker('queue-name', processor, { connection });
}

// Host: scripts/start-worker.ts
import { createAIWorker } from '@repo/ai-editor/worker';
const worker = createAIWorker(redis);
```

---

## 🗄️ Data Isolation Rules

1. **Each package has own Prisma schema**
2. **Distinct table names** using `@@map("prefix_table")`
3. **No foreign keys between packages** - use logical links (UUID strings)
4. **Shared DATABASE_URL** from host app

### Table Naming
- Commerce: `commerce_products`, `commerce_orders`
- Editor: `editor_assets`, `editor_prompt_history`
- CMS: `cms_site_configs`, `cms_page_layouts`

---

## 🚫 Deprecated Concepts

- ❌ MedusaJS integration (v1, v2)
- ❌ Separate `apps/ai-service` backend (v3)
- ❌ Separate apps for admin/editor/storefront (v1)

**Current:** Single `apps/platform` that mounts packages.

---

## ✅ Valid Concepts (Use These)

- ✅ Shadow DOM for style isolation
- ✅ `data-component-id` for click-to-edit
- ✅ Zod schemas for LLM structured outputs
- ✅ PostgreSQL RLS for multi-tenancy
- ✅ BullMQ for async processing
- ✅ Stripe Connect for billing (v3 details)

---

## 📚 Document Priority

1. **v4** - Full-Stack Package pattern (PRIMARY)
2. **v3** - Billing infrastructure details
3. **v2** - Data model concepts (adapted)
4. **v1** - Historical reference only

---

## 🔗 Related Docs

- Architecture: `docs/architecture/01-monotrpo-structure.md`
- Data Layer: `docs/architecture/02-data-layer.md`
- Implementation: `docs/architecture/03-implemenation-plan.md`
- Evolution Notes: `docs/design-documents/DESIGN-EVOLUTION-NOTES.md`

