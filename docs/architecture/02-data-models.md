# Database Schema Strategy

We use a single PostgreSQL database with Logical Isolation via tenant_id.

## 1. Core Tenant & Identity

```prisma
model Tenant {
  id                String   @id @default(uuid())
  slug              String   @unique // e.g. "nike", "agency-a"
  customDomain      String?  @unique
  name              String

  // Design System (Theming)
  themeConfig       Json     // { "colors": { "primary": "#000" }, "fonts": "Inter" }

  // Billing
  subscriptionStatus String
  stripeConnectId    String? // For revenue sharing
  aiCreditsBalance   Int     @default(100)

  users    User[]
  products Product[]
  pages    Page[]
}

model User {
  id        String   @id @default(uuid())
  email     String
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  role      String   // "OWNER", "EDITOR", "VIEWER"

  @@unique([email, tenantId]) // A user can belong to multiple tenants
}
```

## 2. The CMS & AI Content

```prisma
model Page {
  id          String   @id @default(uuid())
  tenantId    String
  slug        String   // "/home", "/about"
  
  // The JSON Tree for the Editor
  // Example: { "root": { "component": "Hero", "props": {... } } }
  structure   Json     
  
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, slug])
}

model Asset {
  id              String  @id @default(uuid())
  tenantId        String
  url             String
  
  // AI Context
  aiDescription   String? @db.Text // "A red sneaker on a white background..."
  embedding       Unsupported("vector(1536)")? // For semantic search
}
```

## 3. Billing & Usage (Ledger)

```prisma
model CreditTransaction {
  id          String   @id @default(uuid())
  tenantId    String
  amount      Int      // Negative for usage, Positive for purchase
  type        String   // "AI_GENERATION", "TOP_UP", "MONTHLY_GRANT"
  referenceId String?  // ID of the Page generation or Stripe Invoice
  createdAt   DateTime @default(now())
  
  @@index([tenantId])
}
```
