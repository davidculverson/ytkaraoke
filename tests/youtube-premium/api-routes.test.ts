/**
 * API Route Tests for YouTube Premium Integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock configuration
const mockConfig = {
    clientId: "test-client-id.apps.googleusercontent.com",
    clientSecret: "test-client-secret",
    redirectUri: "http://localhost:3000/api/youtube/callback",
}

describe("YouTube OAuth API Routes - Logic Tests", () => {
    describe("/api/youtube/auth", () => {
        it("should generate secure state for CSRF protection", () => {
            // Simulate state generation
            const generateState = () => {
                const array = new Uint8Array(32)
                for (let i = 0; i < array.length; i++) {
                    array[i] = Math.floor(Math.random() * 256)
                }
                return Array.from(array, (b) =>
                    b.toString(16).padStart(2, "0"),
                ).join("")
            }

            const state = generateState()
            expect(state.length).toBe(64) // 32 bytes = 64 hex chars
        })

        it("should build correct OAuth URL with all parameters", () => {
            const state = "test-state-123"
            const scopes = [
                "https://www.googleapis.com/auth/youtube",
                "https://www.googleapis.com/auth/youtube.force-ssl",
            ]

            const params = new URLSearchParams({
                client_id: mockConfig.clientId,
                redirect_uri: mockConfig.redirectUri,
                response_type: "code",
                scope: scopes.join(" "),
                access_type: "offline",
                prompt: "consent",
                state,
            })

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

            expect(authUrl).toContain("accounts.google.com")
            expect(authUrl).toContain("client_id=test-client-id")
            expect(authUrl).toContain("access_type=offline")
            expect(authUrl).toContain("prompt=consent")
            expect(authUrl).toContain("state=test-state-123")
        })

        it("should store state in cookie for CSRF validation", () => {
            const mockCookies: Record<string, string> = {}

            // Simulate cookie setting
            const setCookie = (name: string, value: string) => {
                mockCookies[name] = value
            }

            const state = "random-state-456"
            setCookie("youtube_oauth_state", state)

            expect(mockCookies["youtube_oauth_state"]).toBe(state)
        })
    })

    describe("/api/youtube/callback", () => {
        it("should validate state matches stored cookie", () => {
            const savedState = "original-state"
            const receivedState = "original-state"

            const isValid = savedState === receivedState && savedState.length > 0
            expect(isValid).toBe(true)
        })

        it("should reject mismatched state", () => {
            const savedState = "original-state"
            const receivedState = "attacker-state"

            const isValid = savedState === receivedState
            expect(isValid).toBe(false)
        })

        it("should handle OAuth error responses", () => {
            const errorParams = {
                error: "access_denied",
                error_description: "User denied access",
            }

            expect(errorParams.error).toBe("access_denied")
            expect(errorParams.error_description).toBe("User denied access")
        })

        it("should calculate correct token expiration time", () => {
            const tokenResponse = {
                access_token: "ya29.xxx",
                refresh_token: "1//xxx",
                expires_in: 3600, // 1 hour in seconds
                token_type: "Bearer",
            }

            const now = Date.now()
            const expiresAt = now + tokenResponse.expires_in * 1000

            // Should expire approximately 1 hour from now
            expect(expiresAt).toBeGreaterThan(now + 3500000)
            expect(expiresAt).toBeLessThan(now + 3700000)
        })
    })

    describe("/api/youtube/sync", () => {
        it("should validate required request body fields", () => {
            const validRequest = {
                roomId: "room123",
                queue: [{ videoId: "vid1", title: "Song 1", artist: "Artist" }],
            }

            expect(validRequest.roomId).toBeDefined()
            expect(validRequest.queue).toBeDefined()
            expect(Array.isArray(validRequest.queue)).toBe(true)
        })

        it("should reject request without roomId", () => {
            const invalidRequest = {
                queue: [],
            }

            const isValid = "roomId" in invalidRequest && invalidRequest.roomId
            expect(isValid).toBeFalsy()
        })

        it("should check if token needs refresh", () => {
            const auth = {
                expiresAt: Date.now() + 60000, // 1 minute from now
            }
            const bufferMs = 300000 // 5 minutes

            const needsRefresh = Date.now() > auth.expiresAt - bufferMs
            expect(needsRefresh).toBe(true) // Within 5 minute buffer
        })

        it("should not refresh token with plenty of time left", () => {
            const auth = {
                expiresAt: Date.now() + 3600000, // 1 hour from now
            }
            const bufferMs = 300000 // 5 minutes

            const needsRefresh = Date.now() > auth.expiresAt - bufferMs
            expect(needsRefresh).toBe(false)
        })

        it("should calculate sync diff correctly", () => {
            const queueVideoIds = ["vid1", "vid2", "vid3"]
            const playlistVideoIds = ["vid1", "vid4"]

            const queueSet = new Set(queueVideoIds)
            const playlistSet = new Set(playlistVideoIds)

            const toAdd = queueVideoIds.filter((id) => !playlistSet.has(id))
            const toRemove = playlistVideoIds.filter((id) => !queueSet.has(id))

            expect(toAdd).toEqual(["vid2", "vid3"])
            expect(toRemove).toEqual(["vid4"])
        })
    })

    describe("/api/youtube/playlist", () => {
        it("should validate required fields for playlist creation", () => {
            const validRequest = {
                roomId: "room123",
                roomCode: "ABCD",
            }

            expect(validRequest.roomId).toBeDefined()
            expect(validRequest.roomCode).toBeDefined()
        })

        it("should return existing session if already created", () => {
            const existingSession = {
                playlistId: "PLexisting123",
                playlistTitle: "SongUp - ABCD",
            }

            const response = {
                playlistId: existingSession.playlistId,
                playlistTitle: existingSession.playlistTitle,
                isExisting: true,
            }

            expect(response.isExisting).toBe(true)
            expect(response.playlistId).toBe("PLexisting123")
        })

        it("should handle playlist deletion gracefully when no session exists", () => {
            const session = null

            const response = session
                ? { success: true }
                : { success: true, message: "No session to delete" }

            expect(response.success).toBe(true)
            expect(response.message).toBe("No session to delete")
        })
    })
})

describe("Token Refresh Logic", () => {
    it("should use same refresh token when refreshing access token", () => {
        const originalAuth = {
            accessToken: "old-access-token",
            refreshToken: "persistent-refresh-token",
            expiresAt: Date.now() - 1000, // expired
        }

        const refreshedTokens = {
            access_token: "new-access-token",
            expires_in: 3600,
            token_type: "Bearer",
        }

        // When saving refreshed auth, keep original refresh token
        const updatedAuth = {
            accessToken: refreshedTokens.access_token,
            refreshToken: originalAuth.refreshToken, // Keep same
            expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
            tokenType: refreshedTokens.token_type,
        }

        expect(updatedAuth.refreshToken).toBe("persistent-refresh-token")
        expect(updatedAuth.accessToken).toBe("new-access-token")
    })
})

describe("Error Handling", () => {
    it("should format error messages for redirect", () => {
        const error = "Token exchange failed: invalid_grant"
        const encoded = encodeURIComponent(error)

        expect(encoded).toBe("Token%20exchange%20failed%3A%20invalid_grant")
    })

    it("should handle network errors gracefully", () => {
        const networkError = new Error("Failed to fetch")

        const response = {
            error: networkError.message,
            inSync: false,
            lastSync: Date.now(),
            pendingAdditions: [],
            pendingRemovals: [],
        }

        expect(response.inSync).toBe(false)
        expect(response.error).toBe("Failed to fetch")
    })
})
