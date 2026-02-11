import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRoutes, setSelectedRoute } from '../store/slices/routeSlice'
import { fetchBuses } from '../store/slices/busSlice'
import { FaRoute, FaBus, FaMapMarkerAlt, FaSearch } from 'react-icons/fa'
import Loader from '../components/common/Loader'

const RoutesPage = () => {
  const dispatch = useDispatch()
  const { routes, loading, selectedRoute } = useSelector((state) => state.routes)
  const { buses } = useSelector((state) => state.buses)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(fetchRoutes())
    dispatch(fetchBuses())
  }, [dispatch])

  // Filter routes by search term
  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get buses for selected route
  const getBusesForRoute = (routeId) => {
    return buses.filter(bus => bus.route?._id === routeId || bus.route === routeId)
  }

  const handleRouteClick = (routeId) => {
    dispatch(setSelectedRoute(routeId))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-2">
          <FaRoute className="mr-3 text-blue-600" />
          Available Bus Routes
        </h1>
        <p className="text-gray-600">
          Explore all minibus routes in Addis Ababa with real-time information
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes (e.g., 'Bole', 'Merkato', '42')"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Routes List */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  All Routes ({filteredRoutes.length})
                </h2>
                <span className="text-sm text-gray-500">
                  Click on a route for details
                </span>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredRoutes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No routes found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredRoutes.map((route) => {
                    const routeBuses = getBusesForRoute(route._id)
                    return (
                      <div
                        key={route._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedRoute === route._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleRouteClick(route._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">
                              {route.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FaMapMarkerAlt className="mr-2" />
                              <span>
                                {route.stops?.[0]?.name || 'Start'} →{' '}
                                {route.stops?.[route.stops?.length - 1]?.name || 'End'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                              <FaBus className="mr-1" />
                              <span>{route.stops?.length || 0} stops</span>
                            </div>
                            {routeBuses.length > 0 && (
                              <div className="text-xs mt-1 text-green-600">
                                {routeBuses.length} bus(es)
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Show vehicles if selected */}
                        {selectedRoute === route._id && routeBuses.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Buses on this route:
                            </div>
                            <div className="space-y-2">
                              {routeBuses.map((bus) => (
                                <div
                                  key={bus._id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <span className="font-medium">
                                    {bus.plateNumber}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    bus.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : bus.status === 'maintenance'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {bus.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Route Details
              </h2>
              
              {selectedRoute ? (
                (() => {
                  const route = routes.find(r => r._id === selectedRoute)
                  if (!route) return null
                  
                  const routeBuses = getBusesForRoute(route._id)
                  
                  return (
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {route.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Full route with {route.stops?.length || 0} stops
                        </p>
                      </div>
                      
                      {/* Stops List */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-3">
                          Stops along the route:
                        </h4>
                        <div className="space-y-2">
                          {route.stops && route.stops.length > 0 ? (
                            route.stops.map((stop, index) => (
                              <div
                                key={index}
                                className="flex items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-medium">{stop.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {stop.lat?.toFixed(4)}, {stop.lng?.toFixed(4)}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-center py-4">
                              No stops defined for this route
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-sm text-blue-600">Total Stops</div>
                          <div className="text-xl font-bold">
                            {route.stops?.length || 0}
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-sm text-green-600">Assigned Buses</div>
                          <div className="text-xl font-bold">
                            {routeBuses.length}
                          </div>
                        </div>
                      </div>
                      
                      {/* Buses List */}
                      {routeBuses.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">
                            Buses on this route:
                          </h4>
                          <div className="space-y-2">
                            {routeBuses.map((bus) => (
                              <div
                                key={bus._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">{bus.plateNumber}</div>
                                  <div className="text-xs text-gray-500">
                                    {bus.occupancy}
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  bus.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : bus.status === 'maintenance'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {bus.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaRoute className="text-4xl mx-auto mb-4 text-gray-300" />
                  <p>Select a route to see details</p>
                  <p className="text-sm mt-2">
                    Click on any route from the list
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutesPage