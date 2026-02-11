import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
import api from '../../services/api'
import Loader from '../../components/common/Loader'

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    stops: [{ name: '', lat: '', lng: '' }],
    path: []
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/routes')
      setRoutes(response.data)
      setError('')
    } catch (error) {
      console.error('Error fetching routes:', error)
      setError('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    
    try {
      // Validate stops
      const validStops = formData.stops.filter(stop => 
        stop.name && stop.lat && stop.lng
      )
      
      if (validStops.length === 0) {
        setError('At least one stop is required')
        setSubmitting(false)
        return
      }
      
      const routeData = {
        name: formData.name,
        stops: validStops.map(stop => ({
          name: stop.name,
          lat: parseFloat(stop.lat),
          lng: parseFloat(stop.lng)
        }))
      }

      if (editingId) {
        await api.put(`/routes/${editingId}`, routeData)
      } else {
        await api.post('/routes', routeData)
      }
      
      await fetchRoutes()
      resetForm()
    } catch (error) {
      console.error('Error saving route:', error)
      setError(error.response?.data?.message || 'Error saving route')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (route) => {
    setEditingId(route._id)
    setFormData({
      name: route.name,
      stops: route.stops?.length > 0 
        ? route.stops.map(stop => ({
            name: stop.name,
            lat: stop.lat.toString(),
            lng: stop.lng.toString()
          }))
        : [{ name: '', lat: '', lng: '' }],
      path: route.path || []
    })
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return
    
    try {
      await api.delete(`/routes/${id}`)
      await fetchRoutes()
    } catch (error) {
      console.error('Error deleting route:', error)
      setError('Failed to delete route')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      stops: [{ name: '', lat: '', lng: '' }],
      path: []
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { name: '', lat: '', lng: '' }]
    })
  }

  const removeStop = (index) => {
    if (formData.stops.length <= 1) {
      setError('At least one stop is required')
      return
    }
    const newStops = formData.stops.filter((_, i) => i !== index)
    setFormData({ ...formData, stops: newStops })
  }

  const updateStop = (index, field, value) => {
    const newStops = [...formData.stops]
    newStops[index][field] = value
    setFormData({ ...formData, stops: newStops })
  }

  // Predefined Addis Ababa locations for quick add
  const predefinedStops = [
    { name: 'Megenagna', lat: 9.005, lng: 38.789 },
    { name: 'Meskel Square', lat: 9.025, lng: 38.746 },
    { name: 'Bole Medhanealem', lat: 8.990, lng: 38.789 },
    { name: 'Merkato', lat: 9.030, lng: 38.740 },
    { name: 'Arat Kilo', lat: 9.040, lng: 38.760 },
    { name: 'Piazza', lat: 9.035, lng: 38.750 },
    { name: 'Stadium', lat: 9.020, lng: 38.780 },
    { name: 'Tulu Dimtu', lat: 9.060, lng: 38.680 },
    { name: 'Kality', lat: 8.880, lng: 38.720 },
    { name: 'Summit', lat: 9.010, lng: 38.760 },
  ]

  const addPredefinedStop = (stop) => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { ...stop, lat: stop.lat.toString(), lng: stop.lng.toString() }]
    })
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Routes</h1>
          <p className="text-gray-600">Add, edit, or delete bus routes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="mr-2" />
          Add New Route
        </button>
      </div>

      {error && !showForm && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Route Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {editingId ? 'Edit Route' : 'Add New Route'}
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

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route Name *
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bole - Arat Kilo via Meskel Square"
                required
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe the route clearly for passengers
              </p>
            </div>

            {/* Quick Add Stops */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Add Stops
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {predefinedStops.map((stop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addPredefinedStop(stop)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    disabled={submitting}
                  >
                    {stop.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bus Stops *
                </label>
                <button
                  type="button"
                  onClick={addStop}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  disabled={submitting}
                >
                  + Add Stop
                </button>
              </div>

              <div className="space-y-4">
                {formData.stops.map((stop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2">
                          {index + 1}
                        </div>
                        <span className="font-medium">Stop {index + 1}</span>
                      </div>
                      {formData.stops.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStop(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={submitting}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Stop Name</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="e.g., Megenagna"
                          value={stop.name}
                          onChange={(e) => updateStop(index, 'name', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="e.g., 9.005"
                          value={stop.lat}
                          onChange={(e) => updateStop(index, 'lat', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full p-2 border border-gray-300 rounded"
                          placeholder="e.g., 38.789"
                          value={stop.lng}
                          onChange={(e) => updateStop(index, 'lng', e.target.value)}
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                * At least one stop is required. Add stops in order from start to end.
              </p>
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
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {editingId ? 'Update Route' : 'Save Route'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routes List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              All Routes ({routes.length})
            </h2>
            <span className="text-sm text-gray-500">
              Click on a route to edit
            </span>
          </div>
        </div>
        
        {routes.length === 0 ? (
          <div className="p-8 text-center">
            <FaMapMarkerAlt className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No routes yet</h3>
            <p className="text-gray-500 mb-4">Create your first bus route to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create First Route
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {route.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {route.stops?.[0]?.name || 'Start'} → {route.stops?.[route.stops?.length - 1]?.name || 'End'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{route.stops?.length || 0}</span> stops
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(route.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(route)}
                          className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(route._id)}
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

export default ManageRoutes