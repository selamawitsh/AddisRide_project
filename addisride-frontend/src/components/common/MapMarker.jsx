import { useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { OCCUPANCY_COLORS, OCCUPANCY_LABELS } from '../../utils/constants'
import { getTimeAgo } from '../../utils/helpers'
import { FaBus, FaUsers } from 'react-icons/fa'

// Custom bus icon
const createBusIcon = (occupancy) => {
  const color = OCCUPANCY_COLORS[occupancy] || '#6B7280'
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      ">
        <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10v-5H3V5h9v3h1.05a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-3a1 1 0 00-1-1h-2.05a2.5 2.5 0 00-4.9 0H3z"/>
        </svg>
      </div>
    `,
    className: 'bus-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

const BusMarker = ({ bus }) => {
  const { coordinates, plateNumber, occupancy, routeName, lastUpdated } = bus

  return (
    <Marker
      position={[coordinates.lat, coordinates.lng]}
      icon={createBusIcon(occupancy)}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaBus className="text-blue-600" />
              <h3 className="font-bold text-lg">{plateNumber}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium text-white`}
                  style={{ backgroundColor: OCCUPANCY_COLORS[occupancy] }}>
              {OCCUPANCY_LABELS[occupancy]}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <FaUsers className="mr-2 text-gray-500" />
              <span className="font-medium">Route:</span>
              <span className="ml-1 text-gray-700">{routeName}</span>
            </div>
            
            <div className="text-xs text-gray-500">
              Updated {getTimeAgo(lastUpdated)}
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Location:</span>
              <div className="text-gray-600">
                Lat: {coordinates.lat.toFixed(6)}
                <br />
                Lng: {coordinates.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default BusMarker