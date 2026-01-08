# Production Dockerfile for Algedi Platform
# Uses Turborepo pruning to build only the platform app and its dependencies

# Stage 1: Prune and install dependencies
FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/platform/package.json ./apps/platform/
COPY packages/ai-editor/package.json ./packages/ai-editor/
COPY packages/cms/package.json ./packages/cms/
COPY packages/commerce/package.json ./packages/commerce/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Prune workspace
FROM base AS pruned

# Copy all source files
COPY . .

# Prune workspace to only include platform and its dependencies
RUN pnpm turbo prune --scope=platform --docker

# Stage 3: Install pruned dependencies
FROM node:18-alpine AS installer

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Copy pruned workspace
COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# Stage 4: Build
FROM installer AS builder

WORKDIR /app

# Copy source files from pruned workspace
COPY --from=pruned /app/out/full/ .

# Generate Prisma clients for all packages
RUN pnpm --filter @repo/ai-editor prisma:generate
RUN pnpm --filter @repo/cms prisma:generate
RUN pnpm --filter @repo/commerce prisma:generate

# Build the platform app
RUN pnpm --filter @repo/platform build

# Stage 5: Runner
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Copy package files
COPY --from=installer /app/package.json ./
COPY --from=installer /app/pnpm-lock.yaml ./
COPY --from=installer /app/pnpm-workspace.yaml ./
COPY --from=installer /app/turbo.json ./

# Copy app package files
COPY --from=installer /app/apps/platform/package.json ./apps/platform/
COPY --from=installer /app/packages/ai-editor/package.json ./packages/ai-editor/
COPY --from=installer /app/packages/cms/package.json ./packages/cms/
COPY --from=installer /app/packages/commerce/package.json ./packages/commerce/
COPY --from=installer /app/packages/ui/package.json ./packages/ui/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/apps/platform/.next/standalone ./
COPY --from=builder /app/apps/platform/.next/static ./apps/platform/.next/static
COPY --from=builder /app/apps/platform/public ./apps/platform/public

# Copy Prisma schemas and generated clients
COPY --from=builder /app/packages/ai-editor/prisma ./packages/ai-editor/prisma
COPY --from=builder /app/packages/ai-editor/src/generated ./packages/ai-editor/src/generated
COPY --from=builder /app/packages/cms/prisma ./packages/cms/prisma
COPY --from=builder /app/packages/cms/src/generated ./packages/cms/src/generated
COPY --from=builder /app/packages/commerce/prisma ./packages/commerce/prisma
COPY --from=builder /app/packages/commerce/src/generated ./packages/commerce/src/generated

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "apps/platform/server.js"]
