import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

function getIdToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('idToken') || undefined;
  } catch {
    return undefined;
  }
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      const token = getIdToken();
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Chats', 'Messages'],
  endpoints: () => ({}),
});


