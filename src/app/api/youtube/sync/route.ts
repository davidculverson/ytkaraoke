/**
 * YouTube Queue Sync API
 *
 * POST /api/youtube/sync
 * Synchronizes SongUp queue with YouTube Premium playlist
 */

import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"
import { refreshAccessToken } from "@/lib/youtube-oauth"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface Song {
    videoId: string
    title: string
    artist: string
}

interface SyncRequest {
    roomId: string
    queue: Song[]
}

export async function POST(request: NextRequest) {
    try {
        const body: SyncRequest = await request.json()
        const { roomId, queue } = body

        if (!roomId || !queue) {
            return NextResponse.json(
                { error: "roomId and queue are required" },
                { status: 400 },
            )
        }

        // Get YouTube session for this room
        const session = await fetchQuery(api.youtubePremium.getYouTubeSession, {
            roomId: roomId as Id<"rooms">,
        })

        if (!session) {
            return NextResponse.json(
                { error: "No YouTube session for this room" },
                { status: 404 },
            )
        }

        // Get YouTube auth tokens for the host
        const auth = await fetchQuery(
            api.youtubePremium.getYouTubeAuthInternal,
            {
                userId: session.hostUserId,
            },
        )

        if (!auth) {
            return NextResponse.json(
                { error: "Host YouTube account not connected" },
                { status: 401 },
            )
        }

        // Check if token needs refresh
        let accessToken = auth.accessToken
        if (Date.now() > auth.expiresAt - 300000) {
            // Refresh if expires within 5 minutes
            try {
                const refreshed = await refreshAccessToken(auth.refreshToken)
                accessToken = refreshed.access_token

                // Update stored tokens
                await fetchMutation(api.youtubePremium.saveYouTubeAuth, {
                    accessToken: refreshed.access_token,
                    refreshToken: auth.refreshToken, // Keep same refresh token
                    expiresAt: Date.now() + refreshed.expires_in * 1000,
                    tokenType: refreshed.token_type,
                })
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError)
                return NextResponse.json(
                    { error: "Failed to refresh YouTube token" },
                    { status: 401 },
                )
            }
        }

        // Initialize YouTube API
        const youtube = new YouTubeAPI(accessToken)

        // Get current playlist items
        const playlistItems = await youtube.getPlaylistItems(session.playlistId)
        const playlistVideoIds = playlistItems.map((item) => item.videoId)

        // Calculate what needs to be synced
        const queueVideoIds = queue.map((s) => s.videoId)
        const queueSet = new Set(queueVideoIds)
        const playlistSet = new Set(playlistVideoIds)

        const toAdd = queueVideoIds.filter((id) => !playlistSet.has(id))
        const toRemove = playlistItems.filter(
            (item) => !queueSet.has(item.videoId),
        )

        const results = {
            added: [] as string[],
            removed: [] as string[],
            errors: [] as string[],
        }

        // Remove videos no longer in queue
        for (const item of toRemove) {
            try {
                await youtube.removeVideoFromPlaylist(item.id)
                results.removed.push(item.videoId)
            } catch (error) {
                results.errors.push(
                    `Failed to remove ${item.videoId}: ${error}`,
                )
            }
        }

        // Add new videos to playlist (in queue order)
        for (const videoId of toAdd) {
            try {
                await youtube.addVideoToPlaylist(session.playlistId, videoId)
                results.added.push(videoId)
            } catch (error) {
                results.errors.push(`Failed to add ${videoId}: ${error}`)
            }
        }

        // Update sync time
        await fetchMutation(api.youtubePremium.updateYouTubeSyncTime, {
            roomId: roomId as Id<"rooms">,
        })

        return NextResponse.json({
            inSync: results.errors.length === 0,
            lastSync: Date.now(),
            pendingAdditions: [],
            pendingRemovals: [],
            ...results,
        })
    } catch (error) {
        console.error("Queue sync error:", error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Sync failed",
                inSync: false,
                lastSync: Date.now(),
                pendingAdditions: [],
                pendingRemovals: [],
            },
            { status: 500 },
        )
    }
}
