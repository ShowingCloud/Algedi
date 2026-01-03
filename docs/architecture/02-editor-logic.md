# AI Editor Logic & Interaction Flow

## 1. The Async Image Pipeline

Since image description is slow, we treat it as a background job.

1. **Upload**: User drags image to Editor -> Uploads to S3 -> Returns URL.
2. **Trigger**: Editor calls `POST /api/ai/describe` with URL.
3. **Queue**: Server pushes job to Redis Queue.
4. **Worker**: Vision Model analyzes image -> Writes description to `AssetDescription` DB table.
5. **Polling**: Editor polls for completion. When done, it feeds this description to the Page Generation LLM.

## 2. The "Click-to-Data" Mechanism

To allow admins to "point and edit" the generated preview:

### Injection

The build system (Babel/SWC) adds a `data-source-loc="file.tsx:line:col"` attribute to every JSX element in dev mode.

### Shadow DOM

The preview renders inside a shadow-root to isolate styles.

### Event Interception

1. User clicks an element in the preview.
2. Editor catches event, reads `data-source-loc`.
3. Editor highlights the DOM node.

### Regeneration

1. User types: "Make this button bigger."
2. Editor sends: `{ targeted_component_code, instruction }` to LLM.
3. LLM returns only the updated component code.
4. Editor hot-swaps the code.

## 3. The Output Format

The Editor does NOT output HTML. It outputs configured React components.

**Bad**: `<div><h1>Title</h1></div>`

**Good**: `<HeroSection title="Title" variant="centered" />` This ensures the agency can only "style" within the guardrails of our design system.
