/**
 * React Hook for YouTube Premium Integration
 */

import { useEffect, useState } from "react"
import { QueueSyncStatus } from "../types"

interface Song {
    videoId: string
    title: string
    artist: string
}

export function useYouTubePremium(roomId: string, queue: Song[]) {
    const [syncStatus, setSyncStatus] = useState<QueueSyncStatus | null>(null)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        // Auto-sync queue every 5 seconds
        const interval = setInterval(() => {
            syncQueue()
        }, 5000)

        return () => clearInterval(interval)
    }, [queue])

    const syncQueue = async () => {
        if (isSyncing) return

        setIsSyncing(true)
        try {
            const response = await fetch("/api/youtube/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roomId,
                    queue,
                }),
            })

            if (response.ok) {
                const status = await response.json()
                setSyncStatus(status)
            }
        } catch (error) {
            console.error("Sync failed:", error)
            setSyncStatus({
                inSync: false,
                lastSync: Date.now(),
                pendingAdditions: [],
                pendingRemovals: [],
                error: error instanceof Error ? error.message : "Unknown error",
            })
        } finally {
            setIsSyncing(false)
        }
    }

    const initiateYouTubeAuth = () => {
        window.location.href = "/api/youtube/auth"
    }

    const openYouTubePlaylist = (playlistId: string) => {
        window.open(
            `https://www.youtube.com/playlist?list=${playlistId}&autoplay=1`,
            "_blank",
            "width=1280,height=720",
        )
    }

    return {
        syncStatus,
        isSyncing,
        syncQueue,
        initiateYouTubeAuth,
        openYouTubePlaylist,
    }
}
