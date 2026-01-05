# **Architectural Blueprint for a Pluggable, Multi-Tenant AI Editor Platform**

## **Executive Summary**

The convergence of Generative AI and Content Management Systems (CMS) necessitates a fundamental architectural paradigm shift. Traditional editors are static input fields; the next generation of editors must be dynamic, context-aware environments that actively collaborate with the user. The requirement to construct an open-source, pluggable AI editor that maintains an independent data lifecycle—specifically for asynchronous image description, training history, and prompt engineering—while integrating seamlessly into varied host environments presents a sophisticated engineering challenge. Furthermore, the operational mandate to support a multi-tenant billing infrastructure covering usage-based metering, subscription management, and revenue-sharing models adds a layer of financial complexity that requires rigorous data integrity.

This research report provides an exhaustive technical specification for such a platform. The proposed architecture decouples the "Editor" from the "Host" using a React-based Component Bridge pattern, backed by an independent, multi-tenant PostgreSQL database managed via Prisma. The design prioritizes **Inversion of Control (IoC)** to ensure pluggability, **Asynchronous Message Queues** for robust AI processing, and a **Double-Entry Ledger System** integrated with Stripe Connect to handle the financial flows of a multi-party ecosystem.

The report is structured into five comprehensive chapters:

1. **Frontend Architecture:** Detailing the "Headless" Bridge pattern, state synchronization, and visual interaction models for AI.  
2. **Data Persistence:** defining the independent schema for prompt history, training datasets, and multi-tenant isolation using Prisma.  
3. **Asynchronous Orchestration:** Specifying the event-driven architecture required for long-running AI tasks like fine-tuning and image analysis.  
4. **Financial Infrastructure:** A deep dive into metering logic, Stripe Connect flows, and revenue-share mathematics.  
5. **Operational Strategy:** Covering distribution via NPM, security boundaries, and observability.

## ---

**Chapter 1: Frontend Architecture – The Pluggable Editor Pattern**

The primary architectural constraint is the duality of operation: the editor must function as a standalone application and as an integrated plugin within diverse host CMS environments (e.g., Sanity, Strapi, Next.js applications). This requires a strict separation of concerns between the **View Layer** (the editor UI) and the **Context Layer** (the host environment). We reject the legacy iframe integration approach due to its inherent limitations in theming, accessibility, and data interchange. Instead, we adopt a **Headless Component Architecture** utilizing React.

### **1.1 The Bridge Pattern: Inversion of Control**

To achieve true pluggability, the editor cannot "know" about the host environment's routing, authentication, or global state management. Instead, it must define a strict contract—a **Bridge Interface**—that the host must satisfy. This applies the **Dependency Inversion Principle**, where high-level modules (the Editor) do not depend on low-level modules (the Host); both depend on abstractions.

#### **1.1.1 The Editor Interface Specification**

The core editor is packaged as a standalone NPM library (e.g., @platform/ai-editor). It exports a primary React component, \<AIEditor /\>, which accepts a bridge prop. This bridge object injects the necessary dependencies, allowing the editor to function agnostically.

**Table 1: The Bridge Interface Definition**

| Method / Property | Type Signature | Responsibility & Architectural Implication |
| :---- | :---- | :---- |
| initialContent | \`JSON | HTML\` |
| onSave | (content) \=\> Promise\<void\> | **Persistence Delegation:** The editor does not save content to the CMS database directly. It invokes this callback, delegating persistence to the host (e.g., triggering a Sanity patch or a Strapi API call). |
| getAuthToken | () \=\> Promise\<string\> | **Security Tunneling:** Provides a short-lived JWT that allows the editor to authenticate with its *Independent Data Store*. This decouples CMS auth from AI Platform auth. |
| onAssetUpload | (file) \=\> Promise\<url\> | **Asset Abstraction:** The editor should not enforce an upload provider (e.g., S3 vs. Cloudinary). The host handles the upload and returns a URL. |
| themeConfig | ThemeObject | **Visual Continuity:** Allows the host to inject CSS variables or style tokens, ensuring the editor visually inherits the host's design system (e.g., Dark Mode). |

In a **Sanity CMS** integration, the onSave implementation would utilize Sanity's client to patch the document:

TypeScript

// Sanity Host Implementation  
const handleSave \= async (content) \=\> {  
  await client.patch(documentId).set({ body: content }).commit();  
}

In a **Standalone** React app, the implementation might save to a local filesystem or a different API endpoint.1 This decoupling is critical for the "Open Source" requirement, as it prevents vendor lock-in to any specific backend for the content itself.

### **1.2 State Management: The Dual-Loop Synchronization**

A unique challenge of this AI-enabled editor is the management of two distinct state lifecycles: **Content State** and **AI State**.

1. **Content State:** The final artifact (text, images, layout). This is owned by the Host CMS.  
2. **AI State:** The ephemeral and historical data generated during the creation process (prompt history, chat logs, generated image variations, training context). This is owned by the Editor's Independent Store.

The editor must implement a **Dual-Loop Architecture**. The *Primary Loop* handles standard text input, managing cursor position and undo stacks locally, and syncing to the Host via onSave only when settled. The *Secondary Loop* manages AI interactions. When a user requests a "rewrite," the state transition occurs entirely within the Editor's scope—communicating with the Independent Data Store to log the prompt and retrieve the result—before the final accepted text is merged into the Primary Loop.

This separation prevents the Host CMS schema from becoming polluted with high-volume, transient AI metadata. For example, a user might generate 50 image variations before selecting one. Storing all 50 in the Host CMS (like Strapi or WordPress) would bloat the database and complicate the schema. By keeping this in the Independent Store, we maintain a clean separation of "Work in Progress" vs. "Published Content".2

### **1.3 Visual Interaction Patterns for Generative AI**

The User Experience (UX) of an AI editor differs fundamentally from a traditional WYSIWYG editor. It requires specific patterns to support **Prompt Augmentation** and **Generative Iteration**.

#### **1.3.1 The Ghost-Text and Decorator Pattern**

For text generation, the editor should implement a "Ghost-Text" pattern, similar to GitHub Copilot. As the user types, the editor queries the independent AI backend. Suggestions are rendered as greyed-out text overlays.

Technically, this requires the editor to be built on a framework that supports **Decorations** (visual elements that exist in the DOM but are not part of the document data), such as **ProseMirror** or **Lexical**. When the AI returns a suggestion, the editor inserts a "Widget Decoration" at the cursor position. If the user presses Tab, the decoration is replaced by a transaction that inserts the actual text nodes into the document model. This ensures that AI suggestions do not corrupt the undo history or the document structure until explicitly accepted.

#### **1.3.2 Async Inpainting and Image Masking**

For the "async image description" and generation requirement, the editor must support **Inpainting**. This involves an overlay canvas where users can mask specific regions of an image.

* **Interaction:** The user selects an "Edit Region" tool and paints over an area of an image.  
* **Data Capture:** The editor captures the mask coordinates and the base image ID.  
* **Async State:** Upon submission, the editor renders a "Skeleton Loader" or a "BlurHash" placeholder over the masked region. The frontend subscribes to the async job queue (discussed in Chapter 3).  
* **Resolution:** When the job completes, the placeholder is replaced by the new image fragment.

This pattern handles the latency of diffusion models (which can take 10-30 seconds) without freezing the UI, maintaining the user's flow.3

#### **1.3.3 The "Prompt Augmentation" Builder**

To lower the "Articulation Barrier"—the difficulty users face in writing effective prompts—the editor should include a **Prompt Builder** interface. Rather than a raw text input, the UI presents structured controls:

* **Tone Selector:** (e.g., Professional, Witty, Academic).  
* **Format Selector:** (e.g., Bullet Points, Table, Paragraph).  
* **Context Injection:** A mechanism to select previous documents or uploaded assets to serve as "Reference Context" for the AI.

These inputs are synthesized into a complex system prompt on the backend. This "Configurable Control" pattern ensures higher quality outputs and reduces the frustration of trial-and-error prompting.3

## ---

**Chapter 2: Data Persistence – The Independent Store**

The requirement for the editor to maintain "its own data store for async image description and training history" necessitates a robust backend separate from the Host CMS. This backend serves as the "Brain" of the platform. We select **PostgreSQL** orchestrated by **Prisma ORM**, as it provides the relational integrity needed for billing and the flexibility needed for JSON-based AI metadata.

### **2.1 The Multi-Tenant Schema Strategy**

The database must support a **Multi-Tenant** architecture where data is strictly isolated between organizations, yet accessible to the platform for billing aggregation. We will adopt a **Row-Level Security (RLS)** model where all tenants share the same database tables, but every query is scoped by an organizationId.

#### **2.1.1 Core Entities: Organization and Project**

The schema begins with the tenant hierarchy.

Code snippet

// schema.prisma

datasource db {  
  provider \= "postgresql"  
  url      \= env("DATABASE\_URL")  
  extensions \= \[vector\] // Enable pgvector for semantic search  
}

generator client {  
  provider \= "prisma-client-js"  
  previewFeatures \= \["postgresqlExtensions", "views"\]  
}

model Organization {  
  id               String   @id @default(uuid())  
  name             String  
  createdAt        DateTime @default(now())  
    
  // Billing Integrations  
  stripeCustomerId String?  @unique // The organization as a payer  
  stripeConnectId  String?  // The organization as a revenue recipient  
    
  // Configuration for AI Models  
  aiSettings       Json?    // e.g. { "defaultModel": "gpt-4", "tone": "formal" }  
    
  users            User  
  projects         Project  
  subscriptions    Subscription?  
    
  @@index(\[stripeCustomerId\])  
}

model Project {  
  id             String       @id @default(uuid())  
  name           String  
  organizationId String  
  organization   Organization @relation(fields: \[organizationId\], references: \[id\])  
    
  documents      DocumentContext  
  assets         Asset  
    
  @@unique(\[organizationId, name\])  
}

The Organization table is the root of the tenancy. The stripeConnectId field is crucial for the revenue-share model (Chapter 4), linking this internal record to a Stripe Connected Account.6

#### **2.1.2 Storing AI History and Context**

To fulfill the "Training History" and "Async Image Description" requirements, the schema must track the lifecycle of these artifacts.

Code snippet

// AI Operations & History

model PromptLog {  
  id          String   @id @default(uuid())  
  userId      String  
  user        User     @relation(fields: \[userId\], references: \[id\])  
  projectId   String?  
    
  promptText  String  
  modelUsed   String   // e.g. "gpt-4o", "stable-diffusion-3"  
    
  // Vector embedding for "Related Prompts" features  
  embedding   Unsupported("vector(1536)")?   
    
  response    String   @db.Text  
  tokensUsed  Int  
  cost        Decimal  @db.Decimal(10, 4\) // Calculated cost for billing  
    
  createdAt   DateTime @default(now())  
    
  @@index(\[userId\])  
  @@index(\[projectId\])  
}

model FineTuningJob {  
  id             String   @id @default(uuid())  
  organizationId String  
    
  // Content Addressable Storage hash of the training dataset  
  datasetHash    String     
  datasetUrl     String     
    
  baseModel      String  
  status         JobStatus // PENDING, TRAINING, COMPLETED, FAILED  
    
  // Metrics stored as JSON for visualization (Loss curves)  
  trainingMetrics Json?      
    
  // Result  
  fineTunedModelId String?  
    
  createdAt      DateTime @default(now())  
}

enum JobStatus {  
  PENDING  
  PROCESSING  
  COMPLETED  
  FAILED  
}

The FineTuningJob model is designed to support reproducibility. By storing the datasetHash, the system can verify if a dataset has changed before triggering a new expensive training run. The trainingMetrics JSON field allows the frontend to render charts of the model's loss curve over time, fulfilling the "Training History" visualization requirement.7

### **2.2 Semantic Search with pgvector**

To transform the prompt history from a static log into an active utility, we utilize the pgvector extension.

**Mechanism:**

1. When a PromptLog is created, an asynchronous worker generates a vector embedding of the promptText (using a model like OpenAI's text-embedding-3-small).  
2. This vector is stored in the embedding column.  
3. **Prompt Recall:** When a user begins typing a prompt, the editor sends a request to the backend. The backend generates a temporary embedding for the partial input and queries the PromptLog table using a Cosine Similarity search.

SQL

SELECT prompt\_text, response   
FROM "PromptLog"   
WHERE "organizationId" \= $1   
ORDER BY embedding \<=\> $2   
LIMIT 5;

This allows the system to suggest: "You previously used a similar prompt that yielded good results: \[Previous Prompt\]." This feature significantly enhances the value of the platform over time as it builds organizational memory.8

### **2.3 Distributing the Schema**

Since this is an "open-source" project, the Prisma schema itself must be distributable. We recommend packaging the schema and the generated client into a separate NPM package (e.g., @platform/db).

**Best Practice:**

* Use a postinstall script in the package.json to run prisma generate.  
* This ensures that any consumer of the package automatically generates the type-safe client tailored to their specific OS and architecture.  
* For the library integration, use peerDependencies to ensure the host application installs the correct version of @prisma/client, avoiding version conflicts in a monorepo setup.10

## ---

**Chapter 3: Asynchronous Orchestration – The AI Job Engine**

AI operations, particularly image generation (Stable Diffusion) and fine-tuning, are long-running processes that defy the standard HTTP Request-Response cycle. A synchronous request would timeout (typically at 30-60 seconds on standard gateways). Therefore, the architecture must implement an **Asynchronous Job Queue** pattern.

### **3.1 The Producer-Consumer Architecture**

We typically select **BullMQ** (backed by Redis) for this role due to its robustness, support for prioritization, and "at-least-once" delivery guarantees.

1. **The Producer (Next.js Server Action):** When a user requests an operation, the API route acts as the *Producer*. It validates the request, checks billing quotas, and pushes a job payload to Redis. It returns a jobId to the client immediately.  
2. **The Broker (Redis):** Acts as the persistent buffer. It holds the job state, ensuring that even if the worker nodes crash, the jobs are not lost.  
3. **The Consumer (Worker Node):** A standalone Node.js process (separate from the Next.js frontend) pulls jobs from Redis. It executes the heavy API calls to OpenAI or Replicate, processes the results, and updates the database.12

### **3.2 Detailed Workflow: Async Image Description**

The requirement for "async image description" implies a workflow where an image is uploaded, analyzed, and metadata is returned.

**Step-by-Step Flow:**

1. **Upload:** The user drops an image into the Editor. The frontend uses a presigned URL to upload the file directly to Object Storage (S3/R2).  
2. **Enqueue:** The frontend triggers a Server Action: describeImage(assetId).  
3. **Job Processing:**  
   * The Worker picks up the job describe-image.  
   * It downloads the image from S3.  
   * It sends the image to a Vision Model (e.g., GPT-4 Vision) with a system prompt: "Generate a detailed accessibility description and a set of semantic tags."  
   * **Rate Limiting:** The Worker manages the API rate limits (e.g., 50 RPM). If the limit is hit, the job is moved to a delayed state with exponential backoff.  
4. **Completion:** The Worker updates the Asset record in the database:  
   TypeScript  
   await prisma.asset.update({  
     where: { id: job.data.assetId },  
     data: {   
       description: result.text,   
       status: 'COMPLETED'   
     }  
   });

5. **Notification:** The frontend needs to know the data is ready.

### **3.3 Real-Time Feedback Strategies**

How does the editor know the job is done?

Strategy A: Polling (Robust & Simple)  
The frontend uses a hook (e.g., useQuery with refetchInterval) to poll the API endpoint /api/jobs/{jobId} every 2 seconds.

* *Pros:* Extremely reliable, works through firewalls, no persistent connections.  
* *Cons:* Adds load to the database.

Strategy B: Server-Sent Events (SSE) (Responsive)  
The API establishes a uni-directional stream to the client.

* *Pros:* Real-time updates, lower latency than polling.  
* *Cons:* Requires keeping connections open, which can be tricky in serverless environments like Vercel (which have execution time limits).

**Recommendation:** For a robust, open-source solution, **Polling** with a decaying interval (check every 2s, then 5s, then 10s) is the most resilient architecture that doesn't require a dedicated WebSocket server. However, if the platform is deployed on long-running containers (e.g., Docker), **Redis Pub/Sub** combined with SSE is the superior UX choice.13

## ---

**Chapter 4: Financial Infrastructure – Billing & Revenue Share**

The billing requirement is multifaceted: "usage-based (AI), subscription, and revenue-share models." This necessitates a sophisticated financial engine integrated with **Stripe Connect**.

### **4.1 The Stripe Connect Model**

We must define the actors in this ecosystem:

1. **The Platform (You):** The owner of the AI Editor software.  
2. **The Tenant (Organization):** A business (e.g., a Digital Agency) using the Editor.  
3. **The End-User (Customer):** The client of the Tenant (if the Tenant is reselling the service).

We utilize **Stripe Connect** with **Standard Accounts** or **Express Accounts**.

* **Platform Subscription:** The Tenant pays the Platform a fixed fee (e.g., $30/mo) \+ Usage Overage.  
* **Revenue Share:** The Tenant charges *their* customers via the Platform, and the Platform takes a cut.

### **4.2 Metered Billing Architecture**

AI costs are variable. A flat subscription fee is risky; one power user could bankrupt the platform by generating thousands of images. We implement **Metered Billing**.

#### **4.2.1 The Ledger Schema**

We do not rely solely on Stripe's metering for the "Source of Truth." We maintain a shadow ledger in Postgres for auditability and real-time quota enforcement.

Code snippet

model BillingCycle {  
  id             String   @id @default(uuid())  
  organizationId String  
  startDate      DateTime  
  endDate        DateTime  
  isSettled      Boolean  @default(false)  
  usageRecords   UsageRecord  
}

model UsageRecord {  
  id             String   @id @default(uuid())  
  cycleId        String  
  type           UsageType // TEXT\_TOKEN, IMAGE\_GEN, TRAINING\_HOUR  
  quantity       Int  
  cost           Decimal   // Calculated cost at the time of usage  
    
  // Idempotency: The job that caused this usage  
  jobId          String    @unique   
  timestamp      DateTime  @default(now())  
    
  reportedToStripe Boolean @default(false)  
}

#### **4.2.2 The Aggregation & Reporting Loop**

1. **Recording:** When an AI job completes, the Worker calculates the usage (e.g., "Tokens Used: 450") and inserts a UsageRecord inside a **Database Transaction** along with the job completion status. This atomic write ensures that we never bill for a failed job or fail to bill for a successful one.  
2. **Reporting:** To respect Stripe's API rate limits, we do not call Stripe on every request. A cron job runs (e.g., every hour).  
   * It queries UsageRecord where reportedToStripe is false.  
   * It aggregates usage by subscriptionItem.  
   * It calls stripe.billing.meterEvents.create() with the aggregate.  
   * It updates the records to reportedToStripe \= true.6

### **4.3 Revenue Share: Destination Charges**

The request specifies a "revenue-share model." This typically applies when the Tenant acts as a reseller.

**Scenario:** An Agency (Tenant) builds a website for a client using your AI Editor. The Agency wants to charge the client $0.05 per image generation, while your Platform cost is $0.02. The Agency keeps the $0.03 margin.

**Implementation:** We use **Stripe Destination Charges**.16

1. **Payment Intent:** The Platform creates a charge on the *End-User's* card.  
2. **Transfer Data:** The Platform specifies the Agency's Stripe Account ID as the destination.  
3. **Application Fee:** The Platform specifies an application\_fee\_amount. This is the amount the Platform keeps (Cost \+ Platform Markup).

**Flow of Funds Calculation:**

* **Total Charge:** $100.00  
* **Platform Fee:** $10.00 (Defined by Platform)  
* **Stripe Fee:** $3.20 (Approx 2.9% \+ 30c)  
* **Transfer to Tenant:** $86.80

This model allows the Platform to control the billing relationship and ensure its costs are covered before funds are released to the Tenant. The Organization table must track the stripeConnectId to route these funds correctly.

## ---

**Chapter 5: Operational Strategy – Security & Distribution**

### **5.1 Security: The Host-Driven Auth Bridge**

Authentication is complex because the Editor is embedded. It cannot force a user to log in *again* if they are already authenticated in the Host CMS. We use a **Token Exchange Pattern**.

1. **Handshake:** The Host CMS generates a signed JWT (JSON Web Token) containing the userId and organizationId. This is signed with a shared secret key.  
2. **Injection:** This token is passed to the Editor via the EditorBridge.  
3. **Verification:** The Editor's Independent Backend verifies the signature of this token on every request. If valid, it trusts the organizationId payload.

This makes the editor "Headless" regarding Auth. It delegates identity verification to the Host but enforces authorization (What can this Organization do?) within its own boundary.

### **5.2 Scalability: Connection Pooling**

Running this architecture on serverless infrastructure (like Vercel or AWS Lambda) presents a risk of **Connection Exhaustion**. PostgreSQL has a limit on concurrent connections. If 1,000 serverless functions spin up simultaneously, they will crash the database.

We must use a **Connection Pooler** such as **PgBouncer** or **Prisma Accelerate**.19 This middleware sits between the serverless functions and the database, maintaining a small pool of warm connections to Postgres while handling thousands of incoming client requests.

### **5.3 Distribution Strategy**

To distribute this system as "Open Source," we structure the repository as a Monorepo (using Turborepo).

* packages/editor: The React Component Library (Frontend).  
* packages/db: The Prisma Schema and Client generator.  
* apps/api: The Reference Implementation of the Backend (Next.js).  
* apps/worker: The Reference Implementation of the BullMQ Worker.

This allows developers to consume the Editor UI component (npm install @platform/editor) while potentially forking or self-hosting the backend components (docker-compose up api worker), fulfilling the requirement for a truly pluggable and standalone system.

## **Conclusion**

The architecture detailed in this report satisfies the rigorous demands of a modern AI-native content platform. By adhering to the **Bridge Pattern**, we achieve the necessary frontend decoupling to support any Host CMS. By implementing an **Independent Data Store** with **Prisma** and **pgvector**, we secure the complex, high-volume data inherent to AI operations. Finally, by integrating **Stripe Connect** with a shadow ledger, we enable a flexible, audit-proof financial model capable of supporting usage-based billing and multi-tier revenue sharing. This is not merely a text editor; it is a comprehensive infrastructure for the future of AI-assisted content creation.

#### **Works cited**

1. Most Flexible React Headless CMS for Developers \- Sanity, accessed January 3, 2026, [https://www.sanity.io/react-cms](https://www.sanity.io/react-cms)  
2. Onlook: A React visual editor \- LogRocket Blog, accessed January 3, 2026, [https://blog.logrocket.com/onlook-react-visual-editor/](https://blog.logrocket.com/onlook-react-visual-editor/)  
3. Prompt Augmentation: UX Design Patterns for Better AI Prompting \- UX Tigers, accessed January 3, 2026, [https://www.uxtigers.com/post/prompt-augmentation](https://www.uxtigers.com/post/prompt-augmentation)  
4. The Shape of AI | UX Patterns for Artificial Intelligence Design, accessed January 3, 2026, [https://www.shapeof.ai/](https://www.shapeof.ai/)  
5. AI UX Patterns, accessed January 3, 2026, [https://www.aiuxpatterns.com/](https://www.aiuxpatterns.com/)  
6. Metered Usage \- Achromatic, accessed January 3, 2026, [https://www.achromatic.dev/docs/starter-kits/monorepo-next-prisma-authjs/billing/metered-usage](https://www.achromatic.dev/docs/starter-kits/monorepo-next-prisma-authjs/billing/metered-usage)  
7. Using PostgreSQL as an LLM Prompt Store — Why It Works Surprisingly Well | by Pranav Prakash I GenAI I AI/ML I DevOps I | Medium, accessed January 3, 2026, [https://medium.com/@pranavprakash4777/using-postgresql-as-an-llm-prompt-store-why-it-works-surprisingly-well-61143a10f40c](https://medium.com/@pranavprakash4777/using-postgresql-as-an-llm-prompt-store-why-it-works-surprisingly-well-61143a10f40c)  
8. ORM 6.13.0, CI/CD Workflows & pgvector for Prisma Postgres, accessed January 3, 2026, [https://www.prisma.io/blog/orm-6-13-0-ci-cd-workflows-and-pgvector-for-prisma-postgres](https://www.prisma.io/blog/orm-6-13-0-ci-cd-workflows-and-pgvector-for-prisma-postgres)  
9. Postgres extensions | Prisma Documentation, accessed January 3, 2026, [https://www.prisma.io/docs/postgres/database/postgres-extensions](https://www.prisma.io/docs/postgres/database/postgres-extensions)  
10. Sharing Prisma Between Multiple Applications | by Michael Wieczorek \- Medium, accessed January 3, 2026, [https://medium.com/@nolawnchairs/sharing-prisma-between-multiple-applications-5c7a7d131519](https://medium.com/@nolawnchairs/sharing-prisma-between-multiple-applications-5c7a7d131519)  
11. ajmnz/prisma-import: Bringing import statements to Prisma schemas \- GitHub, accessed January 3, 2026, [https://github.com/ajmnz/prisma-import](https://github.com/ajmnz/prisma-import)  
12. Implement Queue in Next.js \- SSOJet, accessed January 3, 2026, [https://ssojet.com/data-structures/implement-queue-in-nextjs/](https://ssojet.com/data-structures/implement-queue-in-nextjs/)  
13. NPC Architecture: Scaling AI Workflows in Serverless Next.js \- DEV Community, accessed January 3, 2026, [https://dev.to/araldhafeeri/npc-architecture-scaling-ai-workflows-in-serverless-nextjs-3cgh](https://dev.to/araldhafeeri/npc-architecture-scaling-ai-workflows-in-serverless-nextjs-3cgh)  
14. How do you handle long running tasks in Next? : r/nextjs \- Reddit, accessed January 3, 2026, [https://www.reddit.com/r/nextjs/comments/1fd3nz1/how\_do\_you\_handle\_long\_running\_tasks\_in\_next/](https://www.reddit.com/r/nextjs/comments/1fd3nz1/how_do_you_handle_long_running_tasks_in_next/)  
15. Manage your usage-based billing setup \- Stripe Documentation, accessed January 3, 2026, [https://docs.stripe.com/billing/subscriptions/usage-based/manage-billing-setup](https://docs.stripe.com/billing/subscriptions/usage-based/manage-billing-setup)  
16. Create destination charges | Stripe Documentation, accessed January 3, 2026, [https://docs.stripe.com/connect/destination-charges?platform=ios](https://docs.stripe.com/connect/destination-charges?platform=ios)  
17. Collect application fees | Stripe Documentation, accessed January 3, 2026, [https://docs.stripe.com/connect/marketplace/tasks/app-fees](https://docs.stripe.com/connect/marketplace/tasks/app-fees)  
18. Create destination charges \- Stripe Documentation, accessed January 3, 2026, [https://docs.stripe.com/connect/destination-charges](https://docs.stripe.com/connect/destination-charges)  
19. Prisma ORM Production Guide: Next.js Complete Setup 2025 \- Digital Marketing Agency, accessed January 3, 2026, [https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs](https://www.digitalapplied.com/blog/prisma-orm-production-guide-nextjs)