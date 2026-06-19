import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async () => {
  const { data } = await api.get('/notifications');
  return data.data;
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => {
  const { data } = await api.put(`/notifications/${id}/read`);
  return data.data;
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], status: 'idle' },
  reducers: {
    addNotification: (state, action) => { state.items.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'idle';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
