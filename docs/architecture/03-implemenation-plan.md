*The Agent Checklist.*

# Execution Roadmap for Cursor Agent

## ✅ Phase 1: The Monorepo Skeleton (COMPLETED)
- [x] Initialize a **Turborepo** with `pnpm`.
- [x] Create the directory structure: `apps/platform`, `packages/ai-editor`, `packages/cms`, `packages/commerce`.
- [x] Set up a shared `packages/ui` with Tailwind v4.
- [x] Configure `tsconfig.json` paths so packages can import each other (e.g., `@repo/commerce`).

## ✅ Phase 2: The Independent Data Layers (COMPLETED)
- [x] Initialize Prisma in `packages/commerce`. Define `Product`, `Order`, `Variant`, `Tenant`.
- [x] Initialize Prisma in `packages/ai-editor`. Define `Asset`, `PromptHistory`, `EditorProject`, `GenerationHistory`.
- [x] Initialize Prisma in `packages/cms`. Define `SiteConfig`, `PageLayout`.
- [x] **Critical:** Ensure each package has a `build` script that generates its own Prisma Client.

## ✅ Phase 3: The Commerce Module (COMPLETED)
- [x] Create the `ProductService` class in `packages/commerce`.
- [x] Implement basic CRUD actions for Products.
- [x] Expose these actions via `index.ts`.

## ✅ Phase 4: The AI Editor (COMPLETED)
- [x] Create the `VisualEditor` component in `packages/ai-editor`.
- [x] Implement the **"Click-to-Edit"** logic with Shadow DOM and `data-component-id`.
- [x] Create a Server Action `generateComponent` with streaming support.
- [x] Use `zod` to structure the LLM output for component props.
- [x] Implement `LivePreview` with client-side transpilation (sucrase).
- [x] Add floating toolbar for prompt input.

## ✅ Phase 5: The Integration (COMPLETED)
- [x] In `apps/platform`, set up Dynamic Routes `/[tenantId]/...`.
- [x] Mount the `VisualEditor` on a route.
- [x] Pass the `CommerceService` data into the Editor as initial context.
- [x] Create save bridge with server actions.

## ✅ Phase 6: Billing Hooks (COMPLETED - Credits System)
- [x] Implement credits-based billing system.
- [x] Add `Tenant` model with `creditsBalance`.
- [x] Create `checkCredits` and `deductCredits` utilities.
- [x] Enforce credits check in `generateComponent` action.
- [x] Add middleware for request tracking.
- [ ] **Note:** Stripe Connect integration still needed (see Phase 7+)

---

## 📋 Next Steps

**See:** `docs/architecture/04-next-steps-plan.md` for detailed roadmap of remaining features from design documents v1-v4.

**Key Missing Features:**
- Async processing infrastructure (BullMQ workers)
- Stripe Connect integration
- Semantic search with pgvector
- Prompt augmentation builder
- Async image description
- Design token system
- CMS subsite generation
