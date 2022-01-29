import { createSlice } from '@reduxjs/toolkit';
import { AppState } from '@/features/app/types';

const initialState: AppState = {
  isLoaded: false,
};

const appSlice = createSlice({
  name: `menu`,
  initialState,
  reducers: {
    setIsLoaded(state) {
      state.isLoaded = true;
    },
  },
});

export const { setIsLoaded } = appSlice.actions;
export default appSlice.reducer;
