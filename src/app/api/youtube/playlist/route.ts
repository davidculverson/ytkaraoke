/**
 * YouTube Playlist Management API
 *
 * POST /api/youtube/playlist - Create a new playlist
 * DELETE /api/youtube/playlist - Delete a playlist
 */

import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"
import { refreshAccessToken } from "@/lib/youtube-oauth"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

interface CreatePlaylistRequest {
    roomId: string
    roomCode: string
}

interface DeletePlaylistRequest {
    roomId: string
}

/**
 * Create a new YouTube playlist for a room
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreatePlaylistRequest = await request.json()
        const { roomId, roomCode } = body

        if (!roomId || !roomCode) {
            return NextResponse.json(
                { error: "roomId and roomCode are required" },
                { status: 400 },
            )
        }

        // Get YouTube auth for current user
        const auth = await fetchQuery(api.youtubePremium.getYouTubeAuth)

        if (!auth || !auth.hasAuth) {
            return NextResponse.json(
                { error: "YouTube account not connected" },
                { status: 401 },
            )
        }

        // Get full auth with tokens (internal query)
        // Note: This needs to be done server-side with proper auth context
        // For now, we'll use the session's auth
const session = await fetchQuery(api.youtubePremium.getYouTubeSession, {
            roomId: roomId as Id<"rooms">,
        })

        // If session already exists, return the existing playlist
        if (session) {
            return NextResponse.json({
                playlistId: session.playlistId,
                playlistTitle: session.playlistTitle,
                isExisting: true,
            })
        }

        // Get full auth tokens to create playlist
        // This requires the user to be authenticated and have YouTube connected
        // The actual implementation would need proper server-side auth

        return NextResponse.json(
            { error: "Playlist creation requires server-side implementation" },
            { status: 501 },
        )
    } catch (error) {
        console.error("Create playlist error:", error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to create playlist",
            },
            { status: 500 },
        )
    }
}

/**
 * Delete a YouTube playlist for a room
 */
export async function DELETE(request: NextRequest) {
    try {
        const body: DeletePlaylistRequest = await request.json()
        const { roomId } = body

        if (!roomId) {
            return NextResponse.json(
                { error: "roomId is required" },
                { status: 400 },
            )
        }

        // Get YouTube session
        const session = await fetchQuery(api.youtubePremium.getYouTubeSession, {
            roomId: roomId as Id<"rooms">,
        })

        if (!session) {
            return NextResponse.json({ success: true, message: "No session to delete" })
        }

        // Get host's YouTube auth
        const auth = await fetchQuery(
            api.youtubePremium.getYouTubeAuthInternal,
            {
                userId: session.hostUserId,
            },
        )

        if (!auth) {
            // Can't delete playlist, just delete session
            await fetchMutation(api.youtubePremium.deleteYouTubeSession, {
                roomId: roomId as Id<"rooms">,
            })
            return NextResponse.json({ success: true, message: "Session deleted, playlist orphaned" })
        }

        // Check if token needs refresh
        let accessToken = auth.accessToken
        if (Date.now() > auth.expiresAt - 300000) {
            try {
                const refreshed = await refreshAccessToken(auth.refreshToken)
                accessToken = refreshed.access_token
            } catch {
                // Continue with old token, might work
            }
        }

        // Delete playlist from YouTube
        try {
            const youtube = new YouTubeAPI(accessToken)
            await youtube.deletePlaylist(session.playlistId)
        } catch (error) {
            console.error("Failed to delete YouTube playlist:", error)
            // Continue to delete session even if playlist delete fails
        }

        // Delete session from Convex
        await fetchMutation(api.youtubePremium.deleteYouTubeSession, {
            roomId: roomId as Id<"rooms">,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete playlist error:", error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete playlist",
            },
            { status: 500 },
        )
    }
}
