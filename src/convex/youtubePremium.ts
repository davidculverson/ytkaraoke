/**
 * Convex Functions for YouTube Premium Integration
 *
 * Handles OAuth token storage, session management, and sync tracking
 */

import { getAuthUserId } from "@convex-dev/auth/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { query } from "./_generated/server"
import { mutation } from "./functions"

/**
 * Save or update YouTube OAuth tokens for the current user
 */
export const saveYouTubeAuth = mutation({
    args: {
        accessToken: v.string(),
        refreshToken: v.string(),
        expiresAt: v.number(),
        tokenType: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        // Check if auth already exists for this user
        const existing = await ctx.db
            .query("youtubeAuth")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique()

        if (existing) {
            // Update existing tokens
            await ctx.db.patch(existing._id, {
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt: args.expiresAt,
                tokenType: args.tokenType,
            })
            return existing._id
        } else {
            // Create new auth record
            return await ctx.db.insert("youtubeAuth", {
                userId: userId as Id<"users">,
                accessToken: args.accessToken,
                refreshToken: args.refreshToken,
                expiresAt: args.expiresAt,
                tokenType: args.tokenType,
            })
        }
    },
})

/**
 * Get YouTube OAuth tokens for the current user
 */
export const getYouTubeAuth = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            return null
        }

        const auth = await ctx.db
            .query("youtubeAuth")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique()

        if (!auth) {
            return null
        }

        // Don't expose tokens to client - just return status
        return {
            hasAuth: true,
            expiresAt: auth.expiresAt,
            isExpired: Date.now() > auth.expiresAt,
        }
    },
})

/**
 * Get YouTube OAuth tokens for internal use (server-side only)
 * Returns full tokens for API calls
 */
export const getYouTubeAuthInternal = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const auth = await ctx.db
            .query("youtubeAuth")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .unique()

        return auth
    },
})

/**
 * Delete YouTube OAuth tokens for the current user
 */
export const deleteYouTubeAuth = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        const existing = await ctx.db
            .query("youtubeAuth")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique()

        if (existing) {
            await ctx.db.delete(existing._id)
        }
    },
})

/**
 * Create a YouTube Premium session for a room
 */
export const createYouTubeSession = mutation({
    args: {
        roomId: v.id("rooms"),
        playlistId: v.string(),
        playlistTitle: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        // Verify user is the room host
        const room = await ctx.db.get(args.roomId)
        if (!room) {
            throw new Error("Room not found")
        }
        if (room.host !== (userId as Id<"users">)) {
            throw new Error("Only the room host can create a YouTube session")
        }

        // Check if session already exists
        const existing = await ctx.db
            .query("youtubeSessions")
            .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
            .unique()

        if (existing) {
            // Update existing session
            await ctx.db.patch(existing._id, {
                playlistId: args.playlistId,
                playlistTitle: args.playlistTitle,
                lastSyncedAt: Date.now(),
            })
            return existing._id
        }

        // Create new session
        return await ctx.db.insert("youtubeSessions", {
            roomId: args.roomId,
            hostUserId: userId as Id<"users">,
            playlistId: args.playlistId,
            playlistTitle: args.playlistTitle,
            createdAt: Date.now(),
            lastSyncedAt: Date.now(),
        })
    },
})

/**
 * Get YouTube session for a room
 */
export const getYouTubeSession = query({
    args: {
        roomId: v.id("rooms"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("youtubeSessions")
            .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
            .unique()
    },
})

/**
 * Update the last sync time for a YouTube session
 */
export const updateYouTubeSyncTime = mutation({
    args: {
        roomId: v.id("rooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        const session = await ctx.db
            .query("youtubeSessions")
            .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
            .unique()

        if (!session) {
            throw new Error("YouTube session not found")
        }

        // Verify user is the session host
        if (session.hostUserId !== (userId as Id<"users">)) {
            throw new Error("Only the session host can update sync time")
        }

        await ctx.db.patch(session._id, {
            lastSyncedAt: Date.now(),
        })
    },
})

/**
 * Delete YouTube session for a room
 */
export const deleteYouTubeSession = mutation({
    args: {
        roomId: v.id("rooms"),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        const session = await ctx.db
            .query("youtubeSessions")
            .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
            .unique()

        if (!session) {
            return // Session doesn't exist, nothing to delete
        }

        // Verify user is the session host
        if (session.hostUserId !== (userId as Id<"users">)) {
            throw new Error("Only the session host can delete the session")
        }

        await ctx.db.delete(session._id)
    },
})

/**
 * Update room playback mode
 */
export const setPlaybackMode = mutation({
    args: {
        roomId: v.id("rooms"),
        playbackMode: v.union(v.literal("embed"), v.literal("youtube-premium")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) {
            throw new Error("Not authenticated")
        }

        const room = await ctx.db.get(args.roomId)
        if (!room) {
            throw new Error("Room not found")
        }

        // Verify user is the room host
        if (room.host !== (userId as Id<"users">)) {
            throw new Error("Only the room host can change playback mode")
        }

        await ctx.db.patch(args.roomId, {
            playbackMode: args.playbackMode,
        })
    },
})

/**
 * Get room playback mode
 */
export const getPlaybackMode = query({
    args: {
        roomId: v.id("rooms"),
    },
    handler: async (ctx, args) => {
        const room = await ctx.db.get(args.roomId)
        if (!room) {
            return null
        }
        return room.playbackMode ?? "embed" // Default to embed mode
    },
})
