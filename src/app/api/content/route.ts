import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { canAddContent } from "@/lib/stripe"

const createContentSchema = z.object({
    title: z.string().min(1).max(200),
    originalUrl: z.string().url(),
    description: z.string().max(1000).optional(),
    platformType: z.enum(["teachable", "thinkific", "gumroad", "custom"]),
    contentType: z.enum(["video", "pdf"]),
    keywords: z.array(z.string()).min(1),
    scanFrequency: z.enum(["MANUAL", "DAILY", "WEEKLY"]).default("MANUAL"),
})

// GET /api/content - List all protected content
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const content = await prisma.protectedContent.findMany({
            where: { userId: session.user.id },
            include: {
                _count: {
                    select: { infringements: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(content)
    } catch (error) {
        console.error("Error fetching content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST /api/content - Create new protected content
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = createContentSchema.parse(body)

        // Check plan limits
        const currentCount = await prisma.protectedContent.count({
            where: { userId: session.user.id, isActive: true }
        })

        const userPlan = session.user.plan || 'free'
        if (!canAddContent(userPlan, currentCount)) {
            return NextResponse.json(
                { error: "You've reached your plan limit. Upgrade to add more courses." },
                { status: 403 }
            )
        }

        // Calculate next scan date if scheduled
        let nextScanAt = undefined
        if (validatedData.scanFrequency !== "MANUAL") {
            const now = new Date()
            nextScanAt = new Date(now)
            if (validatedData.scanFrequency === "DAILY") {
                nextScanAt.setDate(now.getDate() + 1)
            } else if (validatedData.scanFrequency === "WEEKLY") {
                nextScanAt.setDate(now.getDate() + 7)
            }
        }

        // Create the content
        const content = await prisma.protectedContent.create({
            data: {
                userId: session.user.id,
                title: validatedData.title,
                originalUrl: validatedData.originalUrl,
                description: validatedData.description,
                platformType: validatedData.platformType,
                contentType: validatedData.contentType,
                keywords: validatedData.keywords,
                scanFrequency: validatedData.scanFrequency,
                nextScanAt: nextScanAt,
            },
        })

        return NextResponse.json(content, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error creating content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
