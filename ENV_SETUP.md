# PirateSlayer - Environment Variables Setup

Copy the variables below to your `.env.local` file or Vercel Environment Variables.

## Database (Neon.tech)
```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## Authentication (NextAuth.js v5)
```
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_GOOGLE_ID="your-google-oauth-client-id"
AUTH_GOOGLE_SECRET="your-google-oauth-client-secret"
```

## Stripe Billing
```
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_STARTER_PRICE_ID="price_..."   # $19/month
STRIPE_PRO_PRICE_ID="price_..."       # $49/month
STRIPE_ENTERPRISE_PRICE_ID="price_..." # $99/month
```

## Google Custom Search
```
GOOGLE_CSE_API_KEY="your-google-cse-api-key"
GOOGLE_CSE_ID="your-custom-search-engine-id"
```

## Email (Resend)
```
RESEND_API_KEY="re_..."
```

## Telegram Scanner (Optional)
```
TELEGRAM_API_ID="your-telegram-api-id"
TELEGRAM_API_HASH="your-telegram-api-hash"
TELEGRAM_SESSION="your-telegram-session-string"
```

## Cron Jobs Security
```
CRON_SECRET="your-cron-secret-here"
```
Generate with: `openssl rand -hex 32`

---

## Vercel Cron Jobs

Configured in `vercel.json`:

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/cache-cleanup` | Every 6 hours | Clean expired cache |
| `/api/cron/scan` | Every 4 hours | Auto-scan content |

**Note:** Cron jobs require Vercel Pro ($20/mo). For Hobby plan, use [cron-job.org](https://cron-job.org) (free):
```
URL: https://yourdomain.com/api/cron/cache-cleanup
Headers: Authorization: Bearer YOUR_CRON_SECRET
Schedule: 0 */6 * * *
```
