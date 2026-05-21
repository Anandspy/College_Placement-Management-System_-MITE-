import { createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser as loginApi, logoutUser as logoutApi, refreshToken as refreshApi } from '../../api/authApi';
import { setCredentials, clearCredentials, setAccessToken } from './authSlice';
import { clearProfileState } from '../profile/profileSlice';
import { clearApplications } from '../applications/applicationSlice';
import { clearDrives } from '../drives/driveSlice';

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await loginApi(credentials);
      // Clear any previous user's profile/application/drive state before
      // setting new credentials — prevents cross-user data bleed in Redux.
      dispatch(clearProfileState());
      dispatch(clearApplications());
      dispatch(clearDrives());
      dispatch(
        setCredentials({
          user: data.data.user,
          accessToken: data.data.accessToken,
        })
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await logoutApi();
      dispatch(clearCredentials());
      dispatch(clearProfileState());
      dispatch(clearApplications());
      dispatch(clearDrives());
    } catch (error) {
      // Clear credentials even if API call fails
      dispatch(clearCredentials());
      dispatch(clearProfileState());
      dispatch(clearApplications());
      dispatch(clearDrives());
      return rejectWithValue(
        error.response?.data || { message: 'Logout failed' }
      );
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await refreshApi();
      dispatch(
        setCredentials({
          user: data.data.user,
          accessToken: data.data.accessToken,
        })
      );
      return data;
    } catch (error) {
      dispatch(clearCredentials());
      dispatch(clearProfileState());
      dispatch(clearApplications());
      dispatch(clearDrives());
      return rejectWithValue(
        error.response?.data || { message: 'Token refresh failed' }
      );
    }
  }
);
