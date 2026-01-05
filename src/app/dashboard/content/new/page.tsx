"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Loader2, Plus, X, Video, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    originalUrl: z.string().url("Please enter a valid URL"),
    description: z.string().max(1000).optional(),
    platformType: z.enum(["teachable", "thinkific", "gumroad", "custom"]),
    contentType: z.enum(["video", "pdf"]),
    keywords: z.array(z.string()).min(1, "Add at least one keyword"),
    scanFrequency: z.enum(["MANUAL", "DAILY", "WEEKLY"]),
})

type FormData = z.infer<typeof formSchema>

export default function NewContentPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [keywordInput, setKeywordInput] = useState("")

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            originalUrl: "",
            description: "",
            platformType: "custom",
            contentType: "video",
            keywords: [],
            scanFrequency: "MANUAL",
        },
    })

    const keywords = form.watch("keywords")

    const addKeyword = () => {
        const keyword = keywordInput.trim()
        if (keyword && !keywords.includes(keyword)) {
            form.setValue("keywords", [...keywords, keyword])
            setKeywordInput("")
        }
    }

    const removeKeyword = (keyword: string) => {
        form.setValue("keywords", keywords.filter(k => k !== keyword))
    }

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to create content")
            }

            router.push("/dashboard/content")
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Link href="/dashboard/content">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Add Protected Content</h1>
                    <p className="text-slate-400 mt-1">
                        Add a course or material to protect from piracy
                    </p>
                </div>
            </div>

            {/* Form - wrapping everything */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Content Type Selection */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Content Type</CardTitle>
                            <CardDescription className="text-slate-400">
                                What type of content are you protecting?
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="contentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange("video")}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${field.value === "video"
                                                        ? "border-purple-500 bg-purple-500/10"
                                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                                        }`}
                                                >
                                                    <div className={`p-4 rounded-full ${field.value === "video"
                                                        ? "bg-purple-500/20"
                                                        : "bg-slate-700/50"
                                                        }`}>
                                                        <Video className={`w-8 h-8 ${field.value === "video" ? "text-purple-400" : "text-slate-400"
                                                            }`} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`font-semibold ${field.value === "video" ? "text-purple-300" : "text-slate-300"
                                                            }`}>Video Course</p>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            MP4, MKV, course videos
                                                        </p>
                                                    </div>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange("pdf")}
                                                    className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${field.value === "pdf"
                                                        ? "border-emerald-500 bg-emerald-500/10"
                                                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                                                        }`}
                                                >
                                                    <div className={`p-4 rounded-full ${field.value === "pdf"
                                                        ? "bg-emerald-500/20"
                                                        : "bg-slate-700/50"
                                                        }`}>
                                                        <FileText className={`w-8 h-8 ${field.value === "pdf" ? "text-emerald-400" : "text-slate-400"
                                                            }`} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`font-semibold ${field.value === "pdf" ? "text-emerald-300" : "text-slate-300"
                                                            }`}>PDF / eBook</p>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            PDFs, workbooks, guides
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Course Details */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Course Details</CardTitle>
                            <CardDescription className="text-slate-400">
                                Provide information about your course to help us find unauthorized copies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Course Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g., Complete React Development Course 2024"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-slate-500">
                                            The exact title as it appears on your sales page
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* URL */}
                            <FormField
                                control={form.control}
                                name="originalUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Course URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="url"
                                                placeholder="https://your-platform.com/course-name"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                            />
                                        </FormControl>
                                        <FormDescription className="text-slate-500">
                                            The official URL where your course is sold
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Platform */}
                            <FormField
                                control={form.control}
                                name="platformType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Platform</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                    <SelectValue placeholder="Select platform" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="teachable" className="text-slate-200">Teachable</SelectItem>
                                                <SelectItem value="thinkific" className="text-slate-200">Thinkific</SelectItem>
                                                <SelectItem value="gumroad" className="text-slate-200">Gumroad</SelectItem>
                                                <SelectItem value="custom" className="text-slate-200">Custom / Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Brief description of your course content..."
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Keywords */}
                            <FormField
                                control={form.control}
                                name="keywords"
                                render={() => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Search Keywords</FormLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                value={keywordInput}
                                                onChange={(e) => setKeywordInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        addKeyword()
                                                    }
                                                }}
                                                placeholder="e.g., react course, john doe tutorial"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                            />
                                            <Button type="button" onClick={addKeyword} variant="secondary">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <FormDescription className="text-slate-500">
                                            Keywords pirates might use to search for your content
                                        </FormDescription>
                                        {keywords.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {keywords.map((keyword) => (
                                                    <Badge
                                                        key={keyword}
                                                        variant="secondary"
                                                        className="bg-purple-500/10 text-purple-400 border-0"
                                                    >
                                                        {keyword}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeKeyword(keyword)}
                                                            className="ml-2 hover:text-purple-200"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Scan Settings */}
                            <FormField
                                control={form.control}
                                name="scanFrequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-200">Scan Schedule</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                <SelectItem value="MANUAL" className="text-slate-200">Manual (scan when you want)</SelectItem>
                                                <SelectItem value="DAILY" className="text-slate-200">Daily (Automatic)</SelectItem>
                                                <SelectItem value="WEEKLY" className="text-slate-200">Weekly (Automatic)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-slate-500">
                                            How often should we scan for new pirated copies?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    disabled={isLoading}
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Add Course
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    )
}
