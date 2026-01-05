import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function PrivacyPolicyPage() {
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
                    <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-slate-400 mb-8">Last updated: January 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none">
                        <div className="space-y-8 text-slate-300">

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>

                                <h3 className="text-xl font-medium text-white mt-6 mb-3">Account Information</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Name and email address (from Google OAuth)</li>
                                    <li>Profile picture (from Google OAuth)</li>
                                    <li>Account preferences and settings</li>
                                </ul>

                                <h3 className="text-xl font-medium text-white mt-6 mb-3">Content Information</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Details of content you register for protection</li>
                                    <li>URLs and descriptions of your digital products</li>
                                    <li>Keywords used for scanning</li>
                                </ul>

                                <h3 className="text-xl font-medium text-white mt-6 mb-3">Usage Data</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Scan results and detected infringements</li>
                                    <li>DMCA notices generated and sent</li>
                                    <li>Service usage analytics</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>To provide and maintain the Service</li>
                                    <li>To scan for potential infringements of your content</li>
                                    <li>To generate DMCA takedown notices on your behalf</li>
                                    <li>To communicate with you about your account</li>
                                    <li>To improve and optimize our Service</li>
                                    <li>To comply with legal obligations</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
                                <p>We may share your information with:</p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li><strong>Hosting providers</strong> - When sending DMCA notices (your name and contact as the complainant)</li>
                                    <li><strong>Service providers</strong> - Third-party services that help us operate (Stripe for payments, email providers)</li>
                                    <li><strong>Legal requirements</strong> - When required by law or to protect our rights</li>
                                </ul>
                                <p className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-300">
                                    <strong>Note:</strong> DMCA notices legally require including the complainant's contact information.
                                    By using our DMCA tools, you consent to this information being included in notices sent on your behalf.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
                                <p>
                                    We implement appropriate security measures to protect your personal information, including:
                                </p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>Encryption of data in transit (HTTPS/TLS)</li>
                                    <li>Secure database storage</li>
                                    <li>Access controls and authentication</li>
                                    <li>Regular security reviews</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
                                <p>
                                    We retain your information for as long as your account is active or as needed to provide services.
                                    You may request deletion of your account and associated data at any time.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
                                <p>You have the right to:</p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Export your data</li>
                                    <li>Opt out of marketing communications</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies and Tracking</h2>
                                <p>
                                    We use essential cookies for authentication and session management. We may use analytics
                                    tools to understand how users interact with our Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
                                <p>Our Service integrates with:</p>
                                <ul className="list-disc list-inside mt-3 space-y-2">
                                    <li><strong>Google</strong> - For authentication (OAuth)</li>
                                    <li><strong>Stripe</strong> - For payment processing</li>
                                    <li><strong>Google Search</strong> - For infringement scanning</li>
                                </ul>
                                <p className="mt-3">Each service has its own privacy policy governing their data practices.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                                <p>
                                    Our Service is not intended for users under 18 years of age. We do not knowingly collect
                                    information from children.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Policy</h2>
                                <p>
                                    We may update this Privacy Policy periodically. We will notify you of significant changes
                                    via email or through the Service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
                                <p>
                                    For privacy-related questions or to exercise your rights, contact us at privacy@pirateslayer.io
                                </p>
                            </section>

                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-800 flex gap-4">
                        <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
