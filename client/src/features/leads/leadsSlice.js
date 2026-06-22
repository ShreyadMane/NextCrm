import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../app/axios';

export const fetchLeads = createAsyncThunk('leads/fetch', async () => {
  const { data } = await api.get('/leads');
  return data.data; // this is the grouped object
});

export const createLead = createAsyncThunk('leads/create', async (payload) => {
  const { data } = await api.post('/leads', payload);
  return data.data;
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, status }) => {
  const { data } = await api.put(`/leads/${id}/move`, { status });
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
