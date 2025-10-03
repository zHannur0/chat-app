import { baseApi } from '@/shared/store/baseApi';

type SignEmailPayload = { email: string; password: string };
type SignResponse = { idToken: string; refreshToken: string; localId: string };

export const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    signUpEmail: build.mutation<SignResponse, SignEmailPayload>({
      query: (body) => ({ url: '/api/auth/email/signup', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    signInEmail: build.mutation<SignResponse, SignEmailPayload>({
      query: (body) => ({ url: '/api/auth/email/signin', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    signInGoogle: build.mutation<SignResponse, { idToken: string }>({
      query: (body) => ({ url: '/api/auth/google', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    verify: build.query<{ uid: string; email?: string; emailVerified?: boolean; displayName?: string; photoURL?: string }, void>({
      query: () => ({ url: '/api/auth/verify', method: 'GET' }),
      providesTags: ['Auth'],
    }),
  }),
});

export const { useSignUpEmailMutation, useSignInEmailMutation, useSignInGoogleMutation, useVerifyQuery } = authApi;


