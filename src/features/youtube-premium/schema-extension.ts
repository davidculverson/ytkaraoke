/**
 * Convex Schema Extensions for YouTube Premium
 * 
 * Add these to src/convex/schema.ts:
 * 
 * youtubeAuth: defineTable({
 *   userId: v.id("users"),
 *   accessToken: v.string(),
 *   refreshToken: v.string(),
 *   expiresAt: v.number(),
 *   tokenType: v.string(),
 * }).index("by_user", ["userId"]),
 * 
 * youtubeSessions: defineTable({
 *   roomId: v.id("rooms"),
 *   hostUserId: v.id("users"),
 *   playlistId: v.string(),
 *   playlistTitle: v.string(),
 *   createdAt: v.number(),
 *   lastSyncedAt: v.number(),
 * })
 *   .index("by_room", ["roomId"])
 *   .index("by_host", ["hostUserId"]),
 * 
 * Also update rooms table to add:
 *   playbackMode: v.optional(v.union(v.literal("embed"), v.literal("youtube-premium"))),
 */

import { v } from "convex/values"

// Export validators for reuse
export const youtubeAuthValidator = {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    tokenType: v.string(),
}

export const youtubeSessionValidator = {
    roomId: v.id("rooms"),
    hostUserId: v.id("users"),
    playlistId: v.string(),
    playlistTitle: v.string(),
    createdAt: v.number(),
    lastSyncedAt: v.number(),
}
