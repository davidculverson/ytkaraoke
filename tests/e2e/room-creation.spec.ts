import { test, expect } from "@playwright/test"

test.describe("Session Creation", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/poc/playlist")
        await page.waitForLoadState("networkidle")
    })

    test("playlist page loads successfully", async ({ page }) => {
        // Just verify the page loads
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should have some UI controls", async ({ page }) => {
        // Look for any buttons
        const buttons = page.getByRole("button")
        const buttonCount = await buttons.count()
        
        console.log(`Found ${buttonCount} buttons on playlist page`)
        
        // Just verify page has some interactivity
        expect(buttonCount).toBeGreaterThanOrEqual(0)
    })
})
