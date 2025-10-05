import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';


export const fetchWeather = createAsyncThunk('weather/fetchWeather', async (coordinates) => {
    const { lat, lng } = coordinates;
    const response = await AuthService.makeRequest({ 
        urlExtension: `getWeather/?lat=${lat}&lng=${lng}`, 
        method: 'GET', 
        body: null,
    });

    return response.data;
})

export const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    weather: {},
    format: 'F',
    status: 'idle',
    error: null
  },
  reducers: {
    toggleFormat: (state) => {
      if (state.format === 'F') {
        state.format = 'C';
      } else {
        state.format = 'F';
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchWeather.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add fetched weather data
        state.weather = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
});

export const { toggleFormat } = weatherSlice.actions;

export const selectWeather = (state) => state.weather.weather;
export const selectFormat = (state) => state.weather.format;

export default weatherSlice.reducer;
