Step-by-Step Implementation Plan
Phase 1: The Monorepo Foundation
Initialize Turborepo with pnpm.

Create workspace packages/ai-editor.

Create workspace apps/cms (Next.js 15).

Create workspace apps/commerce-backend (Medusa).

Set up shared packages/db (Prisma) with the schema defined in 01-data-model.md.

Phase 2: The Core Logic (Backend)
Implement the CreditLedger service in apps/cms.

Implement the Stripe Connect onboarding flow in apps/commerce-backend.

Set up the Medusa sales_channel logic for multi-tenancy.

Phase 3: The AI Editor (Package)
Build the ShadowDOM container component.

Implement the Zod schema for a "Page Section" (Hero, Features, Footer).

Create the useEditorBridge hook.

Implement the analyzeImage Server Action using OpenAI Vision.

Phase 4: The Integration
Mount the Editor inside apps/cms/app/editor/[[...pageId]]/page.tsx.

Connect the onSave bridge to the Prisma database.

Implement the "Publish" button that pushes the JSON schema to the live edge config.