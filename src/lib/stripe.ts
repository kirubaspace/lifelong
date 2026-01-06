import Stripe from 'stripe'

// Stripe client - initialized lazily for build-time compatibility
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    })
    : null as unknown as Stripe

// Pricing configuration - Optimized for sustainability:
// - Google CSE: Now only 3 queries/scan (down from 17) = 6x capacity
// - Pricing aligned with industry standards for positive margins
// Supports ~100-200 active users on all free tiers
export const PLANS = {
    free: {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic protection',
        price: 0,
        priceId: null,
        features: [
            '1 protected course',
            '1 scan per day',
            'Telegram & Torrent detection',
            'Manual takedowns only',
        ],
        limits: {
            protectedContent: 1,
            scansPerDay: 1,
            autoTakedowns: false,
            useGoogleCSE: false, // Free tier uses alternatives only
        },
    },
    starter: {
        name: 'Starter',
        slug: 'starter',
        description: 'For individual course creators',
        price: 19,
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        features: [
            '5 protected courses',
            '5 scans per day',
            'Google + Telegram + Torrent detection',
            'Manual takedowns',
            'Email alerts',
            'Basic analytics',
        ],
        limits: {
            protectedContent: 5,
            scansPerDay: 5,
            autoTakedowns: false,
            useGoogleCSE: true,
        },
    },
    pro: {
        name: 'Pro',
        slug: 'pro',
        description: 'For serious course creators',
        price: 49,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        popular: true,
        features: [
            '15 protected courses',
            '15 scans per day',
            'All detection sources',
            'Auto-takedowns',
            'Priority scanning',
            'Advanced analytics',
        ],
        limits: {
            protectedContent: 15,
            scansPerDay: 15,
            autoTakedowns: true,
            useGoogleCSE: true,
        },
    },
    enterprise: {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For course platforms & agencies',
        price: 99,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
            '50 protected courses',
            '50 scans per day',
            'All detection sources',
            'Auto-takedowns',
            'White-label reports',
            'API access',
            'Priority support',
        ],
        limits: {
            protectedContent: 50,
            scansPerDay: 50,
            autoTakedowns: true,
            useGoogleCSE: true,
        },
    },
} as const

export type PlanType = keyof typeof PLANS

export function getPlanLimits(plan: string) {
    return PLANS[plan as PlanType]?.limits || PLANS.free.limits
}

export function canAddContent(plan: string, currentCount: number): boolean {
    const limits = getPlanLimits(plan)
    return currentCount < limits.protectedContent
}

export function canAutoTakedown(plan: string): boolean {
    const limits = getPlanLimits(plan)
    return limits.autoTakedowns
}
