import {
  validateUsername,
  validatePassword,
  validateDisplayName,
  validateConfirmPassword,
} from "../validation";

describe("validation", () => {
  describe("validateUsername", () => {
    it("validates correct username", () => {
      expect(validateUsername("testuser")).toBe(null);
      expect(validateUsername("user123")).toBe(null);
      expect(validateUsername("test_user")).toBe(null);
    });

    it("rejects invalid username", () => {
      expect(validateUsername("")).toBe("Username is required");
      expect(validateUsername("ab")).toBe(
        "Username must be at least 3 characters"
      );
      expect(validateUsername("a".repeat(21))).toBe(
        "Username must be less than 20 characters"
      );
      expect(validateUsername("test@user")).toBe(
        "Username can only contain letters, numbers, and underscores"
      );
    });
  });

  describe("validatePassword", () => {
    it("validates correct password", () => {
      expect(validatePassword("password123")).toBe(null);
      expect(validatePassword("MySecurePass1")).toBe(null);
      expect(validatePassword("12345678")).toBe(null);
    });

    it("rejects invalid password", () => {
      expect(validatePassword("")).toBe("Password is required");
      expect(validatePassword("123")).toBe(
        "Password must be at least 6 characters"
      );
      expect(validatePassword("a".repeat(101))).toBe(
        "Password must be less than 100 characters"
      );
    });
  });

  describe("validateDisplayName", () => {
    it("validates correct display name", () => {
      expect(validateDisplayName("John Doe")).toBe(null);
      expect(validateDisplayName("Jane")).toBe(null);
    });

    it("rejects invalid display name", () => {
      expect(validateDisplayName("")).toBe("Display name is required");
      expect(validateDisplayName("J")).toBe(
        "Display name must be at least 2 characters"
      );
      expect(validateDisplayName("a".repeat(51))).toBe(
        "Display name must be less than 50 characters"
      );
    });
  });

  describe("validateConfirmPassword", () => {
    it("validates matching passwords", () => {
      expect(validateConfirmPassword("password123", "password123")).toBe(null);
    });

    it("rejects non-matching passwords", () => {
      expect(validateConfirmPassword("password123", "password456")).toBe(
        "Passwords don't match"
      );
      expect(validateConfirmPassword("password123", "")).toBe(
        "Please confirm your password"
      );
    });
  });
});
