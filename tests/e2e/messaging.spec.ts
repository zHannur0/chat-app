import { test, expect } from "@playwright/test";

test.describe("Send/Receive Message Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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

  test("should send a message successfully", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );
    const sendButton = page.locator('img[alt="send"]');

    // Type a message
    await messageInput.fill("Hello, this is a test message");

    // Send the message
    await sendButton.click();

    // Verify message was sent (adjust based on your implementation)
    // This might check for message in the chat history or input being cleared
    await expect(messageInput).toHaveValue("");
  });

  test("should send message with Enter key", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );

    await messageInput.fill("Message sent with Enter key");
    await messageInput.press("Enter");

    await expect(messageInput).toHaveValue("");
  });

  test("should not send empty message", async ({ page }) => {
    await page.goto("/chat");

    // const messageInput = page.locator(
    //   'textarea[placeholder="Write a message..."]'
    // );
    const sendButton = page.getByAltText("send");

    await sendButton.click();

    await expect(sendButton).toBeDisabled();
  });

  test("should handle message with emoji", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );

    await messageInput.fill("Hello! 😊 This is a test message");

    await messageInput.press("Enter");

    await expect(messageInput).toHaveValue("");
  });

  test("should handle long message", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );
    const longMessage =
      "This is a very long message that should be handled properly by the messaging system. ".repeat(
        10
      );

    await messageInput.fill(longMessage);
    await messageInput.press("Enter");

    await expect(messageInput).toHaveValue("");
  });

  test("should show message status indicators", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );

    await messageInput.fill("Test message for status");
    await messageInput.press("Enter");

    await expect(page.locator('[data-testid="message-status"]')).toBeVisible();
  });

  test("should handle multiple messages", async ({ page }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );

    const messages = ["First message", "Second message", "Third message"];

    for (const message of messages) {
      await messageInput.fill(message);
      await messageInput.press("Enter");
      await expect(messageInput).toHaveValue("");
    }

    // Verify all me  ssages were sent
    // This might ch  eck the chat history or message count
  });

  test("should handle network interruption during sending", async ({
    page,
  }) => {
    await page.goto("/chat");

    const messageInput = page.locator(
      'textarea[placeholder="Write a message..."]'
    );

    // Start typing  a message
    await messageInput.fill("Message during network issue");

    // Simulate netw  ork interruption
    await page.context().setOffline(true);

    await messageInput.press("Enter");

    await expect(
      page.getByText(
        "You're offline. Messages will be sent when connection is restored."
      )
    ).toBeVisible();

    await page.context().setOffline(false);

    await expect(messageInput).toHaveValue("");
  });
});
