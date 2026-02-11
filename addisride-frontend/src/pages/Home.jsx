import { Link } from 'react-router-dom'
import { FaMapMarkedAlt, FaRoute, FaBus, FaClock } from 'react-icons/fa'
import BusList from '../components/buses/BusList'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBuses, fetchLiveLocations } from '../store/slices/busSlice'
import { useEffect } from 'react'
import Loader from '../components/common/Loader'

const Home = () => {
  const dispatch = useDispatch()
  const { buses, liveLocations, loading } = useSelector((state) => state.buses)

  useEffect(() => {
    dispatch(fetchBuses())
    dispatch(fetchLiveLocations())
  }, [dispatch])

  const features = [
    {
      icon: <FaMapMarkedAlt className="text-3xl text-blue-600" />,
      title: 'Live Tracking',
      description: 'See minibuses moving in real-time on the map',
      link: '/live-map',
    },
    {
      icon: <FaRoute className="text-3xl text-green-600" />,
      title: 'Route Planning',
      description: 'Find the best route with estimated travel time',
      link: '/routes',
    },
    {
      icon: <FaBus className="text-3xl text-purple-600" />,
      title: 'Bus Status',
      description: 'Check occupancy levels before boarding',
      link: '#',
    },
    {
      icon: <FaClock className="text-3xl text-amber-600" />,
      title: 'Real-time Updates',
      description: 'Get accurate arrival times',
      link: '#',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Smart Public Transport for{' '}
          <span className="text-blue-600">Addis Ababa</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Track minibuses in real-time, plan your journey, and travel smarter
          with AddisRide
        </p>
        <Link
          to="/live-map"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaMapMarkedAlt className="mr-2" />
          View Live Map
        </Link>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {buses.length}
          </div>
          <div className="text-gray-600">Total Buses</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {liveLocations.length}
          </div>
          <div className="text-gray-600">Active Buses</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
          <div className="text-gray-600">Real-time Tracking</div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Bus List */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Currently Active Buses
          </h2>
          <Link
            to="/live-map"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All on Map →
          </Link>
        </div>
        
        {loading && liveLocations.length === 0 ? (
          <Loader />
        ) : (
          <BusList buses={liveLocations.slice(0, 5)} />
        )}
      </section>
    </div>
  )
}

export default Home