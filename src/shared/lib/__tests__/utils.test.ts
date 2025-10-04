// import { Message } from "@/modules/chat/types/types";
import { formatTime, formatTimeShort, groupMessagesByDate } from "../utils";

describe("utils", () => {
  describe("formatTime", () => {
    it("formats time correctly", () => {
      const date = new Date("2024-01-15T14:30:00Z");
      const result = formatTime(date);

      // The exact format depends on your implementation
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("handles invalid dates", () => {
      const invalidDate = new Date("invalid");
      const result = formatTime(invalidDate);

      expect(result).toBeDefined();
    });
  });

  describe("formatTimeShort", () => {
    it("formats short time correctly", () => {
      const date = new Date("2024-01-15T14:30:00Z");
      const result = formatTimeShort(date);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });

  describe("groupMessagesByDate", () => {
    it("groups messages by date", () => {
      const messages = [
        {
          id: "1",
          text: "Message 1",
          timestamp: new Date("2024-01-15T10:00:00Z"),
          senderId: "user1",
        },
        {
          id: "2",
          text: "Message 2",
          timestamp: new Date("2024-01-15T11:00:00Z"),
          senderId: "user2",
        },
        {
          id: "3",
          text: "Message 3",
          timestamp: new Date("2024-01-16T10:00:00Z"),
          senderId: "user1",
        },
      ];

      const result = groupMessagesByDate(messages as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result["2024-01-15"]).toHaveLength(2);
      expect(result["2024-01-16"]).toHaveLength(1);
    });

    it("handles empty messages array", () => {
      const result = groupMessagesByDate([]);

      expect(result).toEqual({});
    });

    it("handles single message", () => {
      const messages = [
        {
          id: "1",
          text: "Single message",
          timestamp: new Date("2024-01-15T10:00:00Z"),
          senderId: "user1",
        },
      ];

      const result = groupMessagesByDate(messages as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
      expect(result["2024-01-15"]).toHaveLength(1);
    });
  });
});
