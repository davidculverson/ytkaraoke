/**
 * Queue Synchronization Manager
 * Keeps SongUp queue in sync with YouTube playlist
 */

import { YouTubeAPI } from "./youtube-api"
import { QueueSyncStatus } from "./types"

interface Song {
    videoId: string
    title: string
    artist: string
}

export class QueueSyncManager {
    private youtubeApi: YouTubeAPI
    private playlistId: string
    private lastSyncedQueue: Song[] = []

    constructor(youtubeApi: YouTubeAPI, playlistId: string) {
        this.youtubeApi = youtubeApi
        this.playlistId = playlistId
    }

    /**
     * Sync SongUp queue with YouTube playlist
     * Returns status of the sync operation
     */
    async syncQueue(currentQueue: Song[]): Promise<QueueSyncStatus> {
        try {
            // Get current YouTube playlist state
            const playlistItems =
                await this.youtubeApi.getPlaylistItems(this.playlistId)
            const playlistVideoIds = playlistItems.map((item) => item.videoId)
            const queueVideoIds = currentQueue.map((song) => song.videoId)

            // Find differences
            const toAdd = queueVideoIds.filter(
                (id) => !playlistVideoIds.includes(id),
            )
            const toRemove = playlistItems.filter(
                (item) => !queueVideoIds.includes(item.videoId),
            )

            // Apply changes
            for (const videoId of toAdd) {
                const position = queueVideoIds.indexOf(videoId)
                await this.youtubeApi.addVideoToPlaylist(
                    this.playlistId,
                    videoId,
                    position,
                )
            }

            for (const item of toRemove) {
                await this.youtubeApi.removeVideoFromPlaylist(item.id)
            }

            // Verify order matches
            await this.verifyPlaylistOrder(currentQueue)

            this.lastSyncedQueue = [...currentQueue]

            return {
                inSync: true,
                lastSync: Date.now(),
                pendingAdditions: [],
                pendingRemovals: [],
            }
        } catch (error) {
            console.error("Queue sync failed:", error)
            return {
                inSync: false,
                lastSync: Date.now(),
                pendingAdditions: [],
                pendingRemovals: [],
                error: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    /**
     * Verify and correct playlist order to match queue
     */
    private async verifyPlaylistOrder(queue: Song[]): Promise<void> {
        const playlistItems =
            await this.youtubeApi.getPlaylistItems(this.playlistId)

        // Check if order matches
        for (let i = 0; i < queue.length; i++) {
            if (playlistItems[i]?.videoId !== queue[i].videoId) {
                // Find the correct item and move it
                const correctItem = playlistItems.find(
                    (item) => item.videoId === queue[i].videoId,
                )
                if (correctItem) {
                    await this.youtubeApi.updatePlaylistItemPosition(
                        correctItem.id,
                        this.playlistId,
                        correctItem.videoId,
                        i,
                    )
                }
            }
        }
    }

    /**
     * Add a single song to the YouTube playlist
     */
    async addSong(videoId: string, position?: number): Promise<void> {
        await this.youtubeApi.addVideoToPlaylist(
            this.playlistId,
            videoId,
            position,
        )
    }

    /**
     * Remove current song and shift queue
     */
    async popCurrentSong(): Promise<void> {
        const items = await this.youtubeApi.getPlaylistItems(this.playlistId)
        if (items.length > 0) {
            // Remove first item (current song)
            await this.youtubeApi.removeVideoFromPlaylist(items[0].id)
        }
    }

    /**
     * Clear entire playlist
     */
    async clearPlaylist(): Promise<void> {
        const items = await this.youtubeApi.getPlaylistItems(this.playlistId)
        for (const item of items) {
            await this.youtubeApi.removeVideoFromPlaylist(item.id)
        }
    }

    /**
     * Get current sync status
     */
    getLastSyncedQueue(): Song[] {
        return [...this.lastSyncedQueue]
    }
}
