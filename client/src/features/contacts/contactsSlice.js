import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchContacts = createAsyncThunk('contacts/fetch', async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/contacts?${query}`);
  return data;
});

export const getContact = createAsyncThunk('contacts/getOne', async (id) => {
  const { data } = await api.get(`/contacts/${id}`);
  return data.data;
});

export const createContact = createAsyncThunk('contacts/create', async (payload) => {
  const { data } = await api.post('/contacts', payload);
  return data.data;
});

export const updateContact = createAsyncThunk('contacts/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/contacts/${id}`, payload);
  return data.data;
});

export const deleteContact = createAsyncThunk('contacts/delete', async (id) => {
  await api.delete(`/contacts/${id}`);
  return id;
});

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: { items: [], current: null, meta: {}, status: 'idle' },
  reducers: {
    clearCurrentContact: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.data;
        state.meta = action.payload.meta || {};
      })
      .addCase(getContact.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(createContact.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateContact.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.current?._id === action.payload._id) state.current = action.payload;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c._id !== action.payload);
      });
  },
});

export const { clearCurrentContact } = contactsSlice.actions;
export default contactsSlice.reducer;
