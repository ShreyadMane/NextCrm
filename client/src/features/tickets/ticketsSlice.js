import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchTickets = createAsyncThunk('tickets/fetch', async () => {
  const { data } = await api.get('/tickets');
  return data.data;
});
export const createTicket = createAsyncThunk('tickets/create', async (payload) => {
  const { data } = await api.post('/tickets', payload);
  return data.data;
});
export const updateTicket = createAsyncThunk('tickets/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/tickets/${id}`, payload);
  return data.data;
});
export const deleteTicket = createAsyncThunk('tickets/delete', async (id) => {
  await api.delete(`/tickets/${id}`);
  return id;
});

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTickets.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(createTicket.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateTicket.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
      });
  },
});
export default ticketsSlice.reducer;
