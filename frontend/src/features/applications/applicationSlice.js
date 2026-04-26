import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as applicationApi from '../../api/applicationApi';

export const applyToDriveAction = createAsyncThunk(
  'applications/apply',
  async (driveId, thunkAPI) => {
    try {
      return await applicationApi.applyToDrive(driveId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMyApplicationsAction = createAsyncThunk(
  'applications/getMy',
  async (_, thunkAPI) => {
    try {
      return await applicationApi.getMyApplications();
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  applications: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    resetApplicationState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToDriveAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(applyToDriveAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(applyToDriveAction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMyApplicationsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyApplicationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload.data;
      })
      .addCase(getMyApplicationsAction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetApplicationState } = applicationSlice.actions;
export default applicationSlice.reducer;
