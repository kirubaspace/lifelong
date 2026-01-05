"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { PLANS } from "@/lib/stripe"

export default function BillingPage() {
    const [loading, setLoading] = useState<string | null>(null)

    const handleCheckout = async (plan: string) => {
        try {
            setLoading(plan)
            const priceId = PLANS[plan as keyof typeof PLANS]?.priceId
            if (!priceId) {
                console.error("No price ID for plan:", plan)
                return
            }
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, priceId }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    const handlePortal = async () => {
        try {
            setLoading("portal")
            const response = await fetch("/api/stripe/portal", { method: "POST" })
            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
                    <p className="text-slate-400 mt-1">
                        Choose the plan that fits your needs
                    </p>
                </div>
                <Button
                    onClick={handlePortal}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    disabled={loading === "portal"}
                >
                    {loading === "portal" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Manage Subscription
                </Button>
            </div>

            {/* Pricing Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(PLANS).map(([key, plan]) => (
                    <Card
                        key={key}
                        className={`bg-slate-900 border-slate-800 relative ${'popular' in plan && plan.popular ? 'border-purple-500 ring-1 ring-purple-500' : ''
                            }`}
                    >
                        {'popular' in plan && plan.popular && (
                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                                Most Popular
                            </Badge>
                        )}
                        <CardHeader>
                            <CardTitle className="text-white">{plan.name}</CardTitle>
                            <CardDescription className="text-slate-400">
                                {plan.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                <span className="text-slate-400 ml-2">/month</span>
                            </div>

                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2">
                                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="text-slate-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleCheckout(key)}
                                className={`w-full ${'popular' in plan && plan.popular
                                    ? 'bg-purple-600 hover:bg-purple-700'
                                    : 'bg-slate-700 hover:bg-slate-600'
                                    }`}
                                disabled={loading === key || plan.price === 0}
                            >
                                {loading === key && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {plan.price === 0 ? "Current Plan" : "Upgrade"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
