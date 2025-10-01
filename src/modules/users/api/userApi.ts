import { baseApi } from '@/shared/store/baseApi';

export type UserSearchItem = { uid: string; email?: string; displayName?: string; photoURL?: string };

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchUsers: build.query<{ users: UserSearchItem[] }, { q: string }>({
      query: ({ q }) => ({ url: `/api/users/search?q=${encodeURIComponent(q)}`, method: 'GET' }),
      providesTags: ['Auth'],
    }),
  }),
});

export const { useSearchUsersQuery } = userApi;


