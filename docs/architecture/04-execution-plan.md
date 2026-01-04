# Step-by-Step Implementation Plan

## Phase 1: The Monorepo Foundation

1. Initialize Turborepo with pnpm.
2. Create workspace `packages/ai-editor`.
3. Create workspace `apps/cms` (Next.js 15).
4. Create workspace `apps/commerce-backend` (Medusa).
5. Set up shared `packages/db` (Prisma) with the schema defined in `01-data-model.md`.

## Phase 2: The Core Logic (Backend)

1. Implement the CreditLedger service in `apps/cms`.
2. Implement the Stripe Connect onboarding flow in `apps/commerce-backend`.
3. Set up the Medusa `sales_channel` logic for multi-tenancy.

## Phase 3: The AI Editor (Package)

1. Build the ShadowDOM container component.
2. Implement the Zod schema for a "Page Section" (Hero, Features, Footer).
3. Create the `useEditorBridge` hook.
4. Implement the `analyzeImage` Server Action using OpenAI Vision.

## Phase 4: The Integration

1. Mount the Editor inside `apps/cms/app/editor/[[...pageId]]/page.tsx`.
2. Connect the `onSave` bridge to the Prisma database.
3. Implement the "Publish" button that pushes the JSON schema to the live edge config.