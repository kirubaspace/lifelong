"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreVertical, Loader2, Trash2, Edit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner" // Assuming sonner is installed, otherwise standard alert or check what's available

export function ContentActions({ contentId }: { contentId: string }) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
            return
        }

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/content/${contentId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete content")
            }

            toast.success("Content deleted successfully")
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete content")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700">
                <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer">
                    <Link href={`/dashboard/content/${contentId}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-slate-300 focus:text-white focus:bg-slate-800 cursor-pointer">
                    <Link href={`/dashboard/content/${contentId}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-400 focus:text-red-300 focus:bg-slate-800 cursor-pointer"
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
