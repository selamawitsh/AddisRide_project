import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBus, FaExclamationTriangle } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    plateNumber: '',
    route: '',
    status: 'inactive',
    occupancy: 'seats_available'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [vehiclesRes, routesRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/routes')
      ])
      setVehicles(vehiclesRes.data || [])
      setRoutes(routesRes.data || [])
      setError('')
      setDeleteError('')
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      const vehicleData = {
        plateNumber: formData.plateNumber.toUpperCase().trim(),
        route: formData.route,
        status: formData.status,
        occupancy: formData.occupancy
      }

      if (editingId) {
        await api.put(`/vehicles/${editingId}`, vehicleData)
      } else {
        await api.post('/vehicles', vehicleData)
      }
      
      await fetchData()
      resetForm()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      setError(error.response?.data?.message || 'Error saving vehicle')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (vehicle) => {
    setEditingId(vehicle._id)
    setFormData({
      plateNumber: vehicle.plateNumber,
      route: vehicle.route?._id || vehicle.route || '',
      status: vehicle.status || 'inactive',
      occupancy: vehicle.occupancy || 'seats_available'
    })
    setShowForm(true)
    setError('')
    setDeleteError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) return
    
    try {
      setDeleteError('')
      await api.delete(`/vehicles/${id}`)
      await fetchData()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      setDeleteError(error.response?.data?.message || 'Failed to delete vehicle')
    }
  }

  const resetForm = () => {
    setFormData({
      plateNumber: '',
      route: '',
      status: 'inactive',
      occupancy: 'seats_available'
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
    setDeleteError('')
  }

  const statusOptions = [
    { value: 'active', label: '🟢 Active', color: 'text-green-600' },
    { value: 'inactive', label: '⚫ Inactive', color: 'text-gray-600' },
    { value: 'maintenance', label: '🔴 Maintenance', color: 'text-red-600' }
  ]

  const occupancyOptions = [
    { value: 'seats_available', label: '🟢 Seats Available', color: 'text-green-600' },
    { value: 'standing', label: '🟡 Standing Room', color: 'text-amber-600' },
    { value: 'full', label: '🔴 Full', color: 'text-red-600' }
  ]

  // Generate sample plate numbers
  const samplePlates = ['AA1234', 'AA5678', 'AA9012', 'AB3456', 'AB7890']

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Vehicles</h1>
          <p className="text-gray-600">Add, edit, or delete buses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Add New Vehicle
        </button>
      </div>

      {deleteError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {deleteError}
        </div>
      )}

      {/* Vehicle Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <FaTimes />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plate Number *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                placeholder="e.g., AA1234"
                required
                disabled={submitting}
              />
              <div className="mt-2">
                <span className="text-xs text-gray-500">Quick fill: </span>
                {samplePlates.map((plate, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, plateNumber: plate })}
                    className="text-xs px-2 py-1 mr-1 bg-gray-100 hover:bg-gray-200 rounded"
                    disabled={submitting}
                  >
                    {plate}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route *
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                required
                disabled={submitting}
              >
                <option value="">Select a route</option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.name}
                  </option>
                ))}
              </select>
              {routes.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No routes available. Please create a route first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.status === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={formData.status === option.value}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="mr-3"
                        disabled={submitting}
                      />
                      <span className={option.color}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupancy
                </label>
                <div className="space-y-2">
                  {occupancyOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                        formData.occupancy === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="occupancy"
                        value={option.value}
                        checked={formData.occupancy === option.value}
                        onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                        className="mr-3"
                        disabled={submitting}
                      />
                      <span className={option.color}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={submitting || routes.length === 0}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {editingId ? 'Update Vehicle' : 'Save Vehicle'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              All Vehicles ({vehicles.length})
            </h2>
            <div className="text-sm text-gray-500">
              {vehicles.filter(v => v.status === 'active').length} active
            </div>
          </div>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="p-8 text-center">
            <FaBus className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No vehicles yet</h3>
            <p className="text-gray-500 mb-4">Add your first bus to start tracking</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Vehicle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plate Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {vehicle.plateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {vehicle.route?.name || 'No route assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'maintenance'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.occupancy === 'seats_available'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.occupancy === 'standing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.occupancy.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManageVehicles


// import { useState, useEffect } from 'react'
// import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBus } from 'react-icons/fa'
// import api from '../../services/api'
// import Loader from '../../components/common/Loader'

// const ManageVehicles = () => {
//   const [vehicles, setVehicles] = useState([])
//   const [routes, setRoutes] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [showForm, setShowForm] = useState(false)
//   const [editingId, setEditingId] = useState(null)
//   const [formData, setFormData] = useState({
//     plateNumber: '',
//     route: '',
//     status: 'inactive',
//     occupancy: 'seats_available'
//   })
//   const [submitting, setSubmitting] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       const [vehiclesRes, routesRes] = await Promise.all([
//         api.get('/vehicles'),
//         api.get('/routes')
//       ])
//       setVehicles(vehiclesRes.data || [])
//       setRoutes(routesRes.data || [])
//       setError('')
//     } catch (error) {
//       console.error('Error fetching data:', error)
//       setError('Failed to load data')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSubmitting(true)
//     setError('')
    
//     try {
//       const vehicleData = {
//         plateNumber: formData.plateNumber.toUpperCase().trim(),
//         route: formData.route,
//         status: formData.status,
//         occupancy: formData.occupancy
//       }

//       if (editingId) {
//         await api.put(`/vehicles/${editingId}`, vehicleData)
//       } else {
//         await api.post('/vehicles', vehicleData)
//       }
      
//       await fetchData()
//       resetForm()
//     } catch (error) {
//       console.error('Error saving vehicle:', error)
//       setError(error.response?.data?.message || 'Error saving vehicle')
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleEdit = (vehicle) => {
//     setEditingId(vehicle._id)
//     setFormData({
//       plateNumber: vehicle.plateNumber,
//       route: vehicle.route?._id || vehicle.route || '',
//       status: vehicle.status || 'inactive',
//       occupancy: vehicle.occupancy || 'seats_available'
//     })
//     setShowForm(true)
//     setError('')
//   }

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this vehicle?')) return
    
//     try {
//       await api.delete(`/vehicles/${id}`)
//       await fetchData()
//     } catch (error) {
//       console.error('Error deleting vehicle:', error)
//       setError('Failed to delete vehicle')
//     }
//   }

//   const resetForm = () => {
//     setFormData({
//       plateNumber: '',
//       route: '',
//       status: 'inactive',
//       occupancy: 'seats_available'
//     })
//     setEditingId(null)
//     setShowForm(false)
//     setError('')
//   }

//   const statusOptions = [
//     { value: 'active', label: '🟢 Active', color: 'text-green-600' },
//     { value: 'inactive', label: '⚫ Inactive', color: 'text-gray-600' },
//     { value: 'maintenance', label: '🔴 Maintenance', color: 'text-red-600' }
//   ]

//   const occupancyOptions = [
//     { value: 'seats_available', label: '🟢 Seats Available', color: 'text-green-600' },
//     { value: 'standing', label: '🟡 Standing Room', color: 'text-amber-600' },
//     { value: 'full', label: '🔴 Full', color: 'text-red-600' }
//   ]

//   // Generate sample plate numbers
//   const samplePlates = ['AA1234', 'AA5678', 'AA9012', 'AB3456', 'AB7890']

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <Loader />
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Manage Vehicles</h1>
//           <p className="text-gray-600">Add, edit, or delete buses</p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <FaPlus className="mr-2" />
//           Add New Vehicle
//         </button>
//       </div>

//       {error && !showForm && (
//         <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//           {error}
//         </div>
//       )}

//       {/* Vehicle Form */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">
//               {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
//             </h2>
//             <button
//               onClick={resetForm}
//               className="text-gray-500 hover:text-gray-700 p-1"
//             >
//               <FaTimes />
//             </button>
//           </div>

//           {error && (
//             <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Plate Number *
//               </label>
//               <input
//                 type="text"
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
//                 value={formData.plateNumber}
//                 onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
//                 placeholder="e.g., AA1234"
//                 required
//                 disabled={submitting}
//               />
//               <div className="mt-2">
//                 <span className="text-xs text-gray-500">Quick fill: </span>
//                 {samplePlates.map((plate, idx) => (
//                   <button
//                     key={idx}
//                     type="button"
//                     onClick={() => setFormData({ ...formData, plateNumber: plate })}
//                     className="text-xs px-2 py-1 mr-1 bg-gray-100 hover:bg-gray-200 rounded"
//                     disabled={submitting}
//                   >
//                     {plate}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Route *
//               </label>
//               <select
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={formData.route}
//                 onChange={(e) => setFormData({ ...formData, route: e.target.value })}
//                 required
//                 disabled={submitting}
//               >
//                 <option value="">Select a route</option>
//                 {routes.map((route) => (
//                   <option key={route._id} value={route._id}>
//                     {route.name}
//                   </option>
//                 ))}
//               </select>
//               {routes.length === 0 && (
//                 <p className="text-sm text-red-600 mt-1">
//                   No routes available. Please create a route first.
//                 </p>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Status
//                 </label>
//                 <div className="space-y-2">
//                   {statusOptions.map((option) => (
//                     <label
//                       key={option.value}
//                       className={`flex items-center p-3 border rounded-lg cursor-pointer ${
//                         formData.status === option.value
//                           ? 'border-blue-500 bg-blue-50'
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="status"
//                         value={option.value}
//                         checked={formData.status === option.value}
//                         onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                         className="mr-3"
//                         disabled={submitting}
//                       />
//                       <span className={option.color}>{option.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Occupancy
//                 </label>
//                 <div className="space-y-2">
//                   {occupancyOptions.map((option) => (
//                     <label
//                       key={option.value}
//                       className={`flex items-center p-3 border rounded-lg cursor-pointer ${
//                         formData.occupancy === option.value
//                           ? 'border-blue-500 bg-blue-50'
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         name="occupancy"
//                         value={option.value}
//                         checked={formData.occupancy === option.value}
//                         onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
//                         className="mr-3"
//                         disabled={submitting}
//                       />
//                       <span className={option.color}>{option.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 disabled={submitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                 disabled={submitting || routes.length === 0}
//               >
//                 {submitting ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <FaSave className="mr-2" />
//                     {editingId ? 'Update Vehicle' : 'Save Vehicle'}
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* Vehicles Table */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden border">
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-semibold text-gray-800">
//               All Vehicles ({vehicles.length})
//             </h2>
//             <div className="text-sm text-gray-500">
//               {vehicles.filter(v => v.status === 'active').length} active
//             </div>
//           </div>
//         </div>
        
//         {vehicles.length === 0 ? (
//           <div className="p-8 text-center">
//             <FaBus className="text-4xl text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-700 mb-2">No vehicles yet</h3>
//             <p className="text-gray-500 mb-4">Add your first bus to start tracking</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add First Vehicle
//             </button>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Plate Number
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Route
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Occupancy
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {vehicles.map((vehicle) => (
//                   <tr key={vehicle._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div className="font-bold text-gray-900">
//                         {vehicle.plateNumber}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">
//                         {vehicle.route?.name || 'No route assigned'}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         vehicle.status === 'active'
//                           ? 'bg-green-100 text-green-800'
//                           : vehicle.status === 'maintenance'
//                           ? 'bg-red-100 text-red-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {vehicle.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         vehicle.occupancy === 'seats_available'
//                           ? 'bg-green-100 text-green-800'
//                           : vehicle.occupancy === 'standing'
//                           ? 'bg-amber-100 text-amber-800'
//                           : 'bg-red-100 text-red-800'
//                       }`}>
//                         {vehicle.occupancy.replace('_', ' ')}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleEdit(vehicle)}
//                           className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded"
//                           title="Edit"
//                         >
//                           <FaEdit />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(vehicle._id)}
//                           className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded"
//                           title="Delete"
//                         >
//                           <FaTrash />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ManageVehicles