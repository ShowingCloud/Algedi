# Design Document v2: Three-Product Architecture Overview

## Part 1: The AI Editor (The "Stateless" Brain)

**Concept:** Treat the Editor not as a database-driven app, but as a React Component Library (package). It takes Input Data + User Intent and outputs React Code + Configuration JSON. It does not "know" about your database, auth, or payments.

### 1. Architecture: The "Click-to-Prompt" Loop

To achieve the "Point, Click, and Describe" workflow, you need a connection between the rendered DOM and the underlying code structure.

**Rendering Engine:** Use Shadow DOM to render the user's site. This ensures the site's CSS (e.g., "floating headers") doesn't break the Editor's UI.

**Selection Mechanism (Click-to-Data):**
- **Instrumentation:** During the build step (Babel/SWC plugin), inject a `data-component-id="file.tsx:32:5"` attribute into every React component.
- **Interaction:** When the admin clicks an element in the preview:
  - The Editor intercepts the click event.
  - It reads the `data-component-id`.
  - It draws a high-z-index highlight box over that DOM element.
  - It opens a "Context Menu" with options: Edit Style, Edit Text, Regenerate Section.

**The AI Loop:**
- User clicks a "Product Card" and types: "Make the price larger and red."
- Editor extracts the code snippet for that specific component ID.
- Editor sends: `{ current_code: "...", user_prompt: "Make price larger and red" }` to the LLM.
- LLM returns updated JSX.
- Editor "Hot Swaps" the component code in memory to show the result instantly.

### 2. Image Handling (Structured)

**Input:** The editor receives a list of assets: `[{ url: "cdn.com/img1.jpg", description: "A blue sneaker..." }]`.

**Generation:** The LLM is given this list in the system prompt. It is instructed: "When you need an image for a shoe, use the URL from the asset list that matches the description 'blue sneaker'. Do NOT invent URLs."

## Part 2: The CMS (The "Multi-Tenant" Host)

**Concept:** This is the Next.js application that imports the Editor. It handles the "Agency" logic, routing, and data fetching.

### 1. Subsite Generation Strategy

Don't generate static HTML files. Use Runtime Rendering with Configurations.

**Storage:** Store the "Site Definition" as a large JSON blob (or separated tables) in the database.
- `theme_config`: Colors, fonts, border-radius.
- `layout_config`: Header type (sticky/transparent), Footer type.
- `component_map`: Which widgets (Auctions, Hot Deals) go in which "Slots" (Hero, Sidebar, Main).

**Rendering:** When a request hits `agency-a.platform.com`:
- **Middleware:** Detects hostname -> Look up `tenant_id`.
- **Server Component:** Fetches Site Definition for that `tenant_id`.
- **Renderer:** Dynamically selects the React components based on the `component_map` and injects the `theme_config` as CSS Variables into the `<body>`.

### 2. Campaign Logic (Split Responsibility)

- **CMS (Presentation):** Responsible for the visuals. It asks the API: "Is there an active auction for this product?" If yes, it renders the `<AuctionTimer />` component using the style defined by the Agency.
- **E-commerce (Logic):** Responsible for the rules. It validates the bid, checks the timer, and processes the winner. The CMS never calculates "active status" itself; it trusts the API.

## Part 3: The E-commerce Core (The "Abstract" Backend)

**Concept:** A centralized "Headless" engine (MedusaJS is highly recommended here) that acts as the "Source of Truth" for all products and transactions.

### 1. Multi-Vendor Data Privacy

**Strict Isolation:** Use PostgreSQL Row-Level Security (RLS).
- Every query automatically appends `WHERE tenant_id = current_agency`.
- This guarantees that Agency A can never accidentally see Agency B's customer list, even if the CMS code has a bug.

**Global vs. Local:**
- **Superadmins:** Can see all rows (RLS Bypass).
- **Agencies:** Can only see their rows.
- **Shared Products:** If you want Agencies to sell your global products, create a "Catalog Subscription" model. The Product exists in the Global tenant, and the Agency has a `ProductVisibility` entry linking them to it.

### 2. Redirect & Session Handover

**Flow:**
1. Customer browses `agency.com`. Adds item to cart. (Cart ID stored in localStorage on `agency.com`).
2. Customer clicks "Checkout".
3. CMS sends Cart ID to Core API -> Core generates a one-time Handover Token.
4. CMS redirects user to `platform.com/checkout?token=xyz`.
5. Platform validates token -> Hydrates the session -> User pays.

**Privacy:** The Platform now owns the "Customer Contact" for the purpose of the transaction, but the "Agency ID" is tagged on the Order so the Agency gets commission/credit.

## 6. Data Model Design

This model separates the three domains while linking them via UUIDs.

### A. CMS Database (Postgres - Visuals & Routing)

| Table | Columns | Purpose |
|-------|---------|---------|
| Tenants | id (PK), name, custom_domain, platform_subscription_tier | Defines the Agency. |
| Sites | id, tenant_id (FK), global_css_vars (JSON), favicon | Global styling rules per agency. |
| Pages | id, site_id (FK), slug (/home, /about), layout_schema (JSON) | The JSON output from the AI Editor. |
| Assets | id, tenant_id (FK), url, ai_description, embedding | Images uploaded by agencies + AI text. |

### B. E-commerce Database (Medusa/Postgres - Logic & Transactions)

| Table | Columns | Purpose |
|-------|---------|---------|
| Products | id, owner_tenant_id (FK), title, base_price, attributes (JSONB) | The abstract product data. |
| Inventory | product_id, sku, quantity, warehouse_location | Decoupled inventory management. |
| Campaigns | id, tenant_id, type (auction/sale), rules (JSON), start_at, end_at | Logic for "Hot Deals" or Auctions. |
| Orders | id, tenant_id, customer_id, total, status | The transaction record. |
| Customers | id, email, global_user_id (Link to Auth0/Clerk) | Profile data. |
| Customer_Consent | customer_id, tenant_id, permission_scope (marketing/support) | Privacy Critical: Explicit opt-in record. |
