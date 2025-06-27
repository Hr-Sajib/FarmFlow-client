import { baseApi } from '@/redux/api/baseApi';
import { TUser } from '@/types/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<TUser, void>({
      query: () => ({
        url: '/user/getMe',
        method: 'GET', // ✅ Change to GET
      }),
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TUser }) => {
        console.log('getMe response:', response);
        return response.data;
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetMeQuery } = userApi;
