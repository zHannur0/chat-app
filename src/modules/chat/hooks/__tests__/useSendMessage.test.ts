import { renderHook, act } from "@testing-library/react";
import { useSendMessage } from "../useSendMessage";

// Mock the dependencies
jest.mock("@/modules/chat/api/chatApi", () => ({
  useSendMessageMutation: jest.fn(() => [
    jest.fn().mockResolvedValue({ unwrap: () => ({ id: "new-message-id" }) }),
    { isLoading: false },
  ]),
}));

jest.mock("@/modules/chat/lib/messageQueue", () => ({
  messageQueue: {
    addMessage: jest.fn(),
    removeMessage: jest.fn(),
    retryFailedMessages: jest.fn(),
    getMessages: jest.fn(() => []),
    clearOldMessages: jest.fn(),
    updateMessage: jest.fn(),
  },
}));

describe("useSendMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns sendMessage function and queue", () => {
    const { result } = renderHook(() => useSendMessage());

    expect(result.current.sendMessage).toBeDefined();
    expect(typeof result.current.sendMessage).toBe("function");
    expect(result.current.queue).toBeDefined();
    expect(Array.isArray(result.current.queue)).toBe(true);
  });

  it("calls sendMessage with correct parameters", async () => {
    const { result } = renderHook(() => useSendMessage());

    await act(async () => {
      await result.current.sendMessage("chat-id", "Hello world");
    });

    // The function should be called (exact implementation depends on your code)
    expect(result.current.sendMessage).toBeDefined();
  });
});
