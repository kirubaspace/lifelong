import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <DashboardSidebar />
            <div className="lg:pl-72">
                <DashboardHeader user={session.user} />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
