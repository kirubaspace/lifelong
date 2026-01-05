import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        if (!stripe) {
            return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
        }

        const stripeCustomerId = session.user.stripeCustomerId

        if (!stripeCustomerId) {
            return NextResponse.json(
                { error: "No subscription found. Please upgrade first." },
                { status: 400 }
            )
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXTAUTH_URL}/dashboard/billing`,
        })

        return NextResponse.json({ url: portalSession.url })
    } catch (error) {
        console.error("Portal error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Portal access failed" },
            { status: 500 }
        )
    }
}
