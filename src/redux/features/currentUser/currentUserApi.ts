import { baseApi } from '@/redux/api/baseApi';
import { TCurrentUser } from '@/types/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.mutation<{ success: boolean; statusCode: number; message: string; data: TCurrentUser }, void>({
      query: () => {
        console.log('Sending POST /user/getMe request');
        return {
          url: '/user/getMe',
          method: 'POST',
        };
      },
    }),
    updateUser: builder.mutation<TCurrentUser, Partial<TCurrentUser>>({
      query: (userData) => {
        if (!userData._id) {
          throw new Error('User _id is required for update');
        }
        return {
          url: `/user/${userData._id}`,
          method: 'PATCH',
          body: userData,
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetMeMutation, useUpdateUserMutation } = userApi;
