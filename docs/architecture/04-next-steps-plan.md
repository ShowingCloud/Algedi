# Next Steps Implementation Plan

## Overview

This document identifies features from the design documents (v1-v4) that are missing from the current implementation and provides a prioritized roadmap for completion.

**Document Priority:** v4 > v3 > v2 > v1 (newer versions override older ones, but consistent concepts remain valid)

---

## ✅ Completed Features

### Phase 1-6 (From Original Plan)
- ✅ Monorepo skeleton with Turborepo
- ✅ Three packages: ai-editor, cms, commerce
- ✅ Independent Prisma schemas with distinct table names
- ✅ Commerce ProductService with CRUD
- ✅ VisualEditor with Shadow DOM and click-to-edit
- ✅ AI generation with streaming
- ✅ LivePreview with client-side transpilation
- ✅ Platform integration with tenant routing
- ✅ Credits-based billing system

### Phase 7-11 (Additional Features Completed)
- ✅ Async Processing Infrastructure (BullMQ workers, processors, job tracking)
- ✅ Async Image Description (upload, vision model, job status polling)
- ✅ Prompt Augmentation Builder (tone, format, context injection, synthesis)
- ✅ Semantic Search with pgvector (embeddings, cosine similarity, related prompts)
- ✅ Stripe Connect Integration (accounts, subscriptions, metered billing, shadow ledger)
- ✅ Route Factory Pattern (configuration injection, factory functions)

---

## 🔴 Critical Missing Features (High Priority)

### 1. Async Processing Infrastructure (v3, v4) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ BullMQ worker execution (dedicated script)
- ✅ Queue processors for long-running AI tasks (image-description, prompt-embedding, text-generation)
- ✅ Job status tracking and polling (JobStatusPolling component)
- ✅ Worker factory pattern implementation

**Files Created:**
- ✅ `packages/ai-editor/src/workers/worker.ts` - Worker factory
- ✅ `packages/ai-editor/src/workers/processors/` - Job processors (image-description, prompt-embedding, text-generation)
- ✅ `apps/platform/scripts/start-worker.ts` - Worker execution script
- ✅ `packages/ai-editor/src/components/JobStatusPolling.tsx` - Job status polling component

**Reference:** v4 Section 6, v3 Chapter 3

---

### 2. Async Image Description (v1, v3) ✅ COMPLETED (Partial)
**Status:** ✅ Core functionality implemented

**Completed:**
- ✅ Async job for vision model analysis (GPT-4 Vision)
- ✅ Real-time job status updates (polling component)
- ✅ Image upload action and component

**Files Created:**
- ✅ `packages/ai-editor/src/workers/processors/image-description.ts`
- ✅ `packages/ai-editor/src/server/actions/upload-asset.ts`
- ✅ `packages/ai-editor/src/components/ImageUploader.tsx`
- ✅ `apps/platform/app/api/ai-editor/upload/route.ts`

**Remaining (Nice-to-Have):**
- [ ] Image upload with presigned URLs (S3/R2) - structure exists, needs S3/R2 integration
- [ ] Skeleton loader/BlurHash placeholders - UI enhancement

**Reference:** v3 Section 3.2, v1 Section 4.2

---

### 3. Prompt Augmentation Builder (v1, v3) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ Tone selector (8 options: Professional, Casual, Witty, Academic, Friendly, Formal, Creative, Technical)
- ✅ Format selector (7 options: Paragraph, Bullet Points, Table, List, Code, JSON, Markdown)
- ✅ Context injection (previous documents, assets, related prompts)
- ✅ System prompt synthesis from structured inputs
- ✅ Prompt templates (4 pre-built templates)

**Files Created:**
- ✅ `packages/ai-editor/src/components/PromptBuilder.tsx`
- ✅ `packages/ai-editor/src/lib/prompt-synthesis.ts`
- ✅ `packages/ai-editor/src/lib/prompt-types.ts`
- ✅ Integration with FloatingToolbar and generate-stream action

**Reference:** v3 Section 1.3.3, v1 Section 4.3

---

### 4. Semantic Search with pgvector (v3) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ pgvector extension setup (SQL script provided)
- ✅ Embedding generation for prompts (OpenAI text-embedding-3-small)
- ✅ Cosine similarity search queries (raw SQL with pgvector)
- ✅ "Related Prompts" feature in editor (PromptSuggestions component)
- ✅ Async embedding generation (worker processor)

**Files Created/Updated:**
- ✅ `packages/ai-editor/prisma/schema.prisma` - Added embeddingGenerated flag
- ✅ `packages/ai-editor/src/lib/embeddings.ts`
- ✅ `packages/ai-editor/src/server/actions/search-prompts.ts`
- ✅ `packages/ai-editor/src/server/services/prompt-service.ts`
- ✅ `packages/ai-editor/src/workers/processors/prompt-embedding.ts`
- ✅ `packages/ai-editor/src/components/PromptSuggestions.tsx`
- ✅ `packages/ai-editor/scripts/setup-pgvector.sql`
- ✅ `apps/platform/app/api/ai-editor/prompts/search/route.ts`

**Reference:** v3 Section 2.2

---

### 5. Stripe Connect Integration (v3) ✅ COMPLETED (Core Features)
**Status:** ✅ Core billing infrastructure implemented

**Completed:**
- ✅ Stripe Connect account creation (Express accounts)
- ✅ Subscription management (create, update, cancel)
- ✅ Metered billing reporting to Stripe (usage records)
- ✅ BillingCycle and UsageRecord models (shadow ledger)
- ✅ Webhook handling (subscription events, payment events)
- ✅ Usage reporting script (cron-ready)

**Files Created/Updated:**
- ✅ `packages/commerce/prisma/schema.prisma` - Added Tenant, BillingCycle, UsageRecord models
- ✅ `packages/commerce/src/services/billing-service.ts`
- ✅ `apps/platform/app/api/stripe/webhook/route.ts`
- ✅ `apps/platform/scripts/report-usage.ts`
- ✅ Integration with credits system (automatic usage recording)

**Remaining (Advanced):**
- [ ] Revenue share with destination charges - structure exists, needs implementation

**Reference:** v3 Chapter 4

---

## 🟡 Important Missing Features (Medium Priority)

### 6. Ghost-Text Pattern (v1, v3) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ ProseMirror editor integration
- ✅ Widget decorations for AI suggestions
- ✅ Tab-to-accept functionality
- ✅ Undo-safe suggestion handling

**Files Created:**
- ✅ `packages/ai-editor/src/components/GhostTextEditor.tsx`
- ✅ `packages/ai-editor/src/lib/decorations.ts`
- ✅ `packages/ai-editor/src/server/actions/generate-text-suggestion.ts`

**Reference:** v3 Section 1.3.1

---

### 7. Async Inpainting & Image Masking (v1, v3) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ Canvas overlay for mask painting
- ✅ Mask coordinate capture
- ✅ Async job for diffusion model
- ✅ Placeholder rendering during processing

**Files Created:**
- ✅ `packages/ai-editor/src/components/ImageInpainter.tsx`
- ✅ `packages/ai-editor/src/workers/processors/image-inpainting.ts`
- ✅ `apps/platform/app/api/ai-editor/inpaint/route.ts`

**Reference:** v3 Section 1.3.2

---

### 8. Design Token System (v1, v2) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ Theme JSON schema in database
- ✅ ThemeProvider component
- ✅ AI-powered theme generation
- ✅ Token-based styling (not raw CSS)

**Files Created:**
- ✅ `packages/cms/src/lib/theme-schema.ts`
- ✅ `packages/cms/src/lib/theme-parser.ts`
- ✅ `packages/cms/src/components/ThemeProvider.tsx`
- ✅ `packages/ai-editor/src/server/actions/generate-theme.ts`
- ✅ `packages/cms/src/server/actions/theme-actions.ts`

**Reference:** v1 Section 4.4, v2 Section 1

---

### 9. Route Factory Pattern (v4) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ Configuration injection interface (RouteFactoryConfig)
- ✅ Factory functions for all route handlers (generate, jobStatus, searchPrompts, health)
- ✅ Proper mounting in platform app (all routes use factory)

**Files Created/Updated:**
- ✅ `packages/ai-editor/src/server/handlers/factory.ts` - Factory implementation
- ✅ `packages/ai-editor/src/server/handlers/index.ts` - Exports factory
- ✅ `apps/platform/app/api/ai-editor/generate/route.ts` - Uses factory
- ✅ `apps/platform/app/api/ai-editor/jobs/[jobId]/route.ts` - Uses factory
- ✅ `apps/platform/app/api/ai-editor/prompts/search/route.ts` - Uses factory
- ✅ `apps/platform/app/api/ai-editor/health/route.ts` - Health check endpoint

**Reference:** v4 Section 5.1

---

### 10. CMS Subsite Generation (v2) ✅ COMPLETED
**Status:** ✅ Fully implemented

**Completed:**
- ✅ Dynamic component selection from component_map
- ✅ Runtime theme injection
- ✅ Multi-tenant routing middleware
- ✅ Site definition JSON structure

**Files Created:**
- ✅ `packages/cms/src/services/site-renderer.ts`
- ✅ `packages/cms/src/lib/component-map.ts`
- ✅ `packages/cms/src/lib/site-definition.ts`
- ✅ `apps/platform/middleware.ts` - Updated with tenant detection
- ✅ `apps/platform/app/[tenant]/[...path]/page.tsx` - Dynamic rendering

**Reference:** v2 Section 2.1

---

## 🟢 Nice-to-Have Features (Low Priority)

### 11. Fine-Tuning Job Tracking (v3)
**Status:** Not implemented

**Missing:**
- [ ] FineTuningJob model
- [ ] Dataset hash tracking
- [ ] Training metrics storage
- [ ] Job status management

**Reference:** v3 Section 2.1.2

---

### 12. Token Exchange Auth Pattern (v3)
**Status:** Not implemented

**Missing:**
- [ ] JWT generation in host
- [ ] Token verification in editor backend
- [ ] Shared secret management

**Reference:** v3 Section 5.1

---

### 13. Headless Redirect Pattern (v1, v2)
**Status:** Not implemented

**Missing:**
- [ ] Checkout handover token generation
- [ ] Session hydration on platform
- [ ] Return redirect with status

**Reference:** v1 Section 5.1, v2 Section 2.2

---

### 14. Campaign Logic (v2)
**Status:** Not implemented

**Missing:**
- [ ] Campaign model in commerce
- [ ] Auction/sale logic
- [ ] CMS campaign rendering

**Reference:** v2 Section 2.2

---

## 📋 Implementation Priority

### Phase 7: Async Infrastructure (Critical)
1. Implement BullMQ worker execution
2. Create job processors for image description
3. Add job status tracking
4. Set up worker startup script

### Phase 8: Enhanced AI Features (High Value)
1. Prompt augmentation builder
2. Semantic search with pgvector
3. Ghost-text pattern (if using rich text editor)

### Phase 9: Billing & Payments (Business Critical)
1. Stripe Connect integration
2. Metered billing reporting
3. Revenue share implementation
4. Usage ledger system

### Phase 10: CMS Features (Platform Completion)
1. Subsite generation with dynamic rendering
2. Design token system
3. Theme management UI

### Phase 11: Advanced Editor Features (Polish)
1. Image inpainting
2. Fine-tuning job tracking
3. Enhanced asset management

---

## 🔍 Cross-Cutting Concerns

### Database Migrations
- ✅ Add pgvector extension (script provided: `packages/ai-editor/scripts/setup-pgvector.sql`)
- ✅ Add billing models (BillingCycle, UsageRecord) - Added to commerce schema
- [ ] Add FineTuningJob model
- [ ] Add Campaign model

### Infrastructure
- ✅ Redis setup for BullMQ (configured in worker script and factory)
- [ ] Object storage (S3/R2) for assets - structure exists, needs S3/R2 integration
- [ ] Connection pooling (PgBouncer/Prisma Accelerate) - Recommended for production
- ✅ Worker deployment strategy (standalone script: `apps/platform/scripts/start-worker.ts`)

### Security
- [ ] Token exchange auth pattern
- [ ] RLS policies (if using PostgreSQL RLS)
- [ ] API rate limiting
- ✅ Webhook signature verification (implemented in Stripe webhook handler)

---

## 📝 Notes

1. **v4 is authoritative** for FSP pattern and Next.js 15 features
2. **v3 is authoritative** for billing infrastructure details
3. **v2 concepts** remain valid but adapt to current schema
4. **v1 MedusaJS references** should be ignored (we use custom commerce)

5. **Consistent patterns across versions:**
   - Shadow DOM ✅
   - data-component-id ✅
   - Zod schemas ✅
   - Multi-tenancy ✅
   - Async processing ✅ (fully implemented)
   - Billing ✅ (credits + Stripe Connect implemented)

---

## 🎯 Quick Wins (Can be done immediately)

1. ✅ **Route Factory Pattern** - ✅ Completed
2. ✅ **Worker Execution Script** - ✅ Completed (`start-worker.ts`)
3. ✅ **Prompt Builder UI** - ✅ Completed
4. ✅ **Job Status Polling** - ✅ Completed (JobStatusPolling component)
5. ✅ **Theme JSON Schema** - ✅ Completed (theme-schema.ts, theme-parser.ts, ThemeProvider)

---

## 📚 Reference Documents

- **Primary:** `docs/design-documents/design-document-v4.md`
- **Billing:** `docs/design-documents/design-document-v3.md`
- **Data Models:** `docs/architecture/02-data-layer.md`
- **Structure:** `docs/architecture/01-monotrpo-structure.md`
- **Evolution:** `docs/design-documents/DESIGN-EVOLUTION-NOTES.md`

