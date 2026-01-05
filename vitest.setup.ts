
import { vi } from 'vitest'

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock'
