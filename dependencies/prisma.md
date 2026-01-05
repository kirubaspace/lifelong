# Prisma ORM

> Comprehensive guide to Prisma database toolkit for Node.js and TypeScript applications.

---

## Overview

**Prisma** is a next-generation ORM that provides:
- Type-safe database client generated from your schema
- Declarative data modeling with Prisma Schema
- Automated migrations
- Visual database browser (Prisma Studio)

---

## Why Prisma?

| Feature | Benefit |
|---------|---------|
| **Type Safety** | Auto-generated TypeScript types |
| **Developer Experience** | Intuitive API, great autocomplete |
| **Migration System** | Version-controlled schema changes |
| **Query Builder** | No raw SQL needed (but supported) |
| **Multi-Database** | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server |

---

## Setup Guide

### Step 1: Install Prisma

```bash
npm install prisma --save-dev
npm install @prisma/client
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Schema file
- `.env` - Environment variables with DATABASE_URL

### Step 3: Configure Database

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Schema Definition

### Basic Model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  @@index([authorId])
}
```

### Field Types

| Prisma Type | PostgreSQL | Description |
|-------------|------------|-------------|
| `String` | `TEXT` | Variable length text |
| `Int` | `INTEGER` | 32-bit integer |
| `BigInt` | `BIGINT` | 64-bit integer |
| `Float` | `DOUBLE PRECISION` | Floating point |
| `Boolean` | `BOOLEAN` | True/false |
| `DateTime` | `TIMESTAMP` | Date and time |
| `Json` | `JSONB` | JSON data |
| `Bytes` | `BYTEA` | Binary data |

### Field Modifiers

```prisma
// Optional field
name String?

// Array field (PostgreSQL)
tags String[]

// Default value
plan String @default("free")

// Auto-increment
id Int @id @default(autoincrement())

// UUID
id String @id @default(uuid())

// CUID (collision-resistant)
id String @id @default(cuid())

// Current timestamp
createdAt DateTime @default(now())

// Auto-update timestamp
updatedAt DateTime @updatedAt
```

### Relations

```prisma
// One-to-Many
model User {
  id    String @id
  posts Post[]
}

model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}

// Many-to-Many
model Post {
  id         String     @id
  categories Category[]
}

model Category {
  id    String @id
  posts Post[]
}

// One-to-One
model User {
  id      String   @id
  profile Profile?
}

model Profile {
  id     String @id
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

---

## Migrations

### Create Migration

```bash
# Development (also applies migration)
npx prisma migrate dev --name init
npx prisma migrate dev --name add_user_plan

# Production (apply only)
npx prisma migrate deploy
```

### Other Commands

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate client without migration
npx prisma generate

# Push schema without migration (prototyping)
npx prisma db push

# Compare schema to database
npx prisma migrate diff
```

---

## Prisma Client Usage

### Setup Singleton

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### CRUD Operations

```typescript
import { prisma } from '@/lib/db'

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'alice@example.com',
    name: 'Alice',
  },
})

// READ - Single
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
})

const user = await prisma.user.findFirst({
  where: { name: { contains: 'Alice' } },
})

// READ - Multiple
const users = await prisma.user.findMany({
  where: { plan: 'pro' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
})

// UPDATE
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: { plan: 'pro' },
})

// UPDATE - Many
await prisma.user.updateMany({
  where: { plan: 'free' },
  data: { isActive: true },
})

// DELETE
await prisma.user.delete({
  where: { id: 'user-id' },
})

// DELETE - Many
await prisma.user.deleteMany({
  where: { email: { contains: '@test.com' } },
})

// UPSERT
const user = await prisma.user.upsert({
  where: { email: 'alice@example.com' },
  update: { name: 'Alice Updated' },
  create: { email: 'alice@example.com', name: 'Alice' },
})
```

### Including Relations

```typescript
// Include related records
const userWithPosts = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: {
    posts: true,
    profile: true,
  },
})

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    _count: {
      select: { posts: true },
    },
  },
})
```

### Filtering

```typescript
// Comparison operators
where: {
  age: { gt: 18 },       // Greater than
  age: { gte: 18 },      // Greater than or equal
  age: { lt: 65 },       // Less than
  age: { lte: 65 },      // Less than or equal
  age: { not: 30 },      // Not equal
}

// String operators
where: {
  email: { contains: '@gmail.com' },
  name: { startsWith: 'A' },
  name: { endsWith: 'son' },
}

// Logical operators
where: {
  AND: [{ plan: 'pro' }, { isActive: true }],
  OR: [{ email: { contains: '@gmail.com' } }, { email: { contains: '@yahoo.com' } }],
  NOT: { plan: 'free' },
}

// Array operators (PostgreSQL)
where: {
  tags: { has: 'typescript' },
  tags: { hasEvery: ['typescript', 'react'] },
  tags: { hasSome: ['typescript', 'javascript'] },
}
```

### Transactions

```typescript
// Sequential operations
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'new@example.com' } }),
  prisma.post.create({ data: { title: 'First Post', authorId: 'user-id' } }),
])

// Interactive transaction
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'new@example.com' } })
  await tx.post.create({ data: { title: 'First Post', authorId: user.id } })
})
```

---

## Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

---

## Best Practices

### 1. Use Indexes

```prisma
model Post {
  authorId String
  
  @@index([authorId])
  @@index([createdAt])
}
```

### 2. Limit Query Results

```typescript
// Always paginate large datasets
const posts = await prisma.post.findMany({
  take: 20,
  skip: (page - 1) * 20,
})
```

### 3. Select Only Needed Fields

```typescript
// Instead of fetching all fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
  },
})
```

### 4. Use Raw Queries When Needed

```typescript
const result = await prisma.$queryRaw`
  SELECT * FROM "User" WHERE email LIKE ${`%${search}%`}
`
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| `Schema drift detected` | Run `npx prisma migrate dev` |
| `Unique constraint failed` | Handle duplicate entries |
| `Connection pooling issues` | Use connection pooler for serverless |

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Examples](https://github.com/prisma/prisma-examples)

---

*Last updated: January 2026*
