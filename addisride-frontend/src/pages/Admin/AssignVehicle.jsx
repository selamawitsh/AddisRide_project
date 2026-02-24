import { useState, useEffect } from 'react'
import { FaBus, FaUser, FaCheckCircle, FaExclamationTriangle, FaSearch, FaExchangeAlt } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const AssignVehicle = () => {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [driverSearch, setDriverSearch] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vehiclesRes, usersRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/auth/users')
      ])

      // Get all vehicles (both assigned and unassigned)
      setVehicles(vehiclesRes.data || [])

      // Get only verified drivers
      const allDrivers = usersRes.data.filter(u => 
        u.role === 'driver' && u.isVerified
      )
      setDrivers(allDrivers)

      setError('')
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) {
      setError('Please select both a vehicle and a driver')
      return
    }

    // Check if driver already has a vehicle
    if (selectedDriver.assignedVehicle) {
      setError('This driver already has a vehicle assigned. Please unassign first.')
      return
    }

    // Check if vehicle is already assigned
    const vehicleWithDriver = drivers.find(d => 
      d.assignedVehicle?._id === selectedVehicle._id || d.assignedVehicle === selectedVehicle._id
    )
    if (vehicleWithDriver) {
      setError('This vehicle is already assigned to another driver')
      return
    }

    try {
      setAssigning(true)
      setError('')
      
      await api.put(`/vehicles/${selectedVehicle._id}/assign`, {
        driverId: selectedDriver._id
      })

      setSuccess(`Successfully assigned ${selectedVehicle.plateNumber} to ${selectedDriver.name}`)
      
      // Refresh data
      await fetchData()
      
      // Clear selection
      setSelectedVehicle(null)
      setSelectedDriver(null)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('Error assigning vehicle:', error)
      setError(error.response?.data?.message || 'Failed to assign vehicle')
    } finally {
      setAssigning(false)
    }
  }

  const handleUnassign = async (vehicle, driver) => {
    if (!window.confirm(`Are you sure you want to unassign ${vehicle.plateNumber} from ${driver.name}?`)) {
      return
    }

    try {
      setAssigning(true)
      
      // You need to create this endpoint or use a different approach
      await api.put(`/vehicles/${vehicle._id}/unassign`, {
        driverId: driver._id
      })

      setSuccess(`Successfully unassigned ${vehicle.plateNumber}`)
      await fetchData()
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('Error unassigning vehicle:', error)
      setError(error.response?.data?.message || 'Failed to unassign vehicle')
    } finally {
      setAssigning(false)
    }
  }

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.route?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter drivers based on search
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.phoneNumber.includes(driverSearch)
  )

  // Get assigned vehicles with their drivers
  const assignedPairs = drivers
    .filter(driver => driver.assignedVehicle)
    .map(driver => ({
      driver,
      vehicle: vehicles.find(v => 
        v._id === driver.assignedVehicle?._id || v._id === driver.assignedVehicle
      )
    }))
    .filter(pair => pair.vehicle) // Only include if vehicle exists

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Assign Vehicles to Drivers</h1>
        <p className="text-gray-600">Manage which vehicle each driver operates</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <FaCheckCircle className="mr-2" />
          {success}
        </div>
      )}

      {/* Current Assignments */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Assignments</h2>
        
        {assignedPairs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaBus className="text-4xl mx-auto mb-3 text-gray-300" />
            <p>No vehicles assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedPairs.map(({ driver, vehicle }) => (
              <div key={driver._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <FaBus className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold">{vehicle.plateNumber}</div>
                      <div className="text-sm text-gray-600">{vehicle.route?.name || 'No route'}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnassign(vehicle, driver)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    disabled={assigning}
                  >
                    Unassign
                  </button>
                </div>
                <div className="flex items-center mt-2 pt-2 border-t">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <FaUser className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <div className="font-medium">{driver.name}</div>
                    <div className="text-xs text-gray-500">{driver.phoneNumber}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Form */}
      <div className="bg-white rounded-xl shadow-md p-6 border">
        <h2 className="text-xl font-bold text-gray-800 mb-6">New Assignment</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Vehicles List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Vehicle</h3>
              <span className="text-sm text-gray-500">
                {filteredVehicles.length} available
              </span>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by plate or route..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Vehicle List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vehicles found
                </div>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const isAssigned = drivers.some(d => 
                    d.assignedVehicle?._id === vehicle._id || d.assignedVehicle === vehicle._id
                  )
                  
                  return (
                    <div
                      key={vehicle._id}
                      onClick={() => !isAssigned && setSelectedVehicle(vehicle)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedVehicle?._id === vehicle._id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : isAssigned
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaBus className={`mr-3 ${selectedVehicle?._id === vehicle._id ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <div className="font-medium">{vehicle.plateNumber}</div>
                            <div className="text-sm text-gray-600">{vehicle.route?.name || 'No route'}</div>
                          </div>
                        </div>
                        {isAssigned && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Drivers List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Driver</h3>
              <span className="text-sm text-gray-500">
                {filteredDrivers.length} available
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
              />
            </div>

            {/* Driver List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No verified drivers found
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const hasVehicle = driver.assignedVehicle
                  
                  return (
                    <div
                      key={driver._id}
                      onClick={() => !hasVehicle && setSelectedDriver(driver)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedDriver?._id === driver._id
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : hasVehicle
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <FaUser className={`mr-3 ${selectedDriver?._id === driver._id ? 'text-green-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-600">{driver.phoneNumber}</div>
                        </div>
                        {hasVehicle && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Has Vehicle
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Assignment Button */}
        <div className="mt-8 pt-6 border-t flex justify-end">
          <button
            onClick={handleAssign}
            disabled={!selectedVehicle || !selectedDriver || assigning}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Assigning...
              </>
            ) : (
              <>
                <FaExchangeAlt className="mr-2" />
                Assign Vehicle to Driver
              </>
            )}
          </button>
        </div>

        {/* Selected Items Summary */}
        {(selectedVehicle || selectedDriver) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Selected:</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {selectedVehicle && (
                  <div className="flex items-center">
                    <FaBus className="text-blue-600 mr-2" />
                    <span>{selectedVehicle.plateNumber}</span>
                  </div>
                )}
                {selectedVehicle && selectedDriver && (
                  <span className="text-gray-400">→</span>
                )}
                {selectedDriver && (
                  <div className="flex items-center">
                    <FaUser className="text-green-600 mr-2" />
                    <span>{selectedDriver.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssignVehicle