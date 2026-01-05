
import { describe, it, expect } from 'vitest'
import { calculateTorrentConfidence, convertTorrentToInfringement, TorrentResult } from './torrent-scanner'

describe('Torrent Scanner', () => {
    describe('calculateTorrentConfidence', () => {
        it('should give high score for exact title match', () => {
            const result: TorrentResult = {
                id: 'test-1',
                siteName: '1337x',
                title: 'React Masterclass 2024 Full Course',
                link: 'https://example.com/torrent/123',
                seeders: 50,
            }
            const score = calculateTorrentConfidence(result, 'React Masterclass 2024', [])
            expect(score).toBeGreaterThanOrEqual(50)
        })

        it('should boost score for keyword matches', () => {
            const result: TorrentResult = {
                id: 'test-2',
                siteName: 'YTS',
                title: 'Some Video about React and Hooks',
                link: 'https://example.com/torrent/456',
            }
            const scoreWithKeywords = calculateTorrentConfidence(result, 'Random Title', ['react', 'hooks'])
            const scoreWithoutKeywords = calculateTorrentConfidence(result, 'Random Title', [])
            expect(scoreWithKeywords).toBeGreaterThan(scoreWithoutKeywords)
        })

        it('should boost score for piracy indicators like 1080p', () => {
            const result: TorrentResult = {
                id: 'test-3',
                siteName: 'TPB',
                title: 'Course Name 1080p WEBRip x264',
                link: 'https://example.com/torrent/789',
            }
            const score = calculateTorrentConfidence(result, 'Course Name', [])
            expect(score).toBeGreaterThanOrEqual(55) // 50 for title + 5 for piracy indicator
        })

        it('should boost score for high seeders', () => {
            const resultHighSeeders: TorrentResult = {
                id: 'test-4a',
                siteName: '1337x',
                title: 'Test Course',
                link: 'https://example.com/a',
                seeders: 200,
            }
            const resultLowSeeders: TorrentResult = {
                id: 'test-4b',
                siteName: '1337x',
                title: 'Test Course',
                link: 'https://example.com/b',
                seeders: 5,
            }
            const scoreHigh = calculateTorrentConfidence(resultHighSeeders, 'Test Course', [])
            const scoreLow = calculateTorrentConfidence(resultLowSeeders, 'Test Course', [])
            expect(scoreHigh).toBeGreaterThan(scoreLow)
        })
    })

    describe('convertTorrentToInfringement', () => {
        it('should convert torrent result to infringement format', () => {
            const result: TorrentResult = {
                id: 'test-convert',
                siteName: '1337x',
                title: 'My Course Download',
                link: 'https://1337x.to/torrent/123/mycourse',
                seeders: 100,
                leechers: 50,
                size: '2.5GB',
            }
            const infringement = convertTorrentToInfringement(result, 'content-123', 85)

            expect(infringement.contentId).toBe('content-123')
            expect(infringement.sourceUrl).toBe('https://1337x.to/torrent/123/mycourse')
            expect(infringement.sourceType).toBe('torrent')
            expect(infringement.sourceDomain).toBe('1337x')
            expect(infringement.confidence).toBe(85)
            expect(infringement.snippet).toContain('Seeders: 100')
            expect(infringement.snippet).toContain('Size: 2.5GB')
        })

        it('should handle results without seeder info', () => {
            const result: TorrentResult = {
                id: 'test-no-seeders',
                siteName: 'YTS',
                title: 'Test Movie',
                link: 'https://yts.mx/movies/test',
            }
            const infringement = convertTorrentToInfringement(result, 'content-456', 60)

            expect(infringement.snippet).toBe('Found on YTS')
        })
    })
})
