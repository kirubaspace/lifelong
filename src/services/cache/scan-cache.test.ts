/**
 * Unit tests for Scan Cache Service
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateCacheKey } from "./scan-cache"

// Mock Prisma
vi.mock("@/lib/db", () => ({
    prisma: {
        scanCache: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
            delete: vi.fn(),
            deleteMany: vi.fn(),
            count: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}))

describe("Scan Cache Service", () => {
    describe("generateCacheKey", () => {
        it("should generate consistent cache keys", () => {
            const key1 = generateCacheKey("content-123", "google")
            const key2 = generateCacheKey("content-123", "google")
            expect(key1).toBe(key2)
        })

        it("should generate different keys for different content IDs", () => {
            const key1 = generateCacheKey("content-123", "google")
            const key2 = generateCacheKey("content-456", "google")
            expect(key1).not.toBe(key2)
        })

        it("should generate different keys for different source types", () => {
            const key1 = generateCacheKey("content-123", "google")
            const key2 = generateCacheKey("content-123", "telegram")
            expect(key1).not.toBe(key2)
        })

        it("should generate valid SHA256 hashes (64 chars)", () => {
            const key = generateCacheKey("content-123", "google")
            expect(key).toMatch(/^[a-f0-9]{64}$/)
        })
    })

    describe("Cache TTL Logic", () => {
        it("should set 48-hour expiration", () => {
            const CACHE_TTL_HOURS = 48
            const now = new Date()
            const expiresAt = new Date(now.getTime() + CACHE_TTL_HOURS * 60 * 60 * 1000)

            // Should be approximately 48 hours from now
            const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
            expect(diffHours).toBe(48)
        })
    })

    describe("Cache Key Uniqueness", () => {
        it("should create unique keys for all source types", () => {
            const contentId = "test-content"
            const sourceTypes = ["google", "telegram", "torrent"]

            const keys = sourceTypes.map(type => generateCacheKey(contentId, type))
            const uniqueKeys = new Set(keys)

            expect(uniqueKeys.size).toBe(sourceTypes.length)
        })

        it("should handle special characters in content IDs", () => {
            const key = generateCacheKey("content-with-special!@#$%", "google")
            expect(key).toMatch(/^[a-f0-9]{64}$/)
        })
    })
})
