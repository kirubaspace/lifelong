import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateContentSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    originalUrl: z.string().url().optional(),
    description: z.string().max(1000).optional(),
    platformType: z.enum(["teachable", "thinkific", "gumroad", "custom"]).optional(),
    keywords: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
})

// GET /api/content/[id] - Get single content
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const { id } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const content = await prisma.protectedContent.findFirst({
            where: {
                id,
                userId: session.user.id
            },
            include: {
                infringements: {
                    orderBy: { detectedAt: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { infringements: true }
                }
            },
        })

        if (!content) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 })
        }

        return NextResponse.json(content)
    } catch (error) {
        console.error("Error fetching content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PUT /api/content/[id] - Update content
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const { id } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify ownership
        const existing = await prisma.protectedContent.findFirst({
            where: { id, userId: session.user.id }
        })

        if (!existing) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 })
        }

        const body = await request.json()
        const validatedData = updateContentSchema.parse(body)

        const content = await prisma.protectedContent.update({
            where: { id },
            data: validatedData,
        })

        return NextResponse.json(content)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        console.error("Error updating content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE /api/content/[id] - Delete content
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        const { id } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify ownership
        const existing = await prisma.protectedContent.findFirst({
            where: { id, userId: session.user.id }
        })

        if (!existing) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 })
        }

        await prisma.protectedContent.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting content:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
