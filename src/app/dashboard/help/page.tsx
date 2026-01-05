import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, MessageCircle, FileText, ExternalLink, Mail } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Help & Support</h1>
                <p className="text-slate-400 mt-1">
                    Get help with PirateSlayer
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Documentation
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Learn how to use PirateSlayer effectively
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Docs
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-emerald-400" />
                            Live Chat
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Chat with our support team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                            Start Chat
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-400" />
                            Email Support
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Send us an email for complex issues
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800" asChild>
                            <Link href="mailto:support@pirateslayer.com">
                                Contact Support
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-amber-400" />
                            FAQ
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Common questions answered
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                            View FAQ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Quick FAQ */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-white font-medium">How does PirateSlayer detect pirated content?</h3>
                        <p className="text-slate-400 text-sm">
                            We use advanced search algorithms to scan Google, Telegram, and known piracy platforms
                            for unauthorized copies of your content based on titles, keywords, and file signatures.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-white font-medium">What happens when an infringement is found?</h3>
                        <p className="text-slate-400 text-sm">
                            You'll receive an email notification with details. You can then send a DMCA takedown
                            notice with one click from your dashboard.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-white font-medium">How often does scanning occur?</h3>
                        <p className="text-slate-400 text-sm">
                            You can choose manual scanning or set up automatic daily/weekly scans for each
                            protected content item.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
