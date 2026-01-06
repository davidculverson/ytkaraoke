import { NextRequest, NextResponse } from "next/server"

// YouTube Data API v3 - Get video details including duration
// Duration is returned in ISO 8601 format (e.g., PT4M13S = 4 minutes 13 seconds)

function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 240 // Default 4 minutes

    const hours = parseInt(match[1] || "0", 10)
    const minutes = parseInt(match[2] || "0", 10)
    const seconds = parseInt(match[3] || "0", 10)

    return hours * 3600 + minutes * 60 + seconds
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const videoId = searchParams.get("videoId")

    if (!videoId) {
        return NextResponse.json({ error: "videoId is required" }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
        // Fallback: try to get title from oEmbed (no duration available)
        try {
            const oembedResponse = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            )
            if (oembedResponse.ok) {
                const data = await oembedResponse.json()
                return NextResponse.json({
                    videoId,
                    title: data.title || "Unknown Title",
                    duration: 240, // Default 4 minutes when no API key
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    source: "oembed",
                })
            }
        } catch {
            // Ignore oEmbed errors
        }

        return NextResponse.json({
            videoId,
            title: "Unknown Title",
            duration: 240,
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            source: "fallback",
        })
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
        )

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 })
        }

        const video = data.items[0]
        const duration = parseISO8601Duration(video.contentDetails.duration)

        return NextResponse.json({
            videoId,
            title: video.snippet.title,
            duration,
            thumbnail: video.snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            channelTitle: video.snippet.channelTitle,
            source: "youtube-api",
        })
    } catch (error) {
        console.error("YouTube API error:", error)
        
        // Fallback to oEmbed
        try {
            const oembedResponse = await fetch(
                `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
            )
            if (oembedResponse.ok) {
                const data = await oembedResponse.json()
                return NextResponse.json({
                    videoId,
                    title: data.title || "Unknown Title",
                    duration: 240,
                    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    source: "oembed-fallback",
                })
            }
        } catch {
            // Ignore
        }

        return NextResponse.json(
            { error: "Failed to fetch video info" },
            { status: 500 }
        )
    }
}
