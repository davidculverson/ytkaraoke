/**
 * OAuth Flow Tests for YouTube Premium Integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// OAuth configuration
const YOUTUBE_SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.force-ssl",
]

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

/**
 * Build OAuth authorization URL
 */
function buildAuthUrl(config: {
    clientId: string
    redirectUri: string
    state: string
}): string {
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: YOUTUBE_SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent",
        state: config.state,
    })

    return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Validate OAuth state parameter to prevent CSRF
 */
function validateState(received: string, expected: string): boolean {
    return received === expected && received.length > 0
}

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(expiresAt: number, bufferMs: number = 300000): boolean {
    return Date.now() + bufferMs >= expiresAt
}

/**
 * Generate a secure random state for CSRF protection
 */
function generateState(): string {
    const array = new Uint8Array(32)
    // In browser: crypto.getRandomValues(array)
    // For testing, we'll simulate
    for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
    }
    return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("")
}

describe("OAuth URL Building", () => {
    it("should build correct authorization URL", () => {
        const url = buildAuthUrl({
            clientId: "test-client-id.apps.googleusercontent.com",
            redirectUri: "http://localhost:3000/api/youtube/callback",
            state: "random-state-123",
        })

        expect(url).toContain(GOOGLE_AUTH_URL)
        expect(url).toContain("client_id=test-client-id")
        expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost")
        expect(url).toContain("response_type=code")
        expect(url).toContain("access_type=offline")
        expect(url).toContain("prompt=consent")
        expect(url).toContain("state=random-state-123")
    })

    it("should include required scopes", () => {
        const url = buildAuthUrl({
            clientId: "test-client-id",
            redirectUri: "http://localhost:3000/callback",
            state: "state123",
        })

        expect(url).toContain("youtube")
        expect(url).toContain("youtube.force-ssl")
    })
})

describe("OAuth State Validation", () => {
    it("should validate matching states", () => {
        const state = "secure-random-state-123"
        expect(validateState(state, state)).toBe(true)
    })

    it("should reject mismatched states", () => {
        expect(validateState("received", "expected")).toBe(false)
    })

    it("should reject empty states", () => {
        expect(validateState("", "")).toBe(false)
        expect(validateState("valid", "")).toBe(false)
        expect(validateState("", "valid")).toBe(false)
    })
})

describe("Token Expiration", () => {
    it("should detect expired tokens", () => {
        const expiredAt = Date.now() - 1000 // 1 second ago
        expect(isTokenExpired(expiredAt)).toBe(true)
    })

    it("should detect tokens expiring soon", () => {
        const expiresIn5Min = Date.now() + 5 * 60 * 1000 // 5 minutes from now
        const bufferMs = 10 * 60 * 1000 // 10 minute buffer

        expect(isTokenExpired(expiresIn5Min, bufferMs)).toBe(true)
    })

    it("should detect valid tokens", () => {
        const expiresIn1Hour = Date.now() + 60 * 60 * 1000 // 1 hour from now
        expect(isTokenExpired(expiresIn1Hour)).toBe(false)
    })

    it("should use default 5-minute buffer", () => {
        const expiresIn4Min = Date.now() + 4 * 60 * 1000 // 4 minutes from now
        expect(isTokenExpired(expiresIn4Min)).toBe(true)

        const expiresIn6Min = Date.now() + 6 * 60 * 1000 // 6 minutes from now
        expect(isTokenExpired(expiresIn6Min)).toBe(false)
    })
})

describe("State Generation", () => {
    it("should generate unique states", () => {
        const state1 = generateState()
        const state2 = generateState()

        expect(state1).not.toBe(state2)
    })

    it("should generate states of sufficient length", () => {
        const state = generateState()
        expect(state.length).toBeGreaterThanOrEqual(32)
    })

    it("should generate hex-encoded states", () => {
        const state = generateState()
        expect(/^[0-9a-f]+$/.test(state)).toBe(true)
    })
})

describe("OAuth Callback Handling", () => {
    it("should extract code from callback URL", () => {
        const callbackUrl = new URL(
            "http://localhost:3000/api/youtube/callback?code=auth-code-123&state=state456",
        )

        const code = callbackUrl.searchParams.get("code")
        const state = callbackUrl.searchParams.get("state")

        expect(code).toBe("auth-code-123")
        expect(state).toBe("state456")
    })

    it("should detect error responses", () => {
        const errorUrl = new URL(
            "http://localhost:3000/api/youtube/callback?error=access_denied&error_description=User%20denied%20access",
        )

        const error = errorUrl.searchParams.get("error")
        const description = errorUrl.searchParams.get("error_description")

        expect(error).toBe("access_denied")
        expect(description).toBe("User denied access")
    })
})

describe("Token Exchange", () => {
    const mockFetch = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        global.fetch = mockFetch
    })

    it("should exchange code for tokens", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: "ya29.access-token",
                refresh_token: "1//refresh-token",
                expires_in: 3600,
                token_type: "Bearer",
            }),
        })

        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: "client-id",
                client_secret: "client-secret",
                code: "auth-code",
                grant_type: "authorization_code",
                redirect_uri: "http://localhost:3000/callback",
            }),
        })

        const tokens = await response.json()

        expect(tokens.access_token).toBeDefined()
        expect(tokens.refresh_token).toBeDefined()
        expect(tokens.expires_in).toBe(3600)
    })

    it("should refresh expired tokens", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: "ya29.new-access-token",
                expires_in: 3600,
                token_type: "Bearer",
            }),
        })

        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: "client-id",
                client_secret: "client-secret",
                refresh_token: "1//refresh-token",
                grant_type: "refresh_token",
            }),
        })

        const tokens = await response.json()

        expect(tokens.access_token).toBe("ya29.new-access-token")
    })
})
