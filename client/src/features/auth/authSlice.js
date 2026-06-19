import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { accessToken: null, refreshToken: null, user: null, status: 'idle', error: null },
  reducers: {
    setAccessToken: (state, action) => { state.accessToken = action.payload; },
    logout: (state) => { state.accessToken = null; state.refreshToken = null; state.user = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.error.message;
      });
  },
});

export const { setAccessToken, logout } = authSlice.actions;
export default authSlice.reducer;
