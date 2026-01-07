import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to track usage and enforce billing
 * Counts requests to AI generation endpoint
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an AI generation request
  if (pathname.startsWith('/api/ai-editor/generate')) {
    // Extract tenantId from the request
    // It could be in headers, query params, or request body
    // For now, we'll try to get it from the request
    let tenantId: string | null = null;

    // Try to get tenantId from various sources
    tenantId = request.headers.get('x-tenant-id') || 
                request.nextUrl.searchParams.get('tenantId') ||
                null;

    // If tenantId is in the body, we can't read it here (body is consumed)
    // So we'll rely on the route handler to extract it and track usage
    // For now, we'll just pass through and let the route handler handle it
    
    // In a production system, you might want to:
    // 1. Extract tenantId from JWT token or session
    // 2. Log the request for usage tracking
    // 3. Rate limit based on tenant
    // 4. Add request metadata for billing

    // For now, we'll add a header that the route handler can use
    if (tenantId) {
      request.headers.set('x-tenant-id', tenantId);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/ai-editor/:path*',
    // Add other paths that need usage tracking
  ],
};

