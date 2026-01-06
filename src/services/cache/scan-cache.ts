/**
 * Scan Cache Service
 * Reduces Google CSE API calls by ~50-70% by caching scan results for 48 hours
 */

import { prisma } from "@/lib/db"
import crypto from "crypto"

// Cache configuration
const CACHE_TTL_HOURS = 48
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000

export interface CachedScanResult {
    sourceUrl: string
    sourceType: string
    sourceDomain: string
    title: string
    snippet: string
    confidence: number
}

/**
 * Generate a cache key from content ID and source type
 */
export function generateCacheKey(contentId: string, sourceType: string): string {
    const data = `${contentId}:${sourceType}`
    return crypto.createHash("sha256").update(data).digest("hex")
}

/**
 * Get cached scan results if available and not expired
 * Returns null if cache miss or expired
 */
export async function getCachedResults(
    contentId: string,
    sourceType: string
): Promise<CachedScanResult[] | null> {
    const cacheKey = generateCacheKey(contentId, sourceType)

    try {
        const cached = await prisma.scanCache.findUnique({
            where: { cacheKey },
        })

        if (!cached) {
            console.log(`[Cache] MISS for ${sourceType} scan on content ${contentId.slice(0, 8)}...`)
            return null
        }

        // Check if expired
        if (new Date() > cached.expiresAt) {
            console.log(`[Cache] EXPIRED for ${sourceType} scan on content ${contentId.slice(0, 8)}...`)
            // Delete expired entry
            await prisma.scanCache.delete({ where: { cacheKey } }).catch(() => { })
            return null
        }

        // Update hit count
        await prisma.scanCache.update({
            where: { cacheKey },
            data: { hitCount: { increment: 1 } },
        })

        console.log(`[Cache] HIT for ${sourceType} scan on content ${contentId.slice(0, 8)}... (${cached.hitCount + 1} hits)`)
        return cached.results as unknown as CachedScanResult[]
    } catch (error) {
        console.error("[Cache] Error reading cache:", error)
        return null
    }
}

/**
 * Store scan results in cache
 */
export async function setCachedResults(
    contentId: string,
    sourceType: string,
    results: CachedScanResult[]
): Promise<void> {
    const cacheKey = generateCacheKey(contentId, sourceType)
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS)

    try {
        await prisma.scanCache.upsert({
            where: { cacheKey },
            create: {
                contentId,
                cacheKey,
                sourceType,
                results: results as any,
                expiresAt,
                hitCount: 0,
            },
            update: {
                results: results as any,
                expiresAt,
                hitCount: 0,
            },
        })

        console.log(`[Cache] STORED ${results.length} ${sourceType} results for content ${contentId.slice(0, 8)}... (expires in ${CACHE_TTL_HOURS}h)`)
    } catch (error) {
        console.error("[Cache] Error storing cache:", error)
    }
}

/**
 * Invalidate cache for a specific content (e.g., when content is updated)
 */
export async function invalidateCache(contentId: string): Promise<number> {
    try {
        const result = await prisma.scanCache.deleteMany({
            where: { contentId },
        })
        console.log(`[Cache] INVALIDATED ${result.count} cache entries for content ${contentId.slice(0, 8)}...`)
        return result.count
    } catch (error) {
        console.error("[Cache] Error invalidating cache:", error)
        return 0
    }
}

/**
 * Cleanup expired cache entries (should be run periodically via cron)
 * Returns the number of entries deleted
 */
export async function cleanupExpiredCache(): Promise<{ deleted: number; remaining: number }> {
    try {
        const now = new Date()

        // Delete expired entries
        const result = await prisma.scanCache.deleteMany({
            where: {
                expiresAt: { lt: now },
            },
        })

        // Count remaining entries
        const remaining = await prisma.scanCache.count()

        console.log(`[Cache Cleanup] Deleted ${result.count} expired entries, ${remaining} remaining`)

        return {
            deleted: result.count,
            remaining,
        }
    } catch (error) {
        console.error("[Cache Cleanup] Error:", error)
        return { deleted: 0, remaining: 0 }
    }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
    totalEntries: number
    totalHits: number
    bySourceType: Record<string, number>
    averageAge: number
}> {
    try {
        const entries = await prisma.scanCache.findMany({
            select: {
                sourceType: true,
                hitCount: true,
                createdAt: true,
            },
        })

        const now = Date.now()
        const bySourceType: Record<string, number> = {}
        let totalHits = 0
        let totalAge = 0

        for (const entry of entries) {
            bySourceType[entry.sourceType] = (bySourceType[entry.sourceType] || 0) + 1
            totalHits += entry.hitCount
            totalAge += now - entry.createdAt.getTime()
        }

        return {
            totalEntries: entries.length,
            totalHits,
            bySourceType,
            averageAge: entries.length > 0 ? totalAge / entries.length / 1000 / 60 / 60 : 0, // hours
        }
    } catch (error) {
        console.error("[Cache Stats] Error:", error)
        return { totalEntries: 0, totalHits: 0, bySourceType: {}, averageAge: 0 }
    }
}
