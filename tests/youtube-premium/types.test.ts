/**
 * Type validation tests for YouTube Premium integration
 */

import { describe, it, expect } from "vitest"
import type {
    YouTubeAuthToken,
    YouTubePlaylist,
    YouTubePlaylistItem,
    YouTubePremiumSession,
    QueueSyncStatus,
    PlaybackMode,
} from "@/features/youtube-premium/types"

describe("YouTube Premium Types", () => {
    describe("YouTubeAuthToken", () => {
        it("should have correct structure", () => {
            const token: YouTubeAuthToken = {
                access_token: "ya29.xxx",
                refresh_token: "1//xxx",
                expires_at: Date.now() + 3600000,
                token_type: "Bearer",
            }

            expect(token.access_token).toBeDefined()
            expect(token.refresh_token).toBeDefined()
            expect(token.expires_at).toBeGreaterThan(Date.now())
            expect(token.token_type).toBe("Bearer")
        })
    })

    describe("YouTubePlaylist", () => {
        it("should have correct structure", () => {
            const playlist: YouTubePlaylist = {
                id: "PLtest123",
                title: "SongUp Session",
                description: "Karaoke playlist",
                privacyStatus: "private",
                itemCount: 5,
            }

            expect(playlist.id).toBeDefined()
            expect(["private", "public", "unlisted"]).toContain(
                playlist.privacyStatus,
            )
        })
    })

    describe("YouTubePlaylistItem", () => {
        it("should have correct structure", () => {
            const item: YouTubePlaylistItem = {
                id: "PLitem123",
                videoId: "dQw4w9WgXcQ",
                position: 0,
                title: "Never Gonna Give You Up",
                channelTitle: "Rick Astley",
                thumbnails: {
                    default: { url: "https://example.com/default.jpg", width: 120, height: 90 },
                    medium: { url: "https://example.com/medium.jpg", width: 320, height: 180 },
                    high: { url: "https://example.com/high.jpg", width: 480, height: 360 },
                },
            }

            expect(item.videoId).toHaveLength(11) // YouTube video IDs are 11 chars
            expect(item.position).toBeGreaterThanOrEqual(0)
        })
    })

    describe("YouTubePremiumSession", () => {
        it("should have correct structure", () => {
            const session: YouTubePremiumSession = {
                playlistId: "PLtest123",
                roomId: "room123",
                hostUserId: "user456",
                createdAt: Date.now(),
                lastSyncedAt: Date.now(),
            }

            expect(session.playlistId).toBeDefined()
            expect(session.roomId).toBeDefined()
            expect(session.createdAt).toBeLessThanOrEqual(session.lastSyncedAt)
        })
    })

    describe("QueueSyncStatus", () => {
        it("should have correct structure for in-sync state", () => {
            const status: QueueSyncStatus = {
                inSync: true,
                lastSync: Date.now(),
                pendingAdditions: [],
                pendingRemovals: [],
            }

            expect(status.inSync).toBe(true)
            expect(status.pendingAdditions).toHaveLength(0)
            expect(status.pendingRemovals).toHaveLength(0)
        })

        it("should have correct structure for out-of-sync state with error", () => {
            const status: QueueSyncStatus = {
                inSync: false,
                lastSync: Date.now(),
                pendingAdditions: ["vid1", "vid2"],
                pendingRemovals: ["vid3"],
                error: "API quota exceeded",
            }

            expect(status.inSync).toBe(false)
            expect(status.pendingAdditions).toHaveLength(2)
            expect(status.error).toBeDefined()
        })
    })

    describe("PlaybackMode", () => {
        it("should only allow valid modes", () => {
            const embedMode: PlaybackMode = "embed"
            const premiumMode: PlaybackMode = "youtube-premium"

            expect(["embed", "youtube-premium"]).toContain(embedMode)
            expect(["embed", "youtube-premium"]).toContain(premiumMode)
        })
    })
})
