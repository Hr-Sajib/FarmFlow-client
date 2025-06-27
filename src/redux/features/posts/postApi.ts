import { baseApi } from '@/redux/api/baseApi';
import { IPost } from '@/types/types';


export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<IPost[], void>({
      query: () => {
        return {
          url: '/post',
          method: 'GET',
        };
      },
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: IPost[] }) => {
        console.log('getPosts response:', response);
        return response.data;
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetPostsQuery } = postApi;