import BusCard from './BusCard'
import { OCCUPANCY_LABELS } from '../../utils/constants'

const BusList = ({ buses, showDetails = false }) => {
  if (buses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No buses available
      </div>
    )
  }

  // Group buses by occupancy status
  const groupedBuses = {
    seats_available: buses.filter(bus => bus.occupancy === 'seats_available'),
    standing: buses.filter(bus => bus.occupancy === 'standing'),
    full: buses.filter(bus => bus.occupancy === 'full'),
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedBuses).map(([status, statusBuses]) => {
        if (statusBuses.length === 0) return null
        
        return (
          <div key={status}>
            {showDetails && (
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="font-medium text-gray-700">
                  {OCCUPANCY_LABELS[status]}
                </div>
                <div className="text-sm text-gray-500">
                  {statusBuses.length} buses
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {statusBuses.map((bus) => (
                <BusCard
                  key={bus.vehicleId}
                  bus={bus}
                  showDetails={showDetails}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default BusList