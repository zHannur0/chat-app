import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserSearch from "../UserSearch";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the API hooks with simple implementations
jest.mock("@/modules/users/api/userApi", () => ({
  useSearchUsersQuery: jest.fn(() => ({
    data: { users: [] },
    isLoading: false,
    error: null,
  })),
}));

jest.mock("@/modules/chat/api/chatApi", () => ({
  useListChatsQuery: jest.fn(() => ({
    data: { chats: [] },
    isLoading: false,
  })),
  useCreateChatMutation: jest.fn(() => [
    jest
      .fn()
      .mockResolvedValue({ unwrap: () => ({ chat: { id: "new-chat-id" } }) }),
    { isLoading: false },
  ]),
}));

jest.mock("@/modules/auth/api/authApi", () => ({
  useVerifyQuery: jest.fn(() => ({
    data: { uid: "current-user-id", email: "current@example.com" },
    isLoading: false,
  })),
}));

describe("UserSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search input", () => {
    render(<UserSearch />);
    expect(
      screen.getByPlaceholderText("Search by email...")
    ).toBeInTheDocument();
  });

  it("shows search results when typing", async () => {
    const { useSearchUsersQuery } = require("@/modules/users/api/userApi");
    useSearchUsersQuery.mockReturnValue({
      data: {
        users: [
          { uid: "user1", email: "user1@example.com", displayName: "User One" },
          { uid: "user2", email: "user2@example.com", displayName: "User Two" },
        ],
      },
      isLoading: false,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText("Search by email...");
    fireEvent.change(searchInput, { target: { value: "user" } });

    await waitFor(() => {
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
    });
  });

  it("excludes current user from search results", async () => {
    const { useSearchUsersQuery } = require("@/modules/users/api/userApi");
    useSearchUsersQuery.mockReturnValue({
      data: {
        users: [
          {
            uid: "current-user-id",
            email: "current@example.com",
            displayName: "Current User",
          },
          {
            uid: "other-user-id",
            email: "other@example.com",
            displayName: "Other User",
          },
        ],
      },
      isLoading: false,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText("Search by email...");
    fireEvent.change(searchInput, { target: { value: "user" } });

    await waitFor(() => {
      expect(screen.queryByText("Current User")).not.toBeInTheDocument();
      expect(screen.getByText("Other User")).toBeInTheDocument();
    });
  });

  it('shows "No users found" when no results', async () => {
    const { useSearchUsersQuery } = require("@/modules/users/api/userApi");
    useSearchUsersQuery.mockReturnValue({
      data: { users: [] },
      isLoading: false,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText("Search by email...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });
  });

  it("handles user click to start new chat", async () => {
    const mockCreateChat = jest.fn().mockResolvedValue({
      unwrap: () => ({ chat: { id: "new-chat-id" } }),
    });

    const { useCreateChatMutation } = require("@/modules/chat/api/chatApi");
    useCreateChatMutation.mockReturnValue([
      mockCreateChat,
      { isLoading: false },
    ]);

    const { useSearchUsersQuery } = require("@/modules/users/api/userApi");
    useSearchUsersQuery.mockReturnValue({
      data: {
        users: [
          { uid: "user1", email: "user1@example.com", displayName: "User One" },
        ],
      },
      isLoading: false,
    });

    render(<UserSearch />);

    const searchInput = screen.getByPlaceholderText("Search by email...");
    fireEvent.change(searchInput, { target: { value: "user" } });

    await waitFor(() => {
      const userItem = screen.getByText("User One");
      fireEvent.click(userItem);
    });

    expect(mockCreateChat).toHaveBeenCalledWith({
      type: "direct",
      memberIds: ["user1"],
    });
  });
});
