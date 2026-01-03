# Billing & Revenue Architecture

## 1. Metered Billing (For AI Usage)

We bill agencies based on "Generative Units".

- 1 Image Description = 5 Units.
- 1 Page Generation = 10 Units.

### Implementation

1. Middleware calculates cost before calling OpenAI.
2. Updates `TenantUsage` table: `UPDATE usage SET units = units + 10 WHERE tenant_id = X`.
3. Stripe Webhook runs monthly to invoice based on `TenantUsage`.

## 2. Revenue Share (Stripe Connect)

When an end-customer buys a product from an Agency site:

1. Transaction occurs via Stripe Connect (Destination Charge).
2. **Platform Fee**: We take X% application fee.
3. **Agency Share**: The rest goes to the Agency's connected Stripe account.
