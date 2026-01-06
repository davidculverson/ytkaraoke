"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

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

export default function QueuePOC() {
    const [sessionId, setSessionId] = useState<string>("")
    const [mode, setMode] = useState<"select" | "display" | "controller">("select")
    const [singerName, setSingerName] = useState("")
    const [customVideoUrl, setCustomVideoUrl] = useState("")
    const [joinCode, setJoinCode] = useState("")

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const urlSession = params.get("session")
        const urlMode = params.get("mode")

        if (urlSession) {
            setSessionId(urlSession)
            if (urlMode === "display") setMode("display")
            else if (urlMode === "controller") setMode("controller")
        }
    }, [])

    if (mode === "select") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center p-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                            🎤 Karaoke Queue
                        </h1>
                        <p className="text-gray-400">Seamless YouTube playback with batched playlists</p>
                    </div>

                    {!sessionId ? (
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    const newId = generateSessionId()
                                    setSessionId(newId)
                                    window.history.replaceState({}, "", `?session=${newId}`)
                                }}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-lg transition-all"
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
                            </div>

                            <button
                                onClick={() => setMode("display")}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                            >
                                📺 Display Mode (TV/Projector)
                            </button>

                            <button
                                onClick={() => setMode("controller")}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3"
                            >
                                📱 Controller Mode (Phone)
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
    onBack,
}: {
    sessionId: string
    mode: "display" | "controller"
    singerName: string
    setSingerName: (name: string) => void
    customVideoUrl: string
    setCustomVideoUrl: (url: string) => void
    onBack: () => void
}) {
    const session = useQuery(api.karaoke.getSession, { sessionId })
    const createSession = useMutation(api.karaoke.createSession)
    const addToQueue = useMutation(api.karaoke.addToQueue)
    const removeFromQueue = useMutation(api.karaoke.removeFromQueue)
    const launchBatch = useMutation(api.karaoke.launchBatch)
    const completeBatch = useMutation(api.karaoke.completeBatch)

    const [tick, setTick] = useState(0)

    // Create session if it doesn't exist
    useEffect(() => {
        if (session === null) {
            createSession({ sessionId })
        }
    }, [session, sessionId, createSession])

    // Tick every second for progress updates
    useEffect(() => {
        const interval = setInterval(() => setTick((t) => t + 1), 1000)
        return () => clearInterval(interval)
    }, [])

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

    const handleAddSong = async (videoId: string, title: string, duration = 240) => {
        await addToQueue({
            sessionId,
            videoId,
            title,
            singer: singerName || "Anonymous",
            duration,
        })
    }

    const handleAddCustom = async () => {
        const videoId = extractVideoId(customVideoUrl)
        if (videoId) {
            const info = await fetchYouTubeVideoInfo(videoId)
            await handleAddSong(videoId, info?.title || "Custom Song", info?.duration || 240)
            setCustomVideoUrl("")
        }
    }

    const handleLaunchBatch = async () => {
        try {
            const videoIds = await launchBatch({ sessionId })
            // Open YouTube with all videos as a playlist
            const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(",")}`
            window.open(playlistUrl, "karaoke-youtube")
        } catch (error) {
            console.error("Failed to launch batch:", error)
        }
    }

    const handleLaunchNextBatch = async () => {
        await completeBatch({ sessionId })
        // Small delay to let state update
        setTimeout(() => {
            handleLaunchBatch()
        }, 100)
    }

    if (session === undefined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex items-center justify-center">
                <div className="animate-pulse text-xl">Loading session...</div>
            </div>
        )
    }

    const currentSong = session?.playingBatch[session.estimatedCurrentSongIndex]
    const totalBatchDuration = session?.batchTotalDuration ?? 0
    const elapsedInBatch = session?.batchStartedAt ? (Date.now() - session.batchStartedAt) / 1000 : 0
    const batchProgress = totalBatchDuration > 0 ? Math.min(100, (elapsedInBatch / totalBatchDuration) * 100) : 0

    // DISPLAY MODE
    if (mode === "display") {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                {/* Header */}
                <header className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="text-gray-400 hover:text-white">←</button>
                        <h1 className="text-xl font-bold">🎤 Karaoke</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Join:</span>
                        <span className="font-mono text-2xl font-bold text-purple-400">{sessionId}</span>
                    </div>
                </header>

                <main className="flex-1 flex">
                    {/* Now Playing */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {session?.isPlaying && currentSong ? (
                            <div className="w-full max-w-3xl space-y-6">
                                {/* Current Song */}
                                <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src={`https://img.youtube.com/vi/${currentSong.videoId}/maxresdefault.jpg`}
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentSong.videoId}/hqdefault.jpg`
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    
                                    {/* Song info */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <p className="text-sm text-purple-400 mb-1">
                                            Song {session.estimatedCurrentSongIndex + 1} of {session.playingBatch.length}
                                        </p>
                                        <p className="text-3xl font-bold mb-1">{currentSong.title}</p>
                                        <p className="text-xl text-purple-300">🎤 {currentSong.singer}</p>
                                    </div>
                                    
                                    {/* Batch progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                                            style={{ width: `${batchProgress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Progress info */}
                                <div className="text-center text-gray-400">
                                    <p>
                                        {formatTime(session.estimatedTimeInCurrentSong)} / {formatTime(currentSong.duration)}
                                        <span className="mx-4">•</span>
                                        Batch: {formatTime(elapsedInBatch)} / {formatTime(totalBatchDuration)}
                                    </p>
                                </div>

                                {/* Batch Complete Alert */}
                                {session.estimatedBatchComplete && (
                                    <div className="bg-green-900/80 border-2 border-green-500 rounded-2xl p-6 text-center animate-pulse">
                                        <p className="text-2xl text-green-300 mb-4">🎉 Batch Complete!</p>
                                        {session.pendingQueue.length > 0 ? (
                                            <button
                                                onClick={handleLaunchNextBatch}
                                                className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xl transition-colors"
                                            >
                                                ▶️ Launch Next Batch ({session.pendingQueue.length} songs)
                                            </button>
                                        ) : (
                                            <p className="text-green-200">Add more songs from a controller to continue!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-8xl mb-6">🎵</p>
                                {session && session.pendingQueue.length > 0 ? (
                                    <>
                                        <p className="text-3xl text-gray-300 mb-4">
                                            {session.pendingQueue.length} songs ready
                                        </p>
                                        <p className="text-gray-500 mb-8">
                                            Total: {formatDuration(session.pendingQueue.reduce((s, song) => s + song.duration, 0))}
                                        </p>
                                        <button
                                            onClick={handleLaunchBatch}
                                            className="px-12 py-6 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-2xl font-bold text-2xl transition-all flex items-center gap-4 mx-auto"
                                        >
                                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                            </svg>
                                            Launch on YouTube
                                        </button>
                                        <p className="text-sm text-gray-600 mt-4">
                                            Opens YouTube with all songs as a seamless playlist
                                        </p>
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
                        {/* Currently Playing */}
                        {session?.isPlaying && session.playingBatch.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-400 mb-3">
                                    🎵 Now Playing ({session.playingBatch.length})
                                </h2>
                                <div className="space-y-2">
                                    {session.playingBatch.map((song, index) => (
                                        <div
                                            key={song.id}
                                            className={`flex items-center gap-3 p-2 rounded-lg ${
                                                index === session.estimatedCurrentSongIndex
                                                    ? "bg-purple-900/50 border border-purple-500"
                                                    : index < session.estimatedCurrentSongIndex
                                                    ? "opacity-50"
                                                    : "bg-gray-800/30"
                                            }`}
                                        >
                                            {index === session.estimatedCurrentSongIndex && (
                                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            )}
                                            {index < session.estimatedCurrentSongIndex && <span className="text-green-500">✓</span>}
                                            <span className="text-sm truncate flex-1">{song.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Queue */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-400 mb-3">
                                ⏳ Up Next ({session?.pendingQueue.length ?? 0})
                            </h2>
                            {session?.pendingQueue.length === 0 ? (
                                <p className="text-gray-600 text-center py-4">No songs pending</p>
                            ) : (
                                <div className="space-y-2">
                                    {session?.pendingQueue.map((song, index) => (
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
            </div>
        )
    }

    // CONTROLLER MODE
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white pb-20">
            <header className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-purple-500/30 p-4 z-10">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="text-gray-400 hover:text-white">← Back</button>
                    <span className="font-mono text-lg font-bold text-purple-400">{sessionId}</span>
                    <div className="w-12"></div>
                </div>
            </header>

            {/* Status Banner */}
            {session?.isPlaying && currentSong && (
                <div className="mx-4 mt-4 bg-purple-900/50 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img
                                src={`https://img.youtube.com/vi/${currentSong.videoId}/default.jpg`}
                                alt={currentSong.title}
                                className="w-16 h-12 rounded-lg object-cover"
                            />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-purple-400">NOW PLAYING ({session.estimatedCurrentSongIndex + 1}/{session.playingBatch.length})</p>
                            <p className="font-bold truncate">{currentSong.title}</p>
                            <p className="text-sm text-purple-300">🎤 {currentSong.singer}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                            style={{ width: `${batchProgress}%` }}
                        />
                    </div>
                    {session.estimatedBatchComplete && session.pendingQueue.length > 0 && (
                        <p className="text-center text-green-400 mt-3 text-sm animate-pulse">
                            ✨ Batch complete! New songs will play when host launches next batch
                        </p>
                    )}
                </div>
            )}

            <main className="p-4 space-y-6">
                {/* Add Song Form */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-purple-500/20">
                    <h2 className="text-lg font-semibold text-purple-300 mb-4">➕ Add a Song</h2>
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={singerName}
                            onChange={(e) => setSingerName(e.target.value)}
                            placeholder="Your name"
                            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customVideoUrl}
                                onChange={(e) => setCustomVideoUrl(e.target.value)}
                                placeholder="YouTube URL or video ID"
                                className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500"
                                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                            />
                            <button
                                onClick={handleAddCustom}
                                disabled={!customVideoUrl}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-xl font-semibold transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {/* Quick Add */}
                        <div className="grid grid-cols-1 gap-2 pt-2">
                            {SAMPLE_KARAOKE_VIDEOS.map((video) => (
                                <button
                                    key={video.videoId}
                                    onClick={() => handleAddSong(video.videoId, video.title, video.duration)}
                                    className="flex items-center gap-3 p-2 bg-gray-900/50 hover:bg-gray-800 rounded-lg text-left transition-colors"
                                >
                                    <img
                                        src={`https://img.youtube.com/vi/${video.videoId}/default.jpg`}
                                        alt={video.title}
                                        className="w-14 h-10 rounded object-cover"
                                    />
                                    <span className="flex-1 text-sm truncate">{video.title}</span>
                                    <span className="text-purple-400 text-sm">+</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Queue */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-purple-500/20">
                    <h2 className="text-lg font-semibold text-purple-300 mb-4">
                        ⏳ Pending ({session?.pendingQueue.length ?? 0})
                        {session?.pendingQueue && session.pendingQueue.length > 0 && (
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({formatDuration(session.pendingQueue.reduce((s, song) => s + song.duration, 0))})
                            </span>
                        )}
                    </h2>
                    {session?.pendingQueue.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">🎶</p>
                            <p>No songs pending</p>
                            <p className="text-sm mt-1">Add songs above to queue them up</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {session?.pendingQueue.map((song, index) => (
                                <div key={song.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl">
                                    <span className="text-xl font-bold text-gray-600 w-6">{index + 1}</span>
                                    <img
                                        src={`https://img.youtube.com/vi/${song.videoId}/default.jpg`}
                                        alt={song.title}
                                        className="w-14 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate text-sm">{song.title}</p>
                                        <p className="text-xs text-purple-400">🎤 {song.singer} • {formatTime(song.duration)}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromQueue({ sessionId, songId: song.id })}
                                        className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Currently Playing (read-only) */}
                {session?.isPlaying && session.playingBatch.length > 0 && (
                    <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-700/50">
                        <h2 className="text-sm font-semibold text-gray-500 mb-3">
                            🎵 Now Playing ({session.playingBatch.length} songs)
                        </h2>
                        <div className="space-y-2 opacity-70">
                            {session.playingBatch.map((song, index) => (
                                <div key={song.id} className="flex items-center gap-3 p-2 bg-gray-900/30 rounded-lg">
                                    {index === session.estimatedCurrentSongIndex ? (
                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    ) : index < session.estimatedCurrentSongIndex ? (
                                        <span className="text-green-500 text-sm">✓</span>
                                    ) : (
                                        <span className="text-gray-600 text-sm">{index + 1}</span>
                                    )}
                                    <span className="text-sm truncate flex-1">{song.title}</span>
                                    <span className="text-xs text-gray-600">{song.singer}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
