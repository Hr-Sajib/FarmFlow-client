import { baseApi } from '@/redux/api/baseApi';
import { TUser } from '@/types/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.mutation<TUser, void>({
      query: () => {
        console.log('Sending POST /user/getMe request');
        return {
          url: '/user/getMe',
          method: 'POST',
        };
      },
    }),
    updateUser: builder.mutation<TUser, Partial<TUser>>({
      query: (userData) => {
        console.log('Sending POST /user/update request with data:', userData);
        return {
          url: '/user/update',
          method: 'POST',
          body: userData,
        };
      },
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TUser }) => {
        console.log('updateUser response:', response);
        return response.data;
      },
      transformErrorResponse: (error) => {
        console.error('updateUser error response:', error);
        return error;
      },
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: true,
});

export const { useGetMeMutation, useUpdateUserMutation } = userApi;