import { createAIEditorRoutes } from '@repo/ai-editor/api';

// Create routes with platform-specific configuration
const routes = createAIEditorRoutes({
  // Configuration injected from environment variables
  enableBilling: true,
});

// Export the job status handler
export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  return routes.jobStatus(request as any, context);
}

