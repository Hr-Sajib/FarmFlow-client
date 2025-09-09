import { baseApi } from '@/redux/api/baseApi';
import { TField } from '@/types/types';

export const fieldsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all fields for admin
    getAllFields: builder.query<TField[], void>({
      query: () => ({
        url: '/field/',
        method: 'GET',
      }),
      providesTags: ['Field'], // Cache tag for all fields
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField[] }) => {
        return response.data || [];
      },
    }),
    // Fetch fields for the authenticated user
    getMyFields: builder.query<TField[], void>({
      query: () => ({
        url: '/field/myFields',
        method: 'GET',
      }),
      providesTags: ['Field'], // Cache tag for all fields
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField[] }) => {
        return response.data || [];
      },
    }),
    // Fetch a single field by ID
    getFieldById: builder.query<TField, string>({
      query: (fieldId) => ({
        url: `/field/${fieldId}`,
        method: 'GET',
      }),
      providesTags: (result, error, fieldId) => [{ type: 'FieldById', id: fieldId }], // Cache tag for specific field
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
    // Create a new field
    createField: builder.mutation<TField, Partial<TField>>({
      query: (data) => ({
        url: '/field',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Field'], // Invalidate all fields cache to refetch after creation
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
    // Update an existing field
    updateField: builder.mutation<TField, { fieldId: string; data: Partial<TField> }>({
      query: ({ fieldId, data }) => ({
        url: `/field/${fieldId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { fieldId }) => [
        'Field', // Invalidate all fields cache
        { type: 'FieldById', id: fieldId }, // Invalidate specific field cache
      ],
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: TField }) => {
        return response.data;
      },
    }),
    // Delete a field
    deleteField: builder.mutation<void, string>({
      query: (fieldId) => ({
        url: `/field/${fieldId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Field'], // Invalidate all fields cache to refetch after deletion
    }),
  }),
});

export const {
  useGetAllFieldsQuery,
  useGetMyFieldsQuery,
  useGetFieldByIdQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
} = fieldsApi;