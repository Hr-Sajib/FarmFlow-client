import { configureStore, Middleware } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './features/auth/authSlice';
import fieldsReducer from './features/fields/fieldsSlice';
import userReducer from './features/user/userSlice';
import postReducer from './features/posts/postSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'fields', 'user', 'posts'],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  fields: fieldsReducer,
  user: userReducer,
  posts: postReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(baseApi.middleware as Middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;