import { createAIEditorRoutes } from '@repo/ai-editor/api';

// Create routes with platform-specific configuration
// The host can inject API keys, Redis connection, etc.
const routes = createAIEditorRoutes({
  // Configuration is injected from environment variables by default
  // Host can override here if needed:
  // openaiApiKey: process.env.OPENAI_API_KEY,
  // redisUrl: process.env.REDIS_URL,
  enableBilling: true, // Enable billing checks
});

// Export the generate handler
export const POST = routes.generate;

