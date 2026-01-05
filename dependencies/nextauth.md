# NextAuth.js Authentication

> Comprehensive guide to implementing authentication with NextAuth.js v5 in Next.js applications.

---

## Overview

**NextAuth.js** (now Auth.js) provides complete authentication for Next.js applications:
- OAuth providers (Google, GitHub, etc.)
- Email/password authentication
- JWT and database sessions
- Built-in CSRF protection

---

## Why NextAuth.js?

| Feature | Benefit |
|---------|---------|
| **Zero Config** | Works out of the box with providers |
| **Secure by Default** | CSRF, secure cookies, JWT encryption |
| **Flexible** | OAuth, email, credentials providers |
| **Database Adapters** | Prisma, Drizzle, MongoDB, etc. |
| **TypeScript** | Full type safety |

---

## Setup Guide

### Step 1: Install Dependencies

```bash
npm install next-auth@beta @auth/prisma-adapter
```

### Step 2: Create Auth Configuration

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user ID and plan to session
      if (session.user) {
        session.user.id = user.id
        session.user.plan = user.plan
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

### Step 3: Create API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

### Step 4: Add Middleware (Optional)

```typescript
// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

---

## Environment Variables

```bash
# Required
AUTH_SECRET="your-32-character-secret"  # Generate with: openssl rand -base64 32

# Google OAuth
AUTH_GOOGLE_ID="xxxxx.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="GOCSPX-xxxxx"

# Optional
AUTH_URL="http://localhost:3000"  # Required in production
AUTH_TRUST_HOST=true  # For proxied environments
```

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to **APIs & Services → Credentials**

### Step 2: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - App name
   - User support email
   - Developer contact email
4. Add scopes: `email`, `profile`, `openid`

### Step 3: Create OAuth Client ID

1. Go to **Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
4. Copy Client ID and Client Secret

---

## Usage in Components

### Get Session (Server Component)

```typescript
import { auth } from "@/lib/auth"

export default async function Dashboard() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  return <div>Welcome, {session.user.name}</div>
}
```

### Get Session (Client Component)

```typescript
'use client'
import { useSession } from "next-auth/react"

export function UserInfo() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <div>Loading...</div>
  if (!session) return <div>Not signed in</div>
  
  return <div>Welcome, {session.user?.name}</div>
}
```

### Sign In / Sign Out

```typescript
import { signIn, signOut } from "@/lib/auth"

// Server Action
export async function handleSignIn() {
  await signIn("google", { redirectTo: "/dashboard" })
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" })
}
```

### Client-Side Sign In

```typescript
'use client'
import { signIn, signOut } from "next-auth/react"

<button onClick={() => signIn("google")}>Sign in with Google</button>
<button onClick={() => signOut()}>Sign out</button>
```

---

## Prisma Schema

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  
  // Custom fields
  plan          String    @default("free")
  
  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## Extending the Session

### Add Custom Fields to Session

```typescript
// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface User {
    plan?: string
  }
  
  interface Session {
    user: {
      id: string
      plan: string
    } & DefaultSession["user"]
  }
}
```

### Callback Configuration

```typescript
callbacks: {
  async session({ session, user }) {
    session.user.id = user.id
    session.user.plan = user.plan ?? "free"
    return session
  },
  async jwt({ token, user }) {
    if (user) {
      token.plan = user.plan
    }
    return token
  },
}
```

---

## Protecting Routes

### Server-Side Protection

```typescript
// In any server component or API route
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Proceed with authenticated logic
}
```

### Middleware Protection

```typescript
// middleware.ts
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `OAuth client not found` | Verify Google client ID/secret |
| `Callback URL mismatch` | Check authorized redirect URIs |
| `Session undefined` | Ensure SessionProvider wraps app |
| `CSRF token mismatch` | Check AUTH_SECRET is set |
| `Database error` | Run `npx prisma migrate dev` |

---

## Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [NextAuth.js v5 Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [Google Provider](https://authjs.dev/getting-started/providers/google)

---

*Last updated: January 2026*
