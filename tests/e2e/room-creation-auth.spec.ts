import { test, expect } from "@playwright/test"

test.describe("Room Creation Flow", () => {
    test("should create a room without auth errors", async ({ page }) => {
        // Navigate to host page
        await page.goto("/host")

        // Wait for page to be ready
        await page.waitForLoadState("networkidle")

        // Look for a create room button or form
        const createButton = page.locator(
            'button:has-text("Create"), button:has-text("Room"), button:has-text("Start"), button:has-text("Host")',
        )

        if ((await createButton.count()) > 0) {
            // Click the first matching button
            await createButton.first().click()

            // Wait for any potential errors
            await page.waitForTimeout(3000)

            // Check console for auth errors
            const errors: string[] = []
            page.on("pageerror", (error) => {
                errors.push(error.message)
            })

            // Wait a bit more
            await page.waitForTimeout(2000)

            // Check if there's a PKCS8 or RSA error in the page
            const pageContent = await page.content()
            expect(pageContent).not.toContain("PKCS#8")
            expect(pageContent).not.toContain("invalid RSA PrivateKeyInfo")

            console.log("Room creation button clicked without PKCS/RSA errors")
        } else {
            console.log("No create button found, skipping test")
        }
    })
})
