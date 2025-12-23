/**
 * YouTube API Integration Tests
 *
 * Tests for the YouTube Data API v3 client
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("YouTubeAPI", () => {
    let api: YouTubeAPI

    beforeEach(() => {
        vi.clearAllMocks()
        api = new YouTubeAPI("test-access-token")
    })

    describe("createPlaylist", () => {
        it("should create a private playlist successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: "PLtest123",
                    snippet: {
                        title: "SongUp Session",
                        description: "Karaoke session playlist",
                    },
                    status: {
                        privacyStatus: "private",
                    },
                }),
            })

            const playlist = await api.createPlaylist(
                "SongUp Session",
                "Karaoke session playlist",
            )

            expect(playlist).toEqual({
                id: "PLtest123",
                title: "SongUp Session",
                description: "Karaoke session playlist",
                privacyStatus: "private",
                itemCount: 0,
            })

            expect(mockFetch).toHaveBeenCalledWith(
                "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        Authorization: "Bearer test-access-token",
                        "Content-Type": "application/json",
                    },
                }),
            )
        })

        it("should throw error when API fails", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => "Quota exceeded",
            })

            await expect(
                api.createPlaylist("Test", "Description"),
            ).rejects.toThrow("Failed to create playlist: Quota exceeded")
        })
    })

    describe("addVideoToPlaylist", () => {
        it("should add a video to playlist successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: "PLitem123",
                    snippet: {
                        position: 0,
                        title: "Test Song",
                        channelTitle: "Test Artist",
                        thumbnails: {
                            default: {
                                url: "https://img.youtube.com/default.jpg",
                                width: 120,
                                height: 90,
                            },
                            medium: {
                                url: "https://img.youtube.com/medium.jpg",
                                width: 320,
                                height: 180,
                            },
                            high: {
                                url: "https://img.youtube.com/high.jpg",
                                width: 480,
                                height: 360,
                            },
                        },
                    },
                    contentDetails: {
                        videoId: "dQw4w9WgXcQ",
                    },
                }),
            })

            const item = await api.addVideoToPlaylist("PLtest123", "dQw4w9WgXcQ")

            expect(item).toEqual({
                id: "PLitem123",
                videoId: "dQw4w9WgXcQ",
                position: 0,
                title: "Test Song",
                channelTitle: "Test Artist",
                thumbnails: expect.any(Object),
            })
        })

        it("should add video at specific position", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: "PLitem456",
                    snippet: {
                        position: 5,
                        title: "Positioned Song",
                        channelTitle: "Artist",
                        thumbnails: {},
                    },
                    contentDetails: {
                        videoId: "abc123",
                    },
                }),
            })

            await api.addVideoToPlaylist("PLtest123", "abc123", 5)

            const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
            expect(callBody.snippet.position).toBe(5)
        })

        it("should throw error when video cannot be added", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => "Video not found",
            })

            await expect(
                api.addVideoToPlaylist("PLtest123", "invalid"),
            ).rejects.toThrow("Failed to add video to playlist: Video not found")
        })
    })

    describe("removeVideoFromPlaylist", () => {
        it("should remove a video from playlist successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
            })

            await expect(
                api.removeVideoFromPlaylist("PLitem123"),
            ).resolves.toBeUndefined()

            expect(mockFetch).toHaveBeenCalledWith(
                "https://www.googleapis.com/youtube/v3/playlistItems?id=PLitem123",
                expect.objectContaining({
                    method: "DELETE",
                    headers: {
                        Authorization: "Bearer test-access-token",
                    },
                }),
            )
        })

        it("should throw error when removal fails", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: async () => "Item not found",
            })

            await expect(
                api.removeVideoFromPlaylist("invalid"),
            ).rejects.toThrow("Failed to remove video from playlist: Item not found")
        })
    })

    describe("getPlaylistItems", () => {
        it("should fetch all items from a playlist", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [
                        {
                            id: "item1",
                            snippet: {
                                position: 0,
                                title: "Song 1",
                                channelTitle: "Artist 1",
                                thumbnails: {},
                            },
                            contentDetails: { videoId: "vid1" },
                        },
                        {
                            id: "item2",
                            snippet: {
                                position: 1,
                                title: "Song 2",
                                channelTitle: "Artist 2",
                                thumbnails: {},
                            },
                            contentDetails: { videoId: "vid2" },
                        },
                    ],
                    nextPageToken: undefined,
                }),
            })

            const items = await api.getPlaylistItems("PLtest123")

            expect(items).toHaveLength(2)
            expect(items[0].videoId).toBe("vid1")
            expect(items[1].videoId).toBe("vid2")
        })

        it("should handle pagination", async () => {
            // First page
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [
                        {
                            id: "item1",
                            snippet: {
                                position: 0,
                                title: "Song 1",
                                channelTitle: "Artist 1",
                                thumbnails: {},
                            },
                            contentDetails: { videoId: "vid1" },
                        },
                    ],
                    nextPageToken: "page2token",
                }),
            })

            // Second page
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    items: [
                        {
                            id: "item2",
                            snippet: {
                                position: 1,
                                title: "Song 2",
                                channelTitle: "Artist 2",
                                thumbnails: {},
                            },
                            contentDetails: { videoId: "vid2" },
                        },
                    ],
                    nextPageToken: undefined,
                }),
            })

            const items = await api.getPlaylistItems("PLtest123")

            expect(items).toHaveLength(2)
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })

    describe("deletePlaylist", () => {
        it("should delete a playlist successfully", async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
            })

            await expect(
                api.deletePlaylist("PLtest123"),
            ).resolves.toBeUndefined()

            expect(mockFetch).toHaveBeenCalledWith(
                "https://www.googleapis.com/youtube/v3/playlists?id=PLtest123",
                expect.objectContaining({
                    method: "DELETE",
                }),
            )
        })
    })
})
