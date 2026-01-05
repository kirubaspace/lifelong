"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    ExternalLink,
    Loader2,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    Video,
    FileText,
    RefreshCw
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ContentDetails {
    id: string
    title: string
    originalUrl: string
    description?: string
    platformType: string
    contentType: string
    keywords: string[]
    isActive: boolean
    lastScannedAt?: string
    scanCount: number
    createdAt: string
    infringements: Array<{
        id: string
        sourceUrl: string
        sourceType: string
        confidence: number
        status: string
        detectedAt: string
    }>
    _count: {
        infringements: number
    }
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [content, setContent] = useState<ContentDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState<string | null>(null)
    const [contentId, setContentId] = useState<string | null>(null)

    useEffect(() => {
        params.then(p => setContentId(p.id))
    }, [params])

    useEffect(() => {
        if (contentId) {
            fetchContent()
        }
    }, [contentId])

    const fetchContent = async () => {
        try {
            const response = await fetch(`/api/content/${contentId}`)
            if (!response.ok) {
                router.push("/dashboard/content")
                return
            }
            const data = await response.json()
            setContent(data)
        } catch (error) {
            console.error("Error fetching content:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleScan = async () => {
        if (!contentId) return
        setIsScanning(true)
        setScanResult(null)
        try {
            const response = await fetch(`/api/content/${contentId}/scan`, {
                method: "POST",
            })
            const data = await response.json()
            if (response.ok) {
                setScanResult(`Found ${data.newInfringements || 0} potential infringements`)
                fetchContent() // Refresh data
            } else {
                setScanResult(data.error || "Scan failed")
            }
        } catch (error) {
            console.error("Error scanning:", error)
            setScanResult("Scan failed - please try again")
        } finally {
            setIsScanning(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
        )
    }

    if (!content) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl text-white">Content not found</h2>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/content">Back to Content</Link>
                </Button>
            </div>
        )
    }

    const statusColors: Record<string, string> = {
        detected: "bg-yellow-500/10 text-yellow-400",
        reviewing: "bg-blue-500/10 text-blue-400",
        takedown_sent: "bg-orange-500/10 text-orange-400",
        resolved: "bg-green-500/10 text-green-400",
        false_positive: "bg-slate-500/10 text-slate-400",
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Link href="/dashboard/content">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
                        <Badge className={content.contentType === "video"
                            ? "bg-purple-500/10 text-purple-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }>
                            {content.contentType === "video" ? <Video className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                            {content.contentType}
                        </Badge>
                    </div>
                    <a
                        href={content.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-purple-400 flex items-center gap-1 mt-1"
                    >
                        {content.originalUrl}
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <Button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isScanning ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4 mr-2" />
                            Scan Now
                        </>
                    )}
                </Button>
            </div>

            {/* Scan Result */}
            {scanResult && (
                <Card className={`border ${scanResult.includes("Found 0")
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"}`}
                >
                    <CardContent className="py-4 flex items-center gap-3">
                        {scanResult.includes("Found 0") ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className="text-white">{scanResult}</span>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">{content._count.infringements}</div>
                        <div className="text-slate-400 text-sm">Infringements Found</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">{content.scanCount}</div>
                        <div className="text-slate-400 text-sm">Total Scans</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">{content.keywords.length}</div>
                        <div className="text-slate-400 text-sm">Keywords</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="pt-6">
                        <div className="text-sm text-white">
                            {content.lastScannedAt
                                ? formatDistanceToNow(new Date(content.lastScannedAt), { addSuffix: true })
                                : "Never"}
                        </div>
                        <div className="text-slate-400 text-sm">Last Scanned</div>
                    </CardContent>
                </Card>
            </div>

            {/* Keywords */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Search Keywords</CardTitle>
                    <CardDescription className="text-slate-400">
                        Keywords used to find pirated copies
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {content.keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-400">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Infringements */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Detected Infringements</CardTitle>
                    <CardDescription className="text-slate-400">
                        Potential piracy matches found for this content
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {content.infringements.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No infringements detected yet</p>
                            <p className="text-sm mt-1">Click "Scan Now" to search for pirated copies</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {content.infringements.map((inf) => (
                                <div key={inf.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={inf.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white hover:text-purple-400 truncate block"
                                            >
                                                {inf.sourceUrl}
                                            </a>
                                            <div className="flex items-center gap-3 mt-2">
                                                <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                                                    {inf.sourceType}
                                                </Badge>
                                                <span className="text-sm text-slate-400">
                                                    {Math.round(inf.confidence)}% confidence
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {formatDistanceToNow(new Date(inf.detectedAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge className={statusColors[inf.status] || statusColors.detected}>
                                            {inf.status.replace("_", " ")}
                                        </Badge>
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
