import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/redux/store';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5100',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn('No auth token found for API request');
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Fields'],
  endpoints: () => ({}),
});