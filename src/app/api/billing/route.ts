import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { stripe, PLANS } from "@/lib/stripe"
import Stripe from "stripe"

// POST /api/billing/checkout - Create checkout session
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { plan } = await request.json()

        if (!plan || !PLANS[plan as keyof typeof PLANS]) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
        }

        const selectedPlan = PLANS[plan as keyof typeof PLANS]

        if (!selectedPlan.priceId) {
            return NextResponse.json({ error: "Free plan doesn't require checkout" }, { status: 400 })
        }

        // Get or create Stripe customer
        let customerId = session.user.stripeCustomerId

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || undefined,
                metadata: {
                    userId: session.user.id,
                },
            })
            customerId = customer.id

            await prisma.user.update({
                where: { id: session.user.id },
                data: { stripeCustomerId: customerId },
            })
        }

        // Create checkout session
        const headersList = await headers()
        const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: selectedPlan.priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/dashboard/billing?success=true`,
            cancel_url: `${origin}/dashboard/billing?canceled=true`,
            metadata: {
                userId: session.user.id,
                plan,
            },
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error("Error creating checkout:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// GET /api/billing/portal - Get billing portal URL
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { stripeCustomerId: true },
        })

        if (!user?.stripeCustomerId) {
            return NextResponse.json({ error: "No billing account" }, { status: 400 })
        }

        const headersList = await headers()
        const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_APP_URL

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${origin}/dashboard/billing`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("Error creating portal:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
