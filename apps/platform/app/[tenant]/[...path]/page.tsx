import { SiteRenderer } from '@repo/cms/services';
import { ThemeProvider, getTheme } from '@repo/cms';
import { defaultComponentMap } from '@repo/cms/lib/component-map';
import { notFound } from 'next/navigation';
import React from 'react';

interface PageProps {
  params: Promise<{
    tenant: string;
    path?: string[];
  }>;
}

/**
 * Dynamic CMS Page Renderer
 * Handles multi-tenant routing and dynamic component rendering
 */
export default async function DynamicCMSPage({ params }: PageProps) {
  const { tenant, path = [] } = await params;
  const organizationId = tenant;

  // Build the page path
  const pagePath = path.length > 0 ? `/${path.join('/')}` : '/';

  // Get component map (merge with defaults)
  const customComponentMap = await SiteRenderer.getComponentMap(organizationId);
  const componentMap = {
    ...defaultComponentMap,
    ...customComponentMap,
  };

  // Render the page
  const renderResult = await SiteRenderer.renderPage(
    organizationId,
    pagePath,
    componentMap,
    {
      // Additional context can be passed here
      // e.g., products from commerce, user data, etc.
    }
  );

  if (!renderResult) {
    notFound();
  }

  // Get theme
  const theme = renderResult.theme || (await getTheme(organizationId));

  // For now, we'll render a simple structure
  // In a production implementation, you'd use React Server Components
  // to properly render the component tree
  return (
    <ThemeProvider theme={theme || undefined}>
      <div className="min-h-screen">
        {/* 
          TODO: Properly render the component tree using React Server Components
          For now, this is a placeholder that shows the structure
        */}
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-bold mb-4">CMS Page: {pagePath}</h1>
          <p className="text-gray-600 mb-4">Tenant: {organizationId}</p>
          {theme && (
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p className="text-sm">Theme loaded: {theme.colors.primary ? 'Yes' : 'No'}</p>
            </div>
          )}
          <div className="border border-gray-200 rounded p-4">
            <p className="text-sm text-gray-500">
              Component tree rendering will be implemented here.
              The page schema is loaded and ready to render.
            </p>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

/**
 * Generate static params for known tenants (optional, for SSG)
 */
export async function generateStaticParams() {
  // In a real implementation, you'd fetch all tenants from the database
  // For now, return empty array to use dynamic rendering
  return [];
}
