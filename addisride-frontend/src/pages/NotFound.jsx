import { Link } from 'react-router-dom'
import { FaExclamationTriangle, FaHome, FaMapMarkedAlt, FaRoute } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <FaExclamationTriangle className="text-8xl text-yellow-500 animate-pulse" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              404
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            to="/"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Go to Homepage
          </Link>
          <Link
            to="/live-map"
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaMapMarkedAlt className="mr-2" />
            View Live Map
          </Link>
          <Link
            to="/routes"
            className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaRoute className="mr-2" />
            Browse Routes
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Popular Destinations
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/" className="text-blue-600 hover:underline">Home</Link>
            <span className="text-gray-300">•</span>
            <Link to="/live-map" className="text-blue-600 hover:underline">Live Tracking</Link>
            <span className="text-gray-300">•</span>
            <Link to="/routes" className="text-blue-600 hover:underline">Bus Routes</Link>
            <span className="text-gray-300">•</span>
            <Link to="/choose-role" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="mt-8 text-sm text-gray-500">
          <p>🚍 Did you know? AddisRide tracks over 1,000 buses daily!</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound