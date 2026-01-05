import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (use Redis in production for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
    windowMs: number      // Time window in milliseconds
    maxRequests: number   // Max requests per window
}

// Different limits for different operations
export const RATE_LIMITS = {
    // General API calls
    api: { windowMs: 60 * 1000, maxRequests: 100 },       // 100 req/min

    // Authentication attempts
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },  // 10 attempts/15min

    // Content creation (protect against spam)
    createContent: { windowMs: 60 * 60 * 1000, maxRequests: 50 },  // 50/hour

    // Scan requests (expensive operation)
    scan: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100/hour

    // DMCA notice generation (critical, limit abuse)
    dmca: { windowMs: 60 * 60 * 1000, maxRequests: 50 },  // 50/hour

    // Billing operations
    billing: { windowMs: 60 * 1000, maxRequests: 10 },    // 10/min
} as const

export type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Get a unique identifier for rate limiting
 * Uses user ID if authenticated, otherwise IP address
 */
function getIdentifier(request: NextRequest, userId?: string): string {
    if (userId) {
        return `user:${userId}`
    }

    // Get IP from various headers (Vercel, Cloudflare, etc.)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0] || realIp || 'unknown'

    return `ip:${ip}`
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
    identifier: string,
    type: RateLimitType
): { allowed: boolean; remaining: number; resetIn: number } {
    const config = RATE_LIMITS[type]
    const key = `${type}:${identifier}`
    const now = Date.now()

    const record = rateLimitStore.get(key)

    // If no record or window expired, create new
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs
        })
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetIn: config.windowMs
        }
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: record.resetTime - now
        }
    }

    // Increment counter
    record.count++
    rateLimitStore.set(key, record)

    return {
        allowed: true,
        remaining: config.maxRequests - record.count,
        resetIn: record.resetTime - now
    }
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(type: RateLimitType, userId?: string) {
    return (request: NextRequest) => {
        const identifier = getIdentifier(request, userId)
        const result = checkRateLimit(identifier, type)

        if (!result.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Please try again in ${Math.ceil(result.resetIn / 1000)} seconds.`,
                    retryAfter: Math.ceil(result.resetIn / 1000)
                },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
                        'Retry-After': String(Math.ceil(result.resetIn / 1000))
                    }
                }
            )
        }

        return null // No rate limit hit, proceed
    }
}

/**
 * Helper to apply rate limiting in API routes
 * Usage:
 *   const rateLimitResult = applyRateLimit(request, 'api', session?.user?.id)
 *   if (rateLimitResult) return rateLimitResult
 */
export function applyRateLimit(
    request: NextRequest,
    type: RateLimitType,
    userId?: string
): NextResponse | null {
    return rateLimit(type, userId)(request)
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now()
        for (const [key, value] of rateLimitStore.entries()) {
            if (now > value.resetTime) {
                rateLimitStore.delete(key)
            }
        }
    }, 5 * 60 * 1000)
}
