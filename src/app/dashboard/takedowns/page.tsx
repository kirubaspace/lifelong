import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle, Clock, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function TakedownsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    // Fetch infringements that need takedowns
    const infringements = await prisma.infringement.findMany({
        where: {
            content: { is: { userId: session.user.id } }
        },
        include: {
            content: {
                select: { title: true }
            }
        },
        orderBy: { detectedAt: 'desc' }
    })

    // Group by status
    const pending = infringements.filter(i => i.status === 'detected' || i.status === 'pending')
    const sent = infringements.filter(i => i.status === 'takedown_sent')
    const resolved = infringements.filter(i => i.status === 'resolved')
    const failed = infringements.filter(i => i.status === 'failed')

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'detected':
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-400 border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
            case 'takedown_sent':
                return <Badge className="bg-blue-500/10 text-blue-400 border-0"><Send className="w-3 h-3 mr-1" />Sent</Badge>
            case 'resolved':
                return <Badge className="bg-emerald-500/10 text-emerald-400 border-0"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>
            case 'failed':
                return <Badge className="bg-red-500/10 text-red-400 border-0"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
            default:
                return <Badge className="bg-slate-500/10 text-slate-400 border-0">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Takedown Management</h1>
                <p className="text-slate-400 mt-1">
                    Send DMCA notices and track takedown requests
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-amber-500/10">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{pending.length}</p>
                                <p className="text-sm text-slate-400">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/10">
                                <Send className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{sent.length}</p>
                                <p className="text-sm text-slate-400">Sent</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-emerald-500/10">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{resolved.length}</p>
                                <p className="text-sm text-slate-400">Resolved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/10">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{failed.length}</p>
                                <p className="text-sm text-slate-400">Failed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Infringements List */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">All Infringements</CardTitle>
                    <CardDescription className="text-slate-400">
                        Manage takedown requests for detected piracy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {infringements.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No infringements detected</h3>
                            <p className="text-slate-400">
                                Great news! We haven't found any pirated copies of your content.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {infringements.map((inf) => (
                                <div key={inf.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusBadge(inf.status)}
                                            <span className="text-slate-500 text-sm">
                                                {new Date(inf.detectedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-medium truncate">{inf.title || inf.sourceDomain}</h4>
                                        <p className="text-slate-400 text-sm truncate">{inf.sourceUrl}</p>
                                        <p className="text-slate-500 text-xs mt-1">
                                            Content: {inf.content.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                            asChild
                                        >
                                            <Link href={inf.sourceUrl} target="_blank">
                                                <ExternalLink className="w-4 h-4 mr-1" />
                                                View
                                            </Link>
                                        </Button>
                                        {(inf.status === 'detected' || inf.status === 'pending') && (
                                            <Button
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700"
                                                asChild
                                            >
                                                <Link href={`/dashboard/takedowns/${inf.id}/send`}>
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Send DMCA
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
