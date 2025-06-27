import { createSlice } from '@reduxjs/toolkit';
import { postApi } from './postApi';
import { IPost } from '@/types/types';

export type TPostState = {
  posts: IPost[];
  isLoading: boolean;
};

const initialState: TPostState = {
  posts: [],
  isLoading: false,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
      state.isLoading = false;
    },
    clearPosts: (state) => {
      state.posts = [];
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(postApi.endpoints.getPosts.matchPending, (state) => {
        state.isLoading = true;
      })
      .addMatcher(postApi.endpoints.getPosts.matchFulfilled, (state, action) => {
        state.posts = action.payload;
        state.isLoading = false;
      })
      .addMatcher(postApi.endpoints.getPosts.matchRejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setPosts, clearPosts } = postSlice.actions;
export default postSlice.reducer; // ✅ Ensure default export exists
