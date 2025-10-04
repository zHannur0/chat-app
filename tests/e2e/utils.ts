import { Page } from "@playwright/test";

/**
 * Mock authentication for E2E tests
 */
export async function mockAuth(
  page: Page,
  user: { uid: string; email: string; displayName: string }
) {
  await page.evaluate(userData => {
    localStorage.setItem("user", JSON.stringify(userData));
  }, user);
}

/**
 * Wait for the app to be ready
 */
export async function waitForAppReady(page: Page) {
  // Wait for the main app to load
  await page.waitForSelector('[data-testid="app"]', { timeout: 10000 });
}

/**
 * Clear all localStorage and sessionStorage
 */
export async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Mock Firebase for E2E tests
 */
export async function mockFirebase(page: Page) {
  await page.addInitScript(() => {
    // Mock Firebase functions
    (window as any).firebase = {
      auth: () => ({
        currentUser: {
          uid: "test-user-id",
          email: "test@example.com",
          displayName: "Test User",
        },
        onAuthStateChanged: (callback: any) => {
          callback({
            uid: "test-user-id",
            email: "test@example.com",
            displayName: "Test User",
          });
        },
      }),
      firestore: () => ({
        collection: () => ({
          doc: () => ({
            get: () => Promise.resolve({ exists: true, data: () => ({}) }),
            set: () => Promise.resolve(),
            update: () => Promise.resolve(),
          }),
          add: () => Promise.resolve({ id: "test-doc-id" }),
          where: () => ({
            get: () => Promise.resolve({ docs: [] }),
          }),
        }),
      }),
    };
  });
}

/**
 * Common test data
 */
export const testUsers = {
  user1: {
    uid: "user-1-id",
    email: "user1@example.com",
    displayName: "User One",
  },
  user2: {
    uid: "user-2-id",
    email: "user2@example.com",
    displayName: "User Two",
  },
};

/**
 * Common selectors
 */
export const selectors = {
  messageInput:
    'input[placeholder="Write a message..."], textarea[placeholder="Write a message..."]',
  sendButton: 'button[alt="send"], button[aria-label="send"]',
  emojiButton: 'button[alt="emoji"], button[aria-label="emoji"]',
  searchInput: 'input[placeholder*="Search"], input[placeholder*="search"]',
  chatList: '[data-testid="chat-list"]',
  messageList: '[data-testid="message-list"]',
  offlineMessage: 'text="You\'re offline"',
};
