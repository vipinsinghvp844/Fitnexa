import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const storedAuth = loadAuthState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: storedAuth ?? {
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'unauthenticated',
      error: null,
    },
  },
});

store.subscribe(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify(store.getState().auth));
  }
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
