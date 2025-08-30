import { baseApi } from '@/redux/api/baseApi';
import { TField } from '@/types/types';
import { setFields } from './fieldsSlice';

export const fieldsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyFields: builder.query<TField[], void>({
      query: () => ({
        url: '/field/myFields',
        method: 'GET',
      }),
      providesTags: ['Field'],
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField[] }) => {
        return response.data || [];
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setFields(data)); // Update Redux state with fetched fields
        } catch (err) {
          console.error('getMyFields: Error updating Redux state:', err);
        }
      },
    }),
    getFieldById: builder.query<TField, string>({
      query: (fieldId) => ({
        url: `/field/${fieldId}`,
        method: 'GET',
      }),
      providesTags: (result, error, fieldId) => [{ type: 'FieldById', id: fieldId }],
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
    createField: builder.mutation<TField, Partial<TField>>({
      query: (data) => ({
        url: '/field',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Field'],
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
    updateField: builder.mutation<TField, { fieldId: string; data: Partial<TField> }>({
      query: ({ fieldId, data }) => ({
        url: `/field/${fieldId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { fieldId }) => [
        'Field',
        { type: 'FieldById', id: fieldId },
      ],
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
  }),
});

export const { useGetMyFieldsQuery, useGetFieldByIdQuery, useCreateFieldMutation, useUpdateFieldMutation } = fieldsApi;