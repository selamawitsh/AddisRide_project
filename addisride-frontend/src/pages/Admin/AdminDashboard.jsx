import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FaUsers, FaBus, FaRoute, FaUserCheck, FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    totalRoutes: 0,
    activeBuses: 0,
    pendingDrivers: 0,
    verifiedDrivers: 0,
    admins: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      // Use the new admin stats endpoint we created
      const [statsRes, usersRes, vehiclesRes, routesRes, locationsRes] = await Promise.all([
        api.get('/vehicles/admin/stats').catch(() => ({ data: {} })), // New admin stats endpoint
        api.get('/auth/users').catch(() => ({ data: [] })), // Users list
        api.get('/vehicles').catch(() => ({ data: [] })), // All vehicles
        api.get('/routes').catch(() => ({ data: [] })), // All routes
        api.get('/locations/current').catch(() => ({ data: [] })) // Active vehicles with locations
      ])

      // Get user stats
      const users = usersRes.data || []
      const pendingDrivers = users.filter(u => u.role === 'driver' && !u.isVerified).length
      const verifiedDrivers = users.filter(u => u.role === 'driver' && u.isVerified).length
      const admins = users.filter(u => u.role === 'admin').length

      const allVehicles = vehiclesRes.data || []
      const activeVehicleCount = allVehicles.filter(v => v.status === 'active').length
      
      setStats({
        totalUsers: users.length || 0,
        totalBuses: allVehicles.length || 0,
        totalRoutes: routesRes.data.length || 0,
        activeBuses: activeVehicleCount,
        pendingDrivers: pendingDrivers,
        verifiedDrivers: verifiedDrivers,
        admins: admins,
      })

      // Create recent activity feed
      const activity = []
      
      // Add pending drivers to activity
      if (pendingDrivers > 0) {
        activity.push({
          type: 'pending',
          message: `${pendingDrivers} driver(s) pending verification`,
          icon: '👤',
          color: 'yellow'
        })
      }

      // Add active buses
      if (activeVehicleCount > 0) {
        activity.push({
          type: 'active',
          message: `${activeVehicleCount} bus(es) currently active`,
          icon: '🚌',
          color: 'green'
        })
      }

      setRecentActivity(activity)
      setError(null)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <FaUsers className="text-2xl text-blue-600" />,
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      description: 'Registered users',
      link: '/admin/users',
      details: `${stats.admins} admins, ${stats.verifiedDrivers} verified drivers`
    },
    {
      title: 'Total Buses',
      value: stats.totalBuses,
      icon: <FaBus className="text-2xl text-green-600" />,
      color: 'bg-green-50',
      textColor: 'text-green-700',
      description: 'All vehicles',
      link: '/admin/vehicles',
      details: `${stats.activeBuses} active`
    },
    {
      title: 'Active Buses',
      value: stats.activeBuses,
      icon: <FaBus className="text-2xl text-amber-600" />,
      color: 'bg-amber-50',
      textColor: 'text-amber-700',
      description: 'Currently tracking',
      link: '/live-map',
      details: 'On the road'
    },
    {
      title: 'Total Routes',
      value: stats.totalRoutes,
      icon: <FaRoute className="text-2xl text-purple-600" />,
      color: 'bg-purple-50',
      textColor: 'text-purple-700',
      description: 'Available routes',
      link: '/admin/routes',
      details: 'In system'
    },
  ]

  // Add pending drivers card if there are any
  if (stats.pendingDrivers > 0) {
    statCards.push({
      title: 'Pending Drivers',
      value: stats.pendingDrivers,
      icon: <FaUserCheck className="text-2xl text-orange-600" />,
      color: 'bg-orange-50',
      textColor: 'text-orange-700',
      description: 'Awaiting verification',
      link: '/admin/users',
      details: 'Need approval',
      urgent: true
    })
  }

  if (loading && Object.values(stats).every(v => v === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your AddisRide system</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error} - <button onClick={fetchStats} className="underline ml-1">Retry</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            to={card.link || '#'}
            className={`${card.color} p-6 rounded-xl shadow-sm border hover:shadow-lg transition-all ${card.urgent ? 'ring-2 ring-orange-400 animate-pulse' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-gray-600">
                  {card.title}
                </div>
                <div className={`text-3xl font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {card.description}
                </div>
                {card.details && (
                  <div className="text-xs text-gray-400 mt-1">
                    {card.details}
                  </div>
                )}
              </div>
              {card.icon}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/routes"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FaRoute className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Routes</div>
                <div className="text-sm text-gray-600">Add/edit bus routes</div>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/vehicles"
            className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FaBus className="text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Vehicles</div>
                <div className="text-sm text-gray-600">Add/edit buses</div>
              </div>
            </div>
          </Link>
          <Link
            to="/admin/users"
            className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FaUsers className="text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Manage Users</div>
                <div className="text-sm text-gray-600">
                  {stats.pendingDrivers > 0 ? (
                    <span className="text-orange-600 font-medium">
                      {stats.pendingDrivers} pending verification
                    </span>
                  ) : (
                    'View all users'
                  )}
                </div>
              </div>
            </div>
          </Link>
<Link
  to="/admin/assign-vehicle"
  className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
>
  <div className="flex items-center">
    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
      {/* <FaExchangeAlt className="text-orange-600" /> */}
    </div>
    <div>
      <div className="font-medium text-gray-800">Assign Vehicles</div>
      <div className="text-sm text-gray-600">Match drivers with buses</div>
    </div>
  </div>
</Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status - Takes 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">System Status</h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Operational
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaBus className="text-blue-600 mr-3" />
                <div>
                  <div className="font-medium">Active Bus Tracking</div>
                  <div className="text-sm text-gray-600">
                    {stats.activeBuses} of {stats.totalBuses} buses active
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {((stats.activeBuses / stats.totalBuses) * 100 || 0).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaRoute className="text-green-600 mr-3" />
                <div>
                  <div className="font-medium">Routes Available</div>
                  <div className="text-sm text-gray-600">
                    {stats.totalRoutes} routes in system
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FaUsers className="text-purple-600 mr-3" />
                <div>
                  <div className="font-medium">User Distribution</div>
                  <div className="text-sm text-gray-600">
                    {stats.admins} admins, {stats.verifiedDrivers} verified drivers, {stats.pendingDrivers} pending
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Recent Activity - Takes 1/3 width */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaChartLine className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className={`p-3 bg-${activity.color}-50 rounded-lg flex items-center`}>
                  <span className="text-2xl mr-3">{activity.icon}</span>
                  <span className="text-sm text-gray-700">{activity.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium text-gray-700 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-700">{stats.totalBuses}</div>
                <div className="text-xs text-blue-600">Total Buses</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-700">{stats.totalRoutes}</div>
                <div className="text-xs text-green-600">Total Routes</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-purple-700">{stats.totalUsers}</div>
                <div className="text-xs text-purple-600">Total Users</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-amber-700">{stats.activeBuses}</div>
                <div className="text-xs text-amber-600">Active Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard


// import { useEffect, useState } from 'react'
// import { useSelector } from 'react-redux'
// import { FaUsers, FaBus, FaRoute, FaMoneyBillWave, FaChartLine } from 'react-icons/fa'
// import api from '../../services/api'
// import Loader from '../../components/common/Loader'

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalBuses: 0,
//     totalRoutes: 0,
//     activeBuses: 0,
//     revenue: 0,
//   })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     fetchStats()
//     // Refresh stats every 30 seconds
//     const interval = setInterval(fetchStats, 30000)
//     return () => clearInterval(interval)
//   }, [])

//   const fetchStats = async () => {
//     try {
//       // Fetch all necessary data
//       const [usersRes, vehiclesRes, routesRes, locationsRes] = await Promise.all([
//         api.get('/auth/users').catch(() => ({ data: [] })), // Users list
//         api.get('/vehicles'), // All vehicles
//         api.get('/routes'), // All routes
//         api.get('/locations/current'), // Active vehicles with locations
//       ])

//       const activeBuses = locationsRes.data.length
//       const allVehicles = vehiclesRes.data || []
//       const activeVehicleCount = allVehicles.filter(v => v.status === 'active').length
      
//       setStats({
//         totalUsers: usersRes.data.length || 0,
//         totalBuses: allVehicles.length || 0,
//         totalRoutes: routesRes.data.length || 0,
//         activeBuses: activeVehicleCount,
//         revenue: 0, // Will implement in Phase 3
//       })
//       setError(null)
//     } catch (error) {
//       console.error('Error fetching stats:', error)
//       setError('Failed to load dashboard data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const statCards = [
//     {
//       title: 'Total Users',
//       value: stats.totalUsers,
//       icon: <FaUsers className="text-2xl text-blue-600" />,
//       color: 'bg-blue-50',
//       textColor: 'text-blue-700',
//       description: 'Registered users'
//     },
//     {
//       title: 'Total Buses',
//       value: stats.totalBuses,
//       icon: <FaBus className="text-2xl text-green-600" />,
//       color: 'bg-green-50',
//       textColor: 'text-green-700',
//       description: 'All vehicles'
//     },
//     {
//       title: 'Active Buses',
//       value: stats.activeBuses,
//       icon: <FaBus className="text-2xl text-amber-600" />,
//       color: 'bg-amber-50',
//       textColor: 'text-amber-700',
//       description: 'Currently tracking'
//     },
//     {
//       title: 'Total Routes',
//       value: stats.totalRoutes,
//       icon: <FaRoute className="text-2xl text-purple-600" />,
//       color: 'bg-purple-50',
//       textColor: 'text-purple-700',
//       description: 'Available routes'
//     },
//   ]

//   if (loading && Object.values(stats).every(v => v === 0)) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <Loader />
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
//         <p className="text-gray-600">Monitor and manage your AddisRide system</p>
//       </div>

//       {error && (
//         <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//           {error} - <button onClick={fetchStats} className="underline">Retry</button>
//         </div>
//       )}

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {statCards.map((card, index) => (
//           <div
//             key={index}
//             className={`${card.color} p-6 rounded-xl shadow-sm border`}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <div className="text-sm font-medium text-gray-600">
//                   {card.title}
//                 </div>
//                 <div className={`text-3xl font-bold mt-1 ${card.textColor}`}>
//                   {card.value}
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1">
//                   {card.description}
//                 </div>
//               </div>
//               {card.icon}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Actions */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <a
//             href="/admin/routes"
//             className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
//           >
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                 <FaRoute className="text-blue-600" />
//               </div>
//               <div>
//                 <div className="font-medium text-gray-800">Manage Routes</div>
//                 <div className="text-sm text-gray-600">Add/edit bus routes</div>
//               </div>
//             </div>
//           </a>
//           <a
//             href="/admin/vehicles"
//             className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
//           >
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
//                 <FaBus className="text-green-600" />
//               </div>
//               <div>
//                 <div className="font-medium text-gray-800">Manage Vehicles</div>
//                 <div className="text-sm text-gray-600">Add/edit buses</div>
//               </div>
//             </div>
//           </a>
//           <a
//             href="/admin"
//             onClick={(e) => {
//               e.preventDefault()
//               fetchStats()
//             }}
//             className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
//           >
//             <div className="flex items-center">
//               <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
//                 <FaChartLine className="text-purple-600" />
//               </div>
//               <div>
//                 <div className="font-medium text-gray-800">Refresh Data</div>
//                 <div className="text-sm text-gray-600">Update dashboard</div>
//               </div>
//             </div>
//           </a>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="bg-white rounded-xl shadow-md p-6 border">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold text-gray-800">System Status</h2>
//           <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
//             Operational
//           </span>
//         </div>
        
//         <div className="space-y-3">
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center">
//               <FaBus className="text-blue-600 mr-3" />
//               <div>
//                 <div className="font-medium">Active Bus Tracking</div>
//                 <div className="text-sm text-gray-600">
//                   {stats.activeBuses} of {stats.totalBuses} buses active
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-600">Live</div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center">
//               <FaRoute className="text-green-600 mr-3" />
//               <div>
//                 <div className="font-medium">Routes Available</div>
//                 <div className="text-sm text-gray-600">
//                   {stats.totalRoutes} routes in system
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-600">Configured</div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//             <div className="flex items-center">
//               <FaUsers className="text-purple-600 mr-3" />
//               <div>
//                 <div className="font-medium">User Management</div>
//                 <div className="text-sm text-gray-600">
//                   {stats.totalUsers} registered users
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <a 
//                 href="/auth/register" 
//                 className="text-blue-600 hover:text-blue-800 text-sm"
//               >
//                 Add User
//               </a>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-4 pt-4 border-t border-gray-200">
//           <div className="text-sm text-gray-600">
//             Last updated: {new Date().toLocaleTimeString()}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard