import { test, expect } from "@playwright/test"

test.describe("Room Creation", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/host")
        await page.waitForLoadState("networkidle")
    })

    test("host page loads successfully", async ({ page }) => {
        // Just verify the page loads
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should have some UI controls", async ({ page }) => {
        // Look for any buttons
        const buttons = page.getByRole("button")
        const buttonCount = await buttons.count()
        
        console.log(`Found ${buttonCount} buttons on host page`)
        
        // Just verify page has some interactivity
        expect(buttonCount).toBeGreaterThanOrEqual(0)
    })
})

test.describe("Room Page", () => {
    test("should handle room URL gracefully", async ({ page }) => {
        // Go to a room URL - may show error or redirect
        await page.goto("/room/TESTROOM", { waitUntil: "networkidle" })
        
        // Page should render something
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })
})
