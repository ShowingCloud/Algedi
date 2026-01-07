'use server';

import { savePageLayout } from '../actions';

/**
 * Server action that saves layout for a specific tenant
 * This is a curried function: first bind tenantId, then call with layout
 * Usage: const saveAction = saveTenantLayout.bind(null, tenantId);
 *        await saveAction(layout);
 */
export async function saveTenantLayout(tenantId: string, layout: unknown) {
  return savePageLayout(layout, tenantId);
}

