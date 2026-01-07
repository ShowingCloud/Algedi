#!/usr/bin/env node

/**
 * Usage Reporting Script
 * Reports accumulated usage to Stripe for metered billing
 * 
 * This script should be run periodically (e.g., via cron) to sync
 * shadow ledger usage records with Stripe
 * 
 * Usage: npm run report-usage
 * Or: tsx scripts/report-usage.ts
 */

import { prisma } from '@repo/commerce/src/db';
import { recordUsage } from '@repo/commerce/src/services/billing-service';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Report usage records that haven't been synced to Stripe
 */
async function reportUsage() {
  console.log('🔄 Starting usage reporting...');

  try {
    // Find usage records that need to be reported to Stripe
    // (records without stripeUsageRecordId but with active subscription)
    const tenants = await prisma.tenant.findMany({
      where: {
        stripeSubscriptionId: { not: null },
        billingStatus: 'active',
      },
      select: {
        organizationId: true,
        id: true,
      },
    });

    console.log(`Found ${tenants.length} active tenants with subscriptions`);

    let totalReported = 0;

    for (const tenant of tenants) {
      // Find unreported usage records
      const unreportedRecords = await prisma.usageRecord.findMany({
        where: {
          tenantId: tenant.id,
          stripeUsageRecordId: null,
          billingCycle: {
            stripeSubscriptionId: { not: null },
          },
        },
        take: 100, // Process in batches
      });

      if (unreportedRecords.length === 0) {
        continue;
      }

      console.log(
        `Processing ${unreportedRecords.length} unreported records for tenant ${tenant.organizationId}`
      );

      // Group by event type and report in batches
      const groupedByType = unreportedRecords.reduce(
        (acc, record) => {
          const key = record.eventType;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(record);
          return acc;
        },
        {} as Record<string, typeof unreportedRecords>
      );

      for (const [eventType, records] of Object.entries(groupedByType)) {
        // Sum quantities for batch reporting
        const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

        try {
          // Report to Stripe
          const result = await recordUsage(
            tenant.organizationId,
            eventType,
            totalQuantity,
            {
              batchReport: true,
              recordIds: records.map((r) => r.id),
              reportedAt: new Date().toISOString(),
            }
          );

          // Update records with Stripe usage record ID
          if (result.stripeUsageRecordId) {
            await prisma.usageRecord.updateMany({
              where: {
                id: { in: records.map((r) => r.id) },
              },
              data: {
                stripeUsageRecordId: result.stripeUsageRecordId,
              },
            });
          }

          totalReported += records.length;
          console.log(
            `✅ Reported ${totalQuantity} units of ${eventType} for tenant ${tenant.organizationId}`
          );
        } catch (error) {
          console.error(
            `❌ Error reporting usage for ${eventType}:`,
            error
          );
        }
      }
    }

    console.log(`✅ Usage reporting complete. Reported ${totalReported} records.`);
  } catch (error) {
    console.error('❌ Error in usage reporting:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  reportUsage()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { reportUsage };

