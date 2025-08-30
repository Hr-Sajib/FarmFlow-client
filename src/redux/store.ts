import { configureStore, Middleware } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import fieldsReducer from './features/fields/fieldsSlice';
import currentUserReducer from './features/currentUser/currentUserSlice';
import postReducer from './features/posts/postSlice';
import { baseApi } from './api/baseApi';

// Noop storage for SSR
const createNoopStorage = () => ({
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
});

const persistConfig = {
  key: 'root',
  storage: typeof window !== 'undefined' ? storage : createNoopStorage(),
  whitelist: ['auth', 'fields', 'currentUser', 'posts'],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  fields: fieldsReducer,
  currentUser: currentUserReducer,
  posts: postReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware as Middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;