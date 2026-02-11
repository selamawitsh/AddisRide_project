import { FaBus, FaUsers, FaRoute, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { OCCUPANCY_COLORS, OCCUPANCY_LABELS } from '../../utils/constants'
import { getTimeAgo } from '../../utils/helpers'

const BusCard = ({ bus, showDetails = false }) => {
  const {
    plateNumber,
    occupancy,
    routeName,
    coordinates,
    lastUpdated,
  } = bus

  const occupancyColor = OCCUPANCY_COLORS[occupancy]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: occupancyColor }}
          >
            <FaBus />
          </div>
          <div>
            <div className="font-bold text-lg">{plateNumber}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <FaRoute className="mr-1" />
              {routeName}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div
            className="px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: occupancyColor }}
          >
            {OCCUPANCY_LABELS[occupancy]}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center">
            <FaClock className="mr-1" />
            {getTimeAgo(lastUpdated)}
          </div>
        </div>
      </div>

      {showDetails && coordinates && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <FaMapMarkerAlt className="mr-2" />
            <span className="font-medium">Location: </span>
            <span className="ml-1">
              {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusCard