// import { useState, useEffect } from 'react'
// import { FaUserCheck, FaTrash, FaShieldAlt, FaUser } from 'react-icons/fa'
// import { useSelector } from 'react-redux'
// import api from '../../services/api'
// import Loader from '../../components/common/Loader'

// const ManageUsers = () => {
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [stats, setStats] = useState({ total: 0, admins: 0, drivers: 0, verified: 0, pending: 0 })
  
//   const { user: currentUser } = useSelector((state) => state.auth)

//   useEffect(() => {
//     fetchUsers()
//     fetchUserStats()
//   }, [])

//   const fetchUsers = async () => {
//     try {
//       const response = await api.get('/auth/users')
//       setUsers(response.data)
//     } catch (error) {
//       setError('Failed to load users')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchUserStats = async () => {
//     try {
//       const response = await api.get('/auth/count')
//       setStats(response.data)
//     } catch (error) {
//       console.error('Error fetching stats:', error)
//     }
//   }

//   // THIS IS WHERE ADMIN VERIFIES DRIVERS
//   const handleVerifyDriver = async (userId) => {
//     try {
//       await api.put(`/auth/${userId}/verify`)
//       setSuccess('Driver verified successfully!')
//       await fetchUsers()
//       await fetchUserStats()
//       setTimeout(() => setSuccess(''), 3000)
//     } catch (error) {
//       setError('Failed to verify driver')
//     }
//   }

//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) return
//     try {
//       await api.delete(`/auth/${userId}`)
//       setSuccess('User deleted successfully!')
//       await fetchUsers()
//       await fetchUserStats()
//       setTimeout(() => setSuccess(''), 3000)
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to delete user')
//     }
//   }

//   if (loading) return <Loader />

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-5 gap-4 mb-8">
//         <div className="bg-white p-4 rounded-lg shadow"><div className="text-2xl font-bold">{stats.total}</div><div>Total</div></div>
//         <div className="bg-purple-50 p-4 rounded-lg"><div className="text-2xl font-bold text-purple-800">{stats.admins}</div><div>Admins</div></div>
//         <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold text-blue-800">{stats.drivers}</div><div>Drivers</div></div>
//         <div className="bg-green-50 p-4 rounded-lg"><div className="text-2xl font-bold text-green-800">{stats.verified}</div><div>Verified</div></div>
//         <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold text-yellow-800">{stats.pending}</div><div>Pending</div></div>
//       </div>

//       {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}
//       {success && <div className="mb-4 bg-green-50 text-green-700 p-3 rounded">{success}</div>}

//       {/* Users Table */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left">User</th>
//               <th className="px-6 py-3 text-left">Phone</th>
//               <th className="px-6 py-3 text-left">Role</th>
//               <th className="px-6 py-3 text-left">Status</th>
//               <th className="px-6 py-3 text-left">Vehicle</th>
//               <th className="px-6 py-3 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map(user => (
//               <tr key={user._id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4">
//                   <div className="flex items-center">
//                     <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
//                       {user.role === 'admin' ? <FaShieldAlt className="text-purple-600" /> : <FaUser className="text-blue-600" />}
//                     </div>
//                     <div className="font-medium">{user.name}</div>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">{user.phoneNumber}</td>
//                 <td className="px-6 py-4">
//                   <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
//                     {user.role}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   {user.role === 'driver' && (
//                     <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                       {user.isVerified ? 'Verified' : 'Pending'}
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-6 py-4">{user.assignedVehicle?.plateNumber || 'Not assigned'}</td>
//                 <td className="px-6 py-4">
//                   <div className="flex space-x-2">
//                     {/* VERIFY BUTTON - Only shows for unverified drivers */}
//                     {user.role === 'driver' && !user.isVerified && (
//                       <button onClick={() => handleVerifyDriver(user._id)}
//                         className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded" title="Verify Driver">
//                         <FaUserCheck />
//                       </button>
//                     )}
//                     {/* DELETE BUTTON - Never for current admin */}
//                     {user._id !== currentUser?._id && (
//                       <button onClick={() => handleDeleteUser(user._id)}
//                         className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded" title="Delete User">
//                         <FaTrash />
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }

// export default ManageUsers


import { useState, useEffect } from 'react'
import { FaUser, FaUserCheck, FaUserTimes, FaTrash, FaShieldAlt, FaUserTie } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import { useSelector } from 'react-redux'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    drivers: 0,
    verified: 0,
    pending: 0
  })
  
  const { user: currentUser } = useSelector((state) => state.auth)

  useEffect(() => {
    fetchUsers()
    fetchUserStats()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users')
      setUsers(response.data)
      setError('')
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/auth/count')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleVerifyDriver = async (userId) => {
    try {
      await api.put(`/auth/${userId}/verify`)
      await fetchUsers()
      await fetchUserStats()
    } catch (error) {
      console.error('Error verifying driver:', error)
      setError('Failed to verify driver')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    
    try {
      await api.delete(`/auth/${userId}`)
      await fetchUsers()
      await fetchUserStats()
    } catch (error) {
      console.error('Error deleting user:', error)
      setError(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const getRoleBadge = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800'
  }

  const getVerificationBadge = (isVerified, role) => {
    if (role === 'admin') return null
    return isVerified
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

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
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-gray-600">View and manage system users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
          <div className="text-2xl font-bold text-purple-800">{stats.admins}</div>
          <div className="text-sm text-purple-600">Admins</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
          <div className="text-2xl font-bold text-blue-800">{stats.drivers}</div>
          <div className="text-sm text-blue-600">Drivers</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
          <div className="text-2xl font-bold text-green-800">{stats.verified}</div>
          <div className="text-sm text-green-600">Verified</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-100">
          <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            All Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.role === 'admin' ? (
                          <FaShieldAlt className="text-purple-600" />
                        ) : (
                          <FaUser className="text-blue-600" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'driver' ? (
                      <span className={`px-2 py-1 text-xs rounded-full ${getVerificationBadge(user.isVerified, user.role)}`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.assignedVehicle?.plateNumber || 'Not assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {user.role === 'driver' && !user.isVerified && (
                        <button
                          onClick={() => handleVerifyDriver(user._id)}
                          className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded"
                          title="Verify Driver"
                        >
                          <FaUserCheck />
                        </button>
                      )}
                      {user._id !== currentUser?._id && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageUsers