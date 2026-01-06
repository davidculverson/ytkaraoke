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

        // Log the full URL for debugging
        console.log("YouTube OAuth callback URL:", request.nextUrl.toString())
        console.log("All search params:", Object.fromEntries(request.nextUrl.searchParams.entries()))

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
                    `/poc/playlist?error=${encodeURIComponent(description || error)}`,
                    request.url,
                ),
            )
        }

        // Validate state to prevent CSRF
        const savedState = cookieStore.get("youtube_oauth_state")?.value
        if (!state || state !== savedState) {
            console.error("State mismatch:", { received: state, expected: savedState })
            return NextResponse.redirect(
                new URL("/poc/playlist?error=Invalid%20OAuth%20state", request.url),
            )
        }

        // Must have code
        if (!code) {
            return NextResponse.redirect(
                new URL("/poc/playlist?error=No%20authorization%20code", request.url),
            )
        }

        // Get the redirect URI that was used in the auth request
        const savedRedirectUri = cookieStore.get("youtube_oauth_redirect")?.value

        // Exchange code for tokens (use the same redirect_uri as auth request)
        const tokens = await exchangeCodeForTokens(code, savedRedirectUri)

        // Calculate expiration time
        const expiresAt = Date.now() + tokens.expires_in * 1000

        // Save tokens to Convex (for server-side use)
        // Note: This requires the user to be authenticated
        // The token will be associated with their user ID
        try {
            await fetchMutation(api.youtubePremium.saveYouTubeAuth, {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                tokenType: tokens.token_type,
            })
        } catch (e) {
            // User may not be authenticated - that's ok for POC
            console.log("Could not save to Convex (user may not be authenticated):", e)
        }

        // Clear OAuth cookies
        cookieStore.delete("youtube_oauth_state")

        // Check for returnUrl (POC pages want the token returned)
        const returnUrl = cookieStore.get("youtube_oauth_return")?.value
        if (returnUrl) {
            cookieStore.delete("youtube_oauth_return")
            // Append token to returnUrl as query params
            const url = new URL(returnUrl)
            url.searchParams.set("token", tokens.access_token)
            url.searchParams.set("expires_in", tokens.expires_in.toString())
            if (tokens.refresh_token) {
                url.searchParams.set("refresh_token", tokens.refresh_token)
            }
            return NextResponse.redirect(url)
        }

        // Get room ID to redirect back to
        const roomId = cookieStore.get("youtube_oauth_room")?.value
        cookieStore.delete("youtube_oauth_room")

        // Redirect back to playlist page
        const redirectUrl = roomId
            ? `/poc/playlist?room=${roomId}&youtube_connected=true`
            : "/poc/playlist?youtube_connected=true"

        return NextResponse.redirect(new URL(redirectUrl, request.url))
    } catch (error) {
        console.error("YouTube OAuth callback error:", error)
        return NextResponse.redirect(
            new URL(
                `/poc/playlist?error=${encodeURIComponent(
                    error instanceof Error ? error.message : "OAuth failed",
                )}`,
                request.url,
            ),
        )
    }
}
