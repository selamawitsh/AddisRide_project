import { Link } from 'react-router-dom'
import { FaBus, FaShieldAlt, FaEye } from 'react-icons/fa'

const ChooseRole = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to AddisRide</h1>
          <p className="text-xl text-gray-600">Choose how you want to use the app</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Public User Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaEye className="text-3xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Track Buses</h2>
            <p className="text-gray-600 text-center mb-6">
              Just want to see bus locations and routes? No account needed!
            </p>
            <Link
              to="/"
              className="block w-full py-3 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue as Guest
            </Link>
            <p className="text-xs text-gray-400 text-center mt-4">
              No registration required
            </p>
          </div>

          {/* Driver Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border-2 border-blue-100">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBus className="text-3xl text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">I'm a Driver</h2>
            <p className="text-gray-600 text-center mb-6">
              Register as a driver to update bus locations and manage your vehicle
            </p>
            <Link
              to="/register?role=driver"
              className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors mb-3"
            >
              Register as Driver
            </Link>
            <Link
              to="/login?role=driver"
              className="block w-full py-3 px-4 border border-blue-600 text-blue-600 text-center rounded-lg hover:bg-blue-50 transition-colors"
            >
              Login as Driver
            </Link>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt className="text-3xl text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Administrator</h2>
            <p className="text-gray-600 text-center mb-6">
              Manage routes, vehicles, drivers, and system settings
            </p>
            <Link
              to="/login?role=admin"
              className="block w-full py-3 px-4 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors"
            >
              Admin Login
            </Link>
            <p className="text-xs text-gray-400 text-center mt-4">
              Admin accounts are created by system
            </p>
          </div>
        </div>

        {/* Quick Access for Testing */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Demo Access (For Testing)</p>
          <div className="flex justify-center space-x-4">
            <Link to="/live-map" className="text-sm text-blue-600 hover:underline">
              View Live Map
            </Link>
            <Link to="/routes" className="text-sm text-blue-600 hover:underline">
              View Routes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChooseRole