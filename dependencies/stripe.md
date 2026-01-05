# Stripe Integration

> Comprehensive guide to Stripe payment processing for SaaS applications.

---

## Overview

**Stripe** is the payment infrastructure for this application, handling:
- Subscription billing (monthly/yearly)
- Plan management (Free, Starter, Pro, Enterprise)
- Customer portal for self-service
- Webhook events for real-time updates

---

## Account Setup

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete identity verification for payouts

### 2. Get API Keys

Navigate to **Developers → API Keys**:

| Key Type | Environment Variable | Usage |
|----------|---------------------|-------|
| Publishable key | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side (checkout UI) |
| Secret key | `STRIPE_SECRET_KEY` | Server-side (API calls) |

> ⚠️ Use **test mode** keys during development (prefix: `pk_test_`, `sk_test_`)

---

## Product & Price Setup

### Create Products in Dashboard

1. Go to **Products → Add Product**
2. Create products for each plan:

| Product Name | Price | Billing |
|--------------|-------|---------|
| Starter Plan | $19 | Monthly |
| Pro Plan | $49 | Monthly |
| Enterprise Plan | $149 | Monthly |

### Or Via CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products
stripe products create --name="Starter Plan" --description="5 protected content, 50 scans/month"
stripe prices create --product=prod_xxx --unit-amount=1900 --currency=usd --recurring[interval]=month
```

---

## Environment Variables

```bash
# Required
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# For webhooks
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Price IDs (from Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxx
```

---

## Implementation in This Project

### Stripe Client Setup

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Plan limits
export const PLAN_LIMITS = {
  free: { content: 1, scansPerMonth: 10 },
  starter: { content: 5, scansPerMonth: 50 },
  pro: { content: 25, scansPerMonth: 500 },
  enterprise: { content: Infinity, scansPerMonth: Infinity },
}
```

### Create Checkout Session

```typescript
// src/app/api/billing/route.ts
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const session = await auth()
  const { priceId } = await request.json()
  
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
    metadata: { userId: session.user.id },
  })
  
  return NextResponse.json({ url: checkoutSession.url })
}
```

### Customer Portal

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: user.stripeCustomerId,
  return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
})
```

---

## Webhooks

### Setup Webhook Endpoint

1. Go to **Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      // Update user's subscription in database
      await handleCheckoutComplete(session)
      break
      
    case 'customer.subscription.deleted':
      // Downgrade user to free plan
      await handleSubscriptionCanceled(event.data.object)
      break
  }
  
  return NextResponse.json({ received: true })
}
```

### Local Webhook Testing

```bash
# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Get the webhook signing secret from CLI output
# whsec_xxxxx
```

---

## Common Patterns

### Check Subscription Status

```typescript
const subscription = await stripe.subscriptions.retrieve(
  user.stripeSubscriptionId
)

if (subscription.status === 'active') {
  // User has active subscription
}
```

### Cancel Subscription

```typescript
await stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true,
})
```

### Update Subscription

```typescript
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscription.items.data[0].id,
    price: newPriceId,
  }],
  proration_behavior: 'create_prorations',
})
```

---

## Testing

### Test Card Numbers

| Scenario | Card Number |
|----------|-------------|
| Successful payment | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| Requires 3D Secure | `4000 0025 0000 3155` |
| Insufficient funds | `4000 0000 0000 9995` |

### Test Webhook Events

```bash
# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

---

## Going to Production

### Checklist

- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Enable required payment methods
- [ ] Set up tax collection (if applicable)
- [ ] Configure email receipts
- [ ] Complete Stripe identity verification
- [ ] Test complete checkout flow in live mode

### Production Environment Variables

```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From production webhook
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `No such price` | Check price ID matches Stripe dashboard |
| `Invalid signature` | Verify webhook secret is correct |
| `Customer not found` | Create customer before checkout |
| Webhooks not receiving | Check endpoint URL, SSL certificate |
| Test mode in production | Switch to live API keys |

---

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Subscription Integration Guide](https://stripe.com/docs/billing/subscriptions/overview)

---

*Last updated: January 2026*
