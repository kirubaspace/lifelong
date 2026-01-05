# PirateSlayer - Setup Guide

All the credentials and services you need to configure before going live.

---

## 🔴 REQUIRED (App Won't Work Without These)

### 1. Database (PostgreSQL)
| Variable | Where to Get | Notes |
|----------|--------------|-------|
| `DATABASE_URL` | [Supabase](https://supabase.com) (free) or [Neon](https://neon.tech) (free) | Format: `postgresql://user:pass@host:5432/db` |

### 2. NextAuth Authentication
| Variable | How to Generate |
|----------|-----------------|
| `NEXTAUTH_URL` | Your domain: `https://yourdomain.com` (or `http://localhost:3000` for local) |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |

### 3. Google OAuth
| Variable | Where to Get |
|----------|--------------|
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same as above |

**Setup Steps:**
1. Create new project at console.cloud.google.com
2. Go to APIs & Services → OAuth consent screen → External
3. Go to Credentials → Create OAuth Client ID → Web application
4. Add redirect URI: `https://yourdomain.com/api/auth/callback/google`

---

## 🟡 REQUIRED FOR PAYMENTS (Stripe)

| Variable | Where to Get |
|----------|--------------|
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key |
| `STRIPE_PUBLISHABLE_KEY` | Same page → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Create endpoint |
| `STRIPE_STARTER_PRICE_ID` | Create product → Copy price ID (`price_xxx`) |
| `STRIPE_PRO_PRICE_ID` | Create product → Copy price ID |
| `STRIPE_ENTERPRISE_PRICE_ID` | Create product → Copy price ID |

**Setup Steps:**
1. Create account at stripe.com
2. Use TEST keys for development (start with `sk_test_` and `pk_test_`)
3. Create 3 products with monthly recurring prices
4. Set up webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`

---

## 🟢 OPTIONAL (Enhanced Features)

### Google Custom Search (Piracy Scanning)
| Variable | Where to Get |
|----------|--------------|
| `GOOGLE_CSE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → APIs → Custom Search API |
| `GOOGLE_CSE_ID` | [Programmable Search](https://programmablesearchengine.google.com/) → Create engine |

### Email Notifications (Resend)
| Variable | Where to Get |
|----------|--------------|
| `RESEND_API_KEY` | [Resend](https://resend.com) → API Keys |

---

## 📋 Complete .env Template

```bash
# === DATABASE ===
DATABASE_URL="postgresql://username:password@host:5432/pirateslayer"

# === NEXTAUTH ===
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"

# === STRIPE ===
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
STRIPE_STARTER_PRICE_ID="price_xxxxx"
STRIPE_PRO_PRICE_ID="price_xxxxx"
STRIPE_ENTERPRISE_PRICE_ID="price_xxxxx"

# === GOOGLE CUSTOM SEARCH (optional) ===
GOOGLE_CSE_API_KEY=""
GOOGLE_CSE_ID=""

# === APP URL ===
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

---

## 🖥️ Hosting Options

| Option | Best For | Database |
|--------|----------|----------|
| **Vercel** (recommended) | Next.js apps | Need separate DB (Supabase/Neon) |
| **Railway** | Full-stack | Includes PostgreSQL |
| **Hostinger VPS** | Full control | Need to install PostgreSQL |

> ⚠️ **Note**: Standard Hostinger shared hosting does NOT support Next.js. You need Hostinger VPS or use Vercel instead.
