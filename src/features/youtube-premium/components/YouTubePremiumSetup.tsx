/**
 * Component for setting up YouTube Premium mode
 */

"use client"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useQuery } from "convex/react"
import { FaYoutube } from "react-icons/fa"

interface YouTubePremiumSetupProps {
    roomId?: string
    onConnect?: () => void
    onContinue?: () => void
}

export function YouTubePremiumSetup({
    roomId,
    onConnect,
    onContinue,
}: YouTubePremiumSetupProps) {
    const youtubeAuth = useQuery(api.youtubePremium.getYouTubeAuth)
    const isConnected = youtubeAuth?.hasAuth && !youtubeAuth?.isExpired

    const handleConnect = () => {
        if (onConnect) {
            onConnect()
        } else {
            // Default: redirect to OAuth flow
            const url = roomId 
                ? `/api/youtube/auth?roomId=${roomId}`
                : `/api/youtube/auth`
            window.location.href = url
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FaYoutube className="text-red-600" size={24} />
                    YouTube Premium Mode
                </CardTitle>
                <CardDescription>
                    Use your YouTube Premium account for better playback
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Benefits:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>No advertisements during playback</li>
                        <li>Works with embed-disabled videos</li>
                        <li>Native YouTube player experience</li>
                        <li>Better performance and reliability</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Active YouTube Premium subscription</li>
                        <li>YouTube account authentication</li>
                    </ul>
                </div>

                {isConnected ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
                            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                                ✓ YouTube Premium Connected
                            </p>
                        </div>
                        {onContinue && (
                            <Button onClick={onContinue} className="w-full">
                                Continue to Player
                            </Button>
                        )}
                    </div>
                ) : (
                    <Button
                        onClick={handleConnect}
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        <FaYoutube className="mr-2" />
                        Connect YouTube Account
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">
                    Your YouTube credentials are securely stored and only used
                    for playlist management during your karaoke session.
                </p>
            </CardContent>
        </Card>
    )
}
