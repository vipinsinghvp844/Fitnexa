import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: null | {
    id: number;
    name: string;
    email: string;
    tenant_id: number | null;
    roles: string[];
    email_verified_at: string | null;
  };
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'authenticated' | 'unauthenticated';
  error: string | null;
}

const loadState = (): Partial<AuthState> => {
  if (typeof window === 'undefined') return {};
  try {
    const serializedState = localStorage.getItem('auth');
    if (serializedState === null) return {};
    return JSON.parse(serializedState);
  } catch {
    return {};
  }
};

const saveState = (state: AuthState) => {
  if (typeof window === 'undefined') return;
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      status: state.status,
    });
    localStorage.setItem('auth', serializedState);
  } catch {
    // Ignore write errors
  }
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: 'unauthenticated',
  error: null,
  ...loadState(),
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<Partial<AuthState>>) {
      state.user = action.payload.user ?? state.user;
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.refreshToken = action.payload.refreshToken ?? state.refreshToken;
      state.status = action.payload.accessToken ? 'authenticated' : state.status;
      state.error = null;
      saveState(state);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = 'unauthenticated';
      state.error = null;
      saveState(state);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.status = 'unauthenticated';
      saveState(state);
    },
  },
});

export const { setCredentials, logout, setError } = authSlice.actions;

export default authSlice.reducer;
