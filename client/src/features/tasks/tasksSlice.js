import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'ALL') query.set(key, value);
  });
  return query.toString();
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async (params = {}) => {
  const query = toQueryString(params);
  const { data } = await api.get(`/tasks${query ? `?${query}` : ''}`);
  return data.data;
});

export const createTask = createAsyncThunk('tasks/create', async (payload) => {
  const { data } = await api.post('/tasks', payload);
  return data.data;
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data.data;
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id) => {
  await api.delete(`/tasks/${id}`);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export default tasksSlice.reducer;
