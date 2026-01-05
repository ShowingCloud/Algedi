# Design Documents Evolution & Implementation Notes

## Document Version Overview

This document tracks the evolution of architectural decisions across design documents v1-v4, noting what has changed, what remains relevant, and what should be considered deprecated.

**Version Hierarchy:** v4 > v3 > v2 > v1 (newer versions override older ones)

---

## Key Architectural Evolution

### v1 → v2: Three-Product Separation
- **v1:** Focused on single monolithic platform with MedusaJS integration
- **v2:** Introduced clear separation of three products:
  - AI Editor (stateless, React component library)
  - CMS (multi-tenant host)
  - E-commerce Core (headless backend)
- **Status:** ✅ **CURRENT** - Aligns with `.cursorrules` modular monolith architecture

### v2 → v3: Pluggable Editor Pattern
- **v3:** Detailed the "Bridge Pattern" for pluggable editor
- Introduced independent data store with Prisma
- Added async orchestration with BullMQ
- Detailed billing infrastructure with Stripe Connect
- **Status:** ⚠️ **PARTIALLY SUPERSEDED** - Some concepts refined in v4

### v3 → v4: Full-Stack Package (FSP) Pattern
- **v4:** **CURRENT AUTHORITATIVE DOCUMENT**
- Consolidates packages/ai-editor and apps/ai-service into unified FSP
- Emphasizes Next.js 15 Server Actions and Route Handlers
- Defines "Route Factory" pattern for mounting
- Worker execution strategies (dedicated script vs instrumentation)
- **Status:** ✅ **CURRENT** - This is the primary reference

---

## Current Architecture (Based on v4 + .cursorrules)

### Core Principles
1. **Modular Monolith** in Turborepo
2. **Three Standalone Products:**
   - `packages/ai-editor` - Generative UI, Asset Management, Prompt Engineering
   - `packages/cms` - Page Hierarchy, Routing Logic, Theme Management
   - `packages/commerce` - Products, Orders, Customers, Cart
3. **Single Server Constraint:** All code runs in one Next.js server instance (`apps/platform`)
4. **Data Isolation:** Each package has its own Prisma schema with distinct table names

### Full-Stack Package (FSP) Pattern (v4)

**Key Concept:** The AI Editor is a "Full-Stack Package" that contains:
- UI Components (React, both Client and Server)
- Server Actions (`'use server'`)
- Route Handler Factories
- Worker Definitions (BullMQ)
- Data Schema (Prisma)

**Mounting Pattern:**
- Package exports capabilities, not running services
- Host app (`apps/platform`) mounts these capabilities
- Route handlers are created via factories: `createAIHandler(config)`
- Workers are created via factories: `createAIWorker(connection)`

**Directory Structure (from v4):**
```
packages/ai-editor/
├── src/
│   ├── components/     # UI Layer (React)
│   ├── server/         # Backend Logic
│   │   ├── actions.ts  # Server Actions
│   │   ├── handlers/   # API Route Factories
│   │   └── db.ts       # Database client
│   ├── workers/        # Async Processing
│   │   ├── queue.ts    # BullMQ Queue Factory
│   │   └── worker.ts   # BullMQ Worker Factory
│   └── lib/            # Shared Utilities
└── prisma/              # Own schema
```

**Package.json Exports (v4):**
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./ui": "./src/components/index.ts",
    "./api": "./src/server/handlers/index.ts",
    "./actions": "./src/server/actions.ts",
    "./worker": "./src/workers/index.ts",
    "./types": "./src/lib/types.ts"
  }
}
```

---

## Deprecated/Outdated Concepts

### From v1: MedusaJS Integration
- **Status:** ❌ **DEPRECATED**
- **Reason:** Current architecture uses custom commerce package, not MedusaJS
- **Replacement:** `packages/commerce` with own Prisma schema

### From v1: Separate Apps Structure
- **Status:** ❌ **DEPRECATED**
- **Old:** `/apps/platform-admin`, `/apps/visual-editor`, `/apps/storefront-engine`, `/apps/commerce-backend`
- **New:** Single `apps/platform` that mounts packages

### From v2: MedusaJS as E-commerce Core
- **Status:** ❌ **DEPRECATED**
- **Reason:** Architecture now uses standalone `packages/commerce` package
- **Note:** v2's data model concepts (RLS, multi-tenant) remain valid

### From v3: Separate Backend Service
- **Status:** ❌ **DEPRECATED**
- **Old:** Separate `apps/ai-service` backend
- **New:** Consolidated into `packages/ai-editor` as FSP (v4)

---

## Valid Concepts Across Versions

### Data Isolation (v1, v2, v3)
- ✅ PostgreSQL Row-Level Security (RLS) for multi-tenancy
- ✅ Shared Database, Shared Schema with tenant_id filtering
- ✅ Each package has own Prisma schema with distinct table names

### AI Editor Patterns (v1, v2, v3, v4)
- ✅ Shadow DOM for style isolation
- ✅ `data-component-id` attributes for click-to-edit
- ✅ Structured LLM outputs with Zod schemas
- ✅ Prompt history and asset management

### Multi-Tenancy (v1, v2, v3)
- ✅ Organization/Tenant hierarchy
- ✅ Strict data privacy between tenants
- ✅ Theme configuration per tenant

### Async Processing (v3, v4)
- ✅ BullMQ for long-running AI tasks
- ✅ Queue/Worker factory pattern
- ✅ Separate worker process execution

### Billing (v3)
- ✅ Stripe Connect for revenue sharing
- ✅ Usage-based metering
- ✅ Double-entry ledger system
- **Note:** Implementation details in v3 remain valid, but integration happens through FSP pattern

---

## Implementation Status

### ✅ Completed (Phase 1 & 2)
- [x] Turborepo skeleton initialized
- [x] Three package directories created
- [x] Prisma schemas for all three packages
- [x] Distinct table names with `@@map`
- [x] TypeScript path configuration
- [x] Tailwind v4 setup in `packages/ui`

### 🔄 Next Steps (Based on v4)
- [ ] Implement FSP structure in `packages/ai-editor`:
  - [ ] Server Actions (`src/server/actions.ts`)
  - [ ] Route Handler Factories (`src/server/handlers/`)
  - [ ] Worker Factories (`src/workers/`)
  - [ ] UI Components (`src/components/`)
- [ ] Configure package.json exports with subpath exports
- [ ] Set up `apps/platform` to mount FSP capabilities
- [ ] Implement BullMQ worker execution strategy

---

## Design Decisions to Revisit

### 1. Worker Execution Strategy (v4)
- **Question:** Dedicated worker script vs Next.js instrumentation?
- **Recommendation:** Start with dedicated script for production, instrumentation for dev
- **Reference:** v4 Section 6.2

### 2. Route Factory Pattern (v4)
- **Question:** How to handle dynamic route mounting?
- **Current:** Using `app/api/[...route]/route.ts` catch-all
- **Recommendation:** Implement factory pattern as described in v4 Section 5.1

### 3. Billing Integration (v3)
- **Question:** Where does billing logic live?
- **Current Architecture:** Billing hooks in packages, implementation in host
- **Recommendation:** Follow v3 Chapter 4 for Stripe Connect integration

### 4. Asset Management (v2, v3, v4)
- **Question:** Where are assets stored?
- **Current:** `packages/ai-editor` owns Asset model
- **Recommendation:** Follow v3 Section 2.1.2 for async image description workflow

---

## Key Takeaways for Development

1. **Follow v4 as primary reference** for FSP architecture
2. **Use v3 for billing details** (Stripe Connect, metering)
3. **Use v2 for data model inspiration** (but adapt to current schema)
4. **Ignore v1 MedusaJS references** - we use custom commerce package
5. **Maintain strict package boundaries** - no cross-package foreign keys
6. **Use logical linking** (UUID strings) between packages
7. **Each package is standalone** but mounted by host app

---

## Questions for Future Resolution

1. How to handle shared types between packages? (Currently using workspace imports)
2. Should billing logic be a separate package or integrated into host?
3. How to handle cross-package queries efficiently? (Currently direct imports allowed in monolith)
4. What's the deployment strategy for workers? (Docker containers, separate processes?)

---

## References

- **Primary:** `docs/design-documents/design-document-v4.md` - Full-Stack Package Pattern
- **Billing:** `docs/design-documents/design-document-v3.md` - Financial Infrastructure
- **Data Models:** `docs/architecture/02-data-layer.md` - Current Prisma schemas
- **Structure:** `docs/architecture/01-monotrpo-structure.md` - Current monorepo structure

