/**
 * YouTube Premium Feature - Public Exports
 */

// Components
export { YouTubePremiumPlayer } from "./components/YouTubePremiumPlayer"
export { YouTubePremiumSetup } from "./components/YouTubePremiumSetup"

// Hooks
export { useYouTubePremium } from "./hooks/useYouTubePremium"

// Types
export type {
    YouTubeAuthToken,
    YouTubePlaylist,
    YouTubePlaylistItem,
    YouTubePremiumSession,
    QueueSyncStatus,
    PlaybackMode,
} from "./types"

// API Client
export { YouTubeAPI } from "./youtube-api"
