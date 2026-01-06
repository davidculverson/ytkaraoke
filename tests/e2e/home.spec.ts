import { test, expect } from "@playwright/test"

test.describe("Home Page", () => {
    test("should load the home page and redirect to playlist", async ({ page }) => {
        await page.goto("/")
        
        // Wait for redirect to complete
        await page.waitForLoadState("networkidle")
        
        // Should redirect to /poc/playlist
        expect(page.url()).toContain("/poc/playlist")
        
        // Check page loads without critical errors
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should display main content on playlist page", async ({ page }) => {
        await page.goto("/poc/playlist")
        
        // Wait for page to be fully loaded
        await page.waitForLoadState("networkidle")
        
        // Should have some visible content
        const body = page.locator("body")
        await expect(body).toBeVisible()
        
        // No critical error messages
        const errorText = page.getByText(/500|server error|crash/i)
        const errorCount = await errorText.count()
        expect(errorCount).toBe(0)
    })

    test("should be navigable", async ({ page }) => {
        await page.goto("/poc/playlist")
        await page.waitForLoadState("networkidle")
        
        // Page should respond to interactions
        const anyButton = page.getByRole("button").first()
        if (await anyButton.count() > 0) {
            await expect(anyButton).toBeEnabled()
        }
    })
})

test.describe("Playlist Page", () => {
    test("should load the playlist page", async ({ page }) => {
        await page.goto("/poc/playlist")
        
        await page.waitForLoadState("networkidle")
        
        // Should be on the page
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should have interactive elements", async ({ page }) => {
        await page.goto("/poc/playlist")
        await page.waitForLoadState("networkidle")
        
        // Should have some buttons or links
        const buttons = page.getByRole("button")
        const links = page.getByRole("link")
        const inputs = page.getByRole("textbox")
        
        const hasButtons = await buttons.count() > 0
        const hasLinks = await links.count() > 0
        const hasInputs = await inputs.count() > 0
        
        // Should have at least some interactive element
        expect(hasButtons || hasLinks || hasInputs).toBe(true)
    })
})
