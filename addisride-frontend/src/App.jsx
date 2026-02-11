import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import LiveMap from './pages/LiveMap'
import RoutesPage from './pages/Routes'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageRoutes from './pages/Admin/ManageRoutes'
import ManageVehicles from './pages/Admin/ManageVehicles'

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  console.log('AdminRoute check:', { isAuthenticated, userRole: user?.role })
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Protected Route Component for Authenticated Users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  console.log('App auth state:', { isAuthenticated, userRole: user?.role })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show header for all pages except login */}
      {!window.location.pathname.includes('/admin/login') && <Header />}
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/routes" element={<RoutesPage />} />
          
          {/* Admin Login - Public */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin">
            <Route index element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="routes" element={
              <AdminRoute>
                <ManageRoutes />
              </AdminRoute>
            } />
            <Route path="vehicles" element={
              <AdminRoute>
                <ManageVehicles />
              </AdminRoute>
            } />
          </Route>
          
          {/* Driver Routes (for Phase 4) */}
          <Route path="/driver" element={
            <ProtectedRoute>
              <div>Driver Dashboard (Coming Soon)</div>
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      {/* Show footer for all pages except login */}
      {!window.location.pathname.includes('/admin/login') && <Footer />}
    </div>
  )
}

export default App

// import { Routes, Route } from 'react-router-dom'
// import Header from './components/common/Header'
// import Footer from './components/common/Footer'
// import Home from './pages/Home'
// import LiveMap from './pages/LiveMap'
// import RoutesPage from './pages/Routes'
// import AdminDashboard from './pages/Admin/AdminDashboard'
// import ManageRoutes from './pages/Admin/ManageRoutes'
// import ManageVehicles from './pages/Admin/ManageVehicles'
// import ProtectedRoute from './components/ProtectedRoute'

// function App() {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <Header />
//       <main className="flex-grow">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/live-map" element={<LiveMap />} />
//           <Route path="/routes" element={<RoutesPage />} />
          
//           {/* Protected Admin Routes */}
//           <Route path="/admin">
//             <Route index element={
//               <ProtectedRoute requireAdmin>
//                 <AdminDashboard />
//               </ProtectedRoute>
//             } />
//             <Route path="routes" element={
//               <ProtectedRoute requireAdmin>
//                 <ManageRoutes />
//               </ProtectedRoute>
//             } />
//             <Route path="vehicles" element={
//               <ProtectedRoute requireAdmin>
//                 <ManageVehicles />
//               </ProtectedRoute>
//             } />
//           </Route>
//         </Routes>
//       </main>
//       <Footer />
//     </div>
//   )
// }

// export default App