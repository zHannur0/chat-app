import { baseApi } from "@/shared/store/baseApi";

export type ChatPeer = {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
};

export type ChatDto = {
  id: string;
  type: "direct" | "group" | "bot";
  title?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  memberIds: string[];
  botId?: string;
  lastMessage?: {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    createdAt: number;
    updatedAt?: number;
    isBot?: boolean;
  };
  unreadCount?: number;
  peer?: ChatPeer;
};

export type MessageDto = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  isBot?: boolean;
};

export type MessagesResponse = {
  messages: MessageDto[];
  hasMore: boolean;
  nextCursor: number | null;
  prevCursor: number | null;
  total: number;
};

export const chatsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    listChats: build.query<{ chats: ChatDto[] }, void>({
      query: () => ({ url: "/api/chats", method: "GET" }),
      providesTags: ["Chats"],
    }),
    createChat: build.mutation<
      { chat: ChatDto; existed?: boolean },
      {
        type: "direct" | "group" | "bot";
        memberIds: string[];
        title?: string;
        botId?: string;
      }
    >({
      query: body => ({ url: "/api/chats", method: "POST", body }),
      invalidatesTags: ["Chats"],
    }),
    getChatById: build.query<{ chat: ChatDto }, string>({
      query: id => ({ url: `/api/chats/${id}`, method: "GET" }),
      providesTags: ["Chats"],
    }),
  }),
});

export const messagesApi = baseApi.injectEndpoints({
  endpoints: build => ({
    listMessages: build.query<
      MessagesResponse,
      {
        chatId: string;
        limit?: number;
        beforeTs?: number;
        afterTs?: number;
      }
    >({
      query: ({ chatId, limit = 30, beforeTs, afterTs }) => {
        const params = new URLSearchParams({
          chatId,
          limit: limit.toString(),
        });
        if (beforeTs) params.append("beforeTs", beforeTs.toString());
        if (afterTs) params.append("afterTs", afterTs.toString());
        return { url: `/api/messages?${params.toString()}`, method: "GET" };
      },
      providesTags: (r, e, a) => [{ type: "Messages", id: a.chatId }],
    }),
    sendMessage: build.mutation<
      { message: MessageDto },
      { chatId: string; text: string; clientId?: string }
    >({
      query: body => ({ url: "/api/messages", method: "POST", body }),
      invalidatesTags: (r, e, a) => [
        { type: "Messages", id: a.chatId },
        "Chats",
      ],
    }),
    markRead: build.mutation<{ ok: true }, { chatId: string; readAt?: number }>(
      {
        query: body => ({ url: "/api/messages", method: "PUT", body }),
        invalidatesTags: (r, e, a) => [{ type: "Messages", id: a.chatId }],
      }
    ),
  }),
});

export const { useListChatsQuery, useCreateChatMutation, useGetChatByIdQuery } =
  chatsApi;
export const {
  useListMessagesQuery,
  useSendMessageMutation,
  useMarkReadMutation,
} = messagesApi;
