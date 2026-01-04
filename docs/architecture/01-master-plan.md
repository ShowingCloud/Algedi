# Aether Platform - Implementation Master Plan

## Phase 1: The Monorepo Foundation
- [ ] Initialize Turborepo with pnpm.
- [ ] Create 3 empty workspaces: apps/cms, apps/commerce-core, packages/editor.
- [ ] Set up shared packages/ui (Tailwind + Radix) and packages/db (Prisma).
- [ ] Configure tsconfig.json for strict type checking across the monorepo.

## Phase 2: Data Layer & Multi-Tenancy (The "Vault")
- [ ] Define schema.prisma in packages/db (See 02-data-models.md).
- [ ] Implement Tenant and User models with Organization support.
- [ ] Create a db.ts singleton with Prisma extensions for RLS (Row Level Security).
- [ ] Write a seed script to create a "SuperAdmin" and a "Demo Agency".

## Phase 3: The AI Visual Editor (The "Brain")
- [ ] Initialize packages/editor as a React library (Vite build).
- [ ] Create the ShadowBoundary component to isolate styles.
- [ ] Implement the useElementOverlay hook for the "Click-to-Data" highlighting.
- [ ] Build the AIRequest layer: Image -> Description -> Component Props (Zod).
- [ ] Critical: Implement the PropEditor sidebar that generates JSON updates.

## Phase 4: The CMS Host (The "Body")
- [ ] Scaffold apps/cms with Next.js 15 App Router.
- [ ] Build the Dynamic Router: [domain]/[...slug]/page.tsx that fetches PageTemplate from DB.
- [ ] Implement EditorBridge: The component that mounts packages/editor and feeds it DB data.
- [ ] Create the "Style Injector" to apply tenant-specific CSS variables at runtime.

## Phase 5: Commerce & Billing
- [ ] Set up MedusaJS in apps/commerce-core.
- [ ] Implement the "Headless Redirect" pattern for Checkout (CMS -> Medusa).
- [ ] Create the UsageLedger table for AI credits (See 03-billing.md).
- [ ] Implement Stripe Connect webhook handler for "Revenue Share" splits.
