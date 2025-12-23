/**
 * YouTube OAuth 2.0 Authentication
 * Handles authentication flow for YouTube Premium accounts
 */

import { YouTubeAuthToken } from "./types"

const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube.force-ssl", // Manage YouTube account
    "https://www.googleapis.com/auth/youtube.readonly", // View account info
]

export class YouTubeAuthManager {
    private clientId: string
    private clientSecret: string
    private redirectUri: string

    constructor(
        clientId: string,
        clientSecret: string,
        redirectUri: string,
    ) {
        this.clientId = clientId
        this.clientSecret = clientSecret
        this.redirectUri = redirectUri
    }

    /**
     * Generate OAuth authorization URL
     */
    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: "code",
            scope: YOUTUBE_SCOPES.join(" "),
            access_type: "offline", // Get refresh token
            prompt: "consent", // Force consent screen to get refresh token
            state, // CSRF protection
        })

        return `${YOUTUBE_AUTH_URL}?${params.toString()}`
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code: string): Promise<YouTubeAuthToken> {
        const response = await fetch(YOUTUBE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                grant_type: "authorization_code",
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to exchange code: ${error}`)
        }

        const data = await response.json()

        return {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_at: Date.now() + data.expires_in * 1000,
            token_type: data.token_type,
        }
    }

    /**
     * Refresh an expired access token
     */
    async refreshAccessToken(
        refreshToken: string,
    ): Promise<YouTubeAuthToken> {
        const response = await fetch(YOUTUBE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: "refresh_token",
            }),
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Failed to refresh token: ${error}`)
        }

        const data = await response.json()

        return {
            access_token: data.access_token,
            refresh_token: refreshToken, // Refresh token stays the same
            expires_at: Date.now() + data.expires_in * 1000,
            token_type: data.token_type,
        }
    }

    /**
     * Check if token is expired or about to expire (within 5 minutes)
     */
    isTokenExpired(token: YouTubeAuthToken): boolean {
        const fiveMinutes = 5 * 60 * 1000
        return Date.now() >= token.expires_at - fiveMinutes
    }

    /**
     * Get valid access token, refreshing if necessary
     */
    async getValidToken(token: YouTubeAuthToken): Promise<string> {
        if (this.isTokenExpired(token)) {
            const newToken = await this.refreshAccessToken(token.refresh_token)
            return newToken.access_token
        }
        return token.access_token
    }
}
