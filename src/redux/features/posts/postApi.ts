import { baseApi } from '@/redux/api/baseApi';
import { IPost } from '@/types/types';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Fetch all posts
    getPosts: builder.query<IPost[], void>({
      query: () => ({
        url: '/post',
        method: 'GET',
      }),
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: IPost[] }) => {
        return response.data;
      },
      providesTags: ['Posts'], // ✅ so other mutations can refresh this
    }),

    // ✅ Create a post
    createPost: builder.mutation<IPost, Partial<IPost>>({
      query: (post) => ({
        url: '/post',
        method: 'POST',
        body: post,
      }),
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: IPost }) => response.data,
      invalidatesTags: ['Posts'], // ✅ refresh list after create
    }),

    // ✅ Delete a post
    deletePost: builder.mutation<{ success: boolean; message: string }, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Posts'], // ✅ refresh list after delete
    }),

    // ✅ Like a post
    likePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/like/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'], // ✅ refresh like count
    }),

    // ✅ Remove like from a post
    removeLikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/removeLike/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),

    // ✅ Dislike a post
    dislikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/dislike/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),

    // ✅ Remove dislike from a post
    removeDislikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/removeDislike/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Posts'],
    }),

    // ✅ Add a comment to a post
    comment: builder.mutation<IPost, { postId: string; commentText: string }>({
      query: ({ postId, commentText }) => ({
        url: `/post/comment/${postId}`,
        method: 'POST',
        body: { commentText },
      }),
      invalidatesTags: ['Posts'], // ✅ so comment count updates
    }),
  }),
});

export const { 
  useGetPostsQuery, 
  useCreatePostMutation,
  useDeletePostMutation,
  useLikePostMutation, 
  useRemoveLikePostMutation,
  useDislikePostMutation,
  useRemoveDislikePostMutation,
  useCommentMutation
} = postApi;
