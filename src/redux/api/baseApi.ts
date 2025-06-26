import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5100/', // your server URL
    credentials: 'include', // allow cookies if used
  }),
  tagTypes: ['Auth', 'User'],
  endpoints: () => ({}),
});
