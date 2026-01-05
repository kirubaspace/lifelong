import Stripe from 'stripe'

// Stripe client - initialized lazily for build-time compatibility
export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
        typescript: true,
    })
    : null as unknown as Stripe

// Pricing configuration - Affordable pricing for indie creators
export const PLANS = {
    free: {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic protection',
        price: 0,
        priceId: null,
        features: [
            '1 protected course',
            '10 scans per day',
            'Manual takedowns only',
            'Email reports',
        ],
        limits: {
            protectedContent: 1,
            scansPerDay: 10,
            autoTakedowns: false,
        },
    },
    starter: {
        name: 'Starter',
        slug: 'starter',
        description: 'For individual course creators',
        price: 5,
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        features: [
            '3 protected courses',
            '50 scans per day',
            'Manual takedowns',
            'Email reports',
            'Basic analytics',
        ],
        limits: {
            protectedContent: 3,
            scansPerDay: 50,
            autoTakedowns: false,
        },
    },
    pro: {
        name: 'Pro',
        slug: 'pro',
        description: 'For serious course creators',
        price: 15,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        popular: true,
        features: [
            '15 protected courses',
            '500 scans per day',
            'Unlimited auto-takedowns',
            'Priority scanning',
            'Telegram monitoring',
            'Torrent site detection',
            'Advanced analytics',
        ],
        limits: {
            protectedContent: 15,
            scansPerDay: 500,
            autoTakedowns: true,
        },
    },
    enterprise: {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'For course platforms & agencies',
        price: 39,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
            'Unlimited protected courses',
            'Unlimited scans',
            'Unlimited auto-takedowns',
            'Priority scanning',
            'All detection sources',
            'White-label reports',
            'API access',
            'Dedicated support',
        ],
        limits: {
            protectedContent: Infinity,
            scansPerDay: Infinity,
            autoTakedowns: true,
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
