import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchBuses = createAsyncThunk(
  'buses/fetchBuses',
  async () => {
    const response = await api.get('/vehicles')
    return response.data
  }
)

export const fetchLiveLocations = createAsyncThunk(
  'buses/fetchLiveLocations',
  async () => {
    const response = await api.get('/locations/current')
    return response.data
  }
)

// ADD THIS FUNCTION - Get vehicles by route
export const fetchVehiclesByRoute = createAsyncThunk(
  'buses/fetchVehiclesByRoute',
  async (routeId) => {
    const response = await api.get(`/vehicles/route/${routeId}`)
    return response.data
  }
)

const busSlice = createSlice({
  name: 'buses',
  initialState: {
    buses: [],
    liveLocations: [],
    vehiclesByRoute: {}, // Store vehicles by route ID
    loading: false,
    error: null,
    lastUpdated: null,
  },
  reducers: {
    setBuses: (state, action) => {
      state.buses = action.payload
    },
    updateBusLocation: (state, action) => {
      const { vehicleId, coordinates } = action.payload
      const index = state.liveLocations.findIndex(loc => loc.vehicleId === vehicleId)
      if (index >= 0) {
        state.liveLocations[index].coordinates = coordinates
        state.liveLocations[index].lastUpdated = new Date().toISOString()
      }
    },
    setVehiclesForRoute: (state, action) => {
      const { routeId, vehicles } = action.payload
      state.vehiclesByRoute[routeId] = vehicles
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.loading = false
        state.buses = action.payload
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchLiveLocations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLiveLocations.fulfilled, (state, action) => {
        state.loading = false
        state.liveLocations = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchLiveLocations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchVehiclesByRoute.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehiclesByRoute.fulfilled, (state, action) => {
        state.loading = false
        // This thunk needs to store data differently since it's route-specific
        // We'll handle this in the component
      })
      .addCase(fetchVehiclesByRoute.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { setBuses, updateBusLocation, setVehiclesForRoute } = busSlice.actions
export default busSlice.reducer