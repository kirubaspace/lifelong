
import { describe, it, expect } from 'vitest'
import { calculateConfidence } from './google-scanner'

// Since calculateConfidence is not exported, we'll need to export it temporarily or copy logic.
// For robust testing without modifying source too much, I'll assume we export it.
// Note: I will modify google-scanner.ts to export this function first.

describe('Scanner Confidence Logic', () => {
    it('should give high score for exact title match', () => {
        const score = calculateConfidence(
            { title: 'React Course 2024', snippet: '...', displayLink: 'example.com', link: '...' } as any,
            'React Course 2024',
            [],
            'video'
        )
        expect(score).toBeGreaterThanOrEqual(40)
    })

    it('should boost score for piracy domains', () => {
        const score = calculateConfidence(
            { title: 'Random Course', snippet: '...', displayLink: 'thepiratebay.org', link: '...' } as any,
            'Random Course',
            [],
            'video'
        )
        expect(score).toBeGreaterThanOrEqual(25)
    })

    it('should boost score for video-specific keywords', () => {
        const score = calculateConfidence(
            { title: 'React Course MP4 Download', snippet: '...', displayLink: 'example.com', link: '...' } as any,
            'React Course',
            [],
            'video'
        )
        // 40 for title (fuzzy) + 8 for keyword
        expect(score).toBeGreaterThan(40)
    })

    it('should boost score for PDF-specific keywords', () => {
        const score = calculateConfidence(
            { title: 'React eBook PDF Free Download', snippet: '...', displayLink: 'example.com', link: '...' } as any,
            'React eBook',
            [],
            'pdf'
        )
        expect(score).toBeGreaterThan(40)
    })
})
