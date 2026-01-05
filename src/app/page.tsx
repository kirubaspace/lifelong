import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Zap,
  Target,
  Send,
  BarChart3,
  Clock,
  Check,
  ArrowRight,
  Play
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PirateSlayer</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                Login
              </Link>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-6">
            🛡️ Protect Your Digital Products From Pirates
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Stop Losing Money to{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Digital Piracy
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            Automatically detect unauthorized copies of your courses, ebooks, PDFs, and videos
            across the web and send DMCA takedown notices with one click. Protect your revenue 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 h-14">
              <Link href="/login">
                Get Protected Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-lg px-8 h-14">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          <p className="text-slate-500 mt-6">
            No credit card required to sign up
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Piracy Protection
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Everything you need to protect your courses, ebooks, PDFs, and videos from unauthorized distribution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Multi-Source Detection",
                description: "Scan Google, torrent sites, Telegram channels, and black-market forums for pirated copies.",
                color: "text-red-400",
                bgColor: "bg-red-500/10",
              },
              {
                icon: Zap,
                title: "24/7 Automated Scanning",
                description: "Continuous monitoring runs in the background. Get alerted the moment a new pirate copy appears.",
                color: "text-amber-400",
                bgColor: "bg-amber-500/10",
              },
              {
                icon: Send,
                title: "One-Click Takedowns",
                description: "Generate legally compliant DMCA notices and send them to hosting providers automatically.",
                color: "text-blue-400",
                bgColor: "bg-blue-500/10",
              },
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                description: "Track infringements, takedown success rates, and protected revenue over time.",
                color: "text-emerald-400",
                bgColor: "bg-emerald-500/10",
              },
              {
                icon: Clock,
                title: "Status Tracking",
                description: "Follow every takedown request from sent to removal confirmation. Know exactly what's happening.",
                color: "text-purple-400",
                bgColor: "bg-purple-500/10",
              },
              {
                icon: Shield,
                title: "Evidence Collection",
                description: "Automatic screenshot capture and documentation for legal proceedings if needed.",
                color: "text-pink-400",
                bgColor: "bg-pink-500/10",
              },
            ].map((feature) => (
              <Card key={feature.title} className="bg-slate-900 border-slate-800">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: 5,
                description: "For individual course creators",
                features: [
                  "3 protected courses",
                  "50 scans per day",
                  "Manual takedowns",
                  "Email reports",
                  "Basic analytics",
                ],
              },
              {
                name: "Pro",
                price: 15,
                description: "For serious course creators",
                popular: true,
                features: [
                  "15 protected courses",
                  "500 scans per day",
                  "Telegram monitoring",
                  "Torrent site detection",
                  "Unlimited auto-takedowns",
                  "Advanced analytics",
                ],
              },
              {
                name: "Enterprise",
                price: 39,
                description: "For platforms & agencies",
                features: [
                  "Unlimited courses",
                  "Unlimited scans",
                  "All detection sources",
                  "White-label reports",
                  "API access",
                  "Dedicated support",
                ],
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`bg-slate-900 border-slate-800 relative ${plan.popular ? 'border-purple-500 ring-1 ring-purple-500' : ''
                  }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{plan.description}</p>

                  <div className="flex items-baseline mt-6 mb-8">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-slate-400 ml-2">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                  >
                    <Link href="/login">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop Pirates From Stealing Your Revenue
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Every day without protection is lost revenue. Take back control today.
          </p>
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-12 h-14">
            <Link href="/login">
              Start Protecting Your Content
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">PirateSlayer</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 PirateSlayer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
