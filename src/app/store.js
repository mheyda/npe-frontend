import { configureStore } from '@reduxjs/toolkit';
import exploreReducer from '../features/explore/exploreSlice';
import weatherReducer from '../features/weather/weatherSlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import visitedReducer from '../features/visited/visitedSlice';

export const store = configureStore({
  reducer: {
    explore: exploreReducer,
    weather: weatherReducer,
    favorites: favoritesReducer,
    visited: visitedReducer,
  },
});
