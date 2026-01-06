import { NextRequest, NextResponse } from "next/server"
import * as fs from "fs"
import * as path from "path"

interface VideoStats {
    viewCount: number
    likeCount: number
    isHD: boolean
}

// Cache configuration
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
const CACHE_DIR = path.join(process.cwd(), ".cache", "youtube-search")
const CACHE_INDEX_FILE = path.join(CACHE_DIR, "_index.json")

// In-memory cache for fast access (backed by disk)
let memoryCache = new Map<string, { data: unknown; timestamp: number }>()
let cacheLoaded = false

// Clear cache on startup if environment variable is set
const CLEAR_CACHE_ON_STARTUP = process.env.CLEAR_YOUTUBE_CACHE_ON_STARTUP === "true"

function ensureCacheDir(): void {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
}

function loadCacheFromDisk(): void {
    if (cacheLoaded) return
    cacheLoaded = true
    
    if (CLEAR_CACHE_ON_STARTUP) {
        console.log("[YouTube Cache] Clearing cache on startup (CLEAR_YOUTUBE_CACHE_ON_STARTUP=true)")
        clearAllCache()
        return
    }
    
    try {
        ensureCacheDir()
        if (fs.existsSync(CACHE_INDEX_FILE)) {
            const indexData = JSON.parse(fs.readFileSync(CACHE_INDEX_FILE, "utf-8"))
            const now = Date.now()
            let loadedCount = 0
            let expiredCount = 0
            
            for (const [key, meta] of Object.entries(indexData as Record<string, { timestamp: number; file: string }>)) {
                if (now - meta.timestamp > CACHE_TTL_MS) {
                    // Expired - clean up file
                    const filePath = path.join(CACHE_DIR, meta.file)
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath)
                    }
                    expiredCount++
                } else {
                    // Load into memory
                    const filePath = path.join(CACHE_DIR, meta.file)
                    if (fs.existsSync(filePath)) {
                        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
                        memoryCache.set(key, { data, timestamp: meta.timestamp })
                        loadedCount++
                    }
                }
            }
            
            // Rewrite index without expired entries
            saveCacheIndex()
            console.log(`[YouTube Cache] Loaded ${loadedCount} entries, removed ${expiredCount} expired`)
        }
    } catch (error) {
        console.error("[YouTube Cache] Failed to load cache from disk:", error)
    }
}

function saveCacheIndex(): void {
    try {
        ensureCacheDir()
        const index: Record<string, { timestamp: number; file: string }> = {}
        for (const [key, value] of memoryCache.entries()) {
            const safeFileName = Buffer.from(key).toString("base64url") + ".json"
            index[key] = { timestamp: value.timestamp, file: safeFileName }
        }
        fs.writeFileSync(CACHE_INDEX_FILE, JSON.stringify(index, null, 2))
    } catch (error) {
        console.error("[YouTube Cache] Failed to save cache index:", error)
    }
}

function saveCacheEntry(key: string, data: unknown, timestamp: number): void {
    try {
        ensureCacheDir()
        const safeFileName = Buffer.from(key).toString("base64url") + ".json"
        const filePath = path.join(CACHE_DIR, safeFileName)
        fs.writeFileSync(filePath, JSON.stringify(data))
        saveCacheIndex()
    } catch (error) {
        console.error("[YouTube Cache] Failed to save cache entry:", error)
    }
}

export function clearAllCache(): { cleared: number } {
    const count = memoryCache.size
    memoryCache.clear()
    
    try {
        if (fs.existsSync(CACHE_DIR)) {
            const files = fs.readdirSync(CACHE_DIR)
            for (const file of files) {
                fs.unlinkSync(path.join(CACHE_DIR, file))
            }
        }
    } catch (error) {
        console.error("[YouTube Cache] Failed to clear disk cache:", error)
    }
    
    console.log(`[YouTube Cache] Cleared ${count} entries`)
    return { cleared: count }
}

export function getCacheStats(): { entries: number; oldestMs: number | null; newestMs: number | null } {
    loadCacheFromDisk()
    
    let oldest: number | null = null
    let newest: number | null = null
    
    for (const value of memoryCache.values()) {
        if (oldest === null || value.timestamp < oldest) oldest = value.timestamp
        if (newest === null || value.timestamp > newest) newest = value.timestamp
    }
    
    return {
        entries: memoryCache.size,
        oldestMs: oldest ? Date.now() - oldest : null,
        newestMs: newest ? Date.now() - newest : null,
    }
}

function getCacheKey(query: string, pageToken: string | null): string {
    return `${query}::${pageToken || "first"}`
}

function getCachedResult(key: string): unknown | null {
    loadCacheFromDisk()
    
    const cached = memoryCache.get(key)
    if (!cached) return null
    
    const now = Date.now()
    if (now - cached.timestamp > CACHE_TTL_MS) {
        memoryCache.delete(key)
        saveCacheIndex()
        return null
    }
    
    return cached.data
}

function setCachedResult(key: string, data: unknown): void {
    loadCacheFromDisk()
    
    const timestamp = Date.now()
    memoryCache.set(key, { data, timestamp })
    saveCacheEntry(key, data, timestamp)
    
    // Clean up old entries if cache gets too large (max 1000 entries)
    if (memoryCache.size > 1000) {
        const now = Date.now()
        for (const [k, v] of memoryCache.entries()) {
            if (now - v.timestamp > CACHE_TTL_MS) {
                memoryCache.delete(k)
            }
        }
        // If still too large, remove oldest entries
        if (memoryCache.size > 1000) {
            const entries = [...memoryCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
            for (let i = 0; i < entries.length - 500; i++) {
                memoryCache.delete(entries[i][0])
            }
        }
        saveCacheIndex()
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")
    const pageToken = searchParams.get("pageToken")
    const maxResults = parseInt(searchParams.get("maxResults") || "50", 10)
    
    if (!query) {
        return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }
    
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 })
    }
    
    // Check cache first
    const cacheKey = getCacheKey(query, pageToken)
    const cachedData = getCachedResult(cacheKey)
    if (cachedData) {
        // Return cached result with cache headers
        return NextResponse.json(cachedData, {
            headers: {
                "Cache-Control": "public, max-age=604800", // 7 days
                "X-Cache": "HIT",
            },
        })
    }
    
    try {
        // Add "karaoke" to the search query to favor karaoke results
        const karaokeQuery = `${query} karaoke`
        
        // Search with relevance ordering (default) to get accurate results, then sort by quality/views
        let searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&type=video&videoCategoryId=10&maxResults=${Math.min(maxResults, 50)}&` +
            `q=${encodeURIComponent(karaokeQuery)}&` +
            `key=${apiKey}`
        
        if (pageToken) {
            searchUrl += `&pageToken=${encodeURIComponent(pageToken)}`
        }
        
        const searchResponse = await fetch(searchUrl)
        
        if (!searchResponse.ok) {
            const errorData = await searchResponse.json()
            console.error("YouTube search error:", errorData)
            return NextResponse.json({ error: "YouTube search failed" }, { status: searchResponse.status })
        }
        
        const searchData = await searchResponse.json()
        const nextPageToken = searchData.nextPageToken || null
        const videoIds = (searchData.items || []).map((item: { id: { videoId: string } }) => item.id.videoId)
        
        if (videoIds.length === 0) {
            return NextResponse.json({ items: [], nextPageToken: null })
        }
        
        // Fetch video details for statistics (views, likes) and content details (duration, HD)
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?` +
            `part=snippet,statistics,contentDetails&` +
            `id=${videoIds.join(",")}&` +
            `key=${apiKey}`
        )
        
        if (!videosResponse.ok) {
            const errorData = await videosResponse.json()
            console.error("YouTube videos error:", errorData)
            return NextResponse.json({ error: "Failed to fetch video details" }, { status: videosResponse.status })
        }
        
        const videosData = await videosResponse.json()
        
        // Build stats map
        const statsMap = new Map<string, VideoStats>()
        for (const video of videosData.items || []) {
            statsMap.set(video.id, {
                viewCount: parseInt(video.statistics?.viewCount || "0", 10),
                likeCount: parseInt(video.statistics?.likeCount || "0", 10),
                isHD: video.contentDetails?.definition === "hd",
            })
        }
        
        // Parse duration from ISO 8601 format (PT4M30S -> 270 seconds)
        const parseDuration = (isoDuration: string): number => {
            const match = isoDuration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
            if (!match) return 240
            const hours = parseInt(match[1] || "0", 10)
            const minutes = parseInt(match[2] || "0", 10)
            const seconds = parseInt(match[3] || "0", 10)
            return hours * 3600 + minutes * 60 + seconds
        }
        
        // Transform and enrich results
        const results = (videosData.items || []).map((video: {
            id: string
            snippet: { title: string; channelTitle: string }
            contentDetails: { duration: string; definition: string }
            statistics: { viewCount: string; likeCount: string }
        }) => ({
            videoId: video.id,
            title: video.snippet.title,
            artists: [{ name: video.snippet.channelTitle }],
            duration_seconds: parseDuration(video.contentDetails?.duration),
            viewCount: parseInt(video.statistics?.viewCount || "0", 10),
            likeCount: parseInt(video.statistics?.likeCount || "0", 10),
            isHD: video.contentDetails?.definition === "hd",
        }))
        
        // Keep YouTube's relevance order - only boost karaoke to top if some results aren't karaoke
        // This preserves search accuracy while ensuring karaoke versions appear first
        const hasNonKaraoke = results.some((r: { title: string }) => !r.title.toLowerCase().includes("karaoke"))
        
        if (hasNonKaraoke) {
            // Only sort if we have mixed results - put karaoke first
            results.sort((a: { title: string }, b: { title: string }) => {
                const aIsKaraoke = a.title.toLowerCase().includes("karaoke")
                const bIsKaraoke = b.title.toLowerCase().includes("karaoke")
                if (aIsKaraoke && !bIsKaraoke) return -1
                if (!aIsKaraoke && bIsKaraoke) return 1
                return 0 // Preserve YouTube's relevance order otherwise
            })
        }
        // If all results are karaoke, don't re-sort - keep YouTube's relevance order
        
        // Cache the result for 7 days
        const responseData = { items: results, nextPageToken }
        setCachedResult(cacheKey, responseData)
        
        return NextResponse.json(responseData, {
            headers: {
                "Cache-Control": "public, max-age=604800", // 7 days
                "X-Cache": "MISS",
            },
        })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
