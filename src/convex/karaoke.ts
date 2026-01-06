import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Song type for the queue
type Song = {
    id: string
    videoId: string
    title: string
    singer: string
    duration: number
    addedAt: number
}

// Helper to normalize a session with optional fields
function normalizeSession(session: {
    playingBatch?: Song[]
    pendingQueue?: Song[]
    batchStartedAt?: number | null
    batchTotalDuration?: number
    isPlaying?: boolean
    youtubePlaylistId?: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}) {
    return {
        ...session,
        playingBatch: (session.playingBatch ?? []) as Song[],
        pendingQueue: (session.pendingQueue ?? []) as Song[],
        batchStartedAt: (session.batchStartedAt ?? null) as number | null,
        batchTotalDuration: (session.batchTotalDuration ?? 0) as number,
        isPlaying: (session.isPlaying ?? false) as boolean,
        youtubePlaylistId: (session.youtubePlaylistId ?? null) as string | null,
    }
}

// Get the current karaoke session with computed progress
export const getSession = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) return null
        
        const session = normalizeSession(rawSession)

        // Calculate estimated progress through current batch
        let estimatedCurrentSongIndex = 0
        let estimatedTimeInCurrentSong = 0
        let estimatedBatchComplete = false

        if (session.isPlaying && session.batchStartedAt) {
            const elapsed = Date.now() - session.batchStartedAt
            let accumulatedTime = 0

            for (let i = 0; i < session.playingBatch.length; i++) {
                const songDuration = session.playingBatch[i].duration * 1000
                if (accumulatedTime + songDuration > elapsed) {
                    estimatedCurrentSongIndex = i
                    estimatedTimeInCurrentSong = Math.floor((elapsed - accumulatedTime) / 1000)
                    break
                }
                accumulatedTime += songDuration
                estimatedCurrentSongIndex = i + 1
            }

            // Check if batch is complete
            if (elapsed >= session.batchTotalDuration * 1000) {
                estimatedBatchComplete = true
                estimatedCurrentSongIndex = session.playingBatch.length - 1
                const lastSong = session.playingBatch[session.playingBatch.length - 1]
                estimatedTimeInCurrentSong = lastSong?.duration ?? 0
            }
        }

        return {
            ...session,
            estimatedCurrentSongIndex,
            estimatedTimeInCurrentSong,
            estimatedBatchComplete,
        }
    },
})

// Create a new session
export const createSession = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (existing) {
            return existing._id
        }

        return await ctx.db.insert("karaokeSessions", {
            sessionId: args.sessionId,
            playingBatch: [],
            pendingQueue: [],
            batchStartedAt: null,
            batchTotalDuration: 0,
            isPlaying: false,
            createdAt: Date.now(),
        })
    },
})

// Add a song to the pending queue
export const addToQueue = mutation({
    args: {
        sessionId: v.string(),
        videoId: v.string(),
        title: v.string(),
        singer: v.string(),
        duration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)

        const newSong = {
            id: crypto.randomUUID(),
            videoId: args.videoId,
            title: args.title,
            singer: args.singer,
            duration: args.duration ?? 240,
            addedAt: Date.now(),
        }

        await ctx.db.patch(rawSession._id, {
            pendingQueue: [...session.pendingQueue, newSong],
        })

        return newSong.id
    },
})

// Remove a song from the pending queue
export const removeFromQueue = mutation({
    args: {
        sessionId: v.string(),
        songId: v.string(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)

        await ctx.db.patch(rawSession._id, {
            pendingQueue: session.pendingQueue.filter((s) => s.id !== args.songId),
        })
    },
})

// Launch a new batch - moves pending songs to playing and returns video IDs for YouTube
export const launchBatch = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)

        if (session.pendingQueue.length === 0) {
            throw new Error("No songs in queue")
        }

        const totalDuration = session.pendingQueue.reduce((sum, song) => sum + song.duration, 0)

        await ctx.db.patch(rawSession._id, {
            playingBatch: session.pendingQueue,
            pendingQueue: [],
            batchStartedAt: Date.now(),
            batchTotalDuration: totalDuration,
            isPlaying: true,
        })

        return session.pendingQueue.map((s) => s.videoId)
    },
})

// Mark the current batch as complete
export const completeBatch = mutation({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        await ctx.db.patch(rawSession._id, {
            playingBatch: [],
            batchStartedAt: null,
            batchTotalDuration: 0,
            isPlaying: false,
        })
    },
})

// Reorder songs in the pending queue
export const reorderQueue = mutation({
    args: {
        sessionId: v.string(),
        songId: v.string(),
        newIndex: v.number(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)

        const currentIndex = session.pendingQueue.findIndex((s) => s.id === args.songId)
        if (currentIndex === -1) return

        const newQueue = [...session.pendingQueue]
        const [song] = newQueue.splice(currentIndex, 1)
        newQueue.splice(args.newIndex, 0, song)

        await ctx.db.patch(rawSession._id, {
            pendingQueue: newQueue,
        })
    },
})

// Set YouTube playlist ID for the session
export const setYouTubePlaylist = mutation({
    args: {
        sessionId: v.string(),
        playlistId: v.string(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        await ctx.db.patch(rawSession._id, {
            youtubePlaylistId: args.playlistId,
            isPlaying: true,
        })
    },
})

// Add song to playing batch (after adding to YouTube playlist)
export const addToPlayingBatch = mutation({
    args: {
        sessionId: v.string(),
        videoId: v.string(),
        title: v.string(),
        singer: v.string(),
        duration: v.number(),
        playlistItemId: v.string(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)

        const newSong = {
            id: crypto.randomUUID(),
            videoId: args.videoId,
            title: args.title,
            singer: args.singer,
            duration: args.duration,
            addedAt: Date.now(),
            playlistItemId: args.playlistItemId,
        }

        const updatedBatch = [...session.playingBatch, newSong]
        const totalDuration = updatedBatch.reduce((sum, song) => sum + song.duration, 0)

        await ctx.db.patch(rawSession._id, {
            playingBatch: updatedBatch,
            batchTotalDuration: totalDuration,
            // Start the batch timer if this is the first song
            batchStartedAt: session.batchStartedAt ?? Date.now(),
        })

        return newSong.id
    },
})

// Remove song from playing batch (after removing from YouTube playlist)
export const removeFromPlayingBatch = mutation({
    args: {
        sessionId: v.string(),
        songId: v.string(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        const session = normalizeSession(rawSession)
        const updatedBatch = session.playingBatch.filter((s) => s.id !== args.songId)
        const totalDuration = updatedBatch.reduce((sum, song) => sum + song.duration, 0)

        await ctx.db.patch(rawSession._id, {
            playingBatch: updatedBatch,
            batchTotalDuration: totalDuration,
        })
    },
})

// Clear the entire playlist (reset to queue-building state)
export const clearPlaylist = mutation({
    args: {
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        const rawSession = await ctx.db
            .query("karaokeSessions")
            .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
            .first()

        if (!rawSession) {
            throw new Error("Session not found")
        }

        await ctx.db.patch(rawSession._id, {
            playingBatch: [],
            pendingQueue: [],
            youtubePlaylistId: undefined,
            batchStartedAt: undefined,
            batchTotalDuration: 0,
            isPlaying: false,
        })
    },
})
