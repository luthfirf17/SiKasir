import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import menuSlice from './slices/menuSlice';
import tableSlice from './slices/tableSlice';
import systemSlice from './slices/systemSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    menu: menuSlice,
    table: tableSlice,
    system: systemSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['persist'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
