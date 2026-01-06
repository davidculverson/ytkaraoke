import { authTables } from "@convex-dev/auth/server"
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// This is a shared object defining the fields for a song.
const song = {
    addedBy: v.optional(v.id("users")),
    videoId: v.string(),
    // These exact names of types are important
    // because the queue query will use them to sort the songs.
    // Calling user added songs "addedByUser" places them in front of fallback songs.
    type: v.union(v.literal("addedByUser"), v.literal("fallback")),

    title: v.string(),
    artist: v.string(),
    duration: v.number(),
}

export default defineSchema({
    ...authTables,
    users: defineTable({
        // Default fields
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),

        // Custom fields
        nickname: v.optional(v.string()),
    }),
    rooms: defineTable({
        host: v.id("users"),
        code: v.string(),
        expiresAt: v.number(),
        currentSong: v.optional(v.object(song)),
        settings: v.object({
            maxSongsPerUser: v.number(),
        }),
        // YouTube Premium playback mode
        playbackMode: v.optional(
            v.union(v.literal("embed"), v.literal("youtube-premium")),
        ),
    })
        .index("by_code", ["code"])
        .index("by_host", ["host"])
        .index("by_expires_at", ["expiresAt"]),
    queuedSongs: defineTable({
        room: v.id("rooms"),
        ...song,
    })
        .index("by_room_type", ["room", "type"])
        .index("by_added_by_room", ["addedBy", "room"]),

    // YouTube Premium OAuth tokens storage
    youtubeAuth: defineTable({
        userId: v.id("users"),
        accessToken: v.string(),
        refreshToken: v.string(),
        expiresAt: v.number(),
        tokenType: v.string(),
    }).index("by_user", ["userId"]),

    // YouTube Premium session tracking (playlist per room)
    youtubeSessions: defineTable({
        roomId: v.id("rooms"),
        hostUserId: v.id("users"),
        playlistId: v.string(),
        playlistTitle: v.string(),
        createdAt: v.number(),
        lastSyncedAt: v.number(),
    })
        .index("by_room", ["roomId"])
        .index("by_host", ["hostUserId"]),

    // Karaoke sessions for the POC queue feature
    // Uses YouTube's native playlist feature for seamless playback
    karaokeSessions: defineTable({
        sessionId: v.string(),
        // YouTube playlist ID (created via YouTube Data API)
        youtubePlaylistId: v.optional(v.string()),
        // Songs currently in the YouTube playlist
        playingBatch: v.optional(v.array(
            v.object({
                id: v.string(),
                videoId: v.string(),
                title: v.string(),
                singer: v.string(),
                duration: v.number(),
                addedAt: v.number(),
                // YouTube playlist item ID (for removal)
                playlistItemId: v.optional(v.string()),
            })
        )),
        // Songs queued to be added to the next batch
        pendingQueue: v.optional(v.array(
            v.object({
                id: v.string(),
                videoId: v.string(),
                title: v.string(),
                singer: v.string(),
                duration: v.number(),
                addedAt: v.number(),
            })
        )),
        // When the current batch started playing (for progress tracking)
        batchStartedAt: v.optional(v.union(v.number(), v.null())),
        // Total duration of current batch (sum of all song durations)
        batchTotalDuration: v.optional(v.number()),
        // Is a batch currently playing?
        isPlaying: v.optional(v.boolean()),
        createdAt: v.number(),
        // Legacy fields (for backwards compatibility with old data)
        queue: v.optional(v.array(
            v.object({
                id: v.string(),
                videoId: v.string(),
                title: v.string(),
                singer: v.string(),
                duration: v.number(),
                addedAt: v.number(),
            })
        )),
        currentIndex: v.optional(v.number()),
        startedAt: v.optional(v.number()),
    }).index("by_session_id", ["sessionId"]),
})
