# AI Visual Editor Technical Specification

The editor is a **React Component Library** that renders a JSON tree and provides a visual manipulation layer.

## 1. The Rendering Pipeline
1. **Input:** The CMS passes a `pageData` JSON object to `<VisualEditor />`.
2. **Isolation:** The editor wraps the preview area in a `react-shadow` root.
   - *Why?* To prevent the Editor's admin UI styles (Tailwind) from bleeding into the Tenant's site styles.
3. **Injection:** 
   - The Editor loops through the JSON tree.
   - For every component, it injects a `data-aether-id` attribute containing the node's unique ID from the JSON.

## 2. Interaction Logic (Click-to-Data)
We do not use standard `onClick` inside the preview because the components might have their own links/buttons.
1. **Event Capture:** Attach a global `click` listener to the Shadow Root in `capture` mode.
2. **Target Resolution:**
```typescript
const handleClick = (e) => {
  e.stopPropagation();
  e.preventDefault();
  const target = e.target.closest('[data-aether-id]');
  if (target) {
    const componentId = target.getAttribute('data-aether-id');
    setSelectedComponent(componentId);
    drawHighlightBox(target);
  }
}
```

## 3. The Generative Loop
When the user says "Make this section darker":

1. **Context Retrieval:** Get the current JSON props for the selected componentId.
2. **Prompt Construction:** 
   - System: You are a UI expert. Return strictly valid JSON matching the Component Prop Schema.
   - Input Props: `{ "background": "white", "padding": "20px" }`
   - User Instruction: "Make it darker"
   - Constraint: Use values from the Tenant's Design Tokens: `["#000", "#111", "#333"]`.
3. **Application:** The LLM returns `{ "background": "#111" }`. The Editor merges this into the state tree. React re-renders the preview instantly.
