import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { systemApi } from '../api';
import { HealthCheckData } from '../types';

interface SystemState {
  health: HealthCheckData | null;
  loading: boolean;
  error: string | null;
  lastChecked: string | null;
}

const initialState: SystemState = {
  health: null,
  loading: false,
  error: null,
  lastChecked: null,
};

export const fetchSystemHealth = createAsyncThunk(
  'system/fetchHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await systemApi.getHealth();
      return response;
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        return rejectWithValue((err as { message: string }).message);
      }
      return rejectWithValue('Failed to connect to backend server');
    }
  }
);

export const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    clearHealthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action: PayloadAction<HealthCheckData | undefined>) => {
        state.loading = false;
        state.health = action.payload || null;
        state.lastChecked = new Date().toLocaleTimeString();
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Unable to connect to backend API';
      });
  },
});

export const { clearHealthError } = systemSlice.actions;
export default systemSlice.reducer;
