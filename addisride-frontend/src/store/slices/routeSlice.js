import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async () => {
    const response = await api.get('/routes')
    return response.data
  }
)

const routeSlice = createSlice({
  name: 'routes',
  initialState: {
    routes: [],
    loading: false,
    error: null,
    selectedRoute: null,
  },
  reducers: {
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false
        state.routes = action.payload
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { setSelectedRoute } = routeSlice.actions
export default routeSlice.reducer