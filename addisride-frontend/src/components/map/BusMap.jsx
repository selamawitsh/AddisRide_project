import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLiveLocations } from '../../store/slices/busSlice'
import { MAP_CENTER, MAP_ZOOM } from '../../utils/constants'
import BusMarker from '../common/MapMarker'
import Loader from '../common/Loader'
import MapControls from './MapControls'

// Component to auto-update map bounds
const MapUpdater = ({ bounds }) => {
  const map = useMap()
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds)
    }
  }, [bounds, map])
  
  return null
}

const BusMap = () => {
  const dispatch = useDispatch()
  const { liveLocations, loading, error, lastUpdated } = useSelector((state) => state.buses)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(10000) // 10 seconds

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchLiveLocations())
  }, [dispatch])

  // Set up auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      dispatch(fetchLiveLocations())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, dispatch])

  // Calculate bounds for all buses
  const getBounds = () => {
    if (liveLocations.length === 0) return null
    return liveLocations.map(bus => [bus.coordinates.lat, bus.coordinates.lng])
  }

  if (loading && liveLocations.length === 0) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Error loading map</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => dispatch(fetchLiveLocations())}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {liveLocations.map((bus) => (
          <BusMarker key={bus.vehicleId} bus={bus} />
        ))}
        
        {liveLocations.length > 0 && (
          <MapUpdater bounds={getBounds()} />
        )}
      </MapContainer>

      {/* Controls overlay */}
      <MapControls
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        lastUpdated={lastUpdated}
        busCount={liveLocations.length}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
        <div className="text-sm font-medium mb-2">Bus Occupancy</div>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs">Seats Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
            <span className="text-xs">Standing Room</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-xs">Full</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusMap