/**
 * YouTube OAuth - Initiate Auth Flow
 *
 * GET /api/youtube/auth
 * Redirects user to Google OAuth consent screen
 */

import { buildAuthUrl, generateState } from "@/lib/youtube-oauth"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        // Get room ID from query params (to redirect back after auth)
        const roomId = request.nextUrl.searchParams.get("roomId")

        // Generate CSRF state
        const state = generateState()

        // Store state and roomId in cookies for validation in callback
        const cookieStore = await cookies()
        cookieStore.set("youtube_oauth_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 600, // 10 minutes
            path: "/",
        })

        if (roomId) {
            cookieStore.set("youtube_oauth_room", roomId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 600,
                path: "/",
            })
        }

        // Build authorization URL and redirect
        const authUrl = buildAuthUrl(state)

        return NextResponse.redirect(authUrl)
    } catch (error) {
        console.error("YouTube OAuth error:", error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to initiate OAuth",
            },
            { status: 500 },
        )
    }
}
