import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe, PLANS } from "@/lib/stripe"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!stripe) {
            return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
        }

        const body = await request.json()
        const { priceId, plan } = body

        if (!priceId || !plan) {
            return NextResponse.json({ error: "Missing priceId or plan" }, { status: 400 })
        }

        // Get or create Stripe customer
        let stripeCustomerId = session.user.stripeCustomerId

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: session.user.email,
                name: session.user.name || undefined,
                metadata: {
                    userId: session.user.id,
                },
            })
            stripeCustomerId = customer.id

            // Save customer ID to database
            await prisma.user.update({
                where: { id: session.user.id },
                data: { stripeCustomerId },
            })
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
            metadata: {
                userId: session.user.id,
                plan,
            },
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error) {
        console.error("Checkout error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Checkout failed" },
            { status: 500 }
        )
    }
}
