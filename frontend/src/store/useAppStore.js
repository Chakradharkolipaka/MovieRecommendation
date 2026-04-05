import { create } from 'zustand';
import { createMovieSlice } from './slices/movieSlice';
import { createUiSlice } from './slices/uiSlice';

export const useAppStore = create((set) => ({
  ...createMovieSlice(set),
  ...createUiSlice(set),
}));
