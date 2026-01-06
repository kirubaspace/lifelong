/**
 * Google Custom Search Scanner
 * 
 * Scans Google Search results for potential pirated copies of protected content
 */

import { prisma } from "@/lib/db"
import { getCachedResults, setCachedResults, CachedScanResult } from "@/services/cache/scan-cache"

const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID

// Known piracy-related domains and keywords
const PIRACY_DOMAINS = [
    "courseclub",
    "freecoursesite",
    "getfreecourses",
    "tutorialbar",
    "desirecourse",
    "myfreecourses",
    "paidcoursesfree",
    "udemy24",
    "freetutorials",
    "downloadly",
    "1337x",
    "thepiratebay",
    "torrentgalaxy",
    "mega.nz",
    "drive.google.com",
    "t.me",
    "telegram",
]

// Video-specific piracy domains
const VIDEO_PIRACY_DOMAINS = [
    "yts",
    "rarbg",
    "rutracker",
    "nyaa",
    "kickass",
    "katcr",
    "btdig",
    "limetorrents",
    "eztv",
    "seedpeer",
    "gload",
    "fmovies",
    "123movies",
    "putlocker",
]

// PDF-specific piracy domains
const PDF_PIRACY_DOMAINS = [
    "libgen",
    "lib.gen",
    "sci-hub",
    "z-lib",
    "zlibrary",
    "pdfdrive",
    "pdfsearchengine",
    "ebookee",
    "ebook3000",
    "bookzz",
    "b-ok",
    "booksc",
    "scribd", // Often has unauthorized uploads
    "slideshare",
    "issuu",
    "calameo",
]

const FREE_KEYWORDS = [
    "free download",
    "free course",
    "torrent",
    "mega link",
    "google drive",
    "telegram",
    "crack",
    "pirated",
    "nulled",
]

// Video-specific keywords
const VIDEO_KEYWORDS = [
    "mp4 download",
    "mkv download",
    "full course download",
    "video leak",
    "course rip",
    "hdtv",
    "webrip",
    "720p",
    "1080p",
    "4k download",
    "course videos free",
]

// PDF-specific keywords
const PDF_KEYWORDS = [
    "pdf free download",
    "pdf leak",
    "ebook free",
    "epub download",
    "pdf torrent",
    "workbook free",
    "guide pdf",
    "cheatsheet free",
    "slides download",
    "course materials free",
]

interface SearchResult {
    title: string
    link: string
    snippet: string
    displayLink: string
}

interface GoogleSearchResponse {
    items?: SearchResult[]
    searchInformation?: {
        totalResults: string
    }
}

// OPTIMIZED: Smart combined queries using OR operators
// Reduces from 17 queries to 3 per scan = 6x API cost reduction

/**
 * Generate optimized search queries for a content item
 * Uses Google's OR operator to combine multiple patterns into fewer API calls
 */
function generateOptimizedQueries(title: string, keywords: string[], contentType: string): string[] {
    const queries: string[] = []

    // Query 1: Primary piracy sources (combines 5 old queries into 1)
    queries.push(`"${title}" (free download OR torrent OR mega.nz OR telegram channel OR google drive free)`)

    // Query 2: Content-type specific piracy patterns
    if (contentType === "video") {
        queries.push(`"${title}" (course rip OR udemy free OR video torrent OR mp4 download OR full course)`)
    } else if (contentType === "pdf") {
        queries.push(`"${title}" (pdf free OR ebook download OR libgen OR epub OR course materials)`)
    } else {
        queries.push(`"${title}" (course free OR download link OR leaked OR shared)`)
    }

    // Query 3: Keyword-based search (only if keywords exist)
    if (keywords.length > 0) {
        const primaryKeyword = keywords[0]
        if (contentType === "pdf") {
            queries.push(`"${primaryKeyword}" (pdf free download OR ebook OR course pdf)`)
        } else {
            queries.push(`"${primaryKeyword}" (free download OR course video OR tutorial free)`)
        }
    }

    return queries
}

/**
 * Search Google Custom Search for potential infringements
 */
async function searchGoogle(query: string): Promise<SearchResult[]> {
    if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
        console.warn("Google CSE API not configured")
        return []
    }

    const url = new URL("https://www.googleapis.com/customsearch/v1")
    url.searchParams.set("key", GOOGLE_CSE_API_KEY)
    url.searchParams.set("cx", GOOGLE_CSE_ID)
    url.searchParams.set("q", query)
    url.searchParams.set("num", "10")

    try {
        const response = await fetch(url.toString())

        if (!response.ok) {
            console.error("Google CSE API error:", response.status)
            return []
        }

        const data: GoogleSearchResponse = await response.json()
        return data.items || []
    } catch (error) {
        console.error("Error searching Google:", error)
        return []
    }
}

/**
 * Calculate confidence score for a potential infringement
 * Now content-type aware for video and PDF specific detection
 */
export function calculateConfidence(
    result: SearchResult,
    contentTitle: string,
    contentKeywords: string[],
    contentType: string = "video"
): number {
    let score = 0
    const lowerTitle = result.title.toLowerCase()
    const lowerSnippet = result.snippet.toLowerCase()
    const lowerContentTitle = contentTitle.toLowerCase()
    const domain = result.displayLink.toLowerCase()
    const lowerUrl = result.link.toLowerCase()

    // Title similarity (fuzzy match)
    if (lowerTitle.includes(lowerContentTitle)) {
        score += 40
    } else {
        // Partial match - check for significant words
        const titleWords = lowerContentTitle.split(" ").filter(w => w.length > 3)
        const matchedWords = titleWords.filter(w => lowerTitle.includes(w) || lowerSnippet.includes(w))
        score += Math.min(30, (matchedWords.length / titleWords.length) * 30)
    }

    // Keyword matches
    for (const keyword of contentKeywords) {
        if (lowerTitle.includes(keyword.toLowerCase()) || lowerSnippet.includes(keyword.toLowerCase())) {
            score += 5
        }
    }

    // "Free download" indicators
    for (const freeKeyword of FREE_KEYWORDS) {
        if (lowerTitle.includes(freeKeyword) || lowerSnippet.includes(freeKeyword)) {
            score += 10
            break
        }
    }

    // Known piracy domain (general)
    for (const piracyDomain of PIRACY_DOMAINS) {
        if (domain.includes(piracyDomain)) {
            score += 25
            break
        }
    }

    // Content-type specific scoring
    if (contentType === "video") {
        // Check video-specific piracy domains
        for (const videoDomain of VIDEO_PIRACY_DOMAINS) {
            if (domain.includes(videoDomain)) {
                score += 20
                break
            }
        }
        // Check video-specific keywords
        for (const videoKeyword of VIDEO_KEYWORDS) {
            if (lowerTitle.includes(videoKeyword) || lowerSnippet.includes(videoKeyword)) {
                score += 8
                break
            }
        }
        // Check for video file extensions in URL
        if (lowerUrl.includes(".mp4") || lowerUrl.includes(".mkv") || lowerUrl.includes(".avi") || lowerUrl.includes(".mov")) {
            score += 15
        }
    } else if (contentType === "pdf") {
        // Check PDF-specific piracy domains
        for (const pdfDomain of PDF_PIRACY_DOMAINS) {
            if (domain.includes(pdfDomain)) {
                score += 20
                break
            }
        }
        // Check PDF-specific keywords
        for (const pdfKeyword of PDF_KEYWORDS) {
            if (lowerTitle.includes(pdfKeyword) || lowerSnippet.includes(pdfKeyword)) {
                score += 8
                break
            }
        }
        // Check for document file extensions in URL
        if (lowerUrl.includes(".pdf") || lowerUrl.includes(".epub") || lowerUrl.includes(".mobi")) {
            score += 15
        }
    }

    return Math.min(score, 100)
}

export interface ScanResult {
    sourceUrl: string
    sourceType: "google"
    sourceDomain: string
    title: string
    snippet: string
    confidence: number
}

/**
 * Scan a single protected content item using Google CSE
 * Now with caching to reduce API calls by 50-70%
 */
export async function scanContent(contentId: string): Promise<ScanResult[]> {
    // Check cache first
    const cachedResults = await getCachedResults(contentId, "google")
    if (cachedResults) {
        return cachedResults as ScanResult[]
    }

    const content = await prisma.protectedContent.findUnique({
        where: { id: contentId },
    })

    if (!content) {
        throw new Error("Content not found")
    }

    const results: ScanResult[] = []
    const seenUrls = new Set<string>()
    const contentType = content.contentType || "video"

    // OPTIMIZED: Use smart combined queries (3 instead of 17)
    const queries = generateOptimizedQueries(content.title, content.keywords, contentType)

    // Execute searches (with rate limiting)
    for (const query of queries) {
        const searchResults = await searchGoogle(query)

        for (const result of searchResults) {
            // Skip duplicates
            if (seenUrls.has(result.link)) continue
            seenUrls.add(result.link)

            // Skip the original URL
            if (result.link.includes(new URL(content.originalUrl).hostname)) continue

            const confidence = calculateConfidence(result, content.title, content.keywords, contentType)

            // Only include results above threshold
            if (confidence >= 40) {
                results.push({
                    sourceUrl: result.link,
                    sourceType: "google",
                    sourceDomain: result.displayLink,
                    title: result.title,
                    snippet: result.snippet,
                    confidence,
                })
            }
        }

        // Rate limiting - wait between queries
        await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence)

    const finalResults = results.slice(0, 20) // Limit to top 20 results

    // Store in cache for future requests
    await setCachedResults(contentId, "google", finalResults)

    return finalResults
}

/**
 * Run a full scan and save results to database
 */
import { searchTelegram, convertToInfringement } from "./telegram-scanner"
import { runTorrentScan } from "./torrent-scanner"

/**
 * Run a full scan (Google + Telegram + Torrent) and save results to database
 * Hybrid Model: Free tier uses Telegram + Torrent only; Paid tiers get Google CSE
 */
export async function runScanJob(contentId: string): Promise<number> {
    const scanJob = await prisma.scanJob.create({
        data: {
            contentId,
            scanType: "full",
            status: "running",
            startedAt: new Date(),
        },
    })

    try {
        // Get content and user to check plan
        const content = await prisma.protectedContent.findUnique({
            where: { id: contentId },
            include: {
                user: {
                    include: {
                        subscription: true
                    }
                }
            }
        })

        if (!content) {
            throw new Error("Content not found")
        }

        // Check user's plan for Google CSE access
        // Free tier = no active subscription, Paid = has active subscription
        const hasActiveSubscription = content.user?.subscription?.status === "active"
        const useGoogleCSE = hasActiveSubscription // Only paid plans get Google CSE

        let googleResults: ScanResult[] = []
        let telegramResults: any[] = []
        let torrentInfringements = 0

        // Run Google Scan (only for paid users)
        if (useGoogleCSE) {
            console.log(`[Scan] Starting Google scan for content: ${contentId} (Paid user)`)
            googleResults = await scanContent(contentId)
            console.log(`[Scan] Google found ${googleResults.length} results`)
        } else {
            console.log(`[Scan] Skipping Google CSE for free plan user - using Telegram + Torrent only`)
        }

        if (content) {
            // Run Telegram Scan
            try {
                console.log(`[Scan] Starting Telegram scan for: ${content.title}`)
                const tgRawResults = await searchTelegram(content.title)
                telegramResults = tgRawResults.map(r => convertToInfringement(r, contentId))
                console.log(`[Scan] Telegram found ${telegramResults.length} results`)
            } catch (err) {
                console.error("[Scan] Telegram scan failed:", err)
                // Continue even if Telegram fails
            }

            // Run Torrent Scan
            try {
                console.log(`[Scan] Starting Torrent scan for: ${content.title}`)
                torrentInfringements = await runTorrentScan(contentId)
                console.log(`[Scan] Torrent scan found ${torrentInfringements} new infringements`)
            } catch (err) {
                console.error("[Scan] Torrent scan failed:", err)
                // Continue even if Torrent scan fails
            }
        }

        // Save infringements to database
        let newInfringements = torrentInfringements // Torrent already saved to DB

        // Process Google Results
        for (const result of googleResults) {
            const existing = await prisma.infringement.findFirst({
                where: { contentId, sourceUrl: result.sourceUrl },
            })

            if (!existing) {
                await prisma.infringement.create({
                    data: {
                        contentId,
                        sourceUrl: result.sourceUrl,
                        sourceType: result.sourceType,
                        sourceDomain: result.sourceDomain,
                        title: result.title,
                        snippet: result.snippet,
                        confidence: result.confidence,
                        status: "detected",
                    },
                })
                newInfringements++
            }
        }

        // Process Telegram Results
        for (const result of telegramResults) {
            const existing = await prisma.infringement.findFirst({
                where: { contentId, sourceUrl: result.sourceUrl },
            })

            if (!existing) {
                await prisma.infringement.create({
                    data: {
                        contentId,
                        sourceUrl: result.sourceUrl,
                        sourceType: result.sourceType,
                        sourceDomain: result.sourceDomain,
                        title: result.title,
                        snippet: result.snippet,
                        confidence: result.confidence,
                        status: "detected",
                    },
                })
                newInfringements++
            }
        }

        // Update scan job
        await prisma.scanJob.update({
            where: { id: scanJob.id },
            data: {
                status: "completed",
                completedAt: new Date(),
                resultsCount: googleResults.length + telegramResults.length + torrentInfringements,
                infringementsFound: newInfringements,
            },
        })

        // Update content last scanned
        await prisma.protectedContent.update({
            where: { id: contentId },
            data: {
                lastScannedAt: new Date(),
                scanCount: { increment: 1 },
            },
        })

        console.log(`[Scan] Completed! Total new infringements: ${newInfringements}`)
        return newInfringements
    } catch (error) {
        // Update scan job with error
        await prisma.scanJob.update({
            where: { id: scanJob.id },
            data: {
                status: "failed",
                completedAt: new Date(),
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            },
        })

        throw error
    }
}

