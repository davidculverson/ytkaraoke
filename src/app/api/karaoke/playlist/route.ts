import { NextRequest, NextResponse } from "next/server"
import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"

// YouTube API key from environment
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// For authenticated playlist operations, we need OAuth tokens
// For POC, we'll use a simpler approach with just API key for reading

/**
 * POST /api/karaoke/playlist - Create a new YouTube playlist
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
        const { title, description } = body
        
        if (!title) {
            return NextResponse.json(
                { error: "Playlist title is required" },
                { status: 400 }
            )
        }
        
        const api = new YouTubeAPI(accessToken)
        const playlist = await api.createPlaylist(
            title,
            description || "Karaoke queue playlist"
        )
        
        return NextResponse.json({
            playlistId: playlist.id,
            title: playlist.title,
            url: `https://www.youtube.com/playlist?list=${playlist.id}`,
        })
    } catch (error) {
        console.error("Failed to create playlist:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to create playlist" },
            { status: 500 }
        )
    }
}

/**
 * GET /api/karaoke/playlist?id=xxx - Get playlist info
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get("id")
    
    if (!playlistId) {
        return NextResponse.json(
            { error: "Playlist ID is required" },
            { status: 400 }
        )
    }
    
    try {
        // Use API key for read-only access
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`
        )
        
        if (!response.ok) {
            throw new Error("Failed to fetch playlist")
        }
        
        const data = await response.json()
        
        if (!data.items || data.items.length === 0) {
            return NextResponse.json(
                { error: "Playlist not found" },
                { status: 404 }
            )
        }
        
        const playlist = data.items[0]
        return NextResponse.json({
            id: playlist.id,
            title: playlist.snippet.title,
            description: playlist.snippet.description,
            itemCount: playlist.contentDetails.itemCount,
            url: `https://www.youtube.com/playlist?list=${playlist.id}`,
        })
    } catch (error) {
        console.error("Failed to get playlist:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to get playlist" },
            { status: 500 }
        )
    }
}
