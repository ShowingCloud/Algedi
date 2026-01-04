AI Editor Architecture (packages/ai-editor)
This is a Full-Stack Package. It exports UI, Server Actions, and Worker logic.

1. The "Click-to-Data" Loop
We do not parse HTML. We parse Structured Component Trees.

Rendering: The Editor renders a PageRenderer component inside a ShadowDOM (via react-shadow) to isolate Agency styles from Admin styles.

Instrumentation: Every component emitted by the AI includes a data-path attribute:

Example: <Hero data-path="sections.0.props" title="..." />

Interaction:

Admin clicks the "Hero Title".

Editor captures click event inside Shadow DOM.

Editor extracts data-path="sections.0.props".

Editor resolves the actual JSON node from the PageTemplate state.

Modification:

User prompts: "Make it punchier."

LLM receives: { field: "title", value: "Welcome", prompt: "Make it punchier" }.

LLM outputs: "Welcome to the Future".

State updates -> UI Hot Reloads.

2. The Async Job Queue
Since image analysis is slow, we use a producer/consumer model exported from the package.

src/server/actions.ts: Exports analyzeImage(url). This pushes a job to Redis.

src/workers/image-processor.ts: Defines the BullMQ worker that calls OpenAI Vision API.

Integration: The Host App (apps/cms) imports createWorker from this package and runs it in a separate process/container.

3. The Bridge Interface
The Editor needs to save data but doesn't own the DB. It requires a Bridge prop:typescript interface EditorBridge { onSave: (schema: PageSchema) => Promise<void>; onAssetUpload: (file: File) => Promise<string>; // Returns URL aiCreditCheck: () => Promise<number>; // Current balance }