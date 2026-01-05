import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { runScanJob } from "@/services/scanners/google-scanner"

// POST /api/content/[id]/scan - Trigger manual scan
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const { id } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Run the scan
        const newInfringements = await runScanJob(id)

        return NextResponse.json({
            success: true,
            newInfringements,
            message: newInfringements > 0
                ? `Found ${newInfringements} new potential infringement(s)`
                : "Scan completed, no new infringements found"
        })
    } catch (error) {
        console.error("Error running scan:", error)
        return NextResponse.json({ error: "Scan failed" }, { status: 500 })
    }
}
