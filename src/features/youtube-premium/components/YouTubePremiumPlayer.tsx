/**
 * YouTube Premium Player Component
 * Opens YouTube in a controlled window/iframe
 */

"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { FaExternalLinkAlt, FaSync } from "react-icons/fa"

interface YouTubePremiumPlayerProps {
    playlistId: string
    onSync: () => void
    isSyncing: boolean
    lastSyncTime?: number
}

export function YouTubePremiumPlayer({
    playlistId,
    onSync,
    isSyncing,
    lastSyncTime,
}: YouTubePremiumPlayerProps) {
    const [playerWindow, setPlayerWindow] = useState<Window | null>(null)
    const [isPlayerOpen, setIsPlayerOpen] = useState(false)

    const openPlayer = () => {
        const width = 1280
        const height = 720
        const left = (window.screen.width - width) / 2
        const top = (window.screen.height - height) / 2

        const newWindow = window.open(
            `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1`,
            "SongUpYouTube",
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`,
        )

        if (newWindow) {
            setPlayerWindow(newWindow)
            setIsPlayerOpen(true)
        }
    }

    const checkPlayerStatus = () => {
        if (playerWindow && playerWindow.closed) {
            setIsPlayerOpen(false)
            setPlayerWindow(null)
        }
    }

    useEffect(() => {
        // Check if player window is still open every 2 seconds
        const interval = setInterval(checkPlayerStatus, 2000)
        return () => clearInterval(interval)
    }, [playerWindow])

    const formatLastSync = (timestamp?: number) => {
        if (!timestamp) return "Never"
        const seconds = Math.floor((Date.now() - timestamp) / 1000)
        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        return `${minutes}m ago`
    }

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">YouTube Premium Player</h3>
                    <p className="text-sm text-muted-foreground">
                        {isPlayerOpen
                            ? "Player is open"
                            : "Click to open YouTube player"}
                    </p>
                </div>
                {!isPlayerOpen ? (
                    <Button onClick={openPlayer} size="sm">
                        <FaExternalLinkAlt className="mr-2" />
                        Open Player
                    </Button>
                ) : (
                    <Button
                        onClick={() => playerWindow?.focus()}
                        variant="outline"
                        size="sm"
                    >
                        Focus Player
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-4 text-sm">
                <Button
                    onClick={onSync}
                    disabled={isSyncing}
                    variant="outline"
                    size="sm"
                >
                    <FaSync
                        className={`mr-2 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
                <span className="text-muted-foreground">
                    Last sync: {formatLastSync(lastSyncTime)}
                </span>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
                <p>
                    • Queue automatically syncs every 5 seconds
                </p>
                <p>
                    • Keep the YouTube player window open during your session
                </p>
                <p>
                    • Songs are played directly from YouTube with your Premium
                    account
                </p>
            </div>
        </div>
    )
}
