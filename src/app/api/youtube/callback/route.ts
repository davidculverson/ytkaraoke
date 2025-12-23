/**
 * YouTube OAuth - Callback Handler
 *
 * GET /api/youtube/callback
 * Handles OAuth callback from Google, exchanges code for tokens
 */

import { exchangeCodeForTokens } from "@/lib/youtube-oauth"
import { fetchMutation } from "convex/nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()

        // Get OAuth response params
        const code = request.nextUrl.searchParams.get("code")
        const state = request.nextUrl.searchParams.get("state")
        const error = request.nextUrl.searchParams.get("error")

        // Check for OAuth errors
        if (error) {
            const description = request.nextUrl.searchParams.get(
                "error_description",
            )
            console.error("YouTube OAuth error:", error, description)
            return NextResponse.redirect(
                new URL(
                    `/host?error=${encodeURIComponent(description || error)}`,
                    request.url,
                ),
            )
        }

        // Validate state to prevent CSRF
        const savedState = cookieStore.get("youtube_oauth_state")?.value
        if (!state || state !== savedState) {
            console.error("State mismatch:", { received: state, expected: savedState })
            return NextResponse.redirect(
                new URL("/host?error=Invalid%20OAuth%20state", request.url),
            )
        }

        // Must have code
        if (!code) {
            return NextResponse.redirect(
                new URL("/host?error=No%20authorization%20code", request.url),
            )
        }

        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code)

        // Calculate expiration time
        const expiresAt = Date.now() + tokens.expires_in * 1000

        // Save tokens to Convex
        // Note: This requires the user to be authenticated
        // The token will be associated with their user ID
        await fetchMutation(api.youtubePremium.saveYouTubeAuth, {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt,
            tokenType: tokens.token_type,
        })

        // Clear OAuth cookies
        cookieStore.delete("youtube_oauth_state")

        // Get room ID to redirect back to
        const roomId = cookieStore.get("youtube_oauth_room")?.value
        cookieStore.delete("youtube_oauth_room")

        // Redirect back to host page
        const redirectUrl = roomId
            ? `/host/${roomId}?youtube_connected=true`
            : "/host?youtube_connected=true"

        return NextResponse.redirect(new URL(redirectUrl, request.url))
    } catch (error) {
        console.error("YouTube OAuth callback error:", error)
        return NextResponse.redirect(
            new URL(
                `/host?error=${encodeURIComponent(
                    error instanceof Error ? error.message : "OAuth failed",
                )}`,
                request.url,
            ),
        )
    }
}
