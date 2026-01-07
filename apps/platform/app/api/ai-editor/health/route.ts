import { createAIEditorRoutes } from '@repo/ai-editor/api';

// Create routes with platform-specific configuration
const routes = createAIEditorRoutes({
  // Configuration injected from environment variables
});

// Export the health check handler
export const GET = routes.health;

