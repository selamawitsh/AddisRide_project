// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { FaBus, FaMapMarkedAlt, FaRoute, FaUser, FaSignOutAlt, FaLock } from 'react-icons/fa'
// import { useEffect, useState } from 'react'
// import api from '../../services/api'
// import LoginModal from '../modals/LoginModal'

// const Header = () => {
//   const location = useLocation()
//   const navigate = useNavigate()
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [loginModalOpen, setLoginModalOpen] = useState(false)

//   useEffect(() => {
//     checkAuthStatus()
//   }, [location])

//   const checkAuthStatus = async () => {
//     const token = localStorage.getItem('token')
    
//     if (!token) {
//       setUser(null)
//       setLoading(false)
//       return
//     }

//     try {
//       const response = await api.get('/auth/me')
//       setUser(response.data)
//     } catch (error) {
//       // Token invalid or expired
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       setUser(null)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleAdminClick = (e) => {
//     if (!user) {
//       e.preventDefault()
//       setLoginModalOpen(true)
//     } else if (user.role !== 'admin') {
//       e.preventDefault()
//       alert('Admin privileges required. Please login with an admin account.')
//     }
//   }

//   const handleLoginSuccess = (userData) => {
//     setUser(userData)
//     navigate('/admin')
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//     setUser(null)
//     navigate('/')
//   }

//   const navItems = [
//     { path: '/', label: 'Home', icon: <FaBus /> },
//     { path: '/live-map', label: 'Live Map', icon: <FaMapMarkedAlt /> },
//     { path: '/routes', label: 'Routes', icon: <FaRoute /> },
//   ]

//   return (
//     <>
//       <header className="bg-white shadow-md">
//         <div className="container mx-auto px-4 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <FaBus className="text-2xl text-blue-600" />
//               <h1 className="text-xl font-bold text-gray-800">AddisRide</h1>
//             </div>

//             <nav className="flex items-center space-x-6">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                     location.pathname === item.path
//                       ? 'bg-blue-100 text-blue-700'
//                       : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   {item.icon}
//                   <span className="font-medium">{item.label}</span>
//                 </Link>
//               ))}
              
//               {/* Admin Link */}
//               <div className="relative">
//                 {user?.role === 'admin' ? (
//                   <div className="flex items-center space-x-4">
//                     <Link
//                       to="/admin"
//                       className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
//                         location.pathname.startsWith('/admin')
//                           ? 'bg-purple-100 text-purple-700'
//                           : 'text-purple-600 hover:bg-purple-50'
//                       }`}
//                     >
//                       <FaUser className="text-purple-600" />
//                       <span className="font-medium">Admin</span>
//                     </Link>
//                     <button
//                       onClick={handleLogout}
//                       className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm"
//                       title="Logout"
//                     >
//                       <FaSignOutAlt />
//                     </button>
//                   </div>
//                 ) : (
//                   // Clickable admin link that opens login modal
//                   <div 
//                     onClick={handleAdminClick}
//                     className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors group"
//                   >
//                     <FaUser />
//                     <span className="font-medium">Admin</span>
//                     {/* Tooltip for non-admins */}
//                     {user && user.role !== 'admin' && (
//                       <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
//                         Admin privileges required
//                         <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Add this to your header navigation */}
//               {user?.role === 'driver' && (
//                 <Link
//                   to="/driver"
//                   className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
//                 >
//                   Driver Dashboard
//                 </Link>
// )}
//             </nav>

//             <div className="text-sm text-gray-500 hidden md:block">
//               <span className="hidden md:inline">Addis Ababa Public Transport</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Login Modal */}
//       <LoginModal
//         isOpen={loginModalOpen}
//         onClose={() => setLoginModalOpen(false)}
//         onLoginSuccess={handleLoginSuccess}
//       />
//     </>
//   )
// }

// export default Header


import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaBus, FaUser, FaShieldAlt, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa'
import { logout } from '../../store/slices/authSlice'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaBus className="text-2xl text-blue-600" />
            <span className="text-xl font-bold text-gray-800">AddisRide</span>
          </Link>

          {/* Main Navigation - Visible to ALL users */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600">
              Home
            </Link>
            <Link to="/live-map" className="text-gray-600 hover:text-blue-600">
              Live Map
            </Link>
            <Link to="/routes" className="text-gray-600 hover:text-blue-600">
              Routes
            </Link>
          </div>

          {/* Right Side - Depends on Auth Status */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Driver Dashboard Link */}
                {user?.role === 'driver' && (
                  <Link
                    to="/driver/dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaTachometerAlt />
                    <span>Driver Dashboard</span>
                  </Link>
                )}

                {/* Admin Dashboard Link */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <FaShieldAlt />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <FaUser className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    {user?.role === 'driver' && !user?.isVerified && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FaSignOutAlt />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Public User Options */}
                <Link
                  to="/choose-role"
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  Login / Register
                </Link>
                <Link
                  to="/live-map"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Track Buses
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header