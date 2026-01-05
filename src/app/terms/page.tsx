import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">PirateSlayer</span>
                        </Link>
                        <Button asChild variant="ghost" className="text-slate-400 hover:text-white">
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-slate-400 mb-8">Last updated: January 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none">
                        <div className="space-y-8 text-slate-300">

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                                <p>
                                    By accessing or using PirateSlayer ("Service"), you agree to be bound by these Terms of Service.
                                    If you do not agree to these terms, do not use the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
                                <p>
                                    PirateSlayer provides tools to help copyright owners detect potential unauthorized copies of their
                                    digital content and generate DMCA takedown notices. The Service includes:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>Content registration and monitoring</li>
                                    <li>Automated scanning for potential infringements</li>
                                    <li>DMCA notice generation tools</li>
                                    <li>Takedown tracking and analytics</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">3. User Responsibilities</h2>
                                <p className="font-semibold text-amber-400">
                                    YOU ARE SOLELY RESPONSIBLE FOR:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>Ensuring you own or have authorization to protect the content you register</li>
                                    <li>The accuracy of all information provided in DMCA notices</li>
                                    <li>Verifying that alleged infringements are actually unauthorized</li>
                                    <li>Any legal consequences resulting from false or inaccurate claims</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">4. DMCA Notice Requirements</h2>
                                <p>
                                    By using our DMCA generation tools, you certify under penalty of perjury that:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>You are the copyright owner or authorized to act on behalf of the owner</li>
                                    <li>You have a good faith belief that the use is not authorized by the copyright owner</li>
                                    <li>The information in the notice is accurate</li>
                                </ul>
                                <p className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
                                    <strong>Warning:</strong> Filing a false DMCA notice can result in legal liability, including
                                    damages, attorney's fees, and potential perjury charges under 17 U.S.C. § 512(f).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
                                <p>
                                    PirateSlayer provides tools to assist with content protection but does not guarantee:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>Detection of all instances of infringement</li>
                                    <li>Successful removal of infringing content</li>
                                    <li>Compliance by third-party hosting providers</li>
                                    <li>Prevention of all piracy</li>
                                </ul>
                                <p className="mt-4">
                                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. IN NO EVENT SHALL PIRATESLAYER
                                    BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">6. Indemnification</h2>
                                <p>
                                    You agree to indemnify and hold harmless PirateSlayer, its officers, directors, employees,
                                    and agents from any claims, damages, losses, or expenses (including attorney's fees) arising
                                    from your use of the Service or violation of these Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">7. Prohibited Uses</h2>
                                <p>You may NOT use the Service to:</p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>File false or fraudulent DMCA notices</li>
                                    <li>Claim ownership of content you do not own</li>
                                    <li>Harass or abuse third parties</li>
                                    <li>Violate any applicable laws</li>
                                    <li>Circumvent any security measures</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">8. Account Termination</h2>
                                <p>
                                    We reserve the right to suspend or terminate your account at any time for violation of these
                                    Terms, including but not limited to filing false DMCA notices or abusive behavior.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
                                <p>
                                    We may modify these Terms at any time. Continued use of the Service after changes constitutes
                                    acceptance of the modified Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">10. Contact</h2>
                                <p>
                                    For questions about these Terms, contact us at legal@pirateslayer.io
                                </p>
                            </section>

                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <p className="text-slate-500 text-sm">
                            By using PirateSlayer, you acknowledge that you have read, understood, and agree to be bound
                            by these Terms of Service.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
