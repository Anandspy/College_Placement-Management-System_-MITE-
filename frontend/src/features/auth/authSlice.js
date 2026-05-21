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
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      state.loading = false;
      state.error = null;
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

export const { setCredentials, setAccessToken, clearCredentials, setInitialized, setLoading, setError } =
  authSlice.actions;

export default authSlice.reducer;
