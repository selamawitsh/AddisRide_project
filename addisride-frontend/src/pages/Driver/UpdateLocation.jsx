import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaCrosshairs, FaPaperPlane, FaHistory, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import api from '../../services/api'
import socketService from '../../services/socket'
import Loader from '../../components/common/Loader'

const UpdateLocation = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [locationLoading, setLocationLoading] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [updateInterval, setUpdateInterval] = useState(null)
  const [locationHistory, setLocationHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchVehicleDetails()
    
    // Connect socket
    socketService.connect()

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
      socketService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (autoUpdate) {
      const interval = setInterval(() => {
        if (location.lat && location.lng) {
          sendLocationUpdate(true) // silent update
        }
      }, 30000) // Update every 30 seconds
      setUpdateInterval(interval)
    } else if (updateInterval) {
      clearInterval(updateInterval)
      setUpdateInterval(null)
    }

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [autoUpdate, location])

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true)
      const userRes = await api.get('/auth/me')
      
      if (userRes.data.assignedVehicle) {
        const vehicleRes = await api.get(`/vehicles/${userRes.data.assignedVehicle._id}`)
        setVehicle(vehicleRes.data)
        fetchLocationHistory(vehicleRes.data._id)
      } else {
        setError('No vehicle assigned to you. Please contact admin.')
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error)
      setError('Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  const fetchLocationHistory = async (vehicleId) => {
    try {
      setHistoryLoading(true)
      const response = await api.get(`/locations/vehicle/${vehicleId}?limit=10`)
      setLocationHistory(response.data)
    } catch (error) {
      console.error('Error fetching location history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    setError('')
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setLocationLoading(false)
        setSuccess('Location captured successfully!')
        setTimeout(() => setSuccess(''), 3000)
      },
      (error) => {
        console.error('Error getting location:', error)
        let errorMessage = 'Failed to get your location.'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        setError(errorMessage)
        setLocationLoading(false)
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const sendLocationUpdate = async (silent = false) => {
    if (!location.lat || !location.lng) {
      if (!silent) setError('Please get your location first')
      return
    }

    if (!vehicle) {
      if (!silent) setError('No vehicle assigned')
      return
    }

    try {
      // Send to REST API
      const response = await api.post('/locations', {
        vehicleId: vehicle._id,
        lat: location.lat,
        lng: location.lng
      })

      // Send via socket for real-time
      socketService.emit('location-update', {
        vehicleId: vehicle._id,
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date(),
        accuracy: location.accuracy
      })

      // Update history
      setLocationHistory(prev => [response.data, ...prev].slice(0, 10))

      if (!silent) {
        setSuccess('Location updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error sending location:', error)
      if (!silent) setError('Failed to send location update')
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
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
            You need a vehicle assigned before you can update location.
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaMapMarkerAlt className="mr-3 text-red-500" />
          Update Vehicle Location
        </h1>
        <p className="text-gray-600">
          Vehicle: {vehicle.plateNumber} - {vehicle.route?.name}
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Location Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
        <h2 className="text-xl font-bold mb-6">Current Location</h2>

        {/* Location Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
            <div className="text-2xl font-mono">
              {location.lat ? location.lat.toFixed(6) : '---'}
            </div>
            {location.accuracy && (
              <div className="text-xs text-gray-500 mt-1">
                Accuracy: ±{location.accuracy.toFixed(1)}m
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
            <div className="text-2xl font-mono">
              {location.lng ? location.lng.toFixed(6) : '---'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {locationLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Getting Location...
              </>
            ) : (
              <>
                <FaCrosshairs className="mr-2" />
                Get Current Location
              </>
            )}
          </button>
          
          <button
            onClick={() => sendLocationUpdate(false)}
            disabled={!location.lat || !location.lng}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <FaPaperPlane className="mr-2" />
            Send Location Update
          </button>
        </div>

        {/* Auto Update Toggle */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-blue-600"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            <span className="ml-3 text-gray-700">
              <span className="font-medium">Auto-update location</span>
              <span className="text-sm text-gray-500 block">
                Automatically send location every 30 seconds (requires location to be set)
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Location History */}
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaHistory className="mr-2 text-gray-600" />
            Recent Location Updates
          </h2>
          <button
            onClick={() => fetchLocationHistory(vehicle._id)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <Loader />
        ) : locationHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaMapMarkerAlt className="text-4xl mx-auto mb-3 text-gray-300" />
            <p>No location updates yet</p>
            <p className="text-sm">Send your first location to see history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {locationHistory.map((update, index) => (
              <div key={update._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaClock className="text-gray-400 mr-3" />
                  <div>
                    <div className="font-mono text-sm">
                      {update.lat?.toFixed(6)}, {update.lng?.toFixed(6)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(update.createdAt)}
                    </div>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Sent
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">📍 Location Update Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Enable high accuracy GPS for best results</li>
          <li>• Update location every 30 seconds for real-time tracking</li>
          <li>• Make sure you're outdoors for better GPS signal</li>
          <li>• The map will show your bus moving in real-time</li>
        </ul>
      </div>
    </div>
  )
}

export default UpdateLocation