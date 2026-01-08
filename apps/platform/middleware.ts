import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to:
 * 1. Track usage and enforce billing for AI generation
 * 2. Extract tenant ID from domain or path for multi-tenant routing
 * 3. Add tenant context to requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Multi-tenant routing: Extract tenantId from domain or path
  let tenantId: string | null = null;

  // Strategy 1: Extract from subdomain (e.g., tenant1.example.com)
  const hostname = request.headers.get('host') || '';
  const subdomainMatch = hostname.match(/^([^.]+)\./);
  if (subdomainMatch) {
    tenantId = subdomainMatch[1];
  }

  // Strategy 2: Extract from path (e.g., /tenant1/about)
  if (!tenantId) {
    const pathMatch = pathname.match(/^\/([^/]+)/);
    if (pathMatch && pathMatch[1] !== 'api') {
      // Check if it's a valid tenant path (not /api, /_next, etc.)
      const firstSegment = pathMatch[1];
      if (!firstSegment.startsWith('_') && firstSegment !== 'favicon.ico') {
        tenantId = firstSegment;
      }
    }
  }

  // Strategy 3: Extract from headers (for API requests)
  if (!tenantId) {
    tenantId = request.headers.get('x-tenant-id') || 
                request.nextUrl.searchParams.get('tenantId') ||
                null;
  }

  // Add tenant ID to request headers for downstream handlers
  if (tenantId) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', tenantId);
    requestHeaders.set('x-organization-id', tenantId); // Alias for consistency

    // Check if this is an AI generation request
    if (pathname.startsWith('/api/ai-editor/generate')) {
      // Usage tracking will be handled by the route handler
      // Middleware just ensures tenantId is available
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/ai-editor/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)', // Match all routes except Next.js internals
  ],
};

