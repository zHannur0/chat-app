import { baseApi } from '@/shared/store/baseApi';

export type ChatDto = {
  id: string;
  type: 'direct' | 'group' | 'bot';
  title?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  memberIds: string[];
  botId?: string;
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

export const chatsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listChats: build.query<{ chats: ChatDto[] }, void>({
      query: () => ({ url: '/api/chats', method: 'GET' }),
      providesTags: ['Chats'],
    }),
    createChat: build.mutation<{ chat: ChatDto }, { type: 'direct' | 'group' | 'bot'; memberIds: string[]; title?: string; botId?: string }>({
      query: (body) => ({ url: '/api/chats', method: 'POST', body }),
      invalidatesTags: ['Chats'],
    }),
    getChatById: build.query<{ chat: ChatDto }, string>({
      query: (id) => ({ url: `/api/chats/${id}`, method: 'GET' }),
      providesTags: ['Chats'],
    }),
  }),
});

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listMessages: build.query<{ messages: MessageDto[] }, { chatId: string; limit?: number; beforeTs?: number }>({
      query: ({ chatId, limit = 30, beforeTs }) => ({ url: `/api/messages?chatId=${encodeURIComponent(chatId)}&limit=${limit}${beforeTs ? `&beforeTs=${beforeTs}` : ''}`, method: 'GET' }),
      providesTags: (r, e, a) => [{ type: 'Messages', id: a.chatId }],
    }),
    sendMessage: build.mutation<{ message: MessageDto }, { chatId: string; text: string; isBotChat?: boolean; botId?: string }>({
      query: (body) => ({ url: '/api/messages', method: 'POST', body }),
      invalidatesTags: (r, e, a) => [{ type: 'Messages', id: a.chatId }, 'Chats'],
    }),
    markRead: build.mutation<{ ok: true }, { chatId: string; readAt?: number }>({
      query: (body) => ({ url: '/api/messages', method: 'PUT', body }),
      invalidatesTags: (r, e, a) => [{ type: 'Messages', id: a.chatId }],
    }),
  }),
});

export const { useListChatsQuery, useCreateChatMutation, useGetChatByIdQuery } = chatsApi;
export const { useListMessagesQuery, useSendMessageMutation, useMarkReadMutation } = messagesApi;


