import { configureStore } from '@reduxjs/toolkit';
import exploreReducer from '../features/explore/exploreSlice';
import weatherReducer from '../features/weather/weatherSlice';
import favoritesReducer from '../features/lists/favorites/favoritesSlice';
import visitedReducer from '../features/lists/visited/visitedSlice';
import chatbotReducer from '../features/chatbot/chatbotSlice';

export const store = configureStore({
  reducer: {
    explore: exploreReducer,
    weather: weatherReducer,
    favorites: favoritesReducer,
    visited: visitedReducer,
    chatbot: chatbotReducer,
  },
});
