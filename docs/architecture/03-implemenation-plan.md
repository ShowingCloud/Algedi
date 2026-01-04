*The Agent Checklist.*

# Execution Roadmap for Cursor Agent

## Phase 1: The Monorepo Skeleton
1.  Initialize a **Turborepo** with `pnpm`.
2.  Create the directory structure: `apps/platform`, `packages/ai-editor`, `packages/cms`, `packages/commerce`.
3.  Set up a shared `packages/ui` with Tailwind v4 and Shadcn.
4.  Configure `tsconfig.json` paths so packages can import each other (e.g., `@repo/commerce`).

## Phase 2: The Independent Data Layers
1.  Initialize Prisma in `packages/commerce`. Define `Product`, `Order`.
2.  Initialize Prisma in `packages/ai-editor`. Define `Asset`, `PromptHistory`.
3.  Initialize Prisma in `packages/cms`. Define `SiteConfig`, `PageLayout`.
4.  **Critical:** Ensure each package has a `build` script that generates its own Prisma Client.

## Phase 3: The Commerce Module (Base)
1.  Create the `ProductService` class in `packages/commerce`.
2.  Implement basic CRUD actions for Products.
3.  Expose these actions via `index.ts`.

## Phase 4: The AI Editor (The Core)
1.  Create the `VisualEditor` component in `packages/ai-editor`.
2.  Implement the **"Click-to-Edit"** logic:
    *   Mock the DOM selection for now.
    *   Create a Server Action `generateComponent(prompt, context)`.
3.  Use `zod` to structure the LLM output for component props.

## Phase 5: The Integration (The Host)
1.  In `apps/platform`, set up Dynamic Routes `/[tenantId]/...`.
2.  Mount the `VisualEditor` on a route.
3.  Pass the `CommerceService` data into the Editor as initial context.

## Phase 6: Billing Hooks
1.  In `packages/ai-editor`, define an interface `BillingDelegate`.
2.  In `apps/platform`, implement this delegate (connecting to Stripe).
3.  Pass the delegate to the Editor: `<VisualEditor billing={myBilling} />`.
