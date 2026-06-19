import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchInvoices = createAsyncThunk('invoices/fetch', async () => {
  const { data } = await api.get('/invoices');
  return data.data;
});
export const createInvoice = createAsyncThunk('invoices/create', async (payload) => {
  const { data } = await api.post('/invoices', payload);
  return data.data;
});
export const createInvoiceFromQuotation = createAsyncThunk('invoices/fromQuotation', async ({ quotationId, ...payload }) => {
  const { data } = await api.post(`/invoices/from-quotation/${quotationId}`, payload);
  return data.data;
});
export const updateInvoice = createAsyncThunk('invoices/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data.data;
});

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchInvoices.fulfilled, (state, action) => { state.status = 'idle'; state.items = action.payload; })
      .addCase(createInvoice.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(createInvoiceFromQuotation.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});
export default invoicesSlice.reducer;
