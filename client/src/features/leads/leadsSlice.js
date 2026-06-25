import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

const toQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'ALL') query.set(key, value);
  });
  return query.toString();
};

export const fetchLeads = createAsyncThunk('leads/fetch', async (params = {}) => {
  const query = toQueryString(params);
  const { data } = await api.get(`/leads${query ? `?${query}` : ''}`);
  return data.data; // this is the grouped object
});

export const createLead = createAsyncThunk('leads/create', async (payload) => {
  const { data } = await api.post('/leads', payload);
  return data.data;
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, ...payload }) => {
  const { data } = await api.put(`/leads/${id}`, payload);
  return data.data;
});

const leadsSlice = createSlice({
  name: 'leads',
  initialState: { byStage: {}, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = 'idle';
        state.byStage = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        const lead = action.payload;
        if (!state.byStage[lead.status]) state.byStage[lead.status] = [];
        state.byStage[lead.status].unshift(lead);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const updatedLead = action.payload;
        // Remove from all stages
        Object.keys(state.byStage).forEach(stage => {
          state.byStage[stage] = state.byStage[stage].filter(l => l._id !== updatedLead._id);
        });
        // Add to new stage
        if (!state.byStage[updatedLead.status]) state.byStage[updatedLead.status] = [];
        state.byStage[updatedLead.status].unshift(updatedLead);
      });
  },
});

export default leadsSlice.reducer;
