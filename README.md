# Algedi - Multi-Tenant E-Commerce Platform

A multi-tenant e-commerce platform built with Turborepo, featuring AI-powered page generation.

## Architecture

This monorepo consists of three distinct domains:

1. **packages/ai-editor** (The Brain): A stateless React library for AI-powered page generation
2. **apps/cms** (The Host): Next.js 14 App Router application handling auth, routing, and tenant config
3. **apps/commerce-core** (The Vault): Headless API (MedusaJS) - Single Source of Truth for Products, Orders, and Customers
4. **apps/ai-service**: Backend service for AI operations (image description, page generation)

## Tech Stack

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript
- **Frontend**: Next.js 14, React, Tailwind CSS, Radix UI
- **Backend**: MedusaJS, Express
- **Database**: PostgreSQL (with Row Level Security)
- **Cache/Queue**: Redis
- **Validation**: Zod
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker and Docker Compose

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start infrastructure services (PostgreSQL and Redis):
```bash
docker-compose up -d
```

3. Run all apps in development mode:
```bash
pnpm dev
```

### Individual Services

- **CMS**: http://localhost:3000
- **Commerce Core**: http://localhost:9000
- **AI Service**: http://localhost:3001

## Project Structure

```
.
├── apps/
│   ├── cms/              # Next.js CMS application
│   ├── commerce-core/    # MedusaJS commerce API
│   └── ai-service/       # AI operations service
├── packages/
│   └── ai-editor/        # React library for AI editor
└── docs/
    └── architecture/     # Architecture documentation
```

## Environment Variables

Create `.env.local` files in each app directory as needed. See individual README files for specific requirements.

## Development

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all apps

## License

See LICENSE file.

