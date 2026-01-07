import { NextRequest, NextResponse } from 'next/server';
import { searchPrompts } from '@repo/ai-editor/actions';

/**
 * API Route Handler for semantic prompt search
 * This is mounted by the host app at /api/ai-editor/prompts/search
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryPrompt, organizationId, limit = 5 } = body;

    if (!queryPrompt || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: queryPrompt, organizationId' },
        { status: 400 }
      );
    }

    const results = await searchPrompts(queryPrompt, organizationId, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching prompts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

