import { baseApi } from '@/redux/api/baseApi';
import { TCurrentUser } from '@/types/types';
interface UserResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: TCurrentUser;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get current logged-in user
    getMe: builder.mutation<{ success: boolean; statusCode: number; message: string; data: TCurrentUser }, void>({
      query: () => ({
        url: '/user/getMe',
        method: 'POST',
      }),
      // providesTags: ['User'], // so other mutations can refresh current user
    }),

    // ✅ Update user
    updateUser: builder.mutation<UserResponse, Partial<TCurrentUser>>({
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
      invalidatesTags: ['Users'], // refresh all users list
    }),

    // ✅ Get all users
    getAllUsers: builder.query<{ success: boolean; statusCode: number; message: string; data: TCurrentUser[] }, void>({
      query: () => ({
        url: '/user',
        method: 'GET',
      }),
      providesTags: ['Users'], // tag for the list
    }),

    // ✅ Create a new user
    createUser: builder.mutation<{ success: boolean; statusCode: number; message: string; data: TCurrentUser }, Partial<TCurrentUser>>({
      query: (userData) => {
        if (!userData.name || !userData.farmerId || !userData.phone || !userData.address || !userData.status || !userData.role) {
          throw new Error('Required fields: name, farmerId, phone, address, status, role');
        }
        return {
          url: '/user/register',
          method: 'POST',
          body: userData,
        };
      },
      invalidatesTags: ['Users'], // refresh list after create
    }),

    // ✅ Delete user
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>({
      query: (userId) => ({
        url: `/user/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'], // refresh list after delete
    }),
  }),
  overrideExisting: true,
});

export const { 
  useGetMeMutation, 
  useUpdateUserMutation, 
  useGetAllUsersQuery, 
  useCreateUserMutation,
  useDeleteUserMutation
} = userApi;
