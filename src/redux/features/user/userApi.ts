import { baseApi } from '@/redux/api/baseApi';
import { TUser } from '@/types/types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.mutation<{ success: boolean; statusCode: number; message: string; data: TUser }, void>({
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
        if (!userData._id) {
          throw new Error('User _id is required for update');
        }
        return {
          url: `/user/${userData._id}`, // ✅ append _id as param
          method: 'PATCH',
          body: userData,
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetMeMutation, useUpdateUserMutation } = userApi;


// import { baseApi } from '@/redux/api/baseApi';
// import { TUser } from '@/types/types';

// export const userApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     getMe: builder.mutation<TUser, void>({
//       query: () => {
//         console.log('Sending POST /user/getMe request');
//         return {
//           url: '/user/getMe',
//           method: 'POST',
//         };
//       },
//     }),
//     updateUser: builder.mutation<TUser, Partial<TUser>>({
//       query: (userData) => {
//         return {
//           url: '/user/',
//           method: 'PATCH',
//           body: userData,
//         };
//       },
//     }),
//   }),

// });

// export const { useGetMeMutation, useUpdateUserMutation } = userApi;