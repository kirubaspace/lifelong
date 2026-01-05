"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

interface AnalyticsChartsProps {
    scanData: { date: string; scans: number }[]
    infringementData: { month: string; infringements: number }[]
}

export function AnalyticsCharts({ scanData, infringementData }: AnalyticsChartsProps) {
    const hasData = scanData.some(d => d.scans > 0) || infringementData.some(d => d.infringements > 0)

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Scan Activity Chart */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Scan Activity</CardTitle>
                    <CardDescription className="text-slate-400">
                        Last 30 days
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={scanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="scans"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="url(#scanGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-500">No scan data yet. Start scanning to see analytics.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Infringements Chart */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Infringements Detected</CardTitle>
                    <CardDescription className="text-slate-400">
                        Last 6 months
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {hasData ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={infringementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Bar
                                    dataKey="infringements"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-500">No infringement data yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
