import { baseApi } from '@/redux/api/baseApi';
import { TField } from '@/types/types';

export const fieldsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyFields: builder.query<TField[], void>({
      query: () => ({
        url: '/field/myFields',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField[] }) => {
        return response.data || [];
      },
    }),
  }),
});

export const { useGetMyFieldsQuery } = fieldsApi;