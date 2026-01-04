# Billing & Revenue Architecture

## 1. The "Dual-Wallet" System
We bill for two things: **SaaS Subscription** (Platform Fee) and **AI Usage** (Credits).

### Credit System (Metered)
- **Unit:** "Aether Credits"
- **Cost:** 
  - 1 Image Analysis = 5 Credits
  - 1 Section Generation = 10 Credits
- **Implementation:**
  - Before calling OpenAI API, check `Tenant.aiCreditsBalance > Cost`.
  - Perform action.
  - Run a database transaction:
    1. Decrement `Tenant.aiCreditsBalance`.
    2. Insert row into `CreditTransaction`.

## 2. E-commerce Revenue Share (Stripe Connect)
When a Tenant sells a product via their subsite:
1. **Charge Type:** `Destination Charge`.
2. **Flow:**
   - Customer pays $100.
   - Platform takes **Application Fee** (e.g., 2% + $0.30).
   - Remaining funds go to the Tenant's Stripe Express account.
3. **Implementation:**
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 10000,
  currency: 'usd',
  transfer_data: {
    destination: tenant.stripeConnectId,
  },
  application_fee_amount: 230, // Platform profit
});
```
