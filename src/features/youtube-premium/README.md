# YouTube Premium Integration

This feature provides an alternative playback method using a YouTube Premium account's native queue functionality.

## Benefits

1. **No Ads**: Premium accounts don't show advertisements
2. **Embed-Disabled Videos**: Works with videos that block embedding by using YouTube's native player
3. **Better Performance**: Direct YouTube integration instead of iframe embeds

## Architecture

### Components

- **YouTube OAuth Flow**: Authenticate host with their YouTube Premium account
- **YouTube Data API v3**: Manage playlists and queue operations
- **Native YouTube Player**: Use YouTube's web player interface instead of embeds
- **Queue Sync**: Sync SongUp queue with YouTube playlist in real-time

### Flow

1. Host authenticates with YouTube (OAuth 2.0)
2. System creates a temporary private playlist for the session
3. As users add songs, they're added to both Convex queue and YouTube playlist
4. Host's browser opens YouTube in a dedicated window/iframe with the playlist
5. YouTube handles playback natively with premium benefits

## Implementation Status

- [ ] YouTube OAuth setup
- [ ] YouTube Data API integration
- [ ] Playlist creation and management
- [ ] Queue synchronization
- [ ] Host UI for YouTube Premium mode
- [ ] Settings toggle for Premium vs Embed mode

## API Requirements

- Google Cloud Project with YouTube Data API v3 enabled
- OAuth 2.0 credentials (Client ID + Secret)
- Scopes needed: `youtube.force-ssl`, `youtube.readonly` (or more permissive)

## Environment Variables

```env
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret
YOUTUBE_REDIRECT_URI=https://yourdomain.com/api/youtube/callback
```

## Technical Notes

- Uses YouTube's native player controls
- Requires host to be logged into YouTube Premium account
- Playlist is deleted when room expires
- Falls back to embed mode if authentication fails
