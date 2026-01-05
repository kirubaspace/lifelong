import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Shield, AlertTriangle, Activity, Calendar, Search, CheckCircle } from "lucide-react"
import { AnalyticsCharts } from "./analytics-charts"

export default async function AnalyticsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        return null
    }

    // First get user's content IDs for filtering
    const userContentIds = await prisma.protectedContent.findMany({
        where: { userId: session.user.id },
        select: { id: true }
    }).then(content => content.map(c => c.id))

    // Fetch real analytics data
    const [
        totalScans,
        totalInfringements,
        resolvedInfringements,
        protectedContent,
        recentScans,
        infringementsByMonth
    ] = await Promise.all([
        // Total scans
        prisma.scanJob.count({
            where: {
                contentId: { in: userContentIds }
            }
        }),
        // Total infringements
        prisma.infringement.count({
            where: {
                contentId: { in: userContentIds }
            }
        }),
        // Resolved infringements
        prisma.infringement.count({
            where: {
                contentId: { in: userContentIds },
                status: 'removed'
            }
        }),
        // Protected content count
        prisma.protectedContent.count({
            where: { userId: session.user.id }
        }),
        // Recent scans (last 30 days, grouped by day)
        prisma.scanJob.findMany({
            where: {
                contentId: { in: userContentIds },
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { createdAt: 'asc' }
        }),
        // Infringements by month
        prisma.infringement.findMany({
            where: {
                contentId: { in: userContentIds },
                detectedAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { detectedAt: 'asc' }
        })
    ])

    // Calculate takedown rate
    const takedownRate = totalInfringements > 0
        ? Math.round((resolvedInfringements / totalInfringements) * 100)
        : 0

    // Calculate protection score (based on activity)
    const protectionScore = Math.min(100,
        (protectedContent * 20) +
        (totalScans > 0 ? 30 : 0) +
        (takedownRate * 0.5)
    )

    // Process scan data for chart
    const scanChartData = processScansForChart(recentScans)
    const infringementChartData = processInfringementsForChart(infringementsByMonth)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 mt-1">
                    Track your protection metrics and infringement trends
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Scans</CardTitle>
                        <Search className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalScans}</div>
                        <p className="text-xs text-slate-500">All time</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Infringements Found</CardTitle>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalInfringements}</div>
                        <p className="text-xs text-slate-500">
                            {resolvedInfringements} resolved
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Takedown Rate</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{takedownRate}%</div>
                        <p className="text-xs text-slate-500">Success percentage</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Protection Score</CardTitle>
                        <Shield className="w-4 h-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{Math.round(protectionScore)}</div>
                        <p className="text-xs text-slate-500">
                            {protectionScore >= 80 ? "Excellent" : protectionScore >= 50 ? "Good" : "Needs Improvement"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <AnalyticsCharts
                scanData={scanChartData}
                infringementData={infringementChartData}
            />

            {/* Recent Activity */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Quick Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                            <div className="p-2 rounded-full bg-purple-500/10">
                                <Shield className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{protectedContent}</p>
                                <p className="text-sm text-slate-400">Protected Courses</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                            <div className="p-2 rounded-full bg-blue-500/10">
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {recentScans.filter(s =>
                                        new Date(s.createdAt).toDateString() === new Date().toDateString()
                                    ).length}
                                </p>
                                <p className="text-sm text-slate-400">Scans Today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50">
                            <div className="p-2 rounded-full bg-emerald-500/10">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{resolvedInfringements}</p>
                                <p className="text-sm text-slate-400">Takedowns Sent</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper functions to process data for charts
function processScansForChart(scans: any[]) {
    const days: Record<string, number> = {}
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toISOString().split('T')[0]
    })

    last30Days.forEach(day => { days[day] = 0 })
    scans.forEach(scan => {
        const day = new Date(scan.createdAt).toISOString().split('T')[0]
        if (days[day] !== undefined) days[day]++
    })

    return last30Days.map(day => ({
        date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: days[day]
    }))
}

function processInfringementsForChart(infringements: any[]) {
    const months: Record<string, number> = {}
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })

    last6Months.forEach(month => { months[month] = 0 })
    infringements.forEach(inf => {
        const month = new Date(inf.detectedAt).toISOString().slice(0, 7)
        if (months[month] !== undefined) months[month]++
    })

    return last6Months.map(month => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        infringements: months[month]
    }))
}
