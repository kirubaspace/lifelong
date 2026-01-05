/**
 * Torrent Scanner
 * 
 * Searches torrent indexers for pirated content using web scraping.
 * Supports multiple torrent sites with different search patterns.
 */

import { prisma } from "@/lib/db"

// Torrent site configurations
const TORRENT_SITES = [
    {
        name: "1337x",
        searchUrl: "https://1337x.to/search/{query}/1/",
        enabled: true,
    },
    {
        name: "TorrentGalaxy",
        searchUrl: "https://torrentgalaxy.to/torrents.php?search={query}",
        enabled: true,
    },
    {
        name: "YTS",
        searchUrl: "https://yts.mx/api/v2/list_movies.json?query_term={query}",
        isJson: true,
        enabled: true,
    },
    {
        name: "RARBG-proxy",
        searchUrl: "https://rargb.to/search/?search={query}",
        enabled: true,
    },
    {
        name: "LimeTorrents",
        searchUrl: "https://www.limetorrents.lol/search/all/{query}/",
        enabled: true,
    },
    {
        name: "Nyaa",
        searchUrl: "https://nyaa.si/?q={query}",
        enabled: true,
    },
] as const

export interface TorrentResult {
    id: string
    siteName: string
    title: string
    link: string
    seeders?: number
    leechers?: number
    size?: string
    uploadDate?: string
}

/**
 * Search a single torrent site
 */
async function searchTorrentSite(
    site: typeof TORRENT_SITES[number],
    query: string
): Promise<TorrentResult[]> {
    if (!site.enabled) return []

    const encodedQuery = encodeURIComponent(query)
    const url = site.searchUrl.replace("{query}", encodedQuery)
    const results: TorrentResult[] = []

    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "text/html,application/json",
            },
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
            console.warn(`${site.name} returned ${response.status}`)
            return []
        }

        const text = await response.text()

        // Handle JSON API responses (like YTS)
        if ('isJson' in site && site.isJson) {
            try {
                const json = JSON.parse(text)
                if (json.data?.movies) {
                    for (const movie of json.data.movies.slice(0, 10)) {
                        results.push({
                            id: `yts-${movie.id}`,
                            siteName: site.name,
                            title: movie.title_long || movie.title,
                            link: movie.url || `https://yts.mx/movies/${movie.slug}`,
                            seeders: movie.torrents?.[0]?.seeds,
                            leechers: movie.torrents?.[0]?.peers,
                            size: movie.torrents?.[0]?.size,
                        })
                    }
                }
            } catch {
                // JSON parse error - skip
            }
            return results
        }

        // HTML parsing for other sites
        // Look for torrent links with common patterns
        const torrentPatterns = [
            // 1337x style: /torrent/12345/name-here
            /href="(\/torrent\/\d+\/[^"]+)"/g,
            // Generic magnet links
            /href="(magnet:\?xt=urn:btih:[^"]+)"/g,
            // Direct .torrent links
            /href="([^"]+\.torrent[^"]*)"/g,
            // TorrentGalaxy style
            /href="(\/torrent\/[^"]+)"/g,
        ]

        const seenLinks = new Set<string>()

        for (const pattern of torrentPatterns) {
            let match
            while ((match = pattern.exec(text)) !== null) {
                const link = match[1]
                if (seenLinks.has(link)) continue
                seenLinks.add(link)

                // Extract title from link or nearby text
                let title = link.split("/").pop() || query
                title = title.replace(/-/g, " ").replace(/\.\w+$/, "")

                // Build full URL if relative
                let fullLink = link
                if (link.startsWith("/")) {
                    const baseUrl = new URL(url)
                    fullLink = `${baseUrl.origin}${link}`
                }

                results.push({
                    id: `${site.name.toLowerCase()}-${Buffer.from(link).toString("base64").substring(0, 16)}`,
                    siteName: site.name,
                    title: decodeURIComponent(title),
                    link: fullLink,
                })
            }
        }

        // Try to extract seeders/leechers from common patterns
        const statsPattern = /<(?:span|td)[^>]*class="[^"]*(?:seeds?|seeders?)[^"]*"[^>]*>(\d+)/gi
        let statsMatch
        let resultIndex = 0
        while ((statsMatch = statsPattern.exec(text)) !== null && resultIndex < results.length) {
            results[resultIndex].seeders = parseInt(statsMatch[1])
            resultIndex++
        }

    } catch (error) {
        if ((error as Error).name === "AbortError") {
            console.warn(`${site.name} request timed out`)
        } else {
            console.warn(`${site.name} search failed:`, (error as Error).message)
        }
    }

    return results.slice(0, 10) // Limit results per site
}

/**
 * Search all torrent sites for content
 */
export async function searchTorrents(query: string, limit: number = 20): Promise<TorrentResult[]> {
    const allResults: TorrentResult[] = []

    // Search all sites in parallel with error handling
    const searchPromises = TORRENT_SITES.map(site =>
        searchTorrentSite(site, query).catch(err => {
            console.warn(`Error searching ${site.name}:`, err.message)
            return [] as TorrentResult[]
        })
    )

    const siteResults = await Promise.all(searchPromises)

    for (const results of siteResults) {
        allResults.push(...results)
    }

    // Sort by seeders (higher = more popular = higher priority)
    allResults.sort((a, b) => (b.seeders || 0) - (a.seeders || 0))

    return allResults.slice(0, limit)
}

/**
 * Calculate confidence score for torrent results
 */
export function calculateTorrentConfidence(
    result: TorrentResult,
    contentTitle: string,
    keywords: string[]
): number {
    let score = 0
    const lowerTitle = result.title.toLowerCase()
    const lowerContentTitle = contentTitle.toLowerCase()

    // Title match
    if (lowerTitle.includes(lowerContentTitle)) {
        score += 50
    } else {
        // Partial word matching
        const titleWords = lowerContentTitle.split(/\s+/).filter(w => w.length > 3)
        const matchedWords = titleWords.filter(w => lowerTitle.includes(w))
        score += Math.min(40, (matchedWords.length / Math.max(titleWords.length, 1)) * 40)
    }

    // Keyword matches
    for (const keyword of keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
            score += 10
        }
    }

    // Piracy indicators in title
    const piracyIndicators = ["rip", "webrip", "dvdrip", "hdtv", "1080p", "720p", "4k", "x264", "x265", "hevc"]
    for (const indicator of piracyIndicators) {
        if (lowerTitle.includes(indicator)) {
            score += 5
            break
        }
    }

    // High seeders = established piracy
    if (result.seeders && result.seeders > 100) {
        score += 15
    } else if (result.seeders && result.seeders > 10) {
        score += 10
    }

    return Math.min(score, 100)
}

/**
 * Convert torrent result to infringement format
 */
export function convertTorrentToInfringement(result: TorrentResult, contentId: string, confidence: number) {
    return {
        contentId,
        sourceUrl: result.link,
        sourceType: "torrent",
        sourceDomain: result.siteName.toLowerCase(),
        title: `[${result.siteName}] ${result.title}`,
        snippet: result.seeders
            ? `Seeders: ${result.seeders}, Leechers: ${result.leechers || 0}${result.size ? `, Size: ${result.size}` : ""}`
            : `Found on ${result.siteName}`,
        confidence,
        status: "detected",
        detectedAt: new Date(),
    }
}

/**
 * Run torrent scan for content
 */
export async function runTorrentScan(contentId: string): Promise<number> {
    const content = await prisma.protectedContent.findUnique({
        where: { id: contentId },
    })

    if (!content) {
        throw new Error("Content not found")
    }

    // Generate search queries
    const queries = [
        content.title,
        `${content.title} download`,
        `${content.title} ${content.contentType === "pdf" ? "pdf" : "course"}`,
    ]

    // Add keyword-based queries
    if (content.keywords.length > 0) {
        queries.push(`${content.keywords[0]} ${content.title.split(" ")[0]}`)
    }

    const allResults: Array<ReturnType<typeof convertTorrentToInfringement>> = []
    const seenUrls = new Set<string>()

    for (const query of queries) {
        const torrentResults = await searchTorrents(query, 15)

        for (const result of torrentResults) {
            if (seenUrls.has(result.link)) continue
            seenUrls.add(result.link)

            const confidence = calculateTorrentConfidence(result, content.title, content.keywords)

            if (confidence >= 40) {
                allResults.push(convertTorrentToInfringement(result, contentId, confidence))
            }
        }

        // Rate limiting between queries
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Save to database
    let newInfringements = 0

    for (const result of allResults) {
        const existing = await prisma.infringement.findFirst({
            where: { contentId, sourceUrl: result.sourceUrl },
        })

        if (!existing) {
            await prisma.infringement.create({
                data: {
                    contentId: result.contentId,
                    sourceUrl: result.sourceUrl,
                    sourceType: result.sourceType,
                    sourceDomain: result.sourceDomain,
                    title: result.title,
                    snippet: result.snippet,
                    confidence: result.confidence,
                    status: result.status,
                },
            })
            newInfringements++
        }
    }

    return newInfringements
}
