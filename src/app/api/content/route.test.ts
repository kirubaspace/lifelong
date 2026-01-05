
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import * as stripeLib from '@/lib/stripe'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    prisma: {
        protectedContent: {
            count: vi.fn(),
            create: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth', () => ({
    auth: vi.fn(),
}))

vi.mock('next/server', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        NextResponse: {
            json: (body: any, init?: any) => ({ body, status: init?.status || 200, ...init }),
        },
    };
});

describe('POST /api/content', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
        (auth as any).mockResolvedValue(null)
        const req = new NextRequest('http://localhost:3000/api/content', {
            method: 'POST',
        })
        const res: any = await POST(req)
        expect(res.status).toBe(401)
    })

    it('should return 403 if plan limit reached', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1', plan: 'free' } })

        // Mock request body
        const req = new NextRequest('http://localhost:3000/api/content', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test',
                originalUrl: 'https://example.com',
                platformType: 'custom',
                contentType: 'video',
                keywords: ['test'],
                scanFrequency: 'MANUAL'
            })
        })

            // Mock count to return limit (assume Free limit is 1)
            ; (prisma.protectedContent.count as any).mockResolvedValue(1)
        // Ensure stripe lib logic says NO
        vi.spyOn(stripeLib, 'canAddContent').mockReturnValue(false)

        const res: any = await POST(req)
        expect(res.status).toBe(403)
        expect(res.body.error).toContain('limit')
    })

    it('should return 201 if allowed', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1', plan: 'starter' } })

        const payload = {
            title: 'Test Course',
            originalUrl: 'https://example.com',
            platformType: 'custom',
            contentType: 'video',
            keywords: ['test'],
            scanFrequency: 'DAILY'
        }

        const req = new NextRequest('http://localhost:3000/api/content', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

            // Allow it
            ; (prisma.protectedContent.count as any).mockResolvedValue(0)
        vi.spyOn(stripeLib, 'canAddContent').mockReturnValue(true)
            ; (prisma.protectedContent.create as any).mockResolvedValue({ id: 'new-id', ...payload })

        const res: any = await POST(req)
        expect(res.status).toBe(201)
        expect(prisma.protectedContent.create).toHaveBeenCalled()
    })

    it('should return 400 for invalid schema', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'user1' } })

        // Missing title
        const req = new NextRequest('http://localhost:3000/api/content', {
            method: 'POST',
            body: JSON.stringify({
                originalUrl: 'https://example.com',
            })
        })

        const res: any = await POST(req)
        expect(res.status).toBe(400)
    })
})
