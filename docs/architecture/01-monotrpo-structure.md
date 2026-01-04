Defines the file tree and package exports.

# Architectural Blueprint: The Modular Monolith

## 1. Directory Structure

```
/
├── apps/
│   └── platform/              # The "Host" / Showcase Application
│       ├── app/
│       │   ├── api/
│       │   │   └── [...route]/ # Mounts package routes here
│       │   └── [tenant]/     # Multi-tenant routing
│       └── .env               # Contains the SINGLE DATABASE URL
├── packages/
│   ├── ai-editor/             # STANDALONE PRODUCT 1
│   │   ├── prisma/            # Own schema
│   │   ├── src/
│   │   │   ├── components/    # React Editor UI
│   │   │   ├── lib/           # Internal Logic
│   │   │   └── actions.ts     # Server Actions
│   │   └── package.json
│   ├── cms/                   # STANDALONE PRODUCT 2
│   │   └── ...
│   ├── commerce/              # STANDALONE PRODUCT 3
│   │   └── ...
│   └── shared-ui/             # Shared Design System (Button, Card)
```

## 2. The "Mounting" Pattern

The `apps/platform` does not write business logic. It **mounts** logic.

### API Routes

Next.js 15 Route Handlers are defined in packages and re-exported by the app.

**`packages/commerce/src/api/webhooks.ts`**
```typescript
export const POST = async (req) => {...}
```

**`apps/platform/app/api/commerce/webhooks/route.ts`**
```typescript
export { POST } from '@repo/commerce/api/webhooks';
```

### Pages

The App Router layouts are in the host, but the content comes from packages.

**`apps/platform/app/[tenant]/editor/page.tsx`**
```typescript
import { VisualEditor } from '@repo/ai-editor';

export default function EditorPage({ params }) {
  return <VisualEditor context={{ tenantId: params.tenant }} />;
}
```
