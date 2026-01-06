/**
 * Cron job endpoint for cache cleanup
 * Should be called periodically (e.g., every 6 hours) to remove expired cache entries
 * 
 * Can be triggered via Vercel Cron or external service like cron-job.org
 */

import { NextResponse } from "next/server"
import { cleanupExpiredCache, getCacheStats } from "@/services/cache/scan-cache"

// Protect with a secret key
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
    // Verify authorization
    const authHeader = request.headers.get("authorization")

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        console.log("[Cron] Starting cache cleanup...")

        // Get stats before cleanup
        const statsBefore = await getCacheStats()

        // Run cleanup
        const result = await cleanupExpiredCache()

        // Get stats after cleanup
        const statsAfter = await getCacheStats()

        console.log(`[Cron] Cache cleanup complete: ${result.deleted} deleted, ${result.remaining} remaining`)

        return NextResponse.json({
            success: true,
            message: "Cache cleanup completed",
            cleanup: {
                deleted: result.deleted,
                remaining: result.remaining,
            },
            stats: {
                before: statsBefore,
                after: statsAfter,
            },
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("[Cron] Cache cleanup failed:", error)
        return NextResponse.json(
            { error: "Cache cleanup failed", details: String(error) },
            { status: 500 }
        )
    }
}
