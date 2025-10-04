import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';

const EXTRA_NATIONAL_PARKS = [
  "Redwood National and State Parks",
  "National Park of American Samoa"
];

export const fetchParks = createAsyncThunk('parks/fetchAllParks', async (options, { rejectWithValue }) => {
  
  const parks = await AuthService.makeRequest({
    urlExtension: 'getParks?start=0&limit=500&sort=fullName&stateCode=',
    method: 'GET',
    body: null,
    authRequired: false,
  })

  if (parks.error) {
    return rejectWithValue(parks.error);
  } else {
    return parks.data.data;
  }

})

export const exploreSlice = createSlice({
  name: 'explore',
  initialState: {
    allParks: [],
    listParks: [],
    mapParks: [],
    interval: 12,
    sort: 'Alphabetical (A-Z)',
    filter: {
      designations: [],
      stateCodes: [],
    },
    query: '',
    view: sessionStorage.getItem('preferredView') || 'list',
    parksStatus: 'idle',
    error: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setView: (state, action) => {
      state.view = action.payload.view;
      sessionStorage.setItem('preferredView', action.payload.view);
    },
    filterParks: (state) => {
      const allParks = state.allParks;

      let filteredMapParks = [...allParks];
      let filteredListParks = [...allParks];

      // ----- Filter by query -----
      if (state.query) {
        const tokens = state.query
          .toLowerCase()
          .split(' ')
          .filter(token => token.trim() !== '');

        const queryRegex = new RegExp(tokens.join('|'), 'gi');

        const matches = allParks.filter(park => {
          const searchableText = [
            park.fullName,
            park.description,
            ...(park.activities || []).map(a => a.name),
            ...(park.topics || []).map(t => t.name)
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          return queryRegex.test(searchableText);
        });

        filteredMapParks = matches;
        filteredListParks = matches;
      }

      // ----- Filter by state codes -----
      if (state.filter.stateCodes.length > 0) {
        const normalizedStateCodes = state.filter.stateCodes.map(code => code.trim().toUpperCase());

        filteredMapParks = filteredMapParks.filter(park =>
          park.states.split(',').some(code => normalizedStateCodes.includes(code.trim()))
        );

        filteredListParks = filteredListParks.filter(park =>
          park.states.split(',').some(code => normalizedStateCodes.includes(code.trim()))
        );
      }

      // ----- Filter by designation -----
      if (state.filter.designations.length > 0) {
        const includesNationalPark = state.filter.designations.includes("National Park");

        const otherDesignations = state.filter.designations.filter(d => d !== "National Park");

        const designationMatch = (designation, filter) =>
          designation?.toLowerCase().includes(filter.toLowerCase());

        const filterByDesignation = park => {
          const matchesNormalDesignation = otherDesignations.some(designation =>
            designationMatch(park.designation, designation)
          );

          const isManuallyIncluded =
            includesNationalPark && EXTRA_NATIONAL_PARKS.includes(park.fullName);

          const matchesNationalPark =
            includesNationalPark &&
            designationMatch(park.designation, 'National Park');

          return matchesNormalDesignation || matchesNationalPark || isManuallyIncluded;
        };

        filteredMapParks = filteredMapParks.filter(filterByDesignation);
        filteredListParks = filteredListParks.filter(filterByDesignation);
        console.log(filteredMapParks);
      }

      // ----- Sort -----
      switch (state.sort) {
        case 'Alphabetical (A-Z)':
          filteredListParks.sort((a, b) => a.fullName.localeCompare(b.fullName));
          break;
        case 'Reverse Alphabetical (Z-A)':
          filteredListParks.sort((a, b) => b.fullName.localeCompare(a.fullName));
          break;
        default:
          break;
      }

      // ----- Paginate -----
      state.mapParks = filteredMapParks;
      state.listParks = filteredListParks.slice(0, state.interval);
    },
    getNextParks: (state) => {
      state.mapParks.slice(state.listParks.length, state.listParks.length + state.interval).map(park => state.listParks.push(park))
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchParks.pending, (state) => {
        state.parksStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchParks.fulfilled, (state, action) => {
        state.parksStatus = 'succeeded'
        // Add fetched parks to state depending on the current designation filter
        state.allParks = action.payload;
        state.mapParks = action.payload;
        state.listParks = action.payload.slice(0, state.interval);
        state.error = null;
      })
      .addCase(fetchParks.rejected, (state, action) => {
        state.parksStatus = 'failed';
        state.error = action.error.message;
      })
  },
});

export const { setFilter, setSort, setQuery, setView, filterParks, getNextParks } = exploreSlice.actions;

export const selectAllParks = (state) => state.explore.allParks;
export const selectParksStatus = (state) => state.explore.parksStatus;
export const selectMapParks = (state) => state.explore.mapParks;
export const selectListParks = (state) => state.explore.listParks;
export const selectInterval = (state) => state.explore.interval;
export const selectSort = (state) => state.explore.sort;
export const selectError = (state) => state.explore.error;
export const selectFilter = (state) => state.explore.filter;
export const selectQuery = (state) => state.explore.query;
export const selectView = (state) => state.explore.view;

export default exploreSlice.reducer;
