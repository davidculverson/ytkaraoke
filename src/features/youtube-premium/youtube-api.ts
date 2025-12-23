/**
 * YouTube Data API v3 Integration
 * Manages playlists and video operations
 */

import { YouTubePlaylist, YouTubePlaylistItem } from "./types"

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

export class YouTubeAPI {
    private accessToken: string

    constructor(accessToken: string) {
        this.accessToken = accessToken
    }

    /**
     * Create a private playlist for the karaoke session
     */
    async createPlaylist(
        title: string,
        description: string,
    ): Promise<YouTubePlaylist> {
        const response = await fetch(`${YOUTUBE_API_BASE}/playlists?part=snippet,status`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                snippet: {
                    title,
                    description,
                },
                status: {
                    privacyStatus: "private",
                },
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to create playlist: ${error}`)
        }

        const data = await response.json()

        return {
            id: data.id,
            title: data.snippet.title,
            description: data.snippet.description,
            privacyStatus: data.status.privacyStatus,
            itemCount: 0,
        }
    }

    /**
     * Add a video to the playlist
     */
    async addVideoToPlaylist(
        playlistId: string,
        videoId: string,
        position?: number,
    ): Promise<YouTubePlaylistItem> {
        const snippet: {
            playlistId: string
            resourceId: { kind: string; videoId: string }
            position?: number
        } = {
            playlistId,
            resourceId: {
                kind: "youtube#video",
                videoId,
            },
        }

        if (position !== undefined) {
            snippet.position = position
        }

        const response = await fetch(
            `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ snippet }),
            },
        )

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to add video to playlist: ${error}`)
        }

        const data = await response.json()

        return {
            id: data.id,
            videoId: data.contentDetails.videoId,
            position: data.snippet.position,
            title: data.snippet.title,
            channelTitle: data.snippet.channelTitle,
            thumbnails: data.snippet.thumbnails,
        }
    }

    /**
     * Remove a video from the playlist
     */
    async removeVideoFromPlaylist(playlistItemId: string): Promise<void> {
        const response = await fetch(
            `${YOUTUBE_API_BASE}/playlistItems?id=${playlistItemId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            },
        )

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to remove video from playlist: ${error}`)
        }
    }

    /**
     * Get all items in a playlist
     */
    async getPlaylistItems(
        playlistId: string,
    ): Promise<YouTubePlaylistItem[]> {
        const items: YouTubePlaylistItem[] = []
        let pageToken: string | undefined

        do {
            const params = new URLSearchParams({
                part: "snippet,contentDetails",
                playlistId,
                maxResults: "50",
            })

            if (pageToken) {
                params.append("pageToken", pageToken)
            }

            const response = await fetch(
                `${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                },
            )

            if (!response.ok) {
                const error = await response.text()
                throw new Error(`Failed to get playlist items: ${error}`)
            }

            const data = await response.json()

            for (const item of data.items) {
                items.push({
                    id: item.id,
                    videoId: item.contentDetails.videoId,
                    position: item.snippet.position,
                    title: item.snippet.title,
                    channelTitle: item.snippet.channelTitle,
                    thumbnails: item.snippet.thumbnails,
                })
            }

            pageToken = data.nextPageToken
        } while (pageToken)

        return items
    }

    /**
     * Delete a playlist
     */
    async deletePlaylist(playlistId: string): Promise<void> {
        const response = await fetch(
            `${YOUTUBE_API_BASE}/playlists?id=${playlistId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            },
        )

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to delete playlist: ${error}`)
        }
    }

    /**
     * Update playlist order by moving an item
     */
    async updatePlaylistItemPosition(
        playlistItemId: string,
        playlistId: string,
        videoId: string,
        newPosition: number,
    ): Promise<void> {
        const response = await fetch(
            `${YOUTUBE_API_BASE}/playlistItems?part=snippet`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: playlistItemId,
                    snippet: {
                        playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId,
                        },
                        position: newPosition,
                    },
                }),
            },
        )

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to update playlist item position: ${error}`)
        }
    }
}
