import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle2, Clock, XCircle, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function TakedownsPage() {
    const session = await auth()

    const takedowns = await prisma.dMCANotice.findMany({
        where: { infringement: { content: { userId: session?.user?.id } } },
        include: {
            infringement: {
                include: {
                    content: {
                        select: { title: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
        draft: { label: "Draft", color: "bg-slate-500/10 text-slate-400", icon: <FileText className="w-3 h-3" /> },
        sent: { label: "Sent", color: "bg-blue-500/10 text-blue-400", icon: <Send className="w-3 h-3" /> },
        acknowledged: { label: "Acknowledged", color: "bg-purple-500/10 text-purple-400", icon: <Clock className="w-3 h-3" /> },
        complied: { label: "Removed", color: "bg-emerald-500/10 text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
        disputed: { label: "Disputed", color: "bg-orange-500/10 text-orange-400", icon: <Clock className="w-3 h-3" /> },
        failed: { label: "Failed", color: "bg-red-500/10 text-red-400", icon: <XCircle className="w-3 h-3" /> },
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Takedown History</h1>
                <p className="text-slate-400 mt-1">
                    Track the status of your DMCA takedown notices
                </p>
            </div>

            {/* Takedowns List */}
            {takedowns.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No takedowns yet</h3>
                        <p className="text-slate-400 text-center max-w-sm">
                            When you send DMCA takedown notices, they'll appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {takedowns.map((notice) => {
                        const status = statusConfig[notice.status] || statusConfig.draft

                        return (
                            <Card key={notice.id} className="bg-slate-900 border-slate-800">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge className={status.color}>
                                                    {status.icon}
                                                    <span className="ml-1">{status.label}</span>
                                                </Badge>
                                                <span className="text-slate-500 text-sm">
                                                    To: {notice.recipientName || notice.recipientEmail || "Unknown"}
                                                </span>
                                            </div>

                                            <h3 className="text-white font-medium">
                                                {notice.infringement.content.title}
                                            </h3>
                                            <p className="text-slate-500 text-sm truncate mt-1">
                                                {notice.infringement.sourceUrl}
                                            </p>

                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <span className="text-slate-500">
                                                    {notice.sentAt
                                                        ? `Sent ${formatDistanceToNow(notice.sentAt, { addSuffix: true })}`
                                                        : `Created ${formatDistanceToNow(notice.createdAt, { addSuffix: true })}`
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Link href={notice.infringement.sourceUrl} target="_blank">
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </Button>
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
