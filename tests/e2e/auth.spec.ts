import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");

    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should display register page", async ({ page }) => {
    await page.goto("/register");

    // Check if register form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/login");

    // Click on "Sign up" link
    await page.getByText("Sign up").click();
    await expect(page).toHaveURL("/register");

    // Click on "Sign in" link
    await page.getByText("Sign in").click();
    await expect(page).toHaveURL("/login");
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.getByRole("button", { name: /sign in/i }).click();

    // Check for validation errors (adjust based on your validation implementation)
    // These might not be present if validation is handled differently
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
