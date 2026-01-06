import { NextRequest, NextResponse } from "next/server"
import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"

/**
 * POST /api/karaoke/playlist/add - Add a video to the playlist
 * Requires OAuth access token in Authorization header
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            )
        }
        
        const accessToken = authHeader.replace("Bearer ", "")
        const body = await request.json()
        const { playlistId, videoId, position } = body
        
        if (!playlistId || !videoId) {
            return NextResponse.json(
                { error: "Playlist ID and video ID are required" },
                { status: 400 }
            )
        }
        
        const api = new YouTubeAPI(accessToken)
        const item = await api.addVideoToPlaylist(playlistId, videoId, position)
        
        return NextResponse.json({
            playlistItemId: item.id,
            videoId: item.videoId,
            position: item.position,
            title: item.title,
        })
    } catch (error) {
        console.error("Failed to add video to playlist:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to add video" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/karaoke/playlist/add - Remove a video from the playlist
 * Requires OAuth access token in Authorization header
 */
export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization")
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization required" },
                { status: 401 }
            )
        }
        
        const accessToken = authHeader.replace("Bearer ", "")
        const { searchParams } = new URL(request.url)
        const playlistItemId = searchParams.get("playlistItemId")
        
        if (!playlistItemId) {
            return NextResponse.json(
                { error: "Playlist item ID is required" },
                { status: 400 }
            )
        }
        
        const api = new YouTubeAPI(accessToken)
        await api.removeVideoFromPlaylist(playlistItemId)
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to remove video from playlist:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to remove video" },
            { status: 500 }
        )
    }
}
