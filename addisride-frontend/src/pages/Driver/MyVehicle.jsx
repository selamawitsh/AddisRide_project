import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaBus, FaRoute, FaWrench, FaGasPump, FaCalendar, FaIdCard, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const MyVehicle = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [maintenanceHistory, setMaintenanceHistory] = useState([])
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchVehicleDetails()
  }, [])

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true)
      const userRes = await api.get('/auth/me')
      
      if (userRes.data.assignedVehicle) {
        const vehicleRes = await api.get(`/vehicles/${userRes.data.assignedVehicle._id}`)
        setVehicle(vehicleRes.data)
        
        // Fetch maintenance history (if you have this endpoint)
        try {
          const maintenanceRes = await api.get(`/vehicles/${userRes.data.assignedVehicle._id}/maintenance`)
          setMaintenanceHistory(maintenanceRes.data)
        } catch (err) {
          console.log('Maintenance history not available')
        }
      } else {
        setError('No vehicle assigned to you')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      setError('Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
      maintenance: { bg: 'bg-red-100', text: 'text-red-800', label: 'Maintenance' }
    }
    const config = statusConfig[status] || statusConfig.inactive
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>
        {config.label}
      </span>
    )
  }

  const getOccupancyBadge = (occupancy) => {
    const occupancyConfig = {
      seats_available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Seats Available' },
      standing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Standing Room' },
      full: { bg: 'bg-red-100', text: 'text-red-800', label: 'Full' }
    }
    const config = occupancyConfig[occupancy] || occupancyConfig.seats_available
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Vehicle Assigned</h1>
          <p className="text-gray-600 mb-6">
            You don't have a vehicle assigned yet. Please contact the administrator.
          </p>
          <button
            onClick={() => navigate('/driver')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/driver')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Vehicle</h1>
          <p className="text-gray-600">View and manage your assigned vehicle</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vehicle Details
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'maintenance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Maintenance History
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md border">
        {activeTab === 'details' && (
          <div className="p-6">
            {/* Vehicle Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FaBus className="text-3xl text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{vehicle.plateNumber}</h2>
                  <p className="text-gray-600">{vehicle.route?.name || 'No route assigned'}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {getStatusBadge(vehicle.status)}
                {getOccupancyBadge(vehicle.occupancy)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Vehicle ID</div>
                    <div className="font-mono text-sm">{vehicle._id}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaRoute className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Route</div>
                    <div className="font-medium">{vehicle.route?.name || 'Not assigned'}</div>
                    {vehicle.route && (
                      <div className="text-xs text-gray-500">
                        {vehicle.route.stops?.length || 0} stops
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaCalendar className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Added to system</div>
                    <div>{new Date(vehicle.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaGasPump className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Current Occupancy</div>
                    <div className="font-medium capitalize">{vehicle.occupancy?.replace('_', ' ')}</div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FaWrench className="text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium capitalize">{vehicle.status}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Stops Preview */}
            {vehicle.route && vehicle.route.stops && vehicle.route.stops.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3">Route Stops</h3>
                <div className="space-y-2">
                  {vehicle.route.stops.map((stop, index) => (
                    <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 text-xs">
                        {index + 1}
                      </div>
                      <span>{stop.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
            {maintenanceHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaWrench className="text-4xl mx-auto mb-3 text-gray-300" />
                <p>No maintenance records found</p>
                <p className="text-sm">Maintenance history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceHistory.map((record, index) => (
                  <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                    <div className="font-medium">{record.date}</div>
                    <div className="text-sm text-gray-600">{record.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Days in Service</div>
                <div className="text-2xl font-bold">
                  {Math.ceil((new Date() - new Date(vehicle.createdAt)) / (1000 * 60 * 60 * 24))}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Status Duration</div>
                <div className="text-2xl font-bold capitalize">{vehicle.status}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/driver/update-location')}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <FaBus className="mr-2" />
          Update Location
        </button>
        <button
          onClick={() => navigate('/driver')}
          className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default MyVehicle