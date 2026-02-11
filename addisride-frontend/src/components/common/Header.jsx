import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaBus, FaMapMarkedAlt, FaRoute, FaUser, FaSignOutAlt, FaLock } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import api from '../../services/api'
import LoginModal from '../modals/LoginModal'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [location])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminClick = (e) => {
    if (!user) {
      e.preventDefault()
      setLoginModalOpen(true)
    } else if (user.role !== 'admin') {
      e.preventDefault()
      alert('❌ Admin privileges required. Please login with an admin account.')
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    navigate('/admin')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const navItems = [
    { path: '/', label: 'Home', icon: <FaBus /> },
    { path: '/live-map', label: 'Live Map', icon: <FaMapMarkedAlt /> },
    { path: '/routes', label: 'Routes', icon: <FaRoute /> },
  ]

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaBus className="text-2xl text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">AddisRide</h1>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Beta
              </span>
            </div>

            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              
              {/* Admin Link */}
              <div className="relative">
                {user?.role === 'admin' ? (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/admin"
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        location.pathname.startsWith('/admin')
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <FaUser className="text-purple-600" />
                      <span className="font-medium">Admin</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
                      title="Logout"
                    >
                      <FaSignOutAlt />
                    </button>
                  </div>
                ) : (
                  // Clickable admin link that opens login modal
                  <div 
                    onClick={handleAdminClick}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors group"
                  >
                    <FaUser />
                    <span className="font-medium">Admin</span>
                    {/* Tooltip for non-admins */}
                    {user && user.role !== 'admin' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        Admin privileges required
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>

            <div className="text-sm text-gray-500 hidden md:block">
              <span className="hidden md:inline">Addis Ababa Public Transport</span>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  )
}

export default Header