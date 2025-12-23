/**
 * Next.js API Route Examples for YouTube Premium
 * 
 * Create these routes in src/app/api/youtube/
 */

/**
 * src/app/api/youtube/auth/route.ts
 * 
 * Initiates YouTube OAuth flow
 * 
 * import { NextRequest, NextResponse } from "next/server"
 * import { YouTubeAuthManager } from "@/features/youtube-premium/youtube-auth"
 * 
 * export async function GET(request: NextRequest) {
 *   const authManager = new YouTubeAuthManager(
 *     process.env.YOUTUBE_CLIENT_ID!,
 *     process.env.YOUTUBE_CLIENT_SECRET!,
 *     process.env.YOUTUBE_REDIRECT_URI!
 *   )
 * 
 *   // Generate random state for CSRF protection
 *   const state = crypto.randomUUID()
 *   
 *   // Store state in session/cookie for verification
 *   const response = NextResponse.redirect(authManager.getAuthorizationUrl(state))
 *   response.cookies.set("youtube_oauth_state", state, {
 *     httpOnly: true,
 *     secure: process.env.NODE_ENV === "production",
 *     sameSite: "lax",
 *     maxAge: 600, // 10 minutes
 *   })
 * 
 *   return response
 * }
 */

/**
 * src/app/api/youtube/callback/route.ts
 * 
 * Handles OAuth callback and exchanges code for token
 * 
 * import { NextRequest, NextResponse } from "next/server"
 * import { YouTubeAuthManager } from "@/features/youtube-premium/youtube-auth"
 * import { fetchMutation } from "convex/nextjs"
 * import { api } from "@/convex/_generated/api"
 * 
 * export async function GET(request: NextRequest) {
 *   const searchParams = request.nextUrl.searchParams
 *   const code = searchParams.get("code")
 *   const state = searchParams.get("state")
 *   const error = searchParams.get("error")
 * 
 *   // Verify state matches
 *   const storedState = request.cookies.get("youtube_oauth_state")?.value
 *   if (!state || state !== storedState) {
 *     return NextResponse.json({ error: "Invalid state" }, { status: 400 })
 *   }
 * 
 *   if (error) {
 *     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/host/manage?youtube_error=${error}`)
 *   }
 * 
 *   if (!code) {
 *     return NextResponse.json({ error: "No code provided" }, { status: 400 })
 *   }
 * 
 *   try {
 *     const authManager = new YouTubeAuthManager(
 *       process.env.YOUTUBE_CLIENT_ID!,
 *       process.env.YOUTUBE_CLIENT_SECRET!,
 *       process.env.YOUTUBE_REDIRECT_URI!
 *     )
 * 
 *     const token = await authManager.exchangeCodeForToken(code)
 * 
 *     // Store token in Convex
 *     await fetchMutation(api.youtubePremium.saveYouTubeAuth, {
 *       accessToken: token.access_token,
 *       refreshToken: token.refresh_token,
 *       expiresAt: token.expires_at,
 *       tokenType: token.token_type,
 *     })
 * 
 *     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/host/manage?youtube_connected=true`)
 *   } catch (error) {
 *     console.error("YouTube auth error:", error)
 *     return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/host/manage?youtube_error=auth_failed`)
 *   }
 * }
 */

/**
 * src/app/api/youtube/sync/route.ts
 * 
 * Endpoint to trigger queue sync (called from host client)
 * 
 * import { NextRequest, NextResponse } from "next/server"
 * import { YouTubeAuthManager } from "@/features/youtube-premium/youtube-auth"
 * import { YouTubeAPI } from "@/features/youtube-premium/youtube-api"
 * import { QueueSyncManager } from "@/features/youtube-premium/queue-sync"
 * import { fetchQuery } from "convex/nextjs"
 * import { api } from "@/convex/_generated/api"
 * 
 * export async function POST(request: NextRequest) {
 *   const { roomId, queue } = await request.json()
 * 
 *   // Get YouTube auth for user
 *   const auth = await fetchQuery(api.youtubePremium.getYouTubeAuth)
 *   if (!auth) {
 *     return NextResponse.json({ error: "Not authenticated with YouTube" }, { status: 401 })
 *   }
 * 
 *   // Get YouTube session for room
 *   const session = await fetchQuery(api.youtubePremium.getYouTubeSession, { roomId })
 *   if (!session) {
 *     return NextResponse.json({ error: "No YouTube session for room" }, { status: 404 })
 *   }
 * 
 *   try {
 *     const authManager = new YouTubeAuthManager(
 *       process.env.YOUTUBE_CLIENT_ID!,
 *       process.env.YOUTUBE_CLIENT_SECRET!,
 *       process.env.YOUTUBE_REDIRECT_URI!
 *     )
 * 
 *     const accessToken = await authManager.getValidToken({
 *       access_token: auth.accessToken,
 *       refresh_token: auth.refreshToken,
 *       expires_at: auth.expiresAt,
 *       token_type: auth.tokenType,
 *     })
 * 
 *     const youtubeApi = new YouTubeAPI(accessToken)
 *     const syncManager = new QueueSyncManager(youtubeApi, session.playlistId)
 * 
 *     const status = await syncManager.syncQueue(queue)
 * 
 *     return NextResponse.json(status)
 *   } catch (error) {
 *     console.error("Sync error:", error)
 *     return NextResponse.json({ 
 *       error: error instanceof Error ? error.message : "Sync failed" 
 *     }, { status: 500 })
 *   }
 * }
 */

export const API_ROUTES_INFO = `
Create these API routes in src/app/api/youtube/:
- /auth/route.ts - Initiates OAuth
- /callback/route.ts - Handles OAuth callback
- /sync/route.ts - Syncs queue with YouTube playlist
`
