"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
    user: {
        name?: string | null
        email?: string | null
        image?: string | null
        plan?: string
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"

    const planColors: Record<string, string> = {
        free: "bg-slate-500",
        starter: "bg-blue-500",
        pro: "bg-purple-500",
        enterprise: "bg-amber-500",
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-6">
            <div className="flex flex-1 gap-x-4 justify-end">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Bell className="h-5 w-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-white">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                                <AvatarFallback className="bg-purple-500 text-white text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">{user.name}</span>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${planColors[user.plan || "free"]} text-white border-0`}
                                >
                                    {(user.plan || "free").charAt(0).toUpperCase() + (user.plan || "free").slice(1)}
                                </Badge>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                        <DropdownMenuLabel className="text-slate-400">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium text-white">{user.name}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800">
                            <Link href="/dashboard/settings">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800">
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-red-400 focus:text-red-300 focus:bg-slate-800"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
