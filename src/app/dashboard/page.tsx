import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Shield,
    AlertTriangle,
    Send,
    TrendingUp,
    Plus,
    ArrowUpRight,
    FileText,
    CheckCircle2,
    Clock
} from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth()

    // Fetch stats (with fallbacks for empty database)
    const [contentCount, infringementStats, takedownStats] = await Promise.all([
        prisma.protectedContent.count({
            where: { userId: session?.user?.id, isActive: true },
        }).catch(() => 0),
        prisma.infringement.groupBy({
            by: ['status'],
            where: { content: { userId: session?.user?.id } },
            _count: true,
        }).catch(() => []),
        prisma.dMCANotice.groupBy({
            by: ['status'],
            where: { infringement: { content: { userId: session?.user?.id } } },
            _count: true,
        }).catch(() => []),
    ])

    const totalInfringements = Array.isArray(infringementStats)
        ? infringementStats.reduce((acc, s) => acc + s._count, 0)
        : 0
    const newInfringements = Array.isArray(infringementStats)
        ? infringementStats.find(s => s.status === 'detected')?._count || 0
        : 0
    const totalTakedowns = Array.isArray(takedownStats)
        ? takedownStats.reduce((acc, s) => acc + s._count, 0)
        : 0
    const successfulTakedowns = Array.isArray(takedownStats)
        ? takedownStats.find(s => s.status === 'complied')?._count || 0
        : 0

    const stats = [
        {
            name: "Protected Courses",
            value: contentCount.toString(),
            icon: Shield,
            color: "text-purple-400",
            bgColor: "bg-purple-500/10",
            href: "/dashboard/content",
        },
        {
            name: "Infringements Found",
            value: totalInfringements.toString(),
            icon: AlertTriangle,
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            change: newInfringements > 0 ? `+${newInfringements} new` : undefined,
            href: "/dashboard/infringements",
        },
        {
            name: "Takedowns Sent",
            value: totalTakedowns.toString(),
            icon: Send,
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            href: "/dashboard/takedowns",
        },
        {
            name: "Success Rate",
            value: totalTakedowns > 0
                ? `${Math.round((successfulTakedowns / totalTakedowns) * 100)}%`
                : "—",
            icon: TrendingUp,
            color: "text-emerald-400",
            bgColor: "bg-emerald-500/10",
            href: "/dashboard/analytics",
        },
    ]

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Here's what's happening with your protected content.
                    </p>
                </div>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/dashboard/content/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.name}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                {stat.change && (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-0">
                                        {stat.change}
                                    </Badge>
                                )}
                            </div>
                            <Link
                                href={stat.href}
                                className="text-xs text-slate-500 hover:text-purple-400 flex items-center mt-2 transition-colors"
                            >
                                View details
                                <ArrowUpRight className="w-3 h-3 ml-1" />
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick Actions */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                        <CardDescription className="text-slate-400">
                            Common tasks to protect your content
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button asChild variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <Link href="/dashboard/content/new">
                                <FileText className="w-4 h-4 mr-3 text-purple-400" />
                                Add new course to protect
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <Link href="/dashboard/infringements">
                                <AlertTriangle className="w-4 h-4 mr-3 text-amber-400" />
                                Review detected infringements
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <Link href="/dashboard/takedowns">
                                <Send className="w-4 h-4 mr-3 text-blue-400" />
                                View takedown status
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-slate-400">
                            Latest updates on your protected content
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {totalInfringements === 0 && contentCount === 0 ? (
                            <div className="text-center py-8">
                                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">No activity yet</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Add your first course to start protecting it
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white">System Active</p>
                                        <p className="text-xs text-slate-500">Monitoring {contentCount} courses</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white">Next Scan</p>
                                        <p className="text-xs text-slate-500">Scheduled in 6 hours</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
