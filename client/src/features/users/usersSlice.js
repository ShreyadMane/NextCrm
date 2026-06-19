import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchUsers = createAsyncThunk('users/fetch', async () => {
  const { data } = await api.get('/users');
  return data.data;
});
export const createUser = createAsyncThunk('users/create', async (payload) => {
  const { data } = await api.post('/users', payload);
  return data.data;
});
export const updateUser = createAsyncThunk('users/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.data;
});
export const deleteUser = createAsyncThunk('users/delete', async (id) => {
  await api.delete(`/users/${id}`);
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(createUser.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.items.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter(u => u._id !== action.payload);
      });
  },
});
export default usersSlice.reducer;
