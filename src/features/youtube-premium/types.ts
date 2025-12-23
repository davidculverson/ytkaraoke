/**
 * Types for YouTube Premium integration
 */

export interface YouTubeAuthToken {
    access_token: string
    refresh_token: string
    expires_at: number
    token_type: "Bearer"
}

export interface YouTubePlaylist {
    id: string
    title: string
    description: string
    privacyStatus: "private" | "public" | "unlisted"
    itemCount: number
}

export interface YouTubePlaylistItem {
    id: string
    videoId: string
    position: number
    title: string
    channelTitle: string
    thumbnails: {
        default: { url: string; width: number; height: number }
        medium: { url: string; width: number; height: number }
        high: { url: string; width: number; height: number }
    }
}

export interface YouTubePremiumSession {
    playlistId: string
    roomId: string
    hostUserId: string
    createdAt: number
    lastSyncedAt: number
}

export interface QueueSyncStatus {
    inSync: boolean
    lastSync: number
    pendingAdditions: string[] // videoIds
    pendingRemovals: string[] // videoIds
    error?: string
}

export type PlaybackMode = "embed" | "youtube-premium"
