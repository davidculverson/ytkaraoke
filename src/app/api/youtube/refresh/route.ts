/**
 * YouTube OAuth - Token Refresh
 *
 * POST /api/youtube/refresh
 * Refreshes an expired access token using the refresh token
 */

import { refreshAccessToken } from "@/lib/youtube-oauth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { refreshToken } = body

        if (!refreshToken) {
            return NextResponse.json(
                { error: "Refresh token is required" },
                { status: 400 }
            )
        }

        const tokens = await refreshAccessToken(refreshToken)

        return NextResponse.json({
            access_token: tokens.access_token,
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
        })
    } catch (error) {
        console.error("Token refresh error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Token refresh failed" },
            { status: 401 }
        )
    }
}
