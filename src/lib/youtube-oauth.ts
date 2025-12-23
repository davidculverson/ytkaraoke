/**
 * YouTube OAuth Configuration
 *
 * Shared configuration for YouTube OAuth flow
 */

export const YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

export function getYouTubeConfig() {
    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
    const redirectUri =
        process.env.YOUTUBE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/youtube/callback`

    if (!clientId || !clientSecret) {
        throw new Error(
            "Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET environment variables",
        )
    }

    return {
        clientId,
        clientSecret,
        redirectUri,
    }
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthUrl(state: string): string {
    const config = getYouTubeConfig()

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: YOUTUBE_SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent",
        state,
    })

    return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
}> {
    const config = getYouTubeConfig()

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: config.redirectUri,
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Token exchange failed: ${error}`)
    }

    return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    expires_in: number
    token_type: string
}> {
    const config = getYouTubeConfig()

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        }),
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Token refresh failed: ${error}`)
    }

    return response.json()
}

/**
 * Generate a secure random state for CSRF protection
 */
export function generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}
