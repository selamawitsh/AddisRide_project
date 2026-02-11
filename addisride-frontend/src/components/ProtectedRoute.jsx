import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import Loader from './common/Loader'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [auth, setAuth] = useState({ loading: true, user: null })
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setAuth({ loading: false, user: null })
      return
    }

    try {
      const response = await api.get('/auth/me')
      setAuth({ loading: false, user: response.data })
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setAuth({ loading: false, user: null })
    }
  }

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!auth.user) {
    // Redirect to home if not logged in
    return <Navigate to="/" state={{ from: location, message: 'Please login to access admin panel' }} replace />
  }

  if (requireAdmin && auth.user.role !== 'admin') {
    // Show access denied for non-admin users
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Administrator privileges required to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute