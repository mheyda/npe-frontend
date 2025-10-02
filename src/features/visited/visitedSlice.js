import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeRequest } from '../../makeRequest';


export const getVisited = createAsyncThunk('visited/getVisited', async (options, { rejectWithValue }) => {
  // Make request to get user's visited parks.

  const visited = await makeRequest({ 
      urlExtension: 'user/visited/', 
      method: 'GET', 
      body: null,
      authRequired: true,
  });

  if (visited.error) {
    return rejectWithValue(visited.error);
  } else {
    return visited.data;
  }
})

export const toggleVisited = createAsyncThunk('visited/toggleVisited', async (options, { rejectWithValue }) => {
  // Make request to toggle the "visited" status of a park for a user.
  const { id } = options;

  const updatedVisited = await makeRequest({ 
    urlExtension: 'user/visited/', 
    method: 'POST', 
    body: id,
    authRequired: true,
  });

  if (updatedVisited.error) {
    return rejectWithValue(updatedVisited.error);
  } else {
    return updatedVisited.data;
  }
})

export const visitedSlice = createSlice({
  name: 'visited',
  initialState: {
    visited: [],
    visitedStatus: 'idle',
    visitedError: null,
    toggleStatus: 'idle',
    toggleError: null,
  },
  reducers: {
    setToggleStatus: (state, action) => {
      state.toggleStatus = action.payload;
    }
  },
  extraReducers(builder) {
    builder
    .addCase(getVisited.pending, (state) => {
      state.visitedStatus = 'loading';
      state.error = null;
    })
    .addCase(getVisited.fulfilled, (state, action) => {
      state.visitedStatus = 'succeeded'
      state.visited = action.payload;
    })
    .addCase(getVisited.rejected, (state, action) => {
      state.visitedStatus = 'failed';
      state.visitedError = action.error.message;
    })
    .addCase(toggleVisited.pending, (state) => {
      state.toggleStatus = 'loading';
      state.error = null;
    })
    .addCase(toggleVisited.fulfilled, (state, action) => {
      state.toggleStatus = 'succeeded'
      state.visited = action.payload;
    })
    .addCase(toggleVisited.rejected, (state, action) => {
      state.toggleStatus = 'failed';
      state.toggleError = action.error.message;
    })
  },
});

export const { setToggleStatus } = visitedSlice.actions;

export const selectVisited = (state) => state.visited.visited;
export const selectVisitedStatus = (state) => state.visited.visitedStatus;
export const selectToggleStatus = (state) => state.visited.toggleStatus;

export default visitedSlice.reducer;
