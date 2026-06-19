import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchDeals = createAsyncThunk('deals/fetch', async () => {
  const { data } = await api.get('/deals');
  return data.data;
});

export const createDeal = createAsyncThunk('deals/create', async (payload) => {
  const idempotencyKey = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { data } = await api.post('/deals', payload, {
    headers: { 'X-Idempotency-Key': idempotencyKey }
  });
  return data.data;
});

export const closeDeal = createAsyncThunk('deals/close', async ({ id, outcome }) => {
  const { data } = await api.put(`/deals/${id}/close`, { outcome });
  return data.data;
});

const dealsSlice = createSlice({
  name: 'deals',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(closeDeal.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default dealsSlice.reducer;
