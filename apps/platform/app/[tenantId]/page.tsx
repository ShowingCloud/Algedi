import { ProductService } from '@repo/commerce';
import { VisualEditor } from '@repo/ai-editor/ui';
import { saveTenantLayout } from './actions';

interface PageProps {
  params: Promise<{
    tenantId: string;
  }>;
}

/**
 * Tenant-specific page that integrates Commerce and AI Editor
 * This is the main integration point for the Modular Monolith
 */
export default async function TenantPage({ params }: PageProps) {
  const { tenantId } = await params;

  // Fetch products for the current tenant (server-side)
  const products = await ProductService.getProducts(tenantId);

  // Prepare context data to pass to the editor
  const editorContext = {
    tenantId,
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price?.toString(),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        price: variant.price?.toString(),
        sku: variant.sku,
      })),
    })),
  };

  // Create a bridge function that captures tenantId using bind
  // This creates a server action that can be passed to client components
  const handleSave = saveTenantLayout.bind(null, tenantId);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Editor for Tenant: {tenantId}</h1>
        <p className="text-gray-600 mb-8">
          Products loaded: {products.length}
        </p>
        
        {/* Visual Editor with Commerce context */}
        <VisualEditor
          initialData={editorContext}
          onSave={handleSave}
          className="w-full min-h-[600px] border border-gray-200 rounded-lg p-4"
        />
      </div>
    </div>
  );
}

