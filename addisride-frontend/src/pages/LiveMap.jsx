import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRoutes } from '../store/slices/routeSlice'
import BusMap from '../components/map/BusMap'
import BusList from '../components/buses/BusList'
import Loader from '../components/common/Loader'
import { FaMap, FaInfoCircle } from 'react-icons/fa'

const LiveMap = () => {
  const dispatch = useDispatch()
  const { liveLocations, loading } = useSelector((state) => state.buses)
  const { routes } = useSelector((state) => state.routes)

  useEffect(() => {
    dispatch(fetchRoutes())
  }, [dispatch])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaMap className="mr-3 text-blue-600" />
            Live Bus Tracking Map
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time tracking of all active minibuses in Addis Ababa
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
          <FaInfoCircle />
          <span className="font-medium">
            {liveLocations.length} buses active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section - Takes 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <BusMap />
          
          {/* Route Information */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Available Routes ({routes.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {routes.map((route) => (
                <div
                  key={route._id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{route.name}</div>
                  <div className="text-sm text-gray-600">
                    {route.stops?.length || 0} stops
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bus List Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md h-full">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Active Buses
              </h2>
              <p className="text-sm text-gray-600">
                Click on a bus for details
              </p>
            </div>
            
            <div className="overflow-y-auto max-h-[500px]">
              {loading ? (
                <Loader />
              ) : liveLocations.length > 0 ? (
                <BusList buses={liveLocations} showDetails />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-lg mb-2">No active buses found</div>
                  <div className="text-sm">
                    Make sure your simulation script is running
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiveMap