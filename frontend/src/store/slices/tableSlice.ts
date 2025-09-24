import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Table, TableStatus, TableLocation } from '../../types/table';
import { LoadingState } from '../../types/common';

interface TableState extends LoadingState {
  tables: Table[];
  selectedTable: Table | null;
  filters: {
    status: TableStatus | '';
    location: TableLocation | '';
    capacity: number | null;
  };
}

const initialState: TableState = {
  tables: [],
  selectedTable: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    location: '',
    capacity: null,
  },
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setTables: (state, action: PayloadAction<Table[]>) => {
      state.tables = action.payload;
    },
    setSelectedTable: (state, action: PayloadAction<Table | null>) => {
      state.selectedTable = action.payload;
    },
    updateTableStatus: (state, action: PayloadAction<{ tableId: string; status: TableStatus }>) => {
      const table = state.tables.find(t => t.id === action.payload.tableId);
      if (table) {
        table.status = action.payload.status;
      }
    },
    updateFilters: (state, action: PayloadAction<Partial<TableState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setTables, 
  setSelectedTable, 
  updateTableStatus, 
  updateFilters, 
  clearError 
} = tableSlice.actions;

export default tableSlice.reducer;
