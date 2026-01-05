# PostgreSQL Database

> Comprehensive guide to PostgreSQL usage in this project and other Node.js/Next.js applications.

---

## Overview

**PostgreSQL** is an advanced open-source relational database system known for reliability, feature robustness, and performance. It's the primary data store for this application.

---

## Why PostgreSQL?

| Feature | Benefit |
|---------|---------|
| **ACID Compliance** | Guaranteed data integrity for financial/sensitive data |
| **JSON Support** | Native JSONB for flexible schema when needed |
| **Array Types** | Store arrays natively (used for `keywords[]` in this project) |
| **Full-Text Search** | Built-in search capabilities |
| **Scalability** | Handles millions of rows efficiently |
| **Ecosystem** | Excellent tooling, hosting options, and community |

---

## Setup Options

### Option 1: Local Development

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb pirateslayer_dev
```

### Option 2: Docker

```bash
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pirateslayer_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

### Option 3: Cloud Providers (Recommended for Production)

| Provider | Free Tier | Pros |
|----------|-----------|------|
| **Supabase** | 500MB, 2 projects | Built-in auth, realtime, great DX |
| **Neon** | 512MB, unlimited projects | Serverless, branching |
| **Railway** | $5 credit/month | Easy deploy, good DX |
| **Render** | 90 days free | Simple setup |
| **AWS RDS** | 12 months free tier | Enterprise-grade |

---

## Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

### Examples

```bash
# Local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pirateslayer_dev"

# Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Neon
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require"

# Railway
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway"
```

---

## Usage in This Project

### Connection via Prisma

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Schema Location

```
prisma/schema.prisma
```

### Key Tables

| Table | Purpose |
|-------|---------|
| `User` | User accounts with subscription info |
| `Account` | OAuth provider accounts (Google) |
| `Session` | Active user sessions |
| `ProtectedContent` | Content being monitored |
| `Infringement` | Detected piracy instances |
| `DMCANotice` | Takedown notices |
| `ScanJob` | Scan history |

---

## Common Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

---

## Performance Tips

### 1. Connection Pooling

For serverless environments (Vercel, AWS Lambda), use connection pooling:

```bash
# Supabase with pooler
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:6543/postgres?pgbouncer=true"
```

### 2. Indexes

Add indexes for frequently queried columns:

```prisma
model ProtectedContent {
  @@index([userId])
  @@index([isActive])
  @@index([contentType])
}
```

### 3. Query Optimization

```typescript
// Use select to limit returned fields
const contents = await prisma.protectedContent.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    _count: { select: { infringements: true } }
  }
})
```

---

## Backup & Maintenance

```bash
# Backup
pg_dump -h localhost -U postgres -d pirateslayer_dev > backup.sql

# Restore
psql -h localhost -U postgres -d pirateslayer_dev < backup.sql

# Vacuum (reclaim space)
vacuumdb -h localhost -U postgres -d pirateslayer_dev
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `FATAL: password authentication failed` | Check DATABASE_URL credentials |
| `ECONNREFUSED` | Ensure PostgreSQL is running |
| `relation does not exist` | Run `npx prisma migrate dev` |
| `too many connections` | Use connection pooling |
| `SSL required` | Add `?sslmode=require` to connection string |

---

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Neon Documentation](https://neon.tech/docs)

---

*Last updated: January 2026*
