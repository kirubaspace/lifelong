
import { describe, it, expect } from 'vitest'
import { generateNoticeContent, generateNoticeHTML, getAbuseEmail } from './notice-generator'

describe('DMCA Notice Generator', () => {
    const sampleData = {
        ownerName: 'John Doe',
        ownerEmail: 'john@example.com',
        courseTitle: 'React Masterclass 2024',
        courseUrl: 'https://teachable.com/courses/react-masterclass',
        courseDescription: 'A comprehensive React course',
        infringementUrl: 'https://piracysite.com/react-course-free',
        infringementDomain: 'piracysite.com',
    }

    describe('generateNoticeContent', () => {
        it('should generate valid DMCA notice text', () => {
            const notice = generateNoticeContent(sampleData)

            expect(notice).toContain('DMCA TAKEDOWN NOTICE')
            expect(notice).toContain('17 U.S.C. § 512(c)')
            expect(notice).toContain(sampleData.ownerName)
            expect(notice).toContain(sampleData.ownerEmail)
            expect(notice).toContain(sampleData.courseTitle)
            expect(notice).toContain(sampleData.courseUrl)
            expect(notice).toContain(sampleData.infringementUrl)
            expect(notice).toContain('good faith belief')
            expect(notice).toContain('penalty of perjury')
        })

        it('should include course description when provided', () => {
            const notice = generateNoticeContent(sampleData)
            expect(notice).toContain(sampleData.courseDescription)
        })

        it('should work without course description', () => {
            const dataWithoutDesc = { ...sampleData, courseDescription: undefined }
            const notice = generateNoticeContent(dataWithoutDesc)
            expect(notice).not.toContain('undefined')
        })
    })

    describe('generateNoticeHTML', () => {
        it('should generate valid HTML notice', () => {
            const html = generateNoticeHTML(sampleData)

            expect(html).toContain('<!DOCTYPE html>')
            expect(html).toContain('<h1>DMCA TAKEDOWN NOTICE</h1>')
            expect(html).toContain(sampleData.ownerName)
            expect(html).toContain(sampleData.courseTitle)
            expect(html).toContain(`href="${sampleData.courseUrl}"`)
        })

        it('should include proper styling', () => {
            const html = generateNoticeHTML(sampleData)
            expect(html).toContain('<style>')
            expect(html).toContain('font-family')
        })
    })

    describe('getAbuseEmail', () => {
        it('should return correct abuse email for known domains', () => {
            expect(getAbuseEmail('cloudflare.com')).toBe('abuse@cloudflare.com')
            expect(getAbuseEmail('amazonaws.com')).toBe('abuse@amazonaws.com')
            expect(getAbuseEmail('mega.nz')).toBe('copyright@mega.nz')
            expect(getAbuseEmail('t.me')).toBe('dmca@telegram.org')
            expect(getAbuseEmail('drive.google.com')).toBe('dmca-agent@google.com')
        })

        it('should return null for unknown domains', () => {
            expect(getAbuseEmail('unknown-domain.xyz')).toBeNull()
            expect(getAbuseEmail('somethingstrange.net')).toBeNull()
        })

        it('should match partial domain strings', () => {
            expect(getAbuseEmail('sub.cloudflare.com')).toBe('abuse@cloudflare.com')
            expect(getAbuseEmail('storage.amazonaws.com')).toBe('abuse@amazonaws.com')
        })
    })
})
