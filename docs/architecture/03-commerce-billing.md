# Commerce & Billing Architecture

## 1. Multi-Tenant E-Commerce (MedusaJS)

**Service**: `apps/commerce-backend`.

**Pattern**: Headless Redirect.

- Agency sites (shop.agency.com) display products using the Read-Only API.
- "Add to Cart" creates a cart in Medusa tagged with `sales_channel_id = Agency ID`.
- Checkout: User is redirected to `platform.com/checkout?cart_id=xyz`.

**Reason**: This unifies PCI compliance and Stripe Identity verification on the Main Platform.

## 2. Revenue Share (Stripe Connect)

We use Stripe Connect (Destination Charges).

- Customer Pays: $100.
- Platform Fee: We take $10 (Application Fee).
- Agency: Receives $90 (Destination Amount).
- Payout: Stripe automatically handles the payout to the Agency's connected bank account.

**Constraint**: The commerce-backend must store the `stripe_account_id` for every Agency and pass it during Checkout Session creation.

## 3. Usage-Based Billing (AI Credits)

Agencies pay us for AI generation. This is separate from their e-commerce revenue.

**Billing Engine**: Stripe Subscription (Metered Billing).

**Logic**:

1. User clicks "Generate Site" (Cost: 50 credits).
2. `apps/cms` checks CreditLedger balance.
3. If balance >= 50:
   - Run Generation.
   - Insert CreditLedger entry: `amount: -50, type: GENERATION`.
4. If balance < 50:
   - Prompt user to "Top Up" (Stripe One-Time Payment).