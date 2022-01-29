import { configureStore } from '@reduxjs/toolkit';
import appReducer from '@/features/app/slices/appSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
