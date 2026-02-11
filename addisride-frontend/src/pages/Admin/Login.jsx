import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { FaBus, FaPhone, FaLock, FaExclamationCircle } from 'react-icons/fa'

const AdminLogin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  })
  
  const [showDemo, setShowDemo] = useState(false)

  // Redirect based on role when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, role:', user.role)
      
      // Redirect based on role
      if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard')
        navigate('/admin/dashboard')
      } else if (user.role === 'driver') {
        console.log('Redirecting to driver dashboard')
        navigate('/driver')
      } else {
        console.log('Redirecting to home')
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.phoneNumber || !formData.password) {
      return
    }
    
    console.log('Submitting login form...')
    
    // Dispatch login action
    dispatch(login({
      phoneNumber: formData.phoneNumber,
      password: formData.password
    }))
  }

  const fillDemoCredentials = () => {
    setFormData({
      phoneNumber: '0912345678',
      password: 'admin123'
    })
    setShowDemo(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <FaBus className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AddisRide Admin</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <FaExclamationCircle className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 0912345678"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials Toggle */}
          <div className="mt-6">
            {!showDemo ? (
              <button
                onClick={() => setShowDemo(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Use demo credentials
              </button>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Demo Admin Credentials:</h3>
                  <button
                    onClick={() => setShowDemo(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">0912345678</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">admin123</code>
                  </div>
                  <button
                    onClick={fillDemoCredentials}
                    className="w-full mt-2 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Fill Demo Credentials
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            For demonstration purposes only. © 2026 AddisRide
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin