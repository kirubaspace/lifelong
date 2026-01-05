"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    Shield,
    LayoutDashboard,
    FileText,
    AlertTriangle,
    Send,
    BarChart3,
    Settings,
    CreditCard,
    HelpCircle
} from "lucide-react"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Protected Content", href: "/dashboard/content", icon: FileText },
    { name: "Infringements", href: "/dashboard/infringements", icon: AlertTriangle },
    { name: "Takedowns", href: "/dashboard/takedowns", icon: Send },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
]

const secondaryNavigation = [
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 border-r border-slate-800 px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            PirateSlayer
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                pathname === item.href
                                                    ? "bg-slate-800 text-white"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                                                "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li className="mt-auto">
                            <ul role="list" className="-mx-2 space-y-1">
                                {secondaryNavigation.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                pathname === item.href
                                                    ? "bg-slate-800 text-white"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50",
                                                "group flex gap-x-3 rounded-lg p-3 text-sm font-medium transition-colors"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}
