import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchMeetings = createAsyncThunk('meetings/fetch', async () => {
  const response = await api.get('/meetings');
  return response.data.data;
});

export const createMeeting = createAsyncThunk('meetings/create', async (data) => {
  const response = await api.post('/meetings', data);
  return response.data.data;
});

export const updateMeeting = createAsyncThunk('meetings/update', async ({ id, ...data }) => {
  const response = await api.put(`/meetings/${id}`, data);
  return response.data.data;
});

export const deleteMeeting = createAsyncThunk('meetings/delete', async (id) => {
  await api.delete(`/meetings/${id}`);
  return id;
});

const meetingsSlice = createSlice({
  name: 'meetings',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetings.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        const index = state.items.findIndex(m => m._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m._id !== action.payload);
      });
  },
});

export default meetingsSlice.reducer;
