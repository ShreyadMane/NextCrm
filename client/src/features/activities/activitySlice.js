import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchActivities = createAsyncThunk('activities/fetch', async (params) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/activities?${query}`);
  return data.data;
});

export const createActivity = createAsyncThunk('activities/create', async (payload) => {
  const { data } = await api.post('/activities', payload);
  return data.data;
});

const activitySlice = createSlice({
  name: 'activities',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default activitySlice.reducer;
