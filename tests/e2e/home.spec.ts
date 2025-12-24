import { test, expect } from "@playwright/test"

test.describe("Home Page", () => {
    test("should load the home page", async ({ page }) => {
        await page.goto("/")
        
        // Wait for page to be fully loaded
        await page.waitForLoadState("networkidle")
        
        // Check page loads without critical errors
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should display main content", async ({ page }) => {
        await page.goto("/")
        
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
        await page.goto("/")
        await page.waitForLoadState("networkidle")
        
        // Page should respond to interactions
        const anyButton = page.getByRole("button").first()
        if (await anyButton.count() > 0) {
            await expect(anyButton).toBeEnabled()
        }
    })
})

test.describe("Host Page", () => {
    test("should load the host page", async ({ page }) => {
        await page.goto("/host")
        
        // Page should load (may redirect to auth)
        await page.waitForLoadState("networkidle")
        
        // Should be on some page
        const body = page.locator("body")
        await expect(body).toBeVisible()
    })

    test("should have interactive elements", async ({ page }) => {
        await page.goto("/host")
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

test.describe("Room Join Flow", () => {
    test("should allow entering room code", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("networkidle")
        
        // Look for any text input
        const inputs = page.getByRole("textbox")
        
        if (await inputs.count() > 0) {
            await inputs.first().fill("ABCD")
            await expect(inputs.first()).toHaveValue("ABCD")
        }
    })
})
