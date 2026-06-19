import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchQuotations = createAsyncThunk('quotations/fetch', async () => {
  const { data } = await api.get('/quotations');
  return data.data;
});
export const createQuotation = createAsyncThunk('quotations/create', async (payload) => {
  const { data } = await api.post('/quotations', payload);
  return data.data;
});
export const updateQuotation = createAsyncThunk('quotations/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/quotations/${id}`, payload);
  return data.data;
});

const quotationsSlice = createSlice({
  name: 'quotations',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotations.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchQuotations.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(createQuotation.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        const idx = state.items.findIndex(q => q._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});
export default quotationsSlice.reducer;
