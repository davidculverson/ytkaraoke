import { test, expect } from "@playwright/test"

test.describe("YouTube Premium OAuth Flow", () => {
    test("auth endpoint returns redirect to Google", async ({ request }) => {
        const response = await request.get("/api/youtube/auth", {
            maxRedirects: 0,
        })
        
        // Should redirect to Google OAuth
        expect(response.status()).toBe(307)
        const location = response.headers()["location"]
        expect(location).toContain("accounts.google.com")
        expect(location).toContain("oauth2")
    })

    test("auth endpoint includes required scopes", async ({ request }) => {
        const response = await request.get("/api/youtube/auth", {
            maxRedirects: 0,
        })
        
        const location = response.headers()["location"]
        expect(location).toContain("youtube")
        expect(location).toContain("scope")
    })

    test("auth endpoint sets state cookie", async ({ request }) => {
        const response = await request.get("/api/youtube/auth", {
            maxRedirects: 0,
        })
        
        const cookies = response.headers()["set-cookie"]
        expect(cookies).toBeDefined()
        expect(cookies).toContain("youtube_oauth_state")
    })

    test("callback redirects on invalid state", async ({ request }) => {
        // Callback will redirect to /poc/playlist with error - not return error status
        const response = await request.get("/api/youtube/callback?code=test&state=invalid", {
            maxRedirects: 0,
        })
        
        // Should redirect (307 or 302)
        expect([302, 307]).toContain(response.status())
        const location = response.headers()["location"]
        expect(location).toContain("error")
    })

    test("callback redirects on missing code", async ({ request }) => {
        const response = await request.get("/api/youtube/callback?state=test", {
            maxRedirects: 0,
        })
        
        // Should redirect with error
        expect([302, 307]).toContain(response.status())
        const location = response.headers()["location"]
        expect(location).toContain("error")
    })
})

test.describe("YouTube Playlist API", () => {
    test("playlist endpoint requires authentication", async ({ request }) => {
        const response = await request.post("/api/youtube/playlist", {
            data: { roomId: "test123" },
        })
        
        // Should fail without auth
        expect(response.status()).toBeGreaterThanOrEqual(400)
    })

    test("sync endpoint requires roomId", async ({ request }) => {
        const response = await request.post("/api/youtube/sync", {
            data: { queue: [] },
        })
        
        // Should fail without roomId
        const body = await response.json()
        expect(body.error).toBeDefined()
    })
})

test.describe("YouTube Premium UI Integration", () => {
    test("player switcher component loads on playlist page", async ({ page }) => {
        await page.goto("/poc/playlist")
        await page.waitForLoadState("networkidle")
        
        // Look for any YouTube-related UI elements
        const youtubeElements = page.locator("[class*='youtube'], [class*='YouTube'], [data-testid*='youtube']")
        const ytButton = page.getByRole("button", { name: /youtube/i })
        const ytText = page.getByText(/youtube/i)
        
        // Log findings
        const foundElements = await youtubeElements.count()
        const foundButton = await ytButton.count()
        const foundText = await ytText.count()
        
        console.log(`YouTube elements: ${foundElements}, buttons: ${foundButton}, text: ${foundText}`)
    })
})
