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

---

## 🔴 Critical Missing Features (High Priority)

### 1. Async Processing Infrastructure (v3, v4)
**Status:** Structure exists but not fully implemented

**Missing:**
- [ ] BullMQ worker execution (dedicated script or instrumentation)
- [ ] Queue processors for long-running AI tasks
- [ ] Job status tracking and polling
- [ ] Worker factory pattern implementation

**Files to Create/Update:**
- `packages/ai-editor/src/workers/worker.ts` - Worker factory
- `packages/ai-editor/src/workers/processors/` - Job processors
- `apps/platform/scripts/start-worker.ts` - Worker execution script
- `apps/platform/instrumentation.ts` - Optional dev worker startup

**Reference:** v4 Section 6, v3 Chapter 3

---

### 2. Async Image Description (v1, v3)
**Status:** Asset model exists, but async processing not implemented

**Missing:**
- [ ] Image upload with presigned URLs (S3/R2)
- [ ] Async job for vision model analysis
- [ ] Skeleton loader/BlurHash placeholders
- [ ] Real-time job status updates (polling or SSE)

**Files to Create:**
- `packages/ai-editor/src/workers/processors/image-description.ts`
- `packages/ai-editor/src/server/actions/upload-asset.ts`
- `packages/ai-editor/src/components/ImageUploader.tsx`

**Reference:** v3 Section 3.2, v1 Section 4.2

---

### 3. Prompt Augmentation Builder (v1, v3)
**Status:** Basic prompt input exists, but structured builder missing

**Missing:**
- [ ] Tone selector (Professional, Witty, Academic)
- [ ] Format selector (Bullet Points, Table, Paragraph)
- [ ] Context injection (previous documents, assets)
- [ ] System prompt synthesis from structured inputs

**Files to Create:**
- `packages/ai-editor/src/components/PromptBuilder.tsx`
- `packages/ai-editor/src/lib/prompt-synthesis.ts`

**Reference:** v3 Section 1.3.3, v1 Section 4.3

---

### 4. Semantic Search with pgvector (v3)
**Status:** PromptHistory model exists, but vector search not implemented

**Missing:**
- [ ] pgvector extension setup
- [ ] Embedding generation for prompts
- [ ] Cosine similarity search queries
- [ ] "Related Prompts" feature in editor

**Files to Create/Update:**
- `packages/ai-editor/prisma/schema.prisma` - Add vector type
- `packages/ai-editor/src/lib/embeddings.ts`
- `packages/ai-editor/src/server/actions/search-prompts.ts`

**Reference:** v3 Section 2.2

---

### 5. Stripe Connect Integration (v3)
**Status:** Credits system exists, but Stripe integration missing

**Missing:**
- [ ] Stripe Connect account creation
- [ ] Subscription management
- [ ] Metered billing reporting to Stripe
- [ ] Revenue share with destination charges
- [ ] BillingCycle and UsageRecord models

**Files to Create:**
- `packages/commerce/prisma/schema.prisma` - Add billing models
- `packages/commerce/src/services/billing-service.ts`
- `apps/platform/app/api/billing/` - Stripe webhooks

**Reference:** v3 Chapter 4

---

## 🟡 Important Missing Features (Medium Priority)

### 6. Ghost-Text Pattern (v1, v3)
**Status:** Not implemented

**Missing:**
- [ ] ProseMirror or Lexical editor integration
- [ ] Widget decorations for AI suggestions
- [ ] Tab-to-accept functionality
- [ ] Undo-safe suggestion handling

**Files to Create:**
- `packages/ai-editor/src/components/GhostTextEditor.tsx`
- `packages/ai-editor/src/lib/decorations.ts`

**Reference:** v3 Section 1.3.1

---

### 7. Async Inpainting & Image Masking (v1, v3)
**Status:** Not implemented

**Missing:**
- [ ] Canvas overlay for mask painting
- [ ] Mask coordinate capture
- [ ] Async job for diffusion model
- [ ] Placeholder rendering during processing

**Files to Create:**
- `packages/ai-editor/src/components/ImageInpainter.tsx`
- `packages/ai-editor/src/workers/processors/image-inpainting.ts`

**Reference:** v3 Section 1.3.2

---

### 8. Design Token System (v1, v2)
**Status:** CSS variables exist, but full token system missing

**Missing:**
- [ ] Theme JSON schema in database
- [ ] ThemeProvider component
- [ ] AI-powered theme generation
- [ ] Token-based styling (not raw CSS)

**Files to Create:**
- `packages/cms/src/lib/theme-schema.ts`
- `packages/cms/src/components/ThemeProvider.tsx`
- `packages/ai-editor/src/server/actions/generate-theme.ts`

**Reference:** v1 Section 4.4, v2 Section 1

---

### 9. Route Factory Pattern (v4)
**Status:** Handlers exist, but factory pattern not fully implemented

**Missing:**
- [ ] Configuration injection interface
- [ ] Factory functions for all route handlers
- [ ] Proper mounting in platform app

**Files to Update:**
- `packages/ai-editor/src/server/handlers/index.ts` - Add factory
- `apps/platform/app/api/ai-editor/generate/route.ts` - Use factory

**Reference:** v4 Section 5.1

---

### 10. CMS Subsite Generation (v2)
**Status:** PageLayout model exists, but runtime rendering not implemented

**Missing:**
- [ ] Dynamic component selection from component_map
- [ ] Runtime theme injection
- [ ] Multi-tenant routing middleware
- [ ] Site definition JSON structure

**Files to Create:**
- `packages/cms/src/services/site-renderer.ts`
- `apps/platform/middleware.ts` - Add tenant detection
- `apps/platform/app/[tenant]/[...path]/page.tsx` - Dynamic rendering

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
- [ ] Add pgvector extension
- [ ] Add billing models (BillingCycle, UsageRecord)
- [ ] Add FineTuningJob model
- [ ] Add Campaign model

### Infrastructure
- [ ] Redis setup for BullMQ
- [ ] Object storage (S3/R2) for assets
- [ ] Connection pooling (PgBouncer/Prisma Accelerate)
- [ ] Worker deployment strategy

### Security
- [ ] Token exchange auth pattern
- [ ] RLS policies (if using PostgreSQL RLS)
- [ ] API rate limiting
- [ ] Webhook signature verification

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
   - Async processing (structure exists)
   - Billing (credits exist, Stripe missing)

---

## 🎯 Quick Wins (Can be done immediately)

1. **Route Factory Pattern** - Refactor existing handlers
2. **Worker Execution Script** - Create `start-worker.ts`
3. **Prompt Builder UI** - Add structured input controls
4. **Job Status Polling** - Add simple polling hook
5. **Theme JSON Schema** - Define in CMS package

---

## 📚 Reference Documents

- **Primary:** `docs/design-documents/design-document-v4.md`
- **Billing:** `docs/design-documents/design-document-v3.md`
- **Data Models:** `docs/architecture/02-data-layer.md`
- **Structure:** `docs/architecture/01-monotrpo-structure.md`
- **Evolution:** `docs/design-documents/DESIGN-EVOLUTION-NOTES.md`

