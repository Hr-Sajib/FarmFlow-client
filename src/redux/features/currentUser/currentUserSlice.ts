import { createSlice } from '@reduxjs/toolkit';
import { TCurrentUser } from '@/types/types';

export type TUserState = {
  currentUser: TCurrentUser | null;
};

const initialState: TUserState = {
  currentUser: null,
};

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setCurrentUser, clearCurrentUser } = currentUserSlice.actions;
export default currentUserSlice.reducer;