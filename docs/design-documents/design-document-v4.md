# **Architectural Consolidation of Full-Stack Capabilities: The "Full-Stack Package" Pattern in Next.js Monorepos**

## **Executive Summary**

The contemporary landscape of web application architecture is increasingly defined by the tension between modularity and cohesion. As organizations adopt "monorepo" strategies—consolidating multiple projects into a single repository—a common architectural fracture emerges: the separation of User Interface (UI) libraries from the Backend services that power them. This report addresses the specific architectural challenge of consolidating a disjointed frontend package (packages/ai-editor) and a backend service application (apps/ai-service) into a unified, portable, and autonomous "Full-Stack Package" (FSP).

The proposed FSP architecture leverages the advanced capabilities of Next.js 15, specifically the App Router, Server Actions, and Route Handlers, alongside robust asynchronous processing via BullMQ. By encapsulating the UI components, API definition, and background worker logic within a single workspace package (e.g., @repo/ai-feature), we achieve a "Modular Monolith" structure. This unit does not run itself but is designed to be "mounted" by a Host Application (CMS), which provides the execution context, authentication, and infrastructure.

This comprehensive analysis explores the theoretical underpinnings of this pattern, the intricate mechanics of Next.js server-side module resolution, the orchestration of asynchronous worker threads from within a static package structure, and the operational realities of deploying such a hybrid construct. The findings suggest that this consolidation significantly reduces "context switching" overhead, eliminates version drift between frontend and backend, and enhances type safety without requiring complex build steps.

## ---

**1\. The Paradigm Shift: From Microservices to Modular Full-Stack Packages**

### **1.1 The Decomposition Dilemma in Monorepos**

In the evolution of distributed systems, the pendulum has swung from monolithic architectures to microservices, and now, toward the "monorepo" or "modular monolith." Tools like Turborepo have standardized the structure of these repositories, typically enforcing a strict dichotomy between apps/ (deployable units) and packages/ (shared, stateless libraries).1

The user's legacy architecture—splitting packages/ai-editor (UI) and apps/ai-service (Backend)—adheres to this traditional dichotomy. While this separation nominally respects the "separation of concerns" principle, it introduces significant friction in practice. A single feature request, such as "add a new AI text summarization capability," necessitates changes across multiple disparate locations:

1. **The UI Package:** To render the new button and handle the user interaction.  
2. **The Backend App:** To expose the new API endpoint and process the request.  
3. **The Shared Types:** To ensure the payload contract matches between the two.

This separation creates a "distributed monolith" where code is physically separated but logically coupled. The developer must context-switch between different directories, build pipelines, and potentially different testing frameworks, increasing the cognitive load and the likelihood of integration bugs. Furthermore, version skew becomes a constant risk; if the UI package is updated to send a new parameter but the Backend app is not deployed simultaneously, the feature fails.

### **1.2 Defining the Full-Stack Package (FSP)**

The **Full-Stack Package (FSP)** represents a paradigm shift that breaks this rigid dichotomy. An FSP is a workspace package (e.g., packages/ai-fullstack) that encapsulates an entire domain capability. It is not merely a library of components, nor is it a standalone server. It is a portable unit of functionality that contains:

* **User Interface:** React components (both Client and Server) that provide the visual interaction layer.2  
* **Server Logic:** Next.js Route Handlers and Server Actions that encapsulate the domain's business rules and backend logic.3  
* **Asynchronous Workers:** Definitions for BullMQ queues and processors to handle long-running tasks like AI inference.4  
* **Data Schema:** Domain-specific database definitions (e.g., Prisma schemas) that govern the persistence layer.

Critically, the FSP is **agnostic to the host**. It does not own the HTTP server instance, the root authentication session, or the deployment URL. Instead, it exports *capabilities*—route factories, component trees, and worker functions—that a Host Application (e.g., a corporate CMS, a dashboard, or a customer portal) imports and mounts. This "Inversion of Control" allows the feature to be dropped into any Next.js application within the organization with minimal configuration, ensuring high cohesion and extreme portability.

### **1.3 Architectural Benefits of Consolidation**

The primary advantage of this consolidation is **Atomic Feature Deployment**. A version bump to @repo/ai-fullstack upgrades both the editor UI and the text-processing algorithms simultaneously. This guarantees that the frontend code always runs against the matching backend logic, eliminating the class of bugs caused by API version mismatches.

Secondly, the **Colocation of Concerns** significantly improves developer velocity. The API handler that processes a form submission resides in the same file or adjacent directory as the React component that renders the form. This spatial locality allows for easier code navigation and refactoring. If a developer needs to rename a field in the database, they can propagate that change through the API layer and into the UI layer within a single, atomic commit, aided by TypeScript's refactoring tools which work most effectively within a single project context.

Finally, **Shared Type Safety** is achieved implicitly. In a split architecture, types must be exported from a third package or duplicated. In an FSP, the UI component can import the return type of the database query directly (or via type inference), creating a seamless flow of data contract enforcement from the database to the pixel.5

## ---

**2\. Next.js 15 Core Mechanics for Modular Design**

To successfully implement the FSP pattern, one must understand the specific capabilities of Next.js 15 that enable this architecture. The framework has evolved from a page-based router to a component-based architecture that blurs the line between client and server.

### **2.1 The App Router and Server Components**

The App Router (app/ directory) introduced in Next.js 13 and refined in version 15 is the foundation of the FSP. Unlike the Pages router, which relied on file-system routing mapping directly to URLs, the App Router allows for colocation of logic. More importantly, it introduces **React Server Components (RSC)**.2

RSCs allow components to render exclusively on the server, fetching data directly from the database or filesystem, and sending only the rendered HTML (and a minimal JSON payload) to the client. This is crucial for the FSP because it allows the package to contain "backend" code (database queries) directly inside the UI components exported to the host.

For example, an exported \<AIHistory /\> component can directly import the Prisma client and query the database. When the Host App imports and uses this component, Next.js executes that logic on the server. The Host App does not need to know that the component is connecting to a database; it simply renders a React element. This encapsulation is impossible in traditional client-side React libraries, which would require the Host to provide an API endpoint and the component to fetch from it.2

### **2.2 Server Actions: The Invisible RPC**

Next.js 15 emphasizes **Server Actions**—asynchronous functions executed on the server that can be invoked from Client Components.3 This feature is a game-changer for the FSP architecture.

In the legacy split architecture (apps/ai-service), the frontend would need to know the URL of the backend API (e.g., POST https://api.service.com/generate). This introduces configuration overhead (managing NEXT\_PUBLIC\_API\_URL env vars) and fragility.

With Server Actions, the FSP exports a TypeScript function:

TypeScript

// packages/ai-fullstack/src/actions.ts  
'use server';  
export async function generateText(input: string) {... }

The UI component within the same package simply imports and calls this function. During the build process, Next.js automatically creates a unique, encrypted API endpoint for this action. The network details are abstracted away. The Host App, by mounting the UI component, inherently mounts the necessary API capabilities to support it, without explicitly configuring route handlers for every interaction.5

### **2.3 Route Handlers and "Route Factories"**

While Server Actions handle UI interactions (mutations), standard REST endpoints are often still required for webhooks (e.g., callbacks from an external AI provider) or public APIs. Next.js 15 replaces pages/api with **Route Handlers** (route.ts).8

In an FSP context, we cannot define the exact file path (e.g., app/api/callback/route.ts) because the package does not own the Host's app directory. Instead, we utilize a **Route Factory pattern**. The package exports a function that *returns* the handler methods (GET, POST). The Host App creates a file at its desired path and invokes this factory, effectively "mounting" the logic. This aligns with the "Inversion of Control" principle, allowing the Host to inject configuration (like API keys or database connections) into the handler at runtime.9

## ---

**3\. Designing the Full-Stack Package Structure**

A unified package structure must rigorously separate runtime concerns (Browser vs. Server vs. Worker) while maintaining a unified development experience. The directory layout is critical for enabling the build tools (Turborepo, Next.js Compiler) to correctly process the code.

### **3.1 The Directory Blueprint**

We propose consolidating the logic into a new workspace, packages/ai-fullstack. The internal architecture mirrors a standard application but without the routing framework's scaffolding.

**Proposed Directory Structure:**

Plaintext

packages/ai-fullstack/  
├── package.json  
├── tsconfig.json  
├── turbo.json  
├── src/  
│   ├── components/          \# UI Layer (React)  
│   │   ├── Editor.tsx       \# Client Component ('use client')  
│   │   ├── Toolbar.tsx      \# Client Component  
│   │   └── Dashboard.tsx    \# Server Component (RSC)  
│   ├── server/              \# Backend Logic Layer  
│   │   ├── actions.ts       \# Next.js Server Actions ('use server')  
│   │   ├── handlers/        \# API Route Factories  
│   │   │   └── api-handler.ts  
│   │   └── db.ts            \# Database client (Prisma/Drizzle)  
│   ├── workers/             \# Async Processing Layer  
│   │   ├── queue.ts         \# BullMQ Queue Factory  
│   │   ├── worker.ts        \# BullMQ Worker Factory  
│   │   └── processors/      \# Individual Job Logic  
│   │       └── text-generation.ts  
│   └── lib/                 \# Shared Utilities  
│       ├── types.ts         \# Zod schemas & TS interfaces  
│       └── utils.ts  
└── index.ts                 \# Main Entry Point (Barrel file \- Caution\!)

### **3.2 The package.json Exports Strategy**

Modern Node.js and Next.js rely on the exports field in package.json to handle module resolution. For an FSP, using subpath exports is superior to a single index file. It allows the Host App to import specific layers while preventing accidental bundling of server code into client bundles (Leaf-shaking).1

**packages/ai-fullstack/package.json:**

JSON

{  
  "name": "@repo/ai-fullstack",  
  "version": "1.0.0",  
  "private": true,  
  "exports": {  
    ".": "./src/index.ts",  
    "./ui": "./src/components/index.ts",  
    "./api": "./src/server/handlers/index.ts",  
    "./actions": "./src/server/actions.ts",  
    "./worker": "./src/workers/index.ts",  
    "./types": "./src/lib/types.ts"  
  },  
  "scripts": {  
    "lint": "eslint.",  
    "type-check": "tsc \--noEmit"  
  },  
  "dependencies": {  
    "bullmq": "^5.0.0",  
    "ioredis": "^5.3.0",  
    "openai": "^4.0.0",  
    "zod": "^3.22.0",  
    "server-only": "^0.0.1"  
  },  
  "peerDependencies": {  
    "react": "^19.0.0",  
    "next": "^15.0.0"  
  }  
}

By defining these exports, the Host App can import @repo/ai-fullstack/ui for its pages and @repo/ai-fullstack/api for its route handlers. This provides a clear visual separation of concerns in the import statements and aids the bundler in tree-shaking unused code.

### **3.3 Turborepo and Transpilation Configuration**

A critical technical detail in Next.js monorepos is how internal packages are consumed. Historically, packages were pre-compiled (using tsup or rollup) to JavaScript before being consumed by the app. However, Next.js features like Server Actions rely on static analysis of the source code (specifically the 'use client' and 'use server' directives).3

If we pre-compile the package, these directives might be lost or misplaced, causing Next.js to treat Server Components as Client Components or failing to create API endpoints for Actions. Therefore, the FSP should be consumed as **raw TypeScript source**.

To enable this, the Host App (apps/cms) must be configured to transpile the package on the fly.

**Root apps/cms/next.config.js:**

JavaScript

/\*\* @type {import('next').NextConfig} \*/  
const nextConfig \= {  
  // Critical: Tells Next.js to compile this package from source  
  transpilePackages: \['@repo/ai-fullstack'\],  
  experimental: {  
    // Ensure Server Actions can be called from the host's domain  
    serverActions: {  
      allowedOrigins: \['my-cms.com', 'localhost:3000'\],  
    },  
  },  
};

module.exports \= nextConfig;

This configuration is the linchpin of the architecture. It ensures that when Next.js compiles the Host App, it enters the node\_modules/@repo/ai-fullstack directory, reads the TypeScript files, and processes the Next.js-specific directives exactly as if the code were inside the apps/cms directory.11

## ---

**4\. The Interface Layer: UI & Interaction**

The UI layer (src/components) contains the visual elements of the AI feature. In the FSP pattern, we must be rigorous about Client vs. Server boundaries to maintain performance and security.

### **4.1 Managing 'use client' Boundaries**

In a monolithic app, developers often mix client and server code casually. In a shared package, boundaries must be explicit. We adhere to the pattern of **"Leaf-Node Interactivity"**.2

* **Server Components:** The default. Used for data fetching or layout.  
* **Client Components:** Marked with 'use client'. Used only for interactivity (state, effects, event listeners).

**Example: The AI Editor Component**

TypeScript

// src/components/Editor.tsx  
'use client';

import { useState, useTransition } from 'react';  
import { generateTextAction } from '../server/actions'; // Direct import of Server Action

export function AIEditor({ initialData }: { initialData: string }) {  
  const \[content, setContent\] \= useState(initialData);  
  const \= useTransition();

  const handleGenerate \= () \=\> {  
    startTransition(async () \=\> {  
      // RPC call to package backend. No fetch(), no URLs.  
      const result \= await generateTextAction(content);   
      if (result.success) {  
        setContent(result.data);  
      }  
    });  
  };

  return (  
    \<div className\="ai-editor-container"\>  
      \<textarea   
        value\={content}   
        onChange\={(e) \=\> setContent(e.target.value)}   
        disabled={isPending}  
      /\>  
      \<button onClick\={handleGenerate} disabled\={isPending}\>  
        {isPending? 'Generating...' : 'Enhance with AI'}  
      \</button\>  
    \</div\>  
  );  
}

Notice the direct import of generateTextAction. Next.js is intelligent enough to see this import crossing the client/server boundary. It automatically generates a network call to the Host App's internal API to execute that function. This is the "Full-Stack" magic—no manual API fetch code or route handling is required in the component.3

### **4.2 Shared State and Context Injection**

Often, the FSP needs context from the Host App, such as the current user's ID or theme settings. Since the package cannot import from the Host (circular dependency), the Host must inject this context.

We avoid using React Context for *server-side* data (like User ID) because Server Components do not support Context.12 Instead, we use **Props Passing** or **Callback Wrappers**.

**Pattern: The Callback Wrapper**

If the generateTextAction needs to verify the user's session, the package cannot import the Host's auth.ts. Instead, the package defines the action to accept a user ID, and the Host wraps it.

*Package:*

TypeScript

// packages/ai-fullstack/src/server/actions.ts  
export async function generateTextAction(text: string, userId: string) {... }

*Host App:*

TypeScript

// apps/cms/actions/wrapped-ai.ts  
'use server';  
import { generateTextAction } from '@repo/ai-fullstack/actions';  
import { getSession } from '@/lib/auth';

export async function secureGenerate(text: string) {  
  const session \= await getSession();  
  if (\!session) throw new Error('Unauthorized');  
  return generateTextAction(text, session.userId);  
}

This pattern keeps the package pure and testable, while the Host remains the authority on authentication and authorization.5

## ---

**5\. The Service Layer: API & Logic**

While Server Actions handle direct UI interactions, the FSP often needs to expose standard REST endpoints (e.g., for webhooks, mobile apps, or third-party integrations).

### **5.1 The "Route Factory" Pattern**

Next.js Route Handlers are defined by exporting async functions named GET, POST, etc., from a route.ts file.8 In a package, we cannot dictate the file path. Instead, we export a **Route Factory**—a function that creates the handlers.

**Package Side: src/server/handlers/api-handler.ts**

TypeScript

import { NextRequest, NextResponse } from 'next/server';  
import { AIService } from '../services/ai-service';

// Configuration interface allows Host to inject secrets  
export type AIConfig \= {  
  apiKey: string;  
  redisUrl: string;  
  webhookSecret: string;  
};

export function createAIHandler(config: AIConfig) {  
  return {  
    POST: async (req: NextRequest) \=\> {  
      // 1\. Verify Request  
      const body \= await req.json();  
        
      // 2\. Logic execution using injected config  
      const result \= await AIService.process(body, config);  
        
      // 3\. Response  
      return NextResponse.json(result);  
    },  
    GET: async (req: NextRequest) \=\> {  
       return NextResponse.json({ status: 'active', service: 'ai-fullstack' });  
    }  
  };  
}

**Host Side: apps/cms/app/api/ai/\[...slug\]/route.ts**

TypeScript

import { createAIHandler } from '@repo/ai-fullstack/api';

// Inject environment variables here, keeping them out of the package source  
const handler \= createAIHandler({  
  apiKey: process.env.OPENAI\_API\_KEY\!,  
  redisUrl: process.env.REDIS\_URL\!,  
  webhookSecret: process.env.WEBHOOK\_SECRET\!  
});

export const POST \= handler.POST;  
export const GET \= handler.GET;

This implementation utilizes a **Dynamic Route Segment** (\[...slug\]) or a specific path. The factory pattern effectively acts as Dependency Injection. The package defines *how* to handle the request, but the Host supplies the *configuration* (secrets, database connections). This makes the package extremely testable (you can inject mock configs) and environment-agnostic.9

### **5.2 Server Actions vs. Route Handlers**

The table below summarizes when to use which mechanism within the FSP:

| Feature | Server Actions | Route Handlers (via Factory) |
| :---- | :---- | :---- |
| **Primary Use Case** | Form submissions, UI mutations | Webhooks, Public API, Mobile App Backend |
| **Invocation** | Direct import in React Component | HTTP fetch() request |
| **Method** | POST only | GET, POST, PUT, DELETE, etc. |
| **Caching** | Integrated with Next.js Router Cache | No default caching (Next.js 15 change) 9 |
| **Security** | CSRF protection built-in | Manual validation required |
| **Context** | Access to cookies(), headers() | Access to Request object |

For the specific goal of "consolidating the AI Editor," Server Actions are the preferred default for all internal UI interactions due to their simplicity and tight integration with the React lifecycle.5

## ---

**6\. The Asynchronous Processing Layer**

The most complex requirement of this consolidation is the integration of the Backend's async processing capabilities (formerly apps/ai-service) into the package. This typically involves a message queue (BullMQ) and Redis.

Next.js is primarily a request-response framework. It is not designed to run long-lived processes like queue workers within the same process as the web server, especially in serverless environments. Therefore, the FSP must export the *definition* of the worker, which the Host then executes in a decoupled manner.4

### **6.1 Architecture of the Shared Queue**

The FSP contains two key components for async work:

1. **The Producer (Queue):** Adds jobs to Redis. Used by Server Actions/Route Handlers.  
2. **The Consumer (Worker):** Reads jobs from Redis and processes them.

**Package-Side: Connection Factories**

We must avoid global side effects. If the package instantiates a new Queue() at the top level, it might create connections during the build phase or create duplicate connections during hot reloading. We use factories instead.

TypeScript

// packages/ai-fullstack/src/workers/queue.ts  
import { Queue } from 'bullmq';

export const getQueue \= (connection: any) \=\>   
  new Queue('ai-processing-queue', { connection });

TypeScript

// packages/ai-fullstack/src/workers/factory.ts  
import { Worker } from 'bullmq';  
import { aiProcessor } from './processor';

export function createAIWorker(connection: any) {  
  const worker \= new Worker('ai-processing-queue', aiProcessor, {  
    connection,  
    concurrency: 5,  
    lockDuration: 30000  
  });

  worker.on('completed', job \=\> console.log(\`Job ${job.id} completed\`));  
  worker.on('failed', (job, err) \=\> console.error(\`Job ${job?.id} failed\`, err));

  return worker;  
}

### **6.2 Host-Side Execution Strategies**

The Host Application needs to run this worker. There are two primary architectural approaches to this in a Next.js 15 context.

#### **Strategy A: The "Dedicated Worker Script" (Recommended for Production)**

For production scalability, the worker should run as a separate process from the web server. Since the logic is inside the package, we can create a lightweight script in the Host App that simply imports and runs the worker.14

**apps/cms/scripts/start-worker.ts**

TypeScript

import { createAIWorker } from '@repo/ai-fullstack/worker';  
import Redis from 'ioredis';  
import dotenv from 'dotenv';

dotenv.config(); // Load env vars

const connection \= new Redis(process.env.REDIS\_URL\!);  
console.log('Starting standalone AI worker...');

const worker \= createAIWorker(connection);

// Graceful shutdown  
const shutdown \= async () \=\> {  
  await worker.close();  
  process.exit(0);  
};

process.on('SIGTERM', shutdown);  
process.on('SIGINT', shutdown);

This script allows the Host to spawn a process specifically for the worker. In a containerized environment (Docker), we can use the same image but override the start command to run this script instead of next start. This ensures the Worker and the Web App always share the exact same version of the code and dependencies.

#### **Strategy B: The Next.js Instrumentation Hook (Dev/Serverless)**

Next.js 15 provides an instrumentation.ts hook that runs when the server starts.16 This can be used to spin up the worker, but it is risky in serverless environments (Vercel/AWS Lambda) because the process may freeze or die between requests. This approach is suitable only for local development or specific "Long-Running Server" deployments.

**apps/cms/instrumentation.ts**

TypeScript

export async function register() {  
  if (process.env.NEXT\_RUNTIME \=== 'nodejs') {  
    // Dynamic import to avoid bundling worker in edge runtime  
    const { createAIWorker } \= await import('@repo/ai-fullstack/worker');  
    const { redis } \= await import('./lib/redis');   
      
    if (process.env.ENABLE\_INTERNAL\_WORKER \=== 'true') {  
      createAIWorker(redis);  
      console.log('Background AI Worker Started within Next.js process');  
    }  
  }  
}

### **6.3 Observability**

To monitor these queues, the FSP can export an adapter for **Bull Board**. The Host mounts this adapter on a specific route (e.g., /admin/queues), providing a UI to inspect job statuses, retry failed jobs, and view logs.13 This integrates the operational management of the async layer directly into the CMS.

## ---

**7\. Data Persistence and Type Safety**

Consolidating the UI and Backend allows for unified data modeling, typically using an ORM like Prisma or Drizzle.

### **7.1 Prisma in a Shared Package**

It is best practice to house the Prisma schema in the shared package (packages/ai-fullstack/prisma/schema.prisma).

1. **Generation:** The package defines a postinstall script to generate the client: prisma generate.  
2. **Singleton Pattern:** The package exports a singleton instance of the Prisma Client to prevent connection exhaustion in development.17

**packages/ai-fullstack/src/server/db.ts**

TypeScript

import { PrismaClient } from '@prisma/client';  
import 'server-only'; // Prevent leakage to client

const globalForPrisma \= global as unknown as { prisma: PrismaClient };

export const prisma \= globalForPrisma.prisma |

| new PrismaClient();

if (process.env.NODE\_ENV\!== 'production') globalForPrisma.prisma \= prisma;

### **7.2 Zero-API Type Inference**

One of the strongest arguments for the FSP is the elimination of manual DTOs (Data Transfer Objects). Because the UI and API are in the same package, the UI component can infer types directly from the database query function.

TypeScript

// src/server/queries.ts  
export async function getGenerations() {  
  return prisma.generation.findMany({   
    select: { id: true, text: true, createdAt: true }   
  });  
}

// src/components/HistoryList.tsx  
import { getGenerations } from '../server/queries';

// Awaited\<ReturnType\<T\>\> infers the exact shape returned by Prisma  
type Generation \= Awaited\<ReturnType\<typeof getGenerations\>\>\[number\];

export function HistoryList({ items }: { items: Generation }) {  
  // TypeScript guarantees 'items' matches the database query result exactly  
  return \<ul\>{items.map(g \=\> \<li key\={g.id}\>{g.text}\</li\>)}\</ul\>;  
}

This pattern creates a resilient bond between the data layer and the UI. If a field is removed from the Prisma query, the UI component immediately throws a TypeScript error during the build, catching bugs before they reach production.

## ---

**8\. Operational Strategy & Deployment**

Deploying a monorepo with an FSP requires a specific strategy to ensure the package code is correctly bundled and the worker process is correctly orchestrated.

### **8.1 The "Monorepo Docker" Pattern**

When deploying to environments like AWS ECS, Railway, or Render, the build context is critical. Standard Dockerfiles often fail because apps/cms depends on packages/ai-fullstack, which is outside the build context if you only copy the app folder.

We utilize **Turborepo Pruning** (turbo prune).11

**Dockerfile Strategy:**

1. **Prune:** Run turbo prune \--scope=cms \--docker. This generates a reduced version of the monorepo containing *only* the CMS app and its internal dependencies (including ai-fullstack).  
2. **Install:** Copy the pruned package.json files and run npm install.  
3. **Build:** Run npm run build for the CMS.  
4. **Runner:** The final image contains the built app.

### **8.2 Single Image, Dual Roles**

To simplify the CI/CD pipeline, we recommend building a **single Docker image** for the Host App. This image contains both the web server code and the worker script.

* **Web Container:** Deployed with command npm start. Handles HTTP traffic.  
* **Worker Container:** Deployed with command npm run worker. Handles background jobs.

**Benefits:**

* **Consistency:** Guaranteed code synchronization. It is impossible for the Web container to enqueue a job version that the Worker container does not understand.  
* **Simplicity:** Only one build pipeline and one artifact to manage.  
* **Scalability:** You can scale the Web and Worker containers independently based on load (e.g., high traffic \= scale Web; massive batch job \= scale Worker).

### **8.3 Environment Variable Management**

A major risk in FSP architecture is the leakage of server-side secrets (e.g., OPENAI\_API\_KEY) into the client bundle. Next.js inlines NEXT\_PUBLIC\_ variables at build time.

* **Rule:** The FSP should *never* access process.env directly for secrets. It should accept them via configuration objects (Dependency Injection) passed from the Host.  
* **Enforcement:** Use the server-only package in all backend files. If a developer accidentally imports a file containing secrets into a Client Component, the build will fail immediately.2

## ---

**9\. Migration & Implementation Roadmap**

To achieve the user's goal of consolidating packages/ai-editor and apps/ai-service, the following step-by-step execution plan is recommended:

| Phase | Action Item | Description |
| :---- | :---- | :---- |
| **1\. Scaffold** | **Create Workspace** | Initialize packages/ai-fullstack with the structure defined in Section 3.1. Configure package.json exports. |
| **2\. Migration** | **Move Utilities** | Migrate shared Zod schemas and TypeScript interfaces to src/lib. |
| **3\. Backend** | **Refactor Logic** | Copy API route handlers from apps/ai-service. Refactor them into **Route Factories** (src/server/handlers). Convert simple endpoints to **Server Actions** (src/server/actions.ts). |
| **4\. Async** | **Migrate Workers** | Move BullMQ processors to src/workers. Create the Queue and Worker factory functions. |
| **5\. Frontend** | **Move UI** | Move React components from packages/ai-editor to src/components. Update imports to use relative paths to src/server. |
| **6\. Integration** | **Configure Host** | Update apps/cms/package.json to depend on @repo/ai-fullstack. Add transpilePackages to next.config.js. |
| **7\. Mounting** | **Mount Capabilities** | Create apps/cms/app/api/ai/\[...slug\]/route.ts using the factory. Create scripts/start-worker.ts in the CMS app. |
| **8\. Cleanup** | **Decommission** | Remove apps/ai-service and packages/ai-editor from the repository. |

## ---

**Conclusion**

The consolidation of packages/ai-editor and apps/ai-service into a **Full-Stack Package** represents a mature evolution of the Next.js monorepo architecture. By treating the UI and Backend not as separate operational entities but as facets of a single **Functional Domain**, we significantly reduce architectural complexity.

This architecture leverages the unique convergence of features in Next.js 15:

* **Server Actions** provide a zero-config RPC layer for internal mutations.  
* **Route Handlers** with Factory patterns allow for flexible, host-controlled API mounting.  
* **Transpilation** allows for a seamless development experience with raw TypeScript sources.  
* **BullMQ** (integrated via factory patterns) solves the asynchronous processing requirement while respecting the stateless nature of the web server.

The result is a "Modular Monolith" that offers the best of both worlds: the strict boundaries and portability of microservices, with the ease of development, type safety, and atomic deployment of a monolith. For the organization, this means faster feature velocity, fewer integration bugs, and a more maintainable codebase.

#### **Works cited**

1. Structuring a repository \- Turborepo, accessed January 4, 2026, [https://turborepo.com/docs/crafting-your-repository/structuring-a-repository](https://turborepo.com/docs/crafting-your-repository/structuring-a-repository)  
2. Getting Started: Server and Client Components \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components)  
3. Server Actions and Mutations \- Data Fetching \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations](https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations)  
4. Queues | NestJS \- A progressive Node.js framework, accessed January 4, 2026, [https://docs.nestjs.com/techniques/queues](https://docs.nestjs.com/techniques/queues)  
5. Server Actions in Next.js: Why You Shouldn't Ignore Them \- Wisp CMS, accessed January 4, 2026, [https://www.wisp.blog/blog/server-actions-in-nextjs-why-you-shouldnt-ignore-them](https://www.wisp.blog/blog/server-actions-in-nextjs-why-you-shouldnt-ignore-them)  
6. Migrating: App Router \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/app/guides/migrating/app-router-migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration)  
7. Getting Started: Updating Data \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/app/getting-started/updating-data](https://nextjs.org/docs/app/getting-started/updating-data)  
8. API Routes \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/pages/building-your-application/routing/api-routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)  
9. Getting Started: Route Handlers \- Next.js, accessed January 4, 2026, [https://nextjs.org/docs/app/getting-started/route-handlers](https://nextjs.org/docs/app/getting-started/route-handlers)  
10. File-system conventions: route.js | Next.js, accessed January 4, 2026, [https://nextjs.org/docs/app/api-reference/file-conventions/route](https://nextjs.org/docs/app/api-reference/file-conventions/route)  
11. Self-hosting Next.js 15 (App Router \+ Turborepo) without full monorepo dependencies \#85099 \- GitHub, accessed January 4, 2026, [https://github.com/vercel/next.js/discussions/85099](https://github.com/vercel/next.js/discussions/85099)  
12. How to Share API Data Across Multiple Server Components in Next.js 15? : r/nextjs \- Reddit, accessed January 4, 2026, [https://www.reddit.com/r/nextjs/comments/1huybzg/how\_to\_share\_api\_data\_across\_multiple\_server/](https://www.reddit.com/r/nextjs/comments/1huybzg/how_to_share_api_data_across_multiple_server/)  
13. How to Handle Asynchronous Tasks with Node.js and BullMQ | Hostman, accessed January 4, 2026, [https://hostman.com/tutorials/how-to-handle-asynchronous-tasks-with-node-js-and-bullmq/](https://hostman.com/tutorials/how-to-handle-asynchronous-tasks-with-node-js-and-bullmq/)  
14. How To Handle Asynchronous Tasks with Node.js and BullMQ | DigitalOcean, accessed January 4, 2026, [https://www.digitalocean.com/community/tutorials/how-to-handle-asynchronous-tasks-with-node-js-and-bullmq](https://www.digitalocean.com/community/tutorials/how-to-handle-asynchronous-tasks-with-node-js-and-bullmq)  
15. How I Handled Background Jobs in Node.js app with BullMQ and Redis | by Umesh Sujakhu, accessed January 4, 2026, [https://medium.com/@sujakhu.umesh/how-i-handled-background-jobs-in-node-js-with-bullmq-and-redis-95a0f17027ff](https://medium.com/@sujakhu.umesh/how-i-handled-background-jobs-in-node-js-with-bullmq-and-redis-95a0f17027ff)  
16. Next.js 15, accessed January 4, 2026, [https://nextjs.org/blog/next-15](https://nextjs.org/blog/next-15)  
17. Build a Fullstack Monorepo with Turborepo, Next.js, NestJS & TailwindCSS | by Boopy, accessed January 4, 2026, [https://javascript.plainenglish.io/exploring-modern-web-development-an-nft-marketplace-with-turborepo-next-js-3676e1f6fe29](https://javascript.plainenglish.io/exploring-modern-web-development-an-nft-marketplace-with-turborepo-next-js-3676e1f6fe29)