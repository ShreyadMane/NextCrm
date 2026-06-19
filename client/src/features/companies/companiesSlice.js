import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchCompanies = createAsyncThunk('companies/fetch', async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/companies?${query}`);
  return data;
});

export const getCompany = createAsyncThunk('companies/getOne', async (id) => {
  const { data } = await api.get(`/companies/${id}`);
  return data.data;
});

export const createCompany = createAsyncThunk('companies/create', async (payload) => {
  const { data } = await api.post('/companies', payload);
  return data.data;
});

export const updateCompany = createAsyncThunk('companies/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/companies/${id}`, payload);
  return data.data;
});

export const deleteCompany = createAsyncThunk('companies/delete', async (id) => {
  await api.delete(`/companies/${id}`);
  return id;
});

const companiesSlice = createSlice({
  name: 'companies',
  initialState: { items: [], current: null, meta: {}, status: 'idle' },
  reducers: { clearCurrentCompany: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.data;
        state.meta = action.payload.meta || {};
      })
      .addCase(getCompany.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(createCompany.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c._id !== action.payload);
      });
  },
});

export const { clearCurrentCompany } = companiesSlice.actions;
export default companiesSlice.reducer;
