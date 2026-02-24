import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { login, clearError } from '../../store/slices/authSlice'
import { FaBus, FaPhone, FaLock, FaExclamationCircle, FaShieldAlt, FaUser } from 'react-icons/fa'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get role from URL query params
  const queryParams = new URLSearchParams(location.search)
  const defaultRole = queryParams.get('role') || 'driver'
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  })
  
  const [selectedRole, setSelectedRole] = useState(defaultRole)
  const [showDemo, setShowDemo] = useState(false)

  // Redirect based on role when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (user.role === 'driver') {
        if (user.isVerified) {
          navigate('/driver/dashboard')
        } else {
          navigate('/pending-verification')
        }
      }
    }
  }, [isAuthenticated, user, navigate])

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
    
    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.phoneNumber || !formData.password) {
      return
    }
    
    dispatch(login({
      phoneNumber: formData.phoneNumber,
      password: formData.password
    }))
  }

  const fillDemoCredentials = () => {
    if (selectedRole === 'admin') {
      setFormData({
        phoneNumber: '0912345678',
        password: 'admin123'
      })
    } else {
      setFormData({
        phoneNumber: '0912345679',
        password: 'driver123'
      })
    }
    setShowDemo(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Role Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedRole('driver')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                selectedRole === 'driver'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaUser className="inline mr-2" />
              Driver Login
            </button>
            <button
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                selectedRole === 'admin'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaShieldAlt className="inline mr-2" />
              Admin Login
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-b-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              selectedRole === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {selectedRole === 'admin' ? (
                <FaShieldAlt className="text-3xl text-white" />
              ) : (
                <FaBus className="text-3xl text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedRole === 'admin' ? 'Admin Login' : 'Driver Login'}
            </h1>
            <p className="text-gray-600 mt-2">
              {selectedRole === 'admin' 
                ? 'Sign in to manage the system' 
                : 'Sign in to update bus location'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <FaExclamationCircle className="text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${
                selectedRole === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
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
                  <h3 className="text-sm font-medium text-gray-700">
                    {selectedRole === 'admin' ? 'Demo Admin:' : 'Demo Driver:'}
                  </h3>
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
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedRole === 'admin' ? '0912345678' : '0912345679'}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedRole === 'admin' ? 'admin123' : 'driver123'}
                    </code>
                  </div>
                  <button
                    onClick={fillDemoCredentials}
                    className={`w-full mt-2 py-2 px-3 rounded text-sm font-medium transition-colors ${
                      selectedRole === 'admin'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Fill Demo Credentials
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Register Link for Drivers */}
          {selectedRole === 'driver' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a driver account?{' '}
                <Link
                  to="/register?role=driver"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login