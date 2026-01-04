*Explains how to handle the single database with separate schemas.*

# Data Strategy: Separate Clients, Shared DB

To ensure the "standalone" nature of our repos, we cannot have a single giant `schema.prisma`. Each package must own its data.

## 1. Multi-Schema Prisma Setup

We use PostgreSQL **Schemas** (Namespaces) to keep tables distinct within the same database.

### Commerce Package (`packages/commerce/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
  previewFeatures = []
}

model Product {
  id          String @id
  //...
  @@map("commerce_products") // Prefix tables or use distinct PG Schema
}
```

### Editor Package (`packages/ai-editor/prisma/schema.prisma`)

```prisma
//... setup
model GenerationLog {
  id        String @id
  productId String // Logical Link (just a string, NO @relation)
  //...
  @@map("editor_logs")
}
```

## 2. The Database Connection

All packages share the same DATABASE_URL environment variable provided by the Host `apps/platform`.

## 3. Logical Linking (No Foreign Keys)

Since Product is in the Commerce module and GenerationLog is in the Editor module, we cannot use SQL JOIN.

### Pattern: The Data Fetcher

If the Editor needs product details:

- It accepts productId as a prop/argument.
- It asks the Host or a passed Adapter to fetch details. OR
- If running in Monolith mode, it imports the CommerceService directly (Pragmatic approach).

**Recommendation:** For this project, Direct Import is acceptable since it's a Monolith. `import { getProduct } from '@repo/commerce'` is allowed inside `@repo/cms`, AS LONG AS we acknowledge that extracting cms later would require mocking this import.
