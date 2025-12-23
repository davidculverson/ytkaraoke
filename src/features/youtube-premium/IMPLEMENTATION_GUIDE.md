# YouTube Premium Integration - Implementation Guide

## Overview

This implementation allows SongUp to use a YouTube Premium account's native playlist system instead of embedded players, solving two major issues:
1. **No ads** - Premium accounts don't show advertisements
2. **Embed-disabled videos work** - Uses YouTube's native player instead of iframes

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/api/youtube/callback`
5. Copy Client ID and Client Secret

### 2. Environment Variables

Add to your `.env.local`:

```env
YOUTUBE_CLIENT_ID=your-client-id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

For production, update `YOUTUBE_REDIRECT_URI` to your domain.

### 3. Update Convex Schema

Add to `src/convex/schema.ts`:

```ts
youtubeAuth: defineTable({
  userId: v.id("users"),
  accessToken: v.string(),
  refreshToken: v.string(),
  expiresAt: v.number(),
  tokenType: v.string(),
}).index("by_user", ["userId"]),

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
```

Update `rooms` table:
```ts
playbackMode: v.optional(v.union(v.literal("embed"), v.literal("youtube-premium"))),
```

### 4. Create Convex Functions

Create `src/convex/youtube-premium.ts` with functions from `convex-functions.ts`

### 5. Create API Routes

Create these Next.js API routes:
- `src/app/api/youtube/auth/route.ts` - OAuth initiation
- `src/app/api/youtube/callback/route.ts` - OAuth callback
- `src/app/api/youtube/sync/route.ts` - Queue synchronization

See `api-route-examples.ts` for implementations.

### 6. Update Host UI

In the host room page (`src/app/host/[code]/page.tsx`):

1. Add playback mode selector
2. Show YouTube Premium setup if mode is selected
3. Display YouTubePremiumPlayer component when active
4. Use the `useYouTubePremium` hook for queue sync

Example:
```tsx
import { YouTubePremiumSetup } from "@/features/youtube-premium/components/YouTubePremiumSetup"
import { YouTubePremiumPlayer } from "@/features/youtube-premium/components/YouTubePremiumPlayer"
import { useYouTubePremium } from "@/features/youtube-premium/hooks/useYouTubePremium"

// In your component
const { syncStatus, isSyncing, syncQueue, initiateYouTubeAuth, openYouTubePlaylist } = 
  useYouTubePremium(roomId, queue)

// Show setup or player based on connection status
```

## User Flow

### For Hosts

1. **Create Room** → Select "YouTube Premium Mode"
2. **Connect YouTube** → Click "Connect YouTube Account"
3. **Authorize** → Grant permissions to manage playlists
4. **Room Created** → Temporary private playlist created
5. **Open Player** → YouTube opens in new window with playlist
6. **Queue Syncs** → As users add songs, they appear in YouTube playlist
7. **Native Playback** → YouTube plays songs with Premium benefits
8. **Session Ends** → Playlist automatically deleted

### Technical Flow

```
User adds song → Convex mutation → 
  → Song added to Convex queue
  → Trigger sync via webhook/polling
  → API calls YouTube Data API
  → Song added to YouTube playlist
  → YouTube player updates automatically
```

## API Rate Limits

YouTube Data API v3 has quotas:
- **10,000 units/day** (default free tier)
- Playlist insert: 50 units
- Playlist delete: 50 units

For a typical session:
- Create playlist: 50 units
- Add 20 songs: 1,000 units (50 × 20)
- Sync operations: ~100-200 units
- Delete playlist: 50 units
- **Total: ~1,200 units per session**

You can host ~8 sessions per day on free tier.

## Security Considerations

1. **Token Storage**: Store refresh tokens securely in Convex
2. **CSRF Protection**: Use state parameter in OAuth flow
3. **Token Refresh**: Auto-refresh access tokens before expiry
4. **Playlist Cleanup**: Delete playlists when rooms expire
5. **Rate Limiting**: Implement backoff for API calls

## Testing Checklist

- [ ] OAuth flow completes successfully
- [ ] Tokens stored and refreshed correctly
- [ ] Playlist created with correct privacy settings
- [ ] Songs sync from queue to playlist
- [ ] Order maintained correctly
- [ ] Current song removal works
- [ ] Playlist deleted on room expiration
- [ ] Fallback to embed mode if auth fails
- [ ] Multiple concurrent rooms work

## Troubleshooting

### "Invalid credentials"
- Check YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET
- Verify redirect URI matches Google Console

### "Insufficient permissions"
- Ensure scopes include `youtube.force-ssl`
- Revoke access in Google Account settings and re-authorize

### "Quota exceeded"
- Monitor usage in Google Cloud Console
- Request quota increase if needed
- Implement caching for playlist reads

### Songs not syncing
- Check network tab for API errors
- Verify access token not expired
- Check YouTube Data API is enabled

## Future Enhancements

- [ ] Batch playlist operations to reduce API calls
- [ ] WebSocket for real-time sync updates
- [ ] Support for multiple host screens
- [ ] Playlist persistence across sessions
- [ ] Analytics for playback stats
- [ ] Support for YouTube Music playlists
