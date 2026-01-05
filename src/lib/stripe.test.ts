
import { describe, it, expect, vi } from 'vitest'
import { canAddContent, canAutoTakedown, PLANS, getPlanLimits } from './stripe'

// Mock process.env
const originalEnv = process.env

describe('Stripe Pricing Logic', () => {
    it('should return correct limits for free plan', () => {
        const limits = getPlanLimits('free')
        expect(limits.protectedContent).toBe(1)
        expect(limits.scansPerDay).toBe(10)
        expect(limits.autoTakedowns).toBe(false)
    })

    it('should return correct limits for starter plan', () => {
        const limits = getPlanLimits('starter')
        expect(limits.protectedContent).toBe(3)
        expect(limits.scansPerDay).toBe(50)
    })

    it('should return correct limits for pro plan', () => {
        const limits = getPlanLimits('pro')
        expect(limits.protectedContent).toBe(15)
        expect(limits.autoTakedowns).toBe(true)
    })

    it('should allow adding content if under limit', () => {
        expect(canAddContent('free', 0)).toBe(true)
        expect(canAddContent('starter', 2)).toBe(true)
        expect(canAddContent('enterprise', 9999)).toBe(true)
    })

    it('should block adding content if limit reached', () => {
        expect(canAddContent('free', 1)).toBe(false)
        expect(canAddContent('starter', 3)).toBe(false)
    })

    it('should allow auto takedowns only for pro and enterprise', () => {
        expect(canAutoTakedown('free')).toBe(false)
        expect(canAutoTakedown('starter')).toBe(false)
        expect(canAutoTakedown('pro')).toBe(true)
        expect(canAutoTakedown('enterprise')).toBe(true)
    })
})
