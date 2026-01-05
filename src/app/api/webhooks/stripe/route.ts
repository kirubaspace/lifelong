import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

// Helper to safely get subscription period dates
function getSubscriptionDates(subscription: Stripe.Subscription) {
    // Handle both snake_case and camelCase property names
    const sub = subscription as unknown as Record<string, unknown>
    const periodStart = sub.current_period_start ?? sub.currentPeriodStart
    const periodEnd = sub.current_period_end ?? sub.currentPeriodEnd
    const cancelPeriodEnd = sub.cancel_at_period_end ?? sub.cancelAtPeriodEnd

    return {
        currentPeriodStart: typeof periodStart === 'number' ? new Date(periodStart * 1000) : null,
        currentPeriodEnd: typeof periodEnd === 'number' ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: Boolean(cancelPeriodEnd),
    }
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error) {
        console.error("Webhook signature verification failed:", error)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.metadata?.userId
                const plan = session.metadata?.plan

                if (userId && plan) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            plan,
                            stripeSubscriptionId: session.subscription as string,
                        },
                    })

                    // Create subscription record
                    if (session.subscription) {
                        const subscriptionData = await stripe.subscriptions.retrieve(
                            session.subscription as string
                        )

                        const dates = getSubscriptionDates(subscriptionData)

                        await prisma.subscription.upsert({
                            where: { userId },
                            create: {
                                userId,
                                stripeSubscriptionId: subscriptionData.id,
                                status: subscriptionData.status,
                                priceId: subscriptionData.items.data[0]?.price.id,
                                currentPeriodStart: dates.currentPeriodStart,
                                currentPeriodEnd: dates.currentPeriodEnd,
                            },
                            update: {
                                stripeSubscriptionId: subscriptionData.id,
                                status: subscriptionData.status,
                                priceId: subscriptionData.items.data[0]?.price.id,
                                currentPeriodStart: dates.currentPeriodStart,
                                currentPeriodEnd: dates.currentPeriodEnd,
                            },
                        })
                    }
                }
                break
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId },
                })

                if (user) {
                    // Determine plan from price ID
                    let plan = "free"
                    const priceId = subscription.items.data[0]?.price.id

                    if (priceId === process.env.STRIPE_STARTER_PRICE_ID) plan = "starter"
                    else if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = "pro"
                    else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) plan = "enterprise"

                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            plan: subscription.status === "active" ? plan : "free",
                        },
                    })

                    const dates = getSubscriptionDates(subscription)

                    await prisma.subscription.upsert({
                        where: { userId: user.id },
                        create: {
                            userId: user.id,
                            stripeSubscriptionId: subscription.id,
                            status: subscription.status,
                            priceId,
                            currentPeriodStart: dates.currentPeriodStart,
                            currentPeriodEnd: dates.currentPeriodEnd,
                            cancelAtPeriodEnd: dates.cancelAtPeriodEnd,
                        },
                        update: {
                            status: subscription.status,
                            priceId,
                            currentPeriodStart: dates.currentPeriodStart,
                            currentPeriodEnd: dates.currentPeriodEnd,
                            cancelAtPeriodEnd: dates.cancelAtPeriodEnd,
                        },
                    })
                }
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId },
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            plan: "free",
                            stripeSubscriptionId: null,
                        },
                    })

                    await prisma.subscription.updateMany({
                        where: { userId: user.id },
                        data: { status: "canceled" },
                    })
                }
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice
                const customerId = invoice.customer as string

                const user = await prisma.user.findFirst({
                    where: { stripeCustomerId: customerId },
                })

                if (user) {
                    // You could send an email notification here
                    console.log(`Payment failed for user ${user.id}`)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error("Error processing webhook:", error)
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
    }
}
