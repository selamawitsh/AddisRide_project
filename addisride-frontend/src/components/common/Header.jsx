import { Link, useLocation } from 'react-router-dom'
import { FaBus, FaMapMarkedAlt, FaRoute, FaUser } from 'react-icons/fa'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: <FaBus /> },
    { path: '/live-map', label: 'Live Map', icon: <FaMapMarkedAlt /> },
    { path: '/routes', label: 'Routes', icon: <FaRoute /> },
    { path: '/admin', label: 'Admin', icon: <FaUser /> },
  ]

  return (
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

          <nav className="flex space-x-6">
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
          </nav>

          <div className="text-sm text-gray-500">
            <span className="hidden md:inline">Addis Ababa Public Transport</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header