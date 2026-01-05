# PirateSlayer - DMCA Takedown SaaS

## Environment Variables

# Copy this file to .env and fill in your values

# Database (Supabase, Neon, or local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/pirateslayer?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_STARTER_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ENTERPRISE_PRICE_ID="price_..."

# Google Custom Search (for piracy scanning)
GOOGLE_CSE_API_KEY="your-google-cse-api-key"
GOOGLE_CSE_ID="your-custom-search-engine-id"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="PirateSlayer <noreply@yourdomain.com>"

# Redis (Upstash)
REDIS_URL="redis://default:xxx@xxx.upstash.io:6379"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
