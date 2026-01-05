import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { sendTestEmail } from "@/services/email/email-service"

// POST /api/email/test - Send test email
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const result = await sendTestEmail(session.user.email)

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `Test email sent to ${session.user.email}`,
                id: result.id
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || "Failed to send email"
            }, { status: 500 })
        }
    } catch (error) {
        console.error("Error sending test email:", error)
        return NextResponse.json({ error: "Failed to send test email" }, { status: 500 })
    }
}
