import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AlertTriangle,
    ExternalLink,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    Shield
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function InfringementsPage() {
    const session = await auth()

    const infringements = await prisma.infringement.findMany({
        where: { content: { userId: session?.user?.id } },
        include: {
            content: {
                select: { title: true }
            },
            dmcaNotices: {
                select: { id: true, status: true }
            }
        },
        orderBy: { detectedAt: 'desc' },
    }).catch(() => [])

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        detected: { label: "New", color: "bg-amber-500/10 text-amber-400", icon: <AlertTriangle className="w-3 h-3" /> },
        reviewing: { label: "Reviewing", color: "bg-blue-500/10 text-blue-400", icon: <Eye className="w-3 h-3" /> },
        takedown_sent: { label: "Takedown Sent", color: "bg-purple-500/10 text-purple-400", icon: <Send className="w-3 h-3" /> },
        removed: { label: "Removed", color: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
        disputed: { label: "Disputed", color: "bg-orange-500/10 text-orange-400", icon: <Clock className="w-3 h-3" /> },
        dismissed: { label: "Dismissed", color: "bg-slate-500/10 text-slate-400", icon: <XCircle className="w-3 h-3" /> },
        failed: { label: "Failed", color: "bg-red-500/10 text-red-400", icon: <XCircle className="w-3 h-3" /> },
    }

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return "text-red-400"
        if (confidence >= 60) return "text-amber-400"
        return "text-slate-400"
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Infringements</h1>
                    <p className="text-slate-400 mt-1">
                        Detected unauthorized copies of your content
                    </p>
                </div>
            </div>

            {/* Infringements List */}
            {infringements.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">All clear!</h3>
                        <p className="text-slate-400 text-center max-w-sm">
                            No unauthorized copies of your content have been detected yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {infringements.map((item) => {
                        const status = statusConfig[item.status] || statusConfig.detected

                        return (
                            <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Title & Source */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 rounded-lg bg-red-500/10">
                                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-medium truncate">
                                                        {item.title || item.sourceUrl}
                                                    </h3>
                                                    <p className="text-slate-500 text-sm truncate">
                                                        Found on: {item.sourceDomain}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                <Badge className={status.color}>
                                                    {status.icon}
                                                    <span className="ml-1">{status.label}</span>
                                                </Badge>
                                                <span className={`font-medium ${getConfidenceColor(item.confidence)}`}>
                                                    {item.confidence}% match
                                                </span>
                                                <span className="text-slate-500">
                                                    From: {item.content.title}
                                                </span>
                                                <span className="text-slate-600">•</span>
                                                <span className="text-slate-500">
                                                    {formatDistanceToNow(item.detectedAt, { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Snippet */}
                                            {item.snippet && (
                                                <p className="text-slate-400 text-sm mt-3 line-clamp-2">
                                                    {item.snippet}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Link href={item.sourceUrl} target="_blank">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>

                                            {item.status === "detected" && (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    className="bg-purple-600 hover:bg-purple-700"
                                                >
                                                    <Link href={`/dashboard/infringements/${item.id}/takedown`}>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Send Takedown
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
