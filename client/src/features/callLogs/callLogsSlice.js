import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchCallLogs = createAsyncThunk('callLogs/fetch', async () => {
  const response = await api.get('/call-logs');
  return response.data.data;
});

export const createCallLog = createAsyncThunk('callLogs/create', async (data) => {
  const response = await api.post('/call-logs', data);
  return response.data.data;
});

export const updateCallLog = createAsyncThunk('callLogs/update', async ({ id, ...data }) => {
  const response = await api.put(`/call-logs/${id}`, data);
  return response.data.data;
});

export const deleteCallLog = createAsyncThunk('callLogs/delete', async (id) => {
  await api.delete(`/call-logs/${id}`);
  return id;
});

const callLogsSlice = createSlice({
  name: 'callLogs',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallLogs.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCallLogs.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createCallLog.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateCallLog.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCallLog.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload);
      });
  },
});

export default callLogsSlice.reducer;
