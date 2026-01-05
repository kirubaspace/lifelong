import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Bell, Shield, Globe } from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Your account information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Name</Label>
                        <Input
                            defaultValue={session?.user?.name || ""}
                            className="bg-slate-800 border-slate-700 text-white"
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Email</Label>
                        <Input
                            defaultValue={session?.user?.email || ""}
                            className="bg-slate-800 border-slate-700 text-white"
                            disabled
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Configure how you receive alerts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-slate-300">Email Alerts</Label>
                            <p className="text-sm text-slate-500">Receive emails when infringements are detected</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-slate-300">Weekly Reports</Label>
                            <p className="text-sm text-slate-500">Get a weekly summary of your protection status</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Scan Settings */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Scan Preferences
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Configure scanning behavior
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-slate-300">Deep Search</Label>
                            <p className="text-sm text-slate-500">Search additional sources (slower but more thorough)</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-slate-300">Telegram Scanning</Label>
                            <p className="text-sm text-slate-500">Scan public Telegram channels for pirated content</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button className="bg-purple-600 hover:bg-purple-700">
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
