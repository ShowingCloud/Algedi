import { NextRequest, NextResponse } from 'next/server';
import { createAIEditorRoutes } from '@repo/ai-editor/api';

const routes = createAIEditorRoutes({
  openaiApiKey: process.env.OPENAI_API_KEY,
  redisUrl: process.env.REDIS_URL,
  enableBilling: true,
});

export async function POST(request: NextRequest) {
  return routes.inpaint(request);
}
