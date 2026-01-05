
import { describe, it, expect } from 'vitest'
import { convertToInfringement, TelegramResult } from './telegram-scanner'

describe('Telegram Scanner', () => {
    describe('convertToInfringement', () => {
        it('should convert Telegram result to infringement format', () => {
            const telegramResult: TelegramResult = {
                id: '12345',
                channelName: 'Free Courses',
                channelUsername: 'freecourses',
                text: 'Download React Masterclass here: https://mega.nz/...',
                date: Math.floor(Date.now() / 1000),
                link: 'https://t.me/freecourses/12345',
            }

            const infringement = convertToInfringement(telegramResult, 'content-abc')

            expect(infringement.contentId).toBe('content-abc')
            expect(infringement.sourceUrl).toBe('https://t.me/freecourses/12345')
            expect(infringement.sourceType).toBe('telegram')
            expect(infringement.sourceDomain).toBe('t.me')
            expect(infringement.title).toContain('Free Courses')
            expect(infringement.title).toContain('@freecourses')
            expect(infringement.snippet).toBe('Download React Masterclass here: https://mega.nz/...')
            expect(infringement.confidence).toBe(90) // High confidence for direct matches
        })

        it('should truncate long snippets to 200 characters', () => {
            const longText = 'A'.repeat(300)
            const telegramResult: TelegramResult = {
                id: '67890',
                channelName: 'Test Channel',
                channelUsername: 'test',
                text: longText,
                date: Math.floor(Date.now() / 1000),
                link: 'https://t.me/test/67890',
            }

            const infringement = convertToInfringement(telegramResult, 'content-xyz')

            expect(infringement.snippet.length).toBe(200)
        })
    })
})
