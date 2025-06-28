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
        console.log('getPosts response:', response);
        return response.data;
      },
    }),

    // ✅ Create a post
    createPost: builder.mutation<IPost, Partial<IPost>>({
      query: (post) => ({
        url: '/post',
        method: 'POST',
        body: post,
      }),
      transformResponse: (response: { success: boolean; statusCode: number; message: string; data: IPost }) => response.data,

    }),

    // ✅ Like a post
    likePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/like/${postId}`,
        method: 'POST',
      }),
    }),

    // ✅ Remove like from a post
    removeLikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/removeLike/${postId}`,
        method: 'POST',
      }),
    }),

    // ✅ Dislike a post
    dislikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/dislike/${postId}`,
        method: 'POST',
      }),
    }),

    // ✅ Remove dislike from a post
    removeDislikePost: builder.mutation<IPost, string>({
      query: (postId) => ({
        url: `/post/removeDislike/${postId}`,
        method: 'POST',
      }),
    }),

    // ✅ Add a comment to a post
    comment: builder.mutation<IPost, { postId: string; commentText: string }>({
      query: ({ postId, commentText }) => ({
        url: `/post/comment/${postId}`,
        method: 'POST',
        body: { commentText },
      }),
    }),
}),
});

export const { 
  useGetPostsQuery, 
  useCreatePostMutation,
  useLikePostMutation, 
  useRemoveLikePostMutation,
  useDislikePostMutation,
  useRemoveDislikePostMutation,
  useCommentMutation
} = postApi;