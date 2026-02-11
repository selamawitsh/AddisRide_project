import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Login action
export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, password }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', { phoneNumber, password: '***' })
      
      const response = await api.post('/auth/login', {
        phoneNumber,
        password
      })
      
      console.log('Login response:', response.data)
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      
      return response.data
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      
      // Return specific error message
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message)
      }
      return rejectWithValue('Login failed. Please check your credentials.')
    }
  }
)

// Logout action
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return null
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.token = action.payload.token
        state.error = null
        console.log('✅ Login successful, user role:', action.payload.role)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload || 'Login failed'
        console.error('❌ Login rejected:', state.error)
      })
      
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
      })
  }
})

export const { clearError } = authSlice.actions
export default authSlice.reducer