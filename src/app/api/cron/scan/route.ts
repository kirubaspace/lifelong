
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { runScanJob } from "@/services/scanners/google-scanner"

export const maxDuration = 60 // Allow longer timeout for cron jobs

// GET /api/cron/scan - Trigger scheduled scans
export async function GET(request: NextRequest) {
    // Basic security check
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Find content due for scanning
        const dueContent = await prisma.protectedContent.findMany({
            where: {
                scanFrequency: { in: ["DAILY", "WEEKLY"] },
                isActive: true,
                OR: [
                    { nextScanAt: { lte: new Date() } },
                    { nextScanAt: null }
                ]
            },
            take: 10 // Limit batch size
        })

        console.log(`Found ${dueContent.length} items due for scanning`)

        const results = []

        for (const content of dueContent) {
            try {
                // Run the scan
                const infringements = await runScanJob(content.id)

                // Calculate next scan date
                const now = new Date()
                let nextScan = new Date(now)

                if (content.scanFrequency === "DAILY") {
                    nextScan.setDate(now.getDate() + 1)
                } else if (content.scanFrequency === "WEEKLY") {
                    nextScan.setDate(now.getDate() + 7)
                }

                // Update next scan time
                await prisma.protectedContent.update({
                    where: { id: content.id },
                    data: { nextScanAt: nextScan }
                })

                results.push({
                    id: content.id,
                    title: content.title,
                    status: "scanned",
                    found: infringements
                })

            } catch (error) {
                console.error(`Failed to scan content ${content.id}:`, error)
                results.push({
                    id: content.id,
                    title: content.title,
                    status: "failed",
                    error: error instanceof Error ? error.message : "Unknown error"
                })
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        })

    } catch (error) {
        console.error("Cron job error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
