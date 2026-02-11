import { configureStore } from '@reduxjs/toolkit'
import busReducer from './slices/busSlice'
import routeReducer from './slices/routeSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    buses: busReducer,
    routes: routeReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})