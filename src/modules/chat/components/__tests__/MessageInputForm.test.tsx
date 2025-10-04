import { render, screen, fireEvent } from "@testing-library/react";
import MessageInputForm from "../MessageInputForm";

// Mock the hooks with simple implementations
jest.mock("@/modules/chat/hooks/useSendMessage", () => ({
  useSendMessage: () => ({
    sendMessage: jest.fn(),
    queue: [],
  }),
}));

describe("MessageInputForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders message input", () => {
    render(<MessageInputForm chatId="test-chat-id" />);
    expect(
      screen.getByPlaceholderText("Write a message...")
    ).toBeInTheDocument();
  });

  it("renders emoji button", () => {
    render(<MessageInputForm chatId="test-chat-id" />);
    expect(screen.getByAltText("emoji")).toBeInTheDocument();
  });

  it("renders send button", () => {
    render(<MessageInputForm chatId="test-chat-id" />);
    expect(screen.getByAltText("send")).toBeInTheDocument();
  });

  it("allows typing in input", () => {
    render(<MessageInputForm chatId="test-chat-id" />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "Hello world" } });

    expect(input).toHaveValue("Hello world");
  });

  it("handles Enter key press", () => {
    render(<MessageInputForm chatId="test-chat-id" />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "Hello world" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Should not crash on Enter key press
    expect(input).toBeInTheDocument();
  });

  it("handles empty message input", () => {
    render(<MessageInputForm chatId="test-chat-id" />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Should not crash with empty input
    expect(input).toHaveValue("");
  });

  it("shows offline message when offline", () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: false,
    });

    render(<MessageInputForm chatId="test-chat-id" />);

    expect(
      screen.getByText(
        "You're offline. Messages will be sent when connection is restored."
      )
    ).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    render(<MessageInputForm chatId="test-chat-id" />);
    expect(
      screen.getByPlaceholderText("Write a message...")
    ).toBeInTheDocument();
  });
});
