import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast'; // Use ES module import

export type TUser = {
  userName: string;
  userPhone: string;
  role: string;
  iat: number;
  exp: number;
};

export type TAuthState = {
  user: null | TUser;
  token: null | string;
};

const initialState: TAuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      // Check for client-side to avoid SSR issues
      if (typeof window !== 'undefined') {
        // toast.success(`Logged in successfully`);
      }
    },
    logout: (state) => {
      console.log('authSlice - Logout action dispatched');
      state.user = null;
      state.token = null;
      // Check for client-side to avoid SSR issues
      if (typeof window !== 'undefined') {
        toast.success('Logged out successfully!');
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;