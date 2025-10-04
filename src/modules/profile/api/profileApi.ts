import { baseApi } from "@/shared/store/baseApi";

export type Profile = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getProfile: builder.query<Profile, void>({
      query: () => ({ url: "/api/profile" }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      Profile,
      Partial<Pick<Profile, "displayName" | "photoURL">>
    >({
      query: body => ({ url: "/api/profile", method: "PUT", body }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
