import { jobStatus } from '@repo/ai-editor/api';

// Mount the AI Editor's job status route handler
// Note: We need to wrap it to handle Next.js 15 async params
export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> }
) {
  return jobStatus(request as any, context);
}

