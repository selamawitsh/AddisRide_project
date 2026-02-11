import { FaSync, FaPause, FaPlay, FaClock } from 'react-icons/fa'
import { getTimeAgo } from '../../utils/helpers'

const MapControls = ({
  autoRefresh,
  setAutoRefresh,
  refreshInterval,
  setRefreshInterval,
  lastUpdated,
  busCount,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Live Buses: {busCount}</div>
          {lastUpdated && (
            <div className="text-sm text-gray-500 flex items-center">
              <FaClock className="mr-1" />
              {getTimeAgo(lastUpdated)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded flex items-center space-x-1 ${
                autoRefresh
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? <FaPause /> : <FaPlay />}
              <span>{autoRefresh ? 'Pause' : 'Resume'}</span>
            </button>

            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
              disabled={!autoRefresh}
            >
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
            </select>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded flex items-center justify-center space-x-1 hover:bg-blue-200"
          >
            <FaSync />
            <span>Refresh Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MapControls