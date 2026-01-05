# External Dependencies

> Reusable documentation for external services used in this and other projects.

This folder contains comprehensive guides for each external service integrated into this application. Each document is self-contained and can be reused across other projects.

---

## Quick Reference

| Service | Purpose | Documentation |
|---------|---------|---------------|
| **PostgreSQL** | Primary database | [postgresql.md](./postgresql.md) |
| **Stripe** | Payments & subscriptions | [stripe.md](./stripe.md) |
| **Google CSE** | Web search for piracy detection | [google-cse.md](./google-cse.md) |
| **NextAuth.js** | Authentication (Google OAuth) | [nextauth.md](./nextauth.md) |
| **Prisma** | Database ORM | [prisma.md](./prisma.md) |
| **Resend** | Transactional emails | [resend.md](./resend.md) |

---

## Environment Variables Summary

All services require configuration via environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Stripe Payments
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="..."

# Google Custom Search
GOOGLE_CSE_API_KEY="..."
GOOGLE_CSE_ID="..."

# Email
RESEND_API_KEY="..."
```

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Your Application                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ NextAuth │  │  Prisma  │  │  Stripe  │  │  Resend  │   │
│   │   v5     │  │   ORM    │  │   SDK    │  │   SDK    │   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│        │             │             │             │          │
└────────┼─────────────┼─────────────┼─────────────┼──────────┘
         │             │             │             │
         ▼             ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Google  │  │PostgreSQL│  │  Stripe  │  │  Resend  │
   │  OAuth   │  │ Database │  │   API    │  │   API    │
   └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Reusing These Docs

Each documentation file is designed to be:
1. **Self-contained** - Can be copied to other projects
2. **Comprehensive** - Covers setup, usage, troubleshooting
3. **Up-to-date** - Last updated date noted at bottom

To use in another project:
```bash
cp -r dependencies/ /path/to/other/project/
```

---

*Last updated: January 2026*
