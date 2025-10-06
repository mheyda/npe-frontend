import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthService } from '../../../services/AuthService';

export const getFavorites = createAsyncThunk('favorites/getFavorites', async (options, { rejectWithValue }) => {
  // Make request to get user's favorites.

  const favorites = await AuthService.makeRequest({ 
      urlExtension: 'user/favorites/', 
      method: 'GET', 
      body: null,
  });

  if (favorites.error) {
    return rejectWithValue(favorites.error);
  } else {
    return favorites.data;
  }
})

export const toggleFavorite = createAsyncThunk('favorites/toggleFavorite', async (options, { rejectWithValue }) => {
  // Make request to toggle the "favorite" status of a park for a user.
  const { id } = options;

  const updatedFavorites = await AuthService.makeRequest({ 
    urlExtension: 'user/favorites/', 
    method: 'POST', 
    body: id,
  });

  if (updatedFavorites.error) {
    return rejectWithValue(updatedFavorites.error);
  } else {
    return updatedFavorites.data;
  }
})

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: {
    favorites: [],
    favoritesStatus: 'idle',
    favoritesError: null,
    toggleStatus: 'idle',
    toggleError: null,
  },
  reducers: {
    setToggleStatus: (state, action) => {
      state.toggleStatus = action.payload;
    },
    clearFavorites(state) {
      state.favorites = [];
      state.favoritesStatus = 'idle';
      state.favoritesError = null;
      state.toggleStatus = 'idle';
      state.toggleError = null;
    }
  },
  extraReducers(builder) {
    builder
    .addCase(getFavorites.pending, (state) => {
      state.favoritesStatus = 'loading';
      state.favoritesError = null;
    })
    .addCase(getFavorites.fulfilled, (state, action) => {
      state.favoritesStatus = 'succeeded'
      state.favorites = action.payload;
    })
    .addCase(getFavorites.rejected, (state, action) => {
      state.favoritesStatus = 'failed';
      state.favoritesError = action.error.message;
    })
    .addCase(toggleFavorite.pending, (state) => {
      state.toggleStatus = 'loading';
      state.favoritesError = null;
    })
    .addCase(toggleFavorite.fulfilled, (state, action) => {
      state.toggleStatus = 'succeeded'
      state.favorites = action.payload;
    })
    .addCase(toggleFavorite.rejected, (state, action) => {
      state.toggleStatus = 'failed';
      state.toggleError = action.error.message;
    })
  },
});

export const { setToggleStatus, clearFavorites } = favoritesSlice.actions;

export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesStatus = (state) => state.favorites.favoritesStatus;
export const selectToggleStatus = (state) => state.favorites.toggleStatus;

export default favoritesSlice.reducer;
