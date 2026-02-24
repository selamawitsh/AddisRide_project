import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaBus, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api'
import socketService from '../../services/socket'
import Loader from '../../components/common/Loader'

const DriverDashboard = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [location, setLocation] = useState({ lat: null, lng: null })
  const [locationLoading, setLocationLoading] = useState(false)
  const [status, setStatus] = useState('inactive')
  const [occupancy, setOccupancy] = useState('seats_available')
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    fetchVehicleDetails()
    
    // Connect socket - FIXED: remove process.env
    socketService.connect()

    return () => {
      socketService.disconnect()
    }
  }, [])

  useEffect(() => {
    if (vehicle) {
      setStatus(vehicle.status)
      setOccupancy(vehicle.occupancy)
    }
  }, [vehicle])

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true)
      const userRes = await api.get('/auth/me')
      
      if (userRes.data.assignedVehicle) {
        const vehicleRes = await api.get(`/vehicles/${userRes.data.assignedVehicle._id}`)
        setVehicle(vehicleRes.data)
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

  const sendLocationUpdate = async () => {
    if (!location.lat || !location.lng) {
      setError('Please get your location first')
      return
    }

    if (!vehicle) {
      setError('No vehicle assigned')
      return
    }

    try {
      setLocationLoading(true)
      
      await api.post('/locations', {
        vehicleId: vehicle._id,
        lat: location.lat,
        lng: location.lng
      })

      socketService.emit('location-update', {
        vehicleId: vehicle._id,
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date(),
        accuracy: location.accuracy
      })

      setLastUpdate(new Date())
      setSuccess('Location updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error sending location:', error)
      setError('Failed to send location update')
    } finally {
      setLocationLoading(false)
    }
  }

  const updateVehicleStatus = async (newStatus) => {
    try {
      await api.put(`/vehicles/${vehicle._id}/status`, { status: newStatus })
      setStatus(newStatus)
      setVehicle({ ...vehicle, status: newStatus })
      setSuccess(`Status updated to ${newStatus}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update status')
    }
  }

  const updateVehicleOccupancy = async (newOccupancy) => {
    try {
      await api.put(`/vehicles/${vehicle._id}/occupancy`, { occupancy: newOccupancy })
      setOccupancy(newOccupancy)
      setVehicle({ ...vehicle, occupancy: newOccupancy })
      setSuccess(`Occupancy updated to ${newOccupancy.replace('_', ' ')}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error updating occupancy:', error)
      setError('Failed to update occupancy')
    }
  }

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'green', icon: '🟢' },
    { value: 'inactive', label: 'Inactive', color: 'gray', icon: '⚫' },
    { value: 'maintenance', label: 'Maintenance', color: 'red', icon: '🔴' }
  ]

  const occupancyOptions = [
    { value: 'seats_available', label: 'Seats Available', color: 'green', icon: '🟢' },
    { value: 'standing', label: 'Standing Room', color: 'yellow', icon: '🟡' },
    { value: 'full', label: 'Full', color: 'red', icon: '🔴' }
  ]

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
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
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
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
      </div>

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

      {/* Vehicle Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaBus className="mr-2 text-blue-600" />
            Your Vehicle
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' :
            status === 'maintenance' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {statusOptions.find(s => s.value === status)?.icon} {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Plate Number</p>
            <p className="text-lg font-bold">{vehicle.plateNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Route</p>
            <p className="text-lg">{vehicle.route?.name || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Occupancy</p>
            <p className="text-lg">
              {occupancyOptions.find(o => o.value === occupancy)?.icon} {occupancy.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Location Update</p>
            <p className="text-lg">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Location Update Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-2 text-red-500" />
          Update Your Location
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
              value={location.lat?.toFixed(6) || 'Not available'} readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
              value={location.lng?.toFixed(6) || 'Not available'} readOnly />
          </div>
          <div className="flex items-end space-x-2">
            <button onClick={getCurrentLocation} disabled={locationLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-1">
              {locationLoading ? 'Getting Location...' : 'Get Location'}
            </button>
            <button onClick={sendLocationUpdate} disabled={locationLoading || !location.lat}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              Send
            </button>
          </div>
        </div>

        {location.accuracy && (
          <p className="text-xs text-gray-500 mt-2">
            Accuracy: ±{location.accuracy.toFixed(1)} meters
          </p>
        )}
      </div>

      {/* Status & Occupancy Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Status Update */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-4">Update Vehicle Status</h3>
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <button key={option.value} onClick={() => updateVehicleStatus(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  status === option.value ? `border-${option.color}-500 bg-${option.color}-50` : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-xl mr-2">{option.icon}</span> {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Occupancy Update */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h3 className="text-lg font-semibold mb-4">Update Occupancy</h3>
          <div className="space-y-3">
            {occupancyOptions.map((option) => (
              <button key={option.value} onClick={() => updateVehicleOccupancy(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  occupancy === option.value ? `border-${option.color}-500 bg-${option.color}-50` : 'border-gray-200 hover:border-gray-300'
                }`}>
                <span className="text-xl mr-2">{option.icon}</span> {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => navigate('/driver/vehicle')}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          View Vehicle Details
        </button>
        <button onClick={() => navigate('/driver/update-location')}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Detailed Location Update
        </button>
      </div>
    </div>
  )
}

export default DriverDashboard




// import { useState, useEffect } from 'react'
// import { useSelector } from 'react-redux'
// import { FaBus, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
// import api from '../../services/api'
// import Loader from '../../components/common/Loader'
// import { io } from 'socket.io-client'

// const DriverDashboard = () => {
//   const { user } = useSelector((state) => state.auth)
//   const [vehicle, setVehicle] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [location, setLocation] = useState({ lat: null, lng: null })
//   const [locationLoading, setLocationLoading] = useState(false)
//   const [status, setStatus] = useState('inactive')
//   const [occupancy, setOccupancy] = useState('seats_available')
//   const [socket, setSocket] = useState(null)
//   const [lastUpdate, setLastUpdate] = useState(null)

//   useEffect(() => {
//     fetchVehicleDetails()
    
//     // Connect to socket for real-time updates
//     const socketConnection = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000')
//     setSocket(socketConnection)

//     return () => {
//       if (socketConnection) socketConnection.disconnect()
//     }
//   }, [])

//   useEffect(() => {
//     if (vehicle) {
//       setStatus(vehicle.status)
//       setOccupancy(vehicle.occupancy)
//     }
//   }, [vehicle])

//   const fetchVehicleDetails = async () => {
//     try {
//       setLoading(true)
//       // First get user with assigned vehicle
//       const userRes = await api.get('/auth/me')
      
//       if (userRes.data.assignedVehicle) {
//         // Get vehicle details
//         const vehicleRes = await api.get(`/vehicles/${userRes.data.assignedVehicle._id}`)
//         setVehicle(vehicleRes.data)
//       } else {
//         setError('No vehicle assigned to you. Please contact admin.')
//       }
//     } catch (error) {
//       console.error('Error fetching vehicle:', error)
//       setError('Failed to load vehicle details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getCurrentLocation = () => {
//     setLocationLoading(true)
//     setError('')
    
//     if (!navigator.geolocation) {
//       setError('Geolocation is not supported by your browser')
//       setLocationLoading(false)
//       return
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         setLocation({
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         })
//         setLocationLoading(false)
//       },
//       (error) => {
//         console.error('Error getting location:', error)
//         setError('Failed to get your location. Please enable location services.')
//         setLocationLoading(false)
//       },
//       { enableHighAccuracy: true, timeout: 10000 }
//     )
//   }

//   const sendLocationUpdate = async () => {
//     if (!location.lat || !location.lng) {
//       setError('Please get your location first')
//       return
//     }

//     if (!vehicle) {
//       setError('No vehicle assigned')
//       return
//     }

//     try {
//       setLocationLoading(true)
      
//       // Send location to backend
//       await api.post('/locations', {
//         vehicleId: vehicle._id,
//         lat: location.lat,
//         lng: location.lng
//       })

//       // Also send via socket for real-time updates
//       if (socket) {
//         socket.emit('location-update', {
//           vehicleId: vehicle._id,
//           lat: location.lat,
//           lng: location.lng,
//           timestamp: new Date()
//         })
//       }

//       setLastUpdate(new Date())
//       setSuccess('Location updated successfully!')
//       setTimeout(() => setSuccess(''), 3000)
//     } catch (error) {
//       console.error('Error sending location:', error)
//       setError('Failed to send location update')
//     } finally {
//       setLocationLoading(false)
//     }
//   }

//   const updateVehicleStatus = async (newStatus) => {
//     try {
//       await api.put(`/vehicles/${vehicle._id}/status`, { status: newStatus })
//       setStatus(newStatus)
//       setVehicle({ ...vehicle, status: newStatus })
//       setSuccess(`Status updated to ${newStatus}`)
//       setTimeout(() => setSuccess(''), 3000)
//     } catch (error) {
//       console.error('Error updating status:', error)
//       setError('Failed to update status')
//     }
//   }

//   const updateVehicleOccupancy = async (newOccupancy) => {
//     try {
//       await api.put(`/vehicles/${vehicle._id}/occupancy`, { occupancy: newOccupancy })
//       setOccupancy(newOccupancy)
//       setVehicle({ ...vehicle, occupancy: newOccupancy })
//       setSuccess(`Occupancy updated to ${newOccupancy.replace('_', ' ')}`)
//       setTimeout(() => setSuccess(''), 3000)
//     } catch (error) {
//       console.error('Error updating occupancy:', error)
//       setError('Failed to update occupancy')
//     }
//   }

//   const statusOptions = [
//     { value: 'active', label: 'Active', color: 'green', icon: '🟢' },
//     { value: 'inactive', label: 'Inactive', color: 'gray', icon: '⚫' },
//     { value: 'maintenance', label: 'Maintenance', color: 'red', icon: '🔴' }
//   ]

//   const occupancyOptions = [
//     { value: 'seats_available', label: 'Seats Available', color: 'green', icon: '🟢' },
//     { value: 'standing', label: 'Standing Room', color: 'yellow', icon: '🟡' },
//     { value: 'full', label: 'Full', color: 'red', icon: '🔴' }
//   ]

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <Loader />
//       </div>
//     )
//   }

//   if (!vehicle) {
//     return (
//       <div className="container mx-auto px-4 py-16 text-center">
//         <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
//           <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-gray-800 mb-4">No Vehicle Assigned</h1>
//           <p className="text-gray-600 mb-6">
//             You don't have a vehicle assigned yet. Please contact the administrator.
//           </p>
//           <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//             Go Home
//           </a>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>
//         <p className="text-gray-600">Welcome back, {user?.name}</p>
//       </div>

//       {/* Success/Error Messages */}
//       {success && (
//         <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
//           <FaCheckCircle className="mr-2" />
//           {success}
//         </div>
//       )}
      
//       {error && (
//         <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Vehicle Info Card */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-xl font-bold flex items-center">
//             <FaBus className="mr-2 text-blue-600" />
//             Your Vehicle
//           </h2>
//           <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//             status === 'active' ? 'bg-green-100 text-green-800' :
//             status === 'maintenance' ? 'bg-red-100 text-red-800' :
//             'bg-gray-100 text-gray-800'
//           }`}>
//             {statusOptions.find(s => s.value === status)?.icon} {status}
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <p className="text-sm text-gray-500">Plate Number</p>
//             <p className="text-lg font-bold">{vehicle.plateNumber}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Route</p>
//             <p className="text-lg">{vehicle.route?.name || 'Not assigned'}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Current Occupancy</p>
//             <p className="text-lg">
//               {occupancyOptions.find(o => o.value === occupancy)?.icon} {occupancy.replace('_', ' ')}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Last Location Update</p>
//             <p className="text-lg">
//               {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Location Update Section */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
//         <h2 className="text-xl font-bold mb-4 flex items-center">
//           <FaMapMarkerAlt className="mr-2 text-red-500" />
//           Update Your Location
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Latitude
//             </label>
//             <input
//               type="text"
//               className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
//               value={location.lat?.toFixed(6) || 'Not available'}
//               readOnly
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Longitude
//             </label>
//             <input
//               type="text"
//               className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
//               value={location.lng?.toFixed(6) || 'Not available'}
//               readOnly
//             />
//           </div>
//           <div className="flex items-end space-x-2">
//             <button
//               onClick={getCurrentLocation}
//               disabled={locationLoading}
//               className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-1"
//             >
//               {locationLoading ? 'Getting Location...' : 'Get Current Location'}
//             </button>
//             <button
//               onClick={sendLocationUpdate}
//               disabled={locationLoading || !location.lat}
//               className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//             >
//               Send
//             </button>
//           </div>
//         </div>

//         <p className="text-sm text-gray-500 mt-2">
//           <FaClock className="inline mr-1" />
//           Update your location every 30 seconds for accurate tracking
//         </p>
//       </div>

//       {/* Status & Occupancy Controls */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {/* Status Update */}
//         <div className="bg-white rounded-xl shadow-md p-6 border">
//           <h3 className="text-lg font-semibold mb-4">Update Vehicle Status</h3>
//           <div className="space-y-3">
//             {statusOptions.map((option) => (
//               <button
//                 key={option.value}
//                 onClick={() => updateVehicleStatus(option.value)}
//                 className={`w-full p-4 rounded-lg border-2 transition-all ${
//                   status === option.value
//                     ? `border-${option.color}-500 bg-${option.color}-50`
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 <span className="text-xl mr-2">{option.icon}</span>
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Occupancy Update */}
//         <div className="bg-white rounded-xl shadow-md p-6 border">
//           <h3 className="text-lg font-semibold mb-4">Update Occupancy</h3>
//           <div className="space-y-3">
//             {occupancyOptions.map((option) => (
//               <button
//                 key={option.value}
//                 onClick={() => updateVehicleOccupancy(option.value)}
//                 className={`w-full p-4 rounded-lg border-2 transition-all ${
//                   occupancy === option.value
//                     ? `border-${option.color}-500 bg-${option.color}-50`
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 <span className="text-xl mr-2">{option.icon}</span>
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
//         <div className="bg-blue-50 p-4 rounded-lg">
//           <FaBus className="text-blue-600 text-xl mb-2" />
//           <div className="text-2xl font-bold text-blue-800">{vehicle.plateNumber}</div>
//           <div className="text-sm text-blue-600">Your Vehicle</div>
//         </div>
//         <div className="bg-green-50 p-4 rounded-lg">
//           <FaMapMarkerAlt className="text-green-600 text-xl mb-2" />
//           <div className="text-2xl font-bold text-green-800">
//             {location.lat ? 'Active' : 'Unknown'}
//           </div>
//           <div className="text-sm text-green-600">Location Status</div>
//         </div>
//         <div className="bg-purple-50 p-4 rounded-lg">
//           <FaUsers className="text-purple-600 text-xl mb-2" />
//           <div className="text-2xl font-bold text-purple-800 capitalize">
//             {occupancy.replace('_', ' ')}
//           </div>
//           <div className="text-sm text-purple-600">Current Occupancy</div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default DriverDashboard