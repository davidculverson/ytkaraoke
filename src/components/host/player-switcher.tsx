/**
 * Player Switcher Component
 *
 * Renders either the embedded YouTube player or YouTube Premium player
 * based on the room's playback mode setting
 */

"use client"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { YouTubePremiumPlayer } from "@/features/youtube-premium/components/YouTubePremiumPlayer"
import { YouTubePremiumSetup } from "@/features/youtube-premium/components/YouTubePremiumSetup"
import { useYouTubePremium } from "@/features/youtube-premium/hooks/useYouTubePremium"
import { useQuery } from "convex/react"
import { useRef, useState } from "react"
import YouTube, { YouTubeProps } from "react-youtube"

interface Song {
    videoId: string
    title: string
    artist: string
}

interface PlayerSwitcherProps {
    roomId: Id<"rooms">
    roomCode: string
    currentSong: Song | null
    queue: Song[]
    playbackMode: "embed" | "youtube-premium"
    onSongEnd: () => void
    onPlayerError: () => void
}

export function PlayerSwitcher({
    roomId,
    roomCode,
    currentSong,
    queue,
    playbackMode,
    onSongEnd,
    onPlayerError,
}: PlayerSwitcherProps) {
    const playerRef = useRef<YouTube>(null)
    const [showSetup, setShowSetup] = useState(true)

    // YouTube Premium state
    const youtubeAuth = useQuery(api.youtubePremium.getYouTubeAuth)
    const youtubeSession = useQuery(api.youtubePremium.getYouTubeSession, {
        roomId,
    })

    const { syncStatus, isSyncing, syncQueue } = useYouTubePremium(
        roomId,
        queue,
    )

    const isYouTubeConnected = youtubeAuth?.hasAuth && !youtubeAuth?.isExpired

    // YouTube embed player options
    const opts: YouTubeProps["opts"] = {
        width: "100%",
        height: "100%",
        playerVars: {
            autoplay: 1,
            enablejsapi: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            controls: 1,
        },
        host: "https://www.youtube-nocookie.com",
    }

    const onPlayerStateChange: YouTubeProps["onStateChange"] = (event) => {
        if (event.data === -1) {
            event.target.playVideo()
        }
    }

    // If using YouTube Premium mode
    if (playbackMode === "youtube-premium") {
        // Show setup if not connected
        if (!isYouTubeConnected || (showSetup && !youtubeSession)) {
            return (
                <div className="flex h-full w-full items-center justify-center p-4">
                    <YouTubePremiumSetup
                        roomId={roomId}
                        onContinue={() => setShowSetup(false)}
                    />
                </div>
            )
        }

        // Show the YouTube Premium player
        return (
            <YouTubePremiumPlayer
                playlistId={youtubeSession?.playlistId ?? ""}
                onSync={syncQueue}
                isSyncing={isSyncing}
                lastSyncTime={syncStatus?.lastSync}
            />
        )
    }

    // Default: Embedded player
    return (
        <>
            {currentSong && (
                <YouTube
                    ref={playerRef}
                    className="z-10 aspect-video w-full"
                    videoId={currentSong.videoId ?? ""}
                    opts={opts}
                    onStateChange={onPlayerStateChange}
                    onEnd={onSongEnd}
                    onError={onPlayerError}
                />
            )}
            {!currentSong && (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                    <h2 className="text-6xl font-bold">songup.tv</h2>
                    <p className="text-4xl">
                        Enter code <span className="font-extrabold">{roomCode}</span>
                    </p>
                </div>
            )}
        </>
    )
}
