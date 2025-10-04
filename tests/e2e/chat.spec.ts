import { test, expect } from "@playwright/test";

test.describe("Chat Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - you might need to adjust this based on your auth implementation
    await page.goto("/");

    // Mock localStorage for authenticated user
    await page.evaluate(() => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: "test-user-id",
          email: "test@example.com",
          displayName: "Test User",
        })
      );
    });
  });

  test("should display chat interface", async ({ page }) => {
    await page.goto("/chat");

    // Check if main chat elements are present
    await expect(
      page.locator('textarea[placeholder="Write a message..."]')
    ).toBeVisible();
    await expect(page.locator('img[alt="send"]')).toBeVisible();
    await expect(page.locator('img[alt="emoji"]')).toBeVisible();
  });

  test("should allow typing in message input", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );
    await messageInput.fill("Hello, this is a test message");

    await expect(messageInput).toHaveValue("Hello, this is a test message");
  });

  test("should handle Enter key in message input", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );
    await messageInput.fill("Test message");
    await messageInput.press("Enter");

    // Message should be sent (input might be cleared or message should appear)
    // Adjust expectations based on your implementation
    await expect(messageInput).toBeVisible();
  });

  test("should show emoji picker when emoji button is clicked", async ({
    page,
  }) => {
    await page.goto("/chat");

    const emojiButton = page.locator('img[alt="emoji"]');
    await emojiButton.click();

    // Check if emoji picker is visible (adjust selector based on your implementation)
    // This might need adjustment based on how your emoji picker works
    await expect(page.locator('[data-testid="emoji-picker"]')).toBeVisible();
  });

  test("should display user search functionality", async ({ page }) => {
    await page.goto("/chat");

    // Look for user search input (adjust selector based on your implementation)
    const searchInput = page.locator('input[placeholder="Search by email..."]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill("test@example.com");
    // Add more assertions based on your search implementation
  });

  test("should handle offline state", async ({ page }) => {
    await page.goto("/chat");

    // Simulate offline state
    await page.context().setOffline(true);

    // Check if offline message is displayed
    await expect(
      page.getByText(
        "You're offline. Messages will be sent when connection is restored."
      )
    ).toBeVisible();

    // Restore online state
    await page.context().setOffline(false);
  });
});
