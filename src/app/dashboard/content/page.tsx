import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ExternalLink, MoreVertical, Search, AlertTriangle, Video, FileText } from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

export default async function ContentPage() {
    const session = await auth()

    const content = await prisma.protectedContent.findMany({
        where: { userId: session?.user?.id },
        include: {
            _count: {
                select: { infringements: true }
            }
        },
        orderBy: { createdAt: 'desc' },
    }).catch(() => [])

    const platformColors: Record<string, string> = {
        teachable: "bg-orange-500/10 text-orange-400",
        thinkific: "bg-blue-500/10 text-blue-400",
        gumroad: "bg-pink-500/10 text-pink-400",
        custom: "bg-slate-500/10 text-slate-400",
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Protected Content</h1>
                    <p className="text-slate-400 mt-1">
                        Manage your courses and monitor for piracy
                    </p>
                </div>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                    <Link href="/dashboard/content/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Content
                    </Link>
                </Button>
            </div>

            {/* Content Grid */}
            {content.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
                        <p className="text-slate-400 text-center max-w-sm mb-6">
                            Add your first course to start monitoring for unauthorized copies across the web.
                        </p>
                        <Button asChild className="bg-purple-600 hover:bg-purple-700">
                            <Link href="/dashboard/content/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Course
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {content.map((item) => (
                        <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-white truncate">{item.title}</CardTitle>
                                        <CardDescription className="text-slate-400 truncate mt-1">
                                            {item.originalUrl}
                                        </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                                            <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800">
                                                <Link href={`/dashboard/content/${item.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800">
                                                <Link href={`/dashboard/content/${item.id}/edit`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-slate-800">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-4">
                                    {/* Content Type Badge */}
                                    {item.contentType === "pdf" ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-0">
                                            <FileText className="w-3 h-3 mr-1" />
                                            PDF
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-purple-500/10 text-purple-400 border-0">
                                            <Video className="w-3 h-3 mr-1" />
                                            Video
                                        </Badge>
                                    )}
                                    <Badge className={platformColors[item.platformType] || platformColors.custom}>
                                        {item.platformType}
                                    </Badge>
                                    {item._count.infringements > 0 && (
                                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-0">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            {item._count.infringements} found
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">
                                        {item.lastScannedAt
                                            ? `Scanned ${formatDistanceToNow(item.lastScannedAt, { addSuffix: true })}`
                                            : "Never scanned"}
                                    </span>
                                    <Link
                                        href={item.originalUrl}
                                        target="_blank"
                                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Visit
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
