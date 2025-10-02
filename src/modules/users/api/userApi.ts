import { baseApi } from '@/shared/store/baseApi';

export type UserSearchItem = { uid: string; email?: string; displayName?: string; photoURL?: string };

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchUsers: build.query<{ users: UserSearchItem[] }, { q: string }>({
      query: ({ q }) => ({ url: `/api/users/search?q=${encodeURIComponent(q)}`, method: 'GET' }),
      providesTags: ['Auth'],
    }),
    listUsers: build.query<{ users: UserSearchItem[]; nextCursor?: string }, { limit?: number; startAfterEmail?: string } | void>({
      query: (args) => {
        const limit = args?.limit ?? 20;
        const startAfterEmail = args?.startAfterEmail;
        const qs = new URLSearchParams({ limit: String(limit) });
        if (startAfterEmail) qs.set('startAfterEmail', startAfterEmail);
        return { url: `/api/users?${qs.toString()}`, method: 'GET' };
      },
      providesTags: ['Auth'],
    }),
  }),
});

export const { useSearchUsersQuery, useListUsersQuery } = userApi;


