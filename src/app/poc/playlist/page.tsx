"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { QRCodeSVG } from "qrcode.react"

// Fetch video info from our API route
async function fetchYouTubeVideoInfo(videoId: string): Promise<{ title: string; duration: number } | null> {
    try {
        const response = await fetch(`/api/youtube?videoId=${videoId}`)
        if (!response.ok) return null
        const data = await response.json()
        return { title: data.title, duration: data.duration }
    } catch {
        return null
    }
}

// Sample short videos for testing (YouTube Shorts - under 60 seconds)
const SAMPLE_KARAOKE_VIDEOS = [
    { videoId: "56kqc4BeOa8", title: "YouTube Short #1", duration: 30 },
    { videoId: "eDp9FBY8OoY", title: "YouTube Short #2", duration: 30 },
    { videoId: "fOukfwrv4ow", title: "YouTube Short #3", duration: 30 },
    { videoId: "COGNABXQ7TM", title: "YouTube Short #4", duration: 30 },
    { videoId: "3SjvWcaoJC8", title: "YouTube Short #5", duration: 30 },
]

function generateSessionId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

function formatDuration(seconds: number) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m} min`
}

// Token storage utilities
const TOKEN_KEY = "youtube_access_token"
const TOKEN_EXPIRES_KEY = "youtube_token_expires"
const REFRESH_TOKEN_KEY = "youtube_refresh_token"
const TOKEN_LINKED_AT_KEY = "youtube_linked_at"

// Auto-disconnect after X days (0 = never auto-disconnect)
const AUTO_DISCONNECT_DAYS = 30

function getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    const token = localStorage.getItem(TOKEN_KEY)
    const expiresStr = localStorage.getItem(TOKEN_EXPIRES_KEY)
    if (!token || !expiresStr) return null
    const expires = parseInt(expiresStr, 10)
    if (Date.now() > expires - 60000) return null // Expire 1 min early
    
    // Check if auto-disconnect period has passed
    if (AUTO_DISCONNECT_DAYS > 0) {
        const linkedAt = localStorage.getItem(TOKEN_LINKED_AT_KEY)
        if (linkedAt) {
            const linkedDate = parseInt(linkedAt, 10)
            const daysSinceLinked = (Date.now() - linkedDate) / (1000 * 60 * 60 * 24)
            if (daysSinceLinked > AUTO_DISCONNECT_DAYS) {
                clearStoredTokens()
                return null
            }
        }
    }
    
    return token
}

function getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function getTokenAge(): { days: number; linkedAt: Date | null } {
    if (typeof window === "undefined") return { days: 0, linkedAt: null }
    const linkedAt = localStorage.getItem(TOKEN_LINKED_AT_KEY)
    if (!linkedAt) return { days: 0, linkedAt: null }
    const linkedDate = parseInt(linkedAt, 10)
    const days = Math.floor((Date.now() - linkedDate) / (1000 * 60 * 60 * 24))
    return { days, linkedAt: new Date(linkedDate) }
}

function clearStoredTokens(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRES_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_LINKED_AT_KEY)
}

function storeToken(token: string, expiresIn: number, refreshToken?: string) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(TOKEN_EXPIRES_KEY, (Date.now() + expiresIn * 1000).toString())
    // Only set linked date if not already set (first link)
    if (!localStorage.getItem(TOKEN_LINKED_AT_KEY)) {
        localStorage.setItem(TOKEN_LINKED_AT_KEY, Date.now().toString())
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
}

async function tryRefreshToken(): Promise<string | null> {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) return null
    
    try {
        const response = await fetch("/api/youtube/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        })
        
        if (!response.ok) return null
        
        const data = await response.json()
        storeToken(data.access_token, data.expires_in)
        return data.access_token
    } catch {
        return null
    }
}

export default function PlaylistPOC() {
    const [sessionId, setSessionId] = useState<string>("")
    const [mode, setMode] = useState<"select" | "display" | "controller">("select")
    const [singerName, setSingerName] = useState("")
    const [customVideoUrl, setCustomVideoUrl] = useState("")
    const [joinCode, setJoinCode] = useState("")
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isCheckingToken, setIsCheckingToken] = useState(true)
    
    // Query session status when sessionId is set (for launch page room status)
    const sessionStatus = useQuery(
        api.karaoke.getSession, 
        sessionId ? { sessionId } : "skip"
    )

    // Check for stored token on mount, try refresh if expired
    useEffect(() => {
        async function checkToken() {
            setIsCheckingToken(true)
            
            // First try stored access token
            const token = getStoredToken()
            if (token) {
                setAccessToken(token)
                setIsCheckingToken(false)
                return
            }
            
            // If no valid access token, try to refresh
            const refreshedToken = await tryRefreshToken()
            if (refreshedToken) {
                setAccessToken(refreshedToken)
            }
            
            setIsCheckingToken(false)
        }
        
        checkToken()
    }, [])

    // Parse URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const urlSession = params.get("session")
        const urlMode = params.get("mode")

        // Check for OAuth callback token
        const token = params.get("token")
        const expiresIn = params.get("expires_in")
        const refreshToken = params.get("refresh_token")
        if (token && expiresIn) {
            storeToken(token, parseInt(expiresIn, 10), refreshToken || undefined)
            setAccessToken(token)
            // Clean URL
            const cleanUrl = new URL(window.location.href)
            cleanUrl.searchParams.delete("token")
            cleanUrl.searchParams.delete("expires_in")
            cleanUrl.searchParams.delete("refresh_token")
            window.history.replaceState({}, "", cleanUrl.toString())
        }

        if (urlSession) {
            setSessionId(urlSession)
            if (urlMode === "display") setMode("display")
            else if (urlMode === "controller") setMode("controller")
        }
    }, [])

    const handleConnectYouTube = () => {
        // Redirect to YouTube OAuth, preserving session state
        const returnUrl = new URL(window.location.href)
        window.location.href = `/api/youtube/auth?returnUrl=${encodeURIComponent(returnUrl.toString())}`
    }
    
    const handleDisconnectYouTube = () => {
        if (confirm("Disconnect YouTube account? You'll need to reconnect to create new playlists.")) {
            clearStoredTokens()
            setAccessToken(null)
        }
    }

    if (mode === "select") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                            🎤 Karaoke Playlist
                        </h1>
                        <p className="text-gray-400">Using real YouTube playlists via API</p>
                        <p className="text-sm text-green-400 mt-2">
                            Songs auto-play seamlessly - add while playing!
                        </p>
                    </div>

                    {/* YouTube Connection Status - wait for room status to load if session exists */}
                    {sessionId && sessionStatus === undefined ? (
                        <div className="p-4 rounded-xl border bg-gray-900/30 border-gray-500">
                            <div className="flex items-center gap-3 justify-center">
                                <span className="animate-spin text-2xl">⏳</span>
                                <p className="text-gray-300">Checking room status...</p>
                            </div>
                        </div>
                    ) : sessionStatus?.youtubePlaylistId ? (
                        <div className="p-4 rounded-xl border bg-green-900/30 border-green-500">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🎵</span>
                                <div>
                                    <p className="font-semibold text-green-300">Room Has Active Playlist</p>
                                    <p className="text-sm text-green-400/70">You can add songs without connecting YouTube</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-4 rounded-xl border ${accessToken ? "bg-green-900/30 border-green-500" : isCheckingToken ? "bg-gray-900/30 border-gray-500" : "bg-yellow-900/30 border-yellow-500"}`}>
                            {isCheckingToken ? (
                                <div className="flex items-center gap-3 justify-center">
                                    <span className="animate-spin text-2xl">⏳</span>
                                    <p className="text-gray-300">Checking YouTube connection...</p>
                                </div>
                            ) : accessToken ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">✅</span>
                                        <div>
                                            <p className="font-semibold text-green-300">YouTube Connected</p>
                                            <p className="text-sm text-green-400/70">
                                                {(() => {
                                                    const { days } = getTokenAge()
                                                    if (days === 0) return "Linked today"
                                                    if (days === 1) return "Linked 1 day ago"
                                                    return `Linked ${days} days ago`
                                                })()}
                                                {AUTO_DISCONNECT_DAYS > 0 && (
                                                    <span className="text-gray-500"> • auto-unlinks in {AUTO_DISCONNECT_DAYS - getTokenAge().days}d</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDisconnectYouTube}
                                        className="text-sm text-red-400 hover:text-red-300 hover:underline"
                                    >
                                        Unlink
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-yellow-300 mb-3">Connect YouTube to create playlists</p>
                                    <button
                                        onClick={handleConnectYouTube}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold flex items-center gap-2 mx-auto transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        Connect YouTube
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {!sessionId ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    const newId = generateSessionId()
                                    setSessionId(newId)
                                    window.history.replaceState({}, "", `?session=${newId}`)
                                }}
                                disabled={!accessToken}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 rounded-xl font-bold text-lg transition-all"
                            >
                                🎉 Create New Session
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-gray-900 text-gray-500">or join existing</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter code"
                                    maxLength={6}
                                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={() => {
                                        setSessionId(joinCode)
                                        window.history.replaceState({}, "", `?session=${joinCode}`)
                                    }}
                                    disabled={joinCode.length < 4}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                                <p className="text-gray-400 text-sm mb-2">Session Code</p>
                                <p className="text-4xl font-mono font-bold tracking-widest text-purple-400">{sessionId}</p>
                                
                                {/* QR Code - Always visible */}
                                <div className="mt-4">
                                    <div className="bg-white p-3 rounded-xl inline-block">
                                        <QRCodeSVG
                                            value={typeof window !== 'undefined' ? `${window.location.origin}/poc/playlist?session=${sessionId}` : ''}
                                            size={140}
                                            level="M"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <p className="text-gray-500 text-xs mt-2">Scan to join on phone</p>
                                </div>
                            </div>
                            
                            {/* Room Status */}
                            {sessionStatus === undefined ? (
                                <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                                    <div className="flex items-center gap-3 justify-center text-gray-400">
                                        <span className="animate-spin">⏳</span>
                                        <span>Loading room status...</span>
                                    </div>
                                </div>
                            ) : sessionStatus === null ? (
                                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🆕</span>
                                        <div>
                                            <p className="font-medium text-blue-300">New Room</p>
                                            <p className="text-sm text-blue-400/70">This room will be created when you enter</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`rounded-xl p-4 border ${
                                    sessionStatus.youtubePlaylistId 
                                        ? "bg-green-900/30 border-green-500/50" 
                                        : sessionStatus.pendingQueue.length > 0
                                            ? "bg-purple-900/30 border-purple-500/50"
                                            : "bg-gray-800/30 border-gray-700"
                                }`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {sessionStatus.youtubePlaylistId ? "🎵" : sessionStatus.pendingQueue.length > 0 ? "📝" : "🎤"}
                                        </span>
                                        <div className="flex-1">
                                            <p className={`font-medium ${
                                                sessionStatus.youtubePlaylistId 
                                                    ? "text-green-300" 
                                                    : sessionStatus.pendingQueue.length > 0
                                                        ? "text-purple-300"
                                                        : "text-gray-300"
                                            }`}>
                                                {sessionStatus.youtubePlaylistId 
                                                    ? "Playlist Active" 
                                                    : sessionStatus.pendingQueue.length > 0
                                                        ? "Queue Building"
                                                        : "Room Ready"}
                                            </p>
                                            <p className={`text-sm ${
                                                sessionStatus.youtubePlaylistId 
                                                    ? "text-green-400/70" 
                                                    : sessionStatus.pendingQueue.length > 0
                                                        ? "text-purple-400/70"
                                                        : "text-gray-400"
                                            }`}>
                                                {sessionStatus.youtubePlaylistId 
                                                    ? `${sessionStatus.playingBatch.length} songs playing` 
                                                    : sessionStatus.pendingQueue.length > 0
                                                        ? `${sessionStatus.pendingQueue.length} songs queued`
                                                        : "No songs yet"}
                                            </p>
                                        </div>
                                        {(sessionStatus.playingBatch.length > 0 || sessionStatus.pendingQueue.length > 0) && (
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-white">
                                                    {sessionStatus.playingBatch.length + sessionStatus.pendingQueue.length}
                                                </p>
                                                <p className="text-xs text-gray-500">total</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setMode("controller")}
                                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-500/30"
                            >
                                📱 Controller Mode (Phone)
                            </button>

                            <button
                                onClick={() => setMode("display")}
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-base transition-all flex items-center justify-center gap-2 text-gray-300"
                            >
                                📺 Display Mode (TV/Projector)
                            </button>

                            <button
                                onClick={() => {
                                    setSessionId("")
                                    window.history.replaceState({}, "", window.location.pathname)
                                }}
                                className="w-full py-2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <SessionView
            sessionId={sessionId}
            mode={mode}
            singerName={singerName}
            setSingerName={setSingerName}
            customVideoUrl={customVideoUrl}
            setCustomVideoUrl={setCustomVideoUrl}
            accessToken={accessToken}
            onBack={() => setMode("select")}
        />
    )
}

function SessionView({
    sessionId,
    mode,
    singerName,
    setSingerName,
    customVideoUrl,
    setCustomVideoUrl,
    accessToken,
    onBack,
}: {
    sessionId: string
    mode: "display" | "controller"
    singerName: string
    setSingerName: (name: string) => void
    customVideoUrl: string
    setCustomVideoUrl: (url: string) => void
    accessToken: string | null
    onBack: () => void
}) {
    const session = useQuery(api.karaoke.getSession, { sessionId })
    
    // Derived state from session
    const playingBatch = session?.playingBatch || []
    const pendingQueue = session?.pendingQueue || []
    const hasPlaylist = !!session?.youtubePlaylistId
    
    const createSession = useMutation(api.karaoke.createSession)
    const addToQueue = useMutation(api.karaoke.addToQueue)
    const removeFromQueue = useMutation(api.karaoke.removeFromQueue)
    const setYouTubePlaylist = useMutation(api.karaoke.setYouTubePlaylist)
    const addToPlayingBatch = useMutation(api.karaoke.addToPlayingBatch)
    const removeFromPlayingBatch = useMutation(api.karaoke.removeFromPlayingBatch)
    const clearPlaylist = useMutation(api.karaoke.clearPlaylist)
    const [isClearingPlaylist, setIsClearingPlaylist] = useState(false)

    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
    const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false)
    const [playlistOpened, setPlaylistOpened] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean
        title: string
        songTitle: string
        onConfirm: () => void
    } | null>(null)
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<{
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
        viewCount?: number
        likeCount?: number
        isHD?: boolean
    }[]>([])
    const [isSearching, setIsSearching] = useState(false)
    
    // Category browse state
    const [showCategories, setShowCategories] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [categoryResults, setCategoryResults] = useState<{
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
        viewCount?: number
        isHD?: boolean
    }[]>([])
    const [isBrowsing, setIsBrowsing] = useState(false)
    const [categoryNextPageToken, setCategoryNextPageToken] = useState<string | null>(null)
    const [isLoadingMoreCategory, setIsLoadingMoreCategory] = useState(false)
    
    // Artist browse state
    const [showArtists, setShowArtists] = useState(false)
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
    const [artistResults, setArtistResults] = useState<{
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
        viewCount?: number
        isHD?: boolean
    }[]>([])
    const [isBrowsingArtist, setIsBrowsingArtist] = useState(false)
    const [artistNextPageToken, setArtistNextPageToken] = useState<string | null>(null)
    const [isLoadingMoreArtist, setIsLoadingMoreArtist] = useState(false)
    
    // Search pagination state
    const [searchNextPageToken, setSearchNextPageToken] = useState<string | null>(null)
    const [isLoadingMoreSearch, setIsLoadingMoreSearch] = useState(false)
    
    // Refs for infinite scroll
    const searchScrollRef = useRef<HTMLDivElement>(null)
    const categoryScrollRef = useRef<HTMLDivElement>(null)
    const artistScrollRef = useRef<HTMLDivElement>(null)
    
    // Toast notification for added songs
    const [addedSongToast, setAddedSongToast] = useState<{
        title: string
        singer: string
        videoId: string
        isLive: boolean
        queuePosition: number
    } | null>(null)
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    
    // Cache management state (admin only - controller mode)
    const [cacheStats, setCacheStats] = useState<{
        entries: number
        oldestAgeHuman: string | null
        newestAgeHuman: string | null
    } | null>(null)
    const [isClearingCache, setIsClearingCache] = useState(false)
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    
    // Fetch cache stats when admin panel is opened
    const fetchCacheStats = async () => {
        try {
            const response = await fetch("/api/youtube/cache")
            if (response.ok) {
                const stats = await response.json()
                setCacheStats(stats)
            }
        } catch (error) {
            console.error("Failed to fetch cache stats:", error)
        }
    }
    
    const handleClearCache = async () => {
        setIsClearingCache(true)
        try {
            const response = await fetch("/api/youtube/cache", { method: "DELETE" })
            if (response.ok) {
                const result = await response.json()
                setCacheStats({ entries: 0, oldestAgeHuman: null, newestAgeHuman: null })
                setError(null)
                // Show success briefly
                setError(`✓ Cleared ${result.cleared} cached entries`)
                setTimeout(() => setError(null), 3000)
            } else {
                setError("Failed to clear cache")
            }
        } catch (error) {
            console.error("Failed to clear cache:", error)
            setError("Failed to clear cache")
        } finally {
            setIsClearingCache(false)
        }
    }
    
    // Karaoke categories
    const KARAOKE_CATEGORIES = [
        { id: "vietnamese", name: "Việt Nam 🎤", emoji: "🇻🇳", query: "vietnamese karaoke classics" },
        { id: "kpop", name: "K-Pop 한국", emoji: "💜", query: "kpop korean pop" },
        { id: "pop", name: "Pop Hits", emoji: "🎵", query: "pop hits" },
        { id: "rock", name: "Rock Classics", emoji: "🎸", query: "rock classics" },
        { id: "80s", name: "80s Music", emoji: "🪩", query: "80s hits" },
        { id: "90s", name: "90s Throwback", emoji: "📀", query: "90s hits" },
        { id: "2000s", name: "2000s Hits", emoji: "💿", query: "2000s hits" },
        { id: "2010s", name: "2010s Hits", emoji: "📱", query: "2010s hits" },
        { id: "2020s", name: "2020s Hits", emoji: "🎧", query: "2020s hits" },
        { id: "disco", name: "Disco", emoji: "🕺", query: "disco" },
        { id: "rnb", name: "R&B / Soul", emoji: "💜", query: "r&b soul" },
        { id: "hiphop", name: "Hip Hop", emoji: "🔥", query: "hip hop" },
        { id: "country", name: "Country", emoji: "🤠", query: "country" },
        { id: "ballads", name: "Ballads", emoji: "💕", query: "ballad love songs" },
        { id: "party", name: "Party Anthems", emoji: "🎊", query: "party anthem" },
        { id: "duets", name: "Duets", emoji: "👫", query: "duet" },
        { id: "disney", name: "Disney", emoji: "🏰", query: "disney" },
        { id: "musicals", name: "Musicals", emoji: "🎭", query: "broadway musical" },
        { id: "motown", name: "Motown", emoji: "🎷", query: "motown" },
        { id: "diva", name: "Diva Anthems", emoji: "👑", query: "diva anthem" },
        { id: "boyband", name: "Boy Bands", emoji: "🕺🕺", query: "boy band" },
        { id: "girlpower", name: "Girl Power", emoji: "💅", query: "girl power pop" },
        { id: "wedding", name: "Wedding Songs", emoji: "💒", query: "wedding first dance" },
        { id: "christmas", name: "Christmas", emoji: "🎄", query: "christmas" },
    ]

    const KARAOKE_ARTISTS = [
        { id: "adele", name: "Adele", emoji: "🎙️" },
        { id: "beyonce", name: "Beyoncé", emoji: "👑" },
        { id: "queen", name: "Queen", emoji: "👸" },
        { id: "eltonjohn", name: "Elton John", emoji: "🎹" },
        { id: "abba", name: "ABBA", emoji: "✨" },
        { id: "beatles", name: "The Beatles", emoji: "🎵" },
        { id: "taylorswift", name: "Taylor Swift", emoji: "💫" },
        { id: "brunomars", name: "Bruno Mars", emoji: "🎤" },
        { id: "michaeljackson", name: "Michael Jackson", emoji: "🕺" },
        { id: "ladygaga", name: "Lady Gaga", emoji: "🌟" },
        { id: "ed-sheeran", name: "Ed Sheeran", emoji: "🎸" },
        { id: "whitney", name: "Whitney Houston", emoji: "🎙️" },
        { id: "coldplay", name: "Coldplay", emoji: "🌈" },
        { id: "journey", name: "Journey", emoji: "🚀" },
        { id: "bonJovi", name: "Bon Jovi", emoji: "🤘" },
        { id: "mariah", name: "Mariah Carey", emoji: "🦋" },
        { id: "celine", name: "Celine Dion", emoji: "❤️" },
        { id: "bts", name: "BTS", emoji: "💜" },
        { id: "blackpink", name: "BLACKPINK", emoji: "🖤💗" },
        { id: "dualiapa", name: "Dua Lipa", emoji: "💃" },
        { id: "theweeknd", name: "The Weeknd", emoji: "🌙" },
        { id: "rihanna", name: "Rihanna", emoji: "💎" },
        { id: "drake", name: "Drake", emoji: "🦉" },
        { id: "billie", name: "Billie Eilish", emoji: "🖤" },
    ]

    // Create session if it doesn't exist
    useEffect(() => {
        if (session === null) {
            createSession({ sessionId })
        }
    }, [session, sessionId, createSession])
    
    // Auto-prompt YouTube connection if there are pending songs and no auth token
    useEffect(() => {
        if (session && hasPlaylist && pendingQueue.length > 0 && !accessToken && mode === "controller") {
            const shouldConnect = confirm(
                `You have ${pendingQueue.length} pending song${pendingQueue.length > 1 ? 's' : ''} waiting to be added to the YouTube playlist.\n\n` +
                `Connect your YouTube account to add them?`
            )
            if (shouldConnect) {
                const returnUrl = new URL(window.location.href)
                window.location.href = `/api/youtube/auth?returnUrl=${encodeURIComponent(returnUrl.toString())}`
            }
        }
    }, [session, hasPlaylist, pendingQueue.length, accessToken, mode])

    const extractVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/,
        ]
        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    // Auto-load limit - after this, user must click to load more
    const AUTO_LOAD_LIMIT = 100

    // Infinite scroll handlers (auto-load up to 100 results)
    const handleSearchScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
        // Only auto-load if under 100 results
        if (isNearBottom && searchNextPageToken && !isLoadingMoreSearch && !isSearching && searchResults.length < AUTO_LOAD_LIMIT) {
            handleSearch(true)
        }
    }, [searchNextPageToken, isLoadingMoreSearch, isSearching, searchResults.length])
    
    const handleCategoryScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
        // Only auto-load if under 100 results
        if (isNearBottom && categoryNextPageToken && !isLoadingMoreCategory && !isBrowsing && selectedCategory && categoryResults.length < AUTO_LOAD_LIMIT) {
            const cat = KARAOKE_CATEGORIES.find(c => c.id === selectedCategory)
            if (cat) handleBrowseCategory(cat, true)
        }
    }, [categoryNextPageToken, isLoadingMoreCategory, isBrowsing, selectedCategory, categoryResults.length])
    
    const handleArtistScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100
        // Only auto-load if under 100 results
        if (isNearBottom && artistNextPageToken && !isLoadingMoreArtist && !isBrowsingArtist && selectedArtist && artistResults.length < AUTO_LOAD_LIMIT) {
            const artist = KARAOKE_ARTISTS.find(a => a.id === selectedArtist)
            if (artist) handleBrowseArtist(artist, true)
        }
    }, [artistNextPageToken, isLoadingMoreArtist, isBrowsingArtist, selectedArtist, artistResults.length])

    // Create YouTube playlist via API
    const createPlaylist = useCallback(async (): Promise<string | null> => {
        if (!accessToken) {
            setError("YouTube not connected. Please connect YouTube first.")
            return null
        }

        setIsCreatingPlaylist(true)
        setError(null)

        try {
            const response = await fetch("/api/karaoke/playlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    sessionId,
                    title: `Karaoke Session ${sessionId}`,
                    description: "Created by Karaoke Queue POC",
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to create playlist")
            }

            const data = await response.json()
            await setYouTubePlaylist({ sessionId, playlistId: data.playlistId })
            
            return data.playlistId
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create playlist")
            return null
        } finally {
            setIsCreatingPlaylist(false)
        }
    }, [accessToken, sessionId, setYouTubePlaylist])

    // Add video to YouTube playlist via API
    const addVideoToPlaylist = useCallback(async (
        playlistId: string,
        videoId: string,
        title: string,
        singer: string,
        duration: number
    ): Promise<boolean> => {
        // Try with token if available, otherwise will fail gracefully
        if (!accessToken) {
            return false
        }

        setIsAddingToPlaylist(true)
        setError(null)

        try {
            const response = await fetch("/api/karaoke/playlist/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ playlistId, videoId }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to add video")
            }

            const data = await response.json()
            
            // Add to our playing batch with the playlistItemId
            await addToPlayingBatch({
                sessionId,
                videoId,
                title,
                singer,
                duration,
                playlistItemId: data.playlistItemId,
            })

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add video")
            return false
        } finally {
            setIsAddingToPlaylist(false)
        }
    }, [accessToken, sessionId, addToPlayingBatch])

    // Show toast notification for added song
    const showAddedToast = (title: string, singer: string, videoId: string, isLive: boolean, queuePosition: number) => {
        // Clear any existing timeout
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }
        
        setAddedSongToast({ title, singer, videoId, isLive, queuePosition })
        
        // Auto-dismiss after 3 seconds
        toastTimeoutRef.current = setTimeout(() => {
            setAddedSongToast(null)
        }, 3000)
    }

    // Handle adding song - try playlist first if it exists, fallback to pending
    const handleAddSong = async (videoId: string, title: string, duration = 240) => {
        const singer = singerName || "Anonymous"
        const hasPlaylist = !!session?.youtubePlaylistId
        const currentQueueLength = hasPlaylist ? (session?.playingBatch?.length || 0) : (session?.pendingQueue?.length || 0)

        // If playlist exists, try to add to it (will work if any user has token)
        if (session?.youtubePlaylistId) {
            const success = await addVideoToPlaylist(session.youtubePlaylistId, videoId, title, singer, duration)
            if (success) {
                showAddedToast(title, singer, videoId, true, currentQueueLength + 1)
                return
            }
            // If failed, fall through to pending queue
        }
        
        // Add to pending queue (no playlist or adding to playlist failed)
        await addToQueue({
            sessionId,
            videoId,
            title,
            singer,
            duration,
        })
        showAddedToast(title, singer, videoId, false, currentQueueLength + 1)
    }

    const handleAddCustom = async () => {
        const videoId = extractVideoId(customVideoUrl)
        if (videoId) {
            const info = await fetchYouTubeVideoInfo(videoId)
            await handleAddSong(videoId, info?.title || "Custom Song", info?.duration || 240)
            setCustomVideoUrl("")
        }
    }

    // Search for songs using YouTube Data API (adds "karaoke" to query for better results)
    const handleSearch = async (loadMore = false) => {
        if (!searchQuery.trim()) return
        
        if (loadMore) {
            setIsLoadingMoreSearch(true)
        } else {
            setIsSearching(true)
            setSearchResults([])
            setSearchNextPageToken(null)
        }
        setError(null)
        
        try {
            let url = `/api/youtube/search?q=${encodeURIComponent(searchQuery)}`
            if (loadMore && searchNextPageToken) {
                url += `&pageToken=${encodeURIComponent(searchNextPageToken)}`
            }
            
            const response = await fetch(url)
            
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Search failed")
            }
            
            const data = await response.json()
            if (loadMore) {
                setSearchResults(prev => [...prev, ...data.items])
            } else {
                setSearchResults(data.items)
            }
            setSearchNextPageToken(data.nextPageToken)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Search failed")
            if (!loadMore) setSearchResults([])
        } finally {
            setIsSearching(false)
            setIsLoadingMoreSearch(false)
        }
    }

    // Add song from search results
    const handleAddFromSearch = async (result: {
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
    }) => {
        await handleAddSong(result.videoId, result.title, result.duration_seconds)
        // Don't clear search results - let user continue adding
    }

    // Browse category for songs
    const handleBrowseCategory = async (category: { id: string; name: string; query: string }, loadMore = false) => {
        setSelectedCategory(category.id)
        
        if (loadMore) {
            setIsLoadingMoreCategory(true)
        } else {
            setIsBrowsing(true)
            setCategoryResults([])
            setCategoryNextPageToken(null)
        }
        setError(null)
        
        try {
            let url = `/api/youtube/search?q=${encodeURIComponent(category.query)}`
            if (loadMore && categoryNextPageToken) {
                url += `&pageToken=${encodeURIComponent(categoryNextPageToken)}`
            }
            
            const response = await fetch(url)
            
            if (!response.ok) {
                throw new Error("Failed to browse category")
            }
            
            const data = await response.json()
            if (loadMore) {
                setCategoryResults(prev => [...prev, ...data.items])
            } else {
                setCategoryResults(data.items)
            }
            setCategoryNextPageToken(data.nextPageToken)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Browse failed")
            if (!loadMore) setCategoryResults([])
        } finally {
            setIsBrowsing(false)
            setIsLoadingMoreCategory(false)
        }
    }

    // Browse artist for songs
    const handleBrowseArtist = async (artist: { id: string; name: string }, loadMore = false) => {
        setSelectedArtist(artist.id)
        
        if (loadMore) {
            setIsLoadingMoreArtist(true)
        } else {
            setIsBrowsingArtist(true)
            setArtistResults([])
            setArtistNextPageToken(null)
        }
        setError(null)
        
        try {
            let url = `/api/youtube/search?q=${encodeURIComponent(artist.name)}`
            if (loadMore && artistNextPageToken) {
                url += `&pageToken=${encodeURIComponent(artistNextPageToken)}`
            }
            
            const response = await fetch(url)
            
            if (!response.ok) {
                throw new Error("Failed to browse artist")
            }
            
            const data = await response.json()
            if (loadMore) {
                setArtistResults(prev => [...prev, ...data.items])
            } else {
                setArtistResults(data.items)
            }
            setArtistNextPageToken(data.nextPageToken)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Browse failed")
            if (!loadMore) setArtistResults([])
        } finally {
            setIsBrowsingArtist(false)
            setIsLoadingMoreArtist(false)
        }
    }

    // Add song from artist results
    const handleAddFromArtist = async (result: {
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
    }) => {
        await handleAddSong(result.videoId, result.title, result.duration_seconds)
    }

    // Add song from category results
    const handleAddFromCategory = async (result: {
        videoId: string
        title: string
        artists: { name: string }[]
        duration_seconds: number
    }) => {
        await handleAddSong(result.videoId, result.title, result.duration_seconds)
    }

    // Start karaoke - create playlist and add pending songs
    const handleStartKaraoke = async () => {
        // Create playlist
        const playlistId = await createPlaylist()
        if (!playlistId) return

        // Add all pending songs to the playlist
        if (session?.pendingQueue) {
            for (const song of session.pendingQueue) {
                await addVideoToPlaylist(playlistId, song.videoId, song.title, song.singer, song.duration)
                // Remove from pending queue
                await removeFromQueue({ sessionId, songId: song.id })
            }
        }

        // Open the playlist in YouTube with loop enabled
        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}&loop=1`
        window.open(playlistUrl, "karaoke-youtube")
        setPlaylistOpened(true)
    }

    // Open existing playlist
    const handleOpenPlaylist = () => {
        if (session?.youtubePlaylistId) {
            const playlistUrl = `https://www.youtube.com/playlist?list=${session.youtubePlaylistId}&loop=1`
            window.open(playlistUrl, "karaoke-youtube")
            setPlaylistOpened(true)
        }
    }

    if (session === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading session...</div>
            </div>
        )
    }

    // DISPLAY MODE
    if (mode === "display") {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-gray-400 hover:text-white">←</button>
                        <h1 className="text-xl font-bold">🎤 Karaoke Playlist</h1>
                        {hasPlaylist && (
                            <span className="text-sm text-green-400 bg-green-900/30 px-2 py-1 rounded">
                                ✓ Playlist Active
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Join:</span>
                        <span className="font-mono text-2xl font-bold text-purple-400">{sessionId}</span>
                    </div>
                </header>

                {/* Error Banner */}
                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
                        ⚠️ {error}
                    </div>
                )}

                <main className="flex-1 flex">
                    {/* Main Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {hasPlaylist ? (
                            <div className="w-full max-w-3xl space-y-6">
                                {/* Playlist Active State */}
                                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl p-8 border border-green-500/50 text-center">
                                    <p className="text-6xl mb-4">🎵</p>
                                    <h2 className="text-2xl font-bold text-green-300 mb-2">Playlist Active!</h2>
                                    <p className="text-gray-400 mb-6">
                                        {playingBatch.length} songs in playlist
                                    </p>
                                    
                                    {!playlistOpened ? (
                                        <button
                                            onClick={handleOpenPlaylist}
                                            className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-xl transition-colors flex items-center gap-3 mx-auto"
                                        >
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                            </svg>
                                            Open YouTube Playlist
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-green-400">
                                                ✓ Playlist opened - songs are playing in YouTube
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                New songs added will automatically appear in the playlist
                                            </p>
                                            <button
                                                onClick={handleOpenPlaylist}
                                                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                                            >
                                                Re-open Playlist
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Playlist Contents */}
                                <div className="bg-gray-900/50 rounded-xl p-4">
                                    <h3 className="text-lg font-semibold text-purple-300 mb-3">
                                        Playlist Songs ({playingBatch.length})
                                    </h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {playingBatch.map((song, index) => (
                                            <div key={song.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                                                <span className="text-lg font-bold text-gray-500 w-6">{index + 1}</span>
                                                <img
                                                    src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                                    alt={song.title}
                                                    className="w-12 h-9 rounded object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm truncate">{song.title}</p>
                                                    <p className="text-xs text-purple-400">🎤 {song.singer}</p>
                                                </div>
                                                <span className="text-xs text-gray-500">{formatTime(song.duration)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-8xl mb-6">🎵</p>
                                {pendingQueue.length > 0 ? (
                                    <>
                                        <p className="text-3xl text-gray-300 mb-4">
                                            {pendingQueue.length} songs ready
                                        </p>
                                        <p className="text-gray-500 mb-8">
                                            Total: {formatDuration(pendingQueue.reduce((s, song) => s + song.duration, 0))}
                                        </p>
                                        <button
                                            onClick={handleStartKaraoke}
                                            disabled={isCreatingPlaylist || !accessToken}
                                            className="px-12 py-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 rounded-2xl font-bold text-2xl transition-all flex items-center gap-4 mx-auto"
                                        >
                                            {isCreatingPlaylist ? (
                                                <span className="animate-spin">⏳</span>
                                            ) : (
                                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                </svg>
                                            )}
                                            {isCreatingPlaylist ? "Creating Playlist..." : "Start Karaoke"}
                                        </button>
                                        <p className="text-sm text-gray-600 mt-4">
                                            Creates a YouTube playlist with your songs
                                        </p>
                                        {!accessToken && (
                                            <p className="text-sm text-yellow-500 mt-2">
                                                ⚠️ Please connect YouTube first
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="text-3xl text-gray-400 mb-4">Waiting for songs...</p>
                                        <p className="text-xl text-gray-600">
                                            Join with code: <span className="font-mono text-purple-400">{sessionId}</span>
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 bg-gray-900/50 border-l border-gray-800 p-4 overflow-y-auto">
                        {/* Pending Queue */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-400 mb-3">
                                ⏳ Pending ({pendingQueue.length})
                            </h2>
                            {pendingQueue.length === 0 ? (
                                <p className="text-gray-600 text-center py-4">
                                    {hasPlaylist ? "Songs are added directly to playlist" : "No songs pending"}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {pendingQueue.map((song, index) => (
                                        <div key={song.id} className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg">
                                            <span className="text-lg font-bold text-gray-600">{index + 1}</span>
                                            <img
                                                src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                                alt={song.title}
                                                className="w-12 h-9 rounded object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm truncate">{song.title}</p>
                                                <p className="text-xs text-purple-400">{song.singer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                {/* QR Code Footer - visible when scrolled to bottom */}
                <footer className="bg-gray-900/80 border-t border-gray-800 py-8">
                    <div className="flex flex-col items-center justify-center gap-3">
                        <p className="text-gray-400 text-sm">Scan to join on your phone</p>
                        <div className="bg-white p-4 rounded-xl">
                            <QRCodeSVG
                                value={typeof window !== 'undefined' ? `${window.location.origin}/poc/playlist?session=${sessionId}` : ''}
                                size={140}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-purple-400 font-mono font-bold text-lg">Room: {sessionId}</p>
                    </div>
                </footer>
            </div>
        )
    }

    // CONTROLLER MODE
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white pb-20">
            {/* Confirmation Modal */}
            {confirmModal?.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setConfirmModal(null)}
                    />
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-sm w-full border border-red-500/30 shadow-2xl animate-scale-in"
                        style={{ animation: 'scaleIn 0.2s ease-out' }}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
                                <span className="text-3xl md:text-4xl">🗑️</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{confirmModal.title}</h3>
                            <p className="text-gray-400 text-base md:text-lg mb-6 line-clamp-2">
                                &ldquo;{confirmModal.songTitle}&rdquo;
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 px-4 py-3 md:py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium text-base md:text-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmModal.onConfirm()
                                        setConfirmModal(null)
                                    }}
                                    className="flex-1 px-4 py-3 md:py-4 bg-red-600 hover:bg-red-500 rounded-xl font-medium text-base md:text-lg transition-colors"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fancy Toast Notification */}
            {addedSongToast && (
                <div 
                    className="fixed top-0 left-0 right-0 z-50 p-4 animate-slide-down"
                    style={{
                        animation: 'slideDown 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards'
                    }}
                >
                    <div className={`max-w-md mx-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-md ${
                        addedSongToast.isLive 
                            ? 'bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/50' 
                            : 'bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border-purple-500/50'
                    }`}>
                        <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={`https://i.ytimg.com/vi/${addedSongToast.videoId}/mqdefault.jpg`}
                                    alt=""
                                    className="w-16 h-12 rounded-lg object-cover"
                                />
                                <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    addedSongToast.isLive 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-purple-500 text-white'
                                }`}
                                    style={{
                                        animation: 'popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                                    }}
                                >
                                    #{addedSongToast.queuePosition}
                                </div>
                            </div>
                            
                            {/* Song Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">
                                    {addedSongToast.title}
                                </p>
                                <p className={`text-xs ${addedSongToast.isLive ? 'text-green-300' : 'text-purple-300'}`}>
                                    🎤 {addedSongToast.singer}
                                </p>
                            </div>
                            
                            {/* Status */}
                            <div className="flex-shrink-0 text-right">
                                {addedSongToast.isLive ? (
                                    <span className="text-xs text-green-400 font-medium">
                                        ✓ Added to Playlist
                                    </span>
                                ) : (
                                    <span className="text-xs text-purple-400 font-medium">
                                        ✓ Added to Queue
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* Progress bar animation */}
                        <div className="mt-3 h-1 bg-black/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${addedSongToast.isLive ? 'bg-green-400' : 'bg-purple-400'}`}
                                style={{
                                    animation: 'shrinkWidth 3s linear forwards'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* CSS for animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes popIn {
                    0% {
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.3);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `}</style>

            <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-purple-500/30 p-4 md:p-6 z-10">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <button onClick={onBack} className="text-gray-400 hover:text-white text-lg md:text-xl">← Back</button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="font-mono text-xl md:text-2xl lg:text-3xl font-bold text-purple-400">{sessionId}</span>
                        {hasPlaylist ? (
                            <span className="text-sm md:text-base text-green-400 bg-green-900/30 px-2 md:px-3 py-1 rounded">🎵 LIVE</span>
                        ) : (
                            <span className="text-sm md:text-base text-gray-400 bg-gray-800 px-2 md:px-3 py-1 rounded">Queuing</span>
                        )}
                    </div>
                    <button 
                        onClick={() => { setShowAdminPanel(!showAdminPanel); if (!showAdminPanel) fetchCacheStats(); }}
                        className="text-gray-400 hover:text-white text-lg md:text-xl"
                        title="Admin Settings"
                    >
                        ⚙️
                    </button>
                </div>
                
                {/* Admin Panel */}
                {showAdminPanel && (
                    <div className="mt-4 max-w-4xl mx-auto bg-gray-800/80 rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-300">🔧 Admin Settings</h3>
                            <button 
                                onClick={() => setShowAdminPanel(false)}
                                className="text-gray-500 hover:text-white"
                            >✕</button>
                        </div>
                        
                        <div className="space-y-3">
                            {/* Cache Management */}
                            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-300">YouTube Search Cache</p>
                                    {cacheStats ? (
                                        <p className="text-xs text-gray-500">
                                            {cacheStats.entries} entries
                                            {cacheStats.oldestAgeHuman && ` • oldest: ${cacheStats.oldestAgeHuman}`}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-500">Loading...</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleClearCache}
                                    disabled={isClearingCache || (cacheStats?.entries === 0)}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {isClearingCache ? "Clearing..." : "Clear Cache"}
                                </button>
                            </div>
                            
                            <p className="text-xs text-gray-600 italic">
                                Cache reduces YouTube API calls. Set CLEAR_YOUTUBE_CACHE_ON_STARTUP=true to clear on restart.
                            </p>
                        </div>
                    </div>
                )}
            </header>

            {/* Error Banner */}
            {error && (
                <div className={`mx-4 md:mx-auto md:max-w-4xl mt-4 p-3 md:p-4 rounded-lg text-base md:text-lg ${
                    error.startsWith("✓") 
                        ? "bg-green-900/50 border border-green-500 text-green-300" 
                        : "bg-red-900/50 border border-red-500 text-red-300"
                }`}>
                    {error.startsWith("✓") ? "" : "⚠️ "}{error}
                </div>
            )}

            {/* Status Banner */}
            {hasPlaylist ? (
                <div className="mx-4 md:mx-auto md:max-w-4xl mt-4 bg-green-900/30 rounded-xl p-4 md:p-5 border border-green-500/30">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <p className="text-base md:text-lg text-green-300 font-medium">Playlist Active</p>
                            <p className="text-sm md:text-base text-green-400/70">Songs you add will play automatically</p>
                        </div>
                        <span className="text-2xl md:text-3xl font-bold text-green-400">{playingBatch.length}</span>
                        <button
                            onClick={() => setConfirmModal({
                                isOpen: true,
                                title: "Clear entire playlist?",
                                songTitle: `${playingBatch.length} songs will be removed and you'll need to create a new playlist`,
                                onConfirm: async () => {
                                    setIsClearingPlaylist(true)
                                    try {
                                        await clearPlaylist({ sessionId })
                                        setError("✓ Playlist cleared")
                                        setTimeout(() => setError(null), 3000)
                                    } catch (err) {
                                        setError(`Failed to clear: ${err}`)
                                    } finally {
                                        setIsClearingPlaylist(false)
                                    }
                                }
                            })}
                            disabled={isClearingPlaylist}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Clear playlist"
                        >
                            {isClearingPlaylist ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mx-4 md:mx-auto md:max-w-4xl mt-4 bg-purple-900/30 rounded-xl p-4 md:p-5 border border-purple-500/30">
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="text-2xl md:text-3xl">📝</span>
                        <div className="flex-1">
                            <p className="text-base md:text-lg text-purple-300 font-medium">Building Queue</p>
                            <p className="text-sm md:text-base text-purple-400/70">Add songs - host will start karaoke when ready</p>
                        </div>
                        {pendingQueue.length > 0 && (
                            <span className="text-2xl md:text-3xl font-bold text-purple-400">{pendingQueue.length}</span>
                        )}
                    </div>
                </div>
            )}

            <main className="p-4 md:p-6 space-y-6 md:space-y-8 max-w-4xl mx-auto">
                {/* Singer Name */}
                <div className="flex gap-2 md:gap-3 items-center">
                    <span className="text-gray-400 text-lg md:text-xl">🎤</span>
                    <input
                        type="text"
                        value={singerName}
                        onChange={(e) => setSingerName(e.target.value)}
                        placeholder="Your name"
                        className="flex-1 px-4 py-3 md:py-4 text-lg md:text-xl bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500"
                    />
                </div>

                {/* Search - Now at top */}
                <div className="bg-gray-800/50 rounded-2xl p-4 md:p-6 border border-purple-500/20">
                    <h2 className="text-xl md:text-2xl font-semibold text-purple-300 mb-3 md:mb-4">🔍 Search Songs</h2>
                    <div className="flex gap-2 md:gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for karaoke songs..."
                                className="w-full px-4 md:px-5 py-3 md:py-4 pr-10 md:pr-12 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 text-lg md:text-xl"
                                onKeyDown={(e) => e.key === "Enter" && handleSearch(false)}
                            />
                            {(searchQuery || searchResults.length > 0) && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSearchResults([])
                                        setSearchNextPageToken(null)
                                    }}
                                    className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 text-lg md:text-xl"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => handleSearch(false)}
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-6 md:px-8 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-xl font-semibold transition-colors text-xl md:text-2xl"
                        >
                            {isSearching ? "..." : "🔍"}
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <>
                            <div className="mt-4 md:mt-6 flex items-center justify-between">
                                <span className="text-base md:text-lg text-gray-400">{searchResults.length} results</span>
                                <button
                                    onClick={() => {
                                        setSearchQuery("")
                                        setSearchResults([])
                                        setSearchNextPageToken(null)
                                    }}
                                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                >
                                    ✕ Clear Results
                                </button>
                            </div>
                            <div 
                                ref={searchScrollRef}
                                onScroll={handleSearchScroll}
                                className="mt-3 md:mt-4 space-y-2 md:space-y-3 max-h-[60vh] overflow-y-auto"
                            >
                                {searchResults.map((result) => {
                                    const isKaraoke = result.title.toLowerCase().includes("karaoke")
                                    const formatViews = (count?: number) => {
                                        if (!count) return ""
                                        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
                                    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`
                                    return count.toString()
                                }
                                return (
                                    <button
                                        key={result.videoId}
                                        onClick={() => handleAddFromSearch(result)}
                                        disabled={isAddingToPlaylist}
                                        className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl text-left transition-colors ${
                                            isKaraoke 
                                                ? "bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30" 
                                                : "bg-gray-900/50 hover:bg-gray-800"
                                        } disabled:opacity-50`}
                                    >
                                        <div className="relative">
                                            <img
                                                src={`https://i.ytimg.com/vi/${result.videoId}/default.jpg`}
                                                alt={result.title}
                                                className="w-20 h-14 md:w-24 md:h-16 rounded-lg object-cover"
                                            />
                                            {result.isHD && (
                                                <span className="absolute bottom-0 right-0 bg-blue-600 text-[10px] md:text-xs px-1 rounded-sm font-bold">HD</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base md:text-lg font-medium truncate">
                                                {isKaraoke && <span className="text-purple-400 mr-1">🎤</span>}
                                                {result.title}
                                            </p>
                                            <p className="text-sm md:text-base text-gray-400 truncate">
                                                {result.artists.map(a => a.name).join(", ")}
                                                {result.duration_seconds > 0 && ` • ${formatTime(result.duration_seconds)}`}
                                                {result.viewCount && ` • ${formatViews(result.viewCount)} views`}
                                            </p>
                                        </div>
                                        <span className="text-purple-400 text-2xl md:text-3xl">+</span>
                                    </button>
                                )
                            })}
                            {/* Auto-loading indicator for Search */}
                            {searchNextPageToken && (
                                <div className="w-full py-4 text-center">
                                    {isLoadingMoreSearch ? (
                                        <span className="animate-pulse text-base md:text-lg text-gray-500">Loading more...</span>
                                    ) : searchResults.length >= 100 ? (
                                        <button
                                            onClick={() => handleSearch(true)}
                                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium text-base md:text-lg transition-colors"
                                        >
                                            Load More Results ({searchResults.length}+)
                                        </button>
                                    ) : (
                                        <span className="text-sm md:text-base text-gray-500">Scroll for more • {searchResults.length} results</span>
                                    )}
                                </div>
                            )}
                        </div>
                        </>
                    )}
                </div>

                {/* Browse by Category */}
                <div className="bg-gray-800/50 rounded-2xl p-4 md:p-6 border border-purple-500/20">
                    <button 
                        onClick={() => { setShowCategories(!showCategories); setSelectedCategory(null); setCategoryResults([]) }}
                        className="w-full flex items-center justify-between text-xl md:text-2xl font-semibold text-purple-300"
                    >
                        <span>📂 Browse by Category</span>
                        <span className="text-2xl md:text-3xl">{showCategories ? "−" : "+"}</span>
                    </button>
                    
                    {showCategories && !selectedCategory && (
                        <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                            {KARAOKE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleBrowseCategory(cat)}
                                    className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gray-900/50 hover:bg-purple-900/30 rounded-xl text-left transition-colors"
                                >
                                    <span className="text-2xl md:text-3xl">{cat.emoji}</span>
                                    <span className="text-base md:text-lg font-medium">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {showCategories && selectedCategory && (
                        <div className="mt-4 md:mt-6">
                            <button 
                                onClick={() => { setSelectedCategory(null); setCategoryResults([]) }}
                                className="text-base md:text-lg text-purple-400 hover:text-purple-300 mb-3 md:mb-4 flex items-center gap-1"
                            >
                                ← Back to categories
                            </button>
                            
                            <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-3 md:mb-4">
                                {KARAOKE_CATEGORIES.find(c => c.id === selectedCategory)?.emoji}{" "}
                                {KARAOKE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                            </h3>
                            
                            {isBrowsing ? (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="animate-spin text-3xl mb-2">🎵</div>
                                    <p>Loading songs...</p>
                                </div>
                            ) : (
                                <div 
                                    ref={categoryScrollRef}
                                    onScroll={handleCategoryScroll}
                                    className="space-y-2 max-h-[60vh] overflow-y-auto"
                                >
                                    {categoryResults.map((result) => {
                                        const isKaraoke = result.title.toLowerCase().includes("karaoke")
                                        return (
                                            <button
                                                key={result.videoId}
                                                onClick={() => handleAddFromCategory(result)}
                                                disabled={isAddingToPlaylist}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                                                    isKaraoke 
                                                        ? "bg-purple-900/50 hover:bg-purple-800/50 border border-purple-500/30" 
                                                        : "bg-gray-900/50 hover:bg-gray-800"
                                                } disabled:opacity-50`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={`https://i.ytimg.com/vi/${result.videoId}/default.jpg`}
                                                        alt={result.title}
                                                        className="w-16 h-12 rounded-lg object-cover"
                                                    />
                                                    {result.isHD && (
                                                        <span className="absolute bottom-0 right-0 bg-blue-600 text-[8px] px-1 rounded-sm font-bold">HD</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {isKaraoke && <span className="text-purple-400 mr-1">🎤</span>}
                                                        {result.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        {result.artists.map(a => a.name).join(", ")}
                                                        {result.duration_seconds > 0 && ` • ${formatTime(result.duration_seconds)}`}
                                                    </p>
                                                </div>
                                                <span className="text-purple-400 text-xl">+</span>
                                            </button>
                                        )
                                    })}
                                    {/* Auto-loading indicator for Category */}
                                    {categoryNextPageToken && (
                                        <div className="w-full py-3 text-center">
                                            {isLoadingMoreCategory ? (
                                                <span className="animate-pulse text-gray-500">Loading more...</span>
                                            ) : categoryResults.length >= 100 ? (
                                                <button
                                                    onClick={() => {
                                                        const cat = KARAOKE_CATEGORIES.find(c => c.id === selectedCategory)
                                                        if (cat) handleBrowseCategory(cat, true)
                                                    }}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium text-sm transition-colors"
                                                >
                                                    Load More ({categoryResults.length}+)
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500">Scroll for more • {categoryResults.length} results</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Browse by Artist */}
                <div className="bg-gray-800/50 rounded-2xl p-4 md:p-6 border border-pink-500/20">
                    <button 
                        onClick={() => { setShowArtists(!showArtists); setSelectedArtist(null); setArtistResults([]) }}
                        className="w-full flex items-center justify-between text-xl md:text-2xl font-semibold text-pink-300"
                    >
                        <span>🎤 Browse by Artist</span>
                        <span className="text-2xl md:text-3xl">{showArtists ? "−" : "+"}</span>
                    </button>
                    
                    {showArtists && !selectedArtist && (
                        <div className="mt-4 md:mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                            {KARAOKE_ARTISTS.map((artist) => (
                                <button
                                    key={artist.id}
                                    onClick={() => handleBrowseArtist(artist)}
                                    className="flex items-center gap-2 md:gap-3 p-3 md:p-4 bg-gray-900/50 hover:bg-pink-900/30 rounded-xl text-left transition-colors"
                                >
                                    <span className="text-2xl md:text-3xl">{artist.emoji}</span>
                                    <span className="text-base md:text-lg font-medium">{artist.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {showArtists && selectedArtist && (
                        <div className="mt-4 md:mt-6">
                            <button 
                                onClick={() => { setSelectedArtist(null); setArtistResults([]) }}
                                className="text-base md:text-lg text-pink-400 hover:text-pink-300 mb-3 md:mb-4 flex items-center gap-1"
                            >
                                ← Back to artists
                            </button>
                            
                            <h3 className="text-lg md:text-xl font-semibold text-gray-300 mb-3 md:mb-4">
                                {KARAOKE_ARTISTS.find(a => a.id === selectedArtist)?.emoji}{" "}
                                {KARAOKE_ARTISTS.find(a => a.id === selectedArtist)?.name} Karaoke
                            </h3>
                            
                            {isBrowsingArtist ? (
                                <div className="text-center py-8 md:py-12 text-gray-500">
                                    <div className="animate-spin text-4xl md:text-5xl mb-3">🎵</div>
                                    <p className="text-lg md:text-xl">Loading songs...</p>
                                </div>
                            ) : (
                                <div 
                                    ref={artistScrollRef}
                                    onScroll={handleArtistScroll}
                                    className="space-y-2 md:space-y-3 max-h-[60vh] overflow-y-auto"
                                >
                                    {artistResults.map((result) => {
                                        const isKaraoke = result.title.toLowerCase().includes("karaoke")
                                        return (
                                            <button
                                                key={result.videoId}
                                                onClick={() => handleAddFromArtist(result)}
                                                disabled={isAddingToPlaylist}
                                                className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl text-left transition-colors ${
                                                    isKaraoke 
                                                        ? "bg-pink-900/50 hover:bg-pink-800/50 border border-pink-500/30" 
                                                        : "bg-gray-900/50 hover:bg-gray-800"
                                                } disabled:opacity-50`}
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={`https://i.ytimg.com/vi/${result.videoId}/default.jpg`}
                                                        alt={result.title}
                                                        className="w-20 h-14 md:w-24 md:h-16 rounded-lg object-cover"
                                                    />
                                                    {result.isHD && (
                                                        <span className="absolute bottom-0 right-0 bg-blue-600 text-[10px] md:text-xs px-1 rounded-sm font-bold">HD</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-base md:text-lg font-medium truncate">
                                                        {isKaraoke && <span className="text-pink-400 mr-1">🎤</span>}
                                                        {result.title}
                                                    </p>
                                                    <p className="text-sm md:text-base text-gray-400 truncate">
                                                        {result.artists.map(a => a.name).join(", ")}
                                                        {result.duration_seconds > 0 && ` • ${formatTime(result.duration_seconds)}`}
                                                    </p>
                                                </div>
                                                <span className="text-pink-400 text-2xl md:text-3xl">+</span>
                                            </button>
                                        )
                                    })}
                                    {/* Auto-loading indicator for Artist */}
                                    {artistNextPageToken && (
                                        <div className="w-full py-3 md:py-4 text-center">
                                            {isLoadingMoreArtist ? (
                                                <span className="animate-pulse text-base md:text-lg text-gray-500">Loading more...</span>
                                            ) : artistResults.length >= 100 ? (
                                                <button
                                                    onClick={() => {
                                                        const artist = KARAOKE_ARTISTS.find(a => a.id === selectedArtist)
                                                        if (artist) handleBrowseArtist(artist, true)
                                                    }}
                                                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg font-medium text-sm md:text-base transition-colors"
                                                >
                                                    Load More ({artistResults.length}+)
                                                </button>
                                            ) : (
                                                <span className="text-sm md:text-base text-gray-500">Scroll for more • {artistResults.length} results</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pending Queue - show if there are pending songs or no playlist yet */}
                {(!hasPlaylist || pendingQueue.length > 0) && (
                    <div className="bg-gray-800/50 rounded-2xl p-4 md:p-6 border border-purple-500/20">
                        <h2 className="text-xl md:text-2xl font-semibold text-purple-300 mb-4 md:mb-5">
                            ⏳ Pending ({pendingQueue.length})
                            {pendingQueue.length > 0 && (
                                <span className="text-base md:text-lg font-normal text-gray-500 ml-2">
                                    ({formatDuration(pendingQueue.reduce((s, song) => s + song.duration, 0))})
                                </span>
                            )}
                        </h2>
                        {pendingQueue.length === 0 ? (
                            <div className="text-center py-8 md:py-12 text-gray-500">
                                <p className="text-5xl md:text-6xl mb-3">🎶</p>
                                <p className="text-lg md:text-xl">No songs pending</p>
                                <p className="text-base md:text-lg mt-2">Add songs above to queue them up</p>
                            </div>
                        ) : (
                            <div className="space-y-2 md:space-y-3">
                                {pendingQueue.map((song, index) => (
                                    <div key={song.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/50 rounded-xl">
                                        <span className="text-xl md:text-2xl font-bold text-gray-600 w-8">{index + 1}</span>
                                        <img
                                            src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                            alt={song.title}
                                            className="w-16 h-12 md:w-20 md:h-14 rounded object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-base md:text-lg">{song.title}</p>
                                            <p className="text-sm md:text-base text-purple-400">🎤 {song.singer} • {formatTime(song.duration)}</p>
                                        </div>
                                        <button
                                            onClick={() => setConfirmModal({
                                                isOpen: true,
                                                title: "Remove from queue?",
                                                songTitle: song.title,
                                                onConfirm: () => removeFromQueue({ sessionId, songId: song.id })
                                            })}
                                            className="p-2 md:p-3 text-red-400 hover:bg-red-900/30 rounded-lg text-lg md:text-xl"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Playlist Songs (when active) */}
                {hasPlaylist && playingBatch.length > 0 && (
                    <div className="bg-gray-800/30 rounded-2xl p-4 md:p-6 border border-green-500/20">
                        <h2 className="text-xl md:text-2xl font-semibold text-green-300 mb-4 md:mb-5">
                            🎵 In Playlist ({playingBatch.length})
                        </h2>
                        <div className="space-y-2 md:space-y-3">
                            {playingBatch.map((song, index) => (
                                <div key={song.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-900/30 rounded-lg">
                                    <span className="text-gray-500 text-lg md:text-xl w-8">{index + 1}</span>
                                    <img
                                        src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                        alt={song.title}
                                        className="w-16 h-12 md:w-20 md:h-14 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base md:text-lg truncate">{song.title}</p>
                                        <p className="text-sm md:text-base text-purple-400">🎤 {song.singer}</p>
                                    </div>
                                    <button
                                        onClick={() => setConfirmModal({
                                            isOpen: true,
                                            title: "Remove from playlist?",
                                            songTitle: song.title,
                                            onConfirm: () => removeFromPlayingBatch({ sessionId, songId: song.id })
                                        })}
                                        className="p-2 md:p-3 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors text-lg md:text-xl"
                                        title="Remove from playlist"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* QR Code Footer - visible when scrolled to bottom */}
                <div className="mt-8 pb-4">
                    <div className="bg-gray-800/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
                        <p className="text-gray-400 text-sm">Share this room</p>
                        <div className="bg-white p-3 rounded-xl">
                            <QRCodeSVG
                                value={typeof window !== 'undefined' ? `${window.location.origin}/poc/playlist?session=${sessionId}` : ''}
                                size={120}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <p className="text-purple-400 font-mono font-bold">Room: {sessionId}</p>
                    </div>
                </div>
            </main>
        </div>
    )
}

