const { chromium } = require("playwright")

async function testCreateRoom() {
    const browser = await chromium.launch({ headless: false })
    const page = await browser.newPage()

    console.log("Navigating to /host...")
    await page.goto("http://localhost:3000/host")

    console.log("Waiting for page to load...")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(2000)

    console.log("Looking for Create Room button to open dialog...")
    
    // Look for the button that opens the dialog
    const openDialogButton = page.locator('button:has-text("Create Room"), button:has-text("Create a room")')
    
    if (await openDialogButton.count() > 0) {
        console.log("Found Create Room button, clicking...")
        await openDialogButton.first().click()
        await page.waitForTimeout(1000)
        
        // Now look for the submit button inside the dialog
        console.log("Looking for submit button in dialog...")
        const submitButton = page.locator('button[type="submit"]:has-text("Create Room"), form button:has-text("Create Room")')
        
        if (await submitButton.count() > 0) {
            console.log("Found submit button, clicking to create room...")
            await submitButton.first().click()
            console.log("Submit clicked! Waiting for auth...")
            await page.waitForTimeout(5000)
        } else {
            console.log("No submit button found in dialog")
        }
    } else {
        console.log("No Create Room button found on page")
    }

    // Check for errors in the page
    const pageContent = await page.content()
    if (pageContent.includes("PKCS#8") || pageContent.includes("invalid RSA")) {
        console.log("ERROR: Auth key error found in page!")
    } else {
        console.log("No auth key errors found in page content")
    }

    // Wait a bit to see the result
    await page.waitForTimeout(3000)

    await browser.close()
    console.log("Test complete")
}

testCreateRoom().catch(console.error)
