import { Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import LiveMap from './pages/LiveMap'
import RoutesPage from './pages/Routes'
import AdminDashboard from './pages/Admin/Dashboard'
import ManageRoutes from './pages/Admin/ManageRoutes'
import ManageVehicles from './pages/Admin/ManageVehicles'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/admin">
            <Route index element={<AdminDashboard />} />
            <Route path="routes" element={<ManageRoutes />} />
            <Route path="vehicles" element={<ManageVehicles />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App