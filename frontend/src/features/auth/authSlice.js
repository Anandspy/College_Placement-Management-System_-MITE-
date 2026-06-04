import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  role: null,
  isAuthenticated: false,
  isInitialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
      // Persist refresh token in localStorage for cross-domain support
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (_state, action) => {
      // Only updates localStorage — refresh token is NOT kept in Redux state
      if (action.payload) {
        localStorage.setItem('refreshToken', action.payload);
      }
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('refreshToken');
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, setAccessToken, setRefreshToken, clearCredentials, setInitialized, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;

