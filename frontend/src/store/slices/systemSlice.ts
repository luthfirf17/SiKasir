import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemConfig } from '../../types/system';
import { LoadingState } from '../../types/common';

interface SystemState extends LoadingState {
  config: SystemConfig | null;
  permissions: string[];
  features: string[];
}

const initialState: SystemState = {
  config: null,
  permissions: [],
  features: [],
  isLoading: false,
  error: null,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<SystemConfig>) => {
      state.config = action.payload;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    setFeatures: (state, action: PayloadAction<string[]>) => {
      state.features = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setConfig, setPermissions, setFeatures, clearError } = systemSlice.actions;
export default systemSlice.reducer;
