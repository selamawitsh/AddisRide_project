import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import LiveMap from './pages/LiveMap'
import RoutesPage from './pages/Routes'
import NotFound from './pages/NotFound'

// Auth Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ChooseRole from './pages/Auth/ChooseRole'

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard'
import ManageRoutes from './pages/Admin/ManageRoutes'
import ManageVehicles from './pages/Admin/ManageVehicles'
import ManageUsers from './pages/Admin/ManageUsers'
import AssignVehicle from './pages/Admin/AssignVehicle'

// Driver Pages
import DriverDashboard from './pages/Driver/DriverDashboard'
import UpdateLocation from './pages/Driver/UpdateLocation'
import MyVehicle from './pages/Driver/MyVehicle'

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Protected Route for Driver
const DriverRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (user?.role !== 'driver') {
    return <Navigate to="/" replace />
  }
  
  if (!user?.isVerified) {
    return <Navigate to="/pending-verification" replace />
  }
  
  return children
}

// Public Route (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes - Anyone can access */}
          <Route path="/" element={<Home />} />
          <Route path="/live-map" element={<LiveMap />} />
          <Route path="/routes" element={<RoutesPage />} />
          
          {/* Auth Routes - Only when NOT logged in */}
          <Route path="/choose-role" element={
            <PublicRoute>
              <ChooseRole />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Pending Verification - For unverified drivers */}
          <Route path="/pending-verification" element={
            <div className="container mx-auto px-4 py-16 text-center">
              <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Account Pending Verification
                </h1>
                <p className="text-gray-600 mb-6">
                  Your driver account is waiting for admin approval. 
                  You'll be able to access the driver dashboard once verified.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact the administrator if you have any questions.
                </p>
              </div>
            </div>
          } />
          
          {/* Admin Routes */}
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
            <Route path="users" element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            } />
            <Route path="assign-vehicle" element={
              <AdminRoute>
                <AssignVehicle />
              </AdminRoute>
            } />
          </Route>
          
          {/* Driver Routes */}
          <Route path="/driver">
            <Route index element={
              <DriverRoute>
                <DriverDashboard />
              </DriverRoute>
            } />
            <Route path="dashboard" element={
              <DriverRoute>
                <DriverDashboard />
              </DriverRoute>
            } />
            <Route path="vehicle" element={
              <DriverRoute>
                <MyVehicle />
              </DriverRoute>
            } />
            <Route path="update-location" element={
              <DriverRoute>
                <UpdateLocation />
              </DriverRoute>
            } />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App

// import { Routes, Route, Navigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import Header from './components/common/Header'
// import Footer from './components/common/Footer'
// import Home from './pages/Home'
// import LiveMap from './pages/LiveMap'
// import RoutesPage from './pages/Routes'
// import AdminLogin from './pages/Admin/Login'
// import AdminDashboard from './pages/Admin/AdminDashboard'
// import ManageRoutes from './pages/Admin/ManageRoutes'
// import ManageVehicles from './pages/Admin/ManageVehicles'
// import ManageUsers from './pages/Admin/ManageUsers'
// import AssignVehicle from './pages/Admin/AssignVehicle'

// // Import Driver Pages
// import DriverDashboard from './pages/Driver/DriverDashboard'
// import UpdateLocation from './pages/Driver/UpdateLocation'
// import MyVehicle from './pages/Driver/MyVehicle'

// // Protected Route Component for Admin
// const AdminRoute = ({ children }) => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
  
//   console.log('AdminRoute check:', { isAuthenticated, userRole: user?.role })
  
//   if (!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />
//   }
  
//   if (user?.role !== 'admin') {
//     return <Navigate to="/" replace />
//   }
  
//   return children
// }

// // Protected Route Component for Drivers
// const DriverRoute = ({ children }) => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
  
//   console.log('DriverRoute check:', { isAuthenticated, userRole: user?.role })
  
//   if (!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />
//   }
  
//   if (user?.role !== 'driver') {
//     return <Navigate to="/" replace />
//   }
  
//   // Check if driver is verified
//   if (!user?.isVerified) {
//     return <Navigate to="/pending-verification" replace />
//   }
  
//   return children
// }

// // Protected Route Component for Any Authenticated User
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useSelector((state) => state.auth)
  
//   if (!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />
//   }
  
//   return children
// }

// function App() {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
  
//   console.log('App auth state:', { isAuthenticated, userRole: user?.role })

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Show header for all pages except login */}
//       {!window.location.pathname.includes('/admin/login') && 
//        !window.location.pathname.includes('/driver/login') && <Header />}
      
//       <main className="flex-grow">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/live-map" element={<LiveMap />} />
//           <Route path="/routes" element={<RoutesPage />} />
          
//           {/* Admin Login - Public */}
//           <Route path="/admin/login" element={<AdminLogin />} />
          
//           {/* Driver Login - Same as admin login for now */}
//           <Route path="/driver/login" element={<AdminLogin />} />
          
//           {/* Pending Verification Page */}
//           <Route path="/pending-verification" element={
//             <div className="container mx-auto px-4 py-16 text-center">
//               <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
//                 <div className="text-5xl mb-4">⏳</div>
//                 <h1 className="text-2xl font-bold text-gray-800 mb-4">
//                   Account Pending Verification
//                 </h1>
//                 <p className="text-gray-600 mb-6">
//                   Your driver account is waiting for admin approval. 
//                   You'll be able to access the driver dashboard once verified.
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Please contact the administrator if you have any questions.
//                 </p>
//               </div>
//             </div>
//           } />
          
//           {/* Protected Admin Routes */}
//           <Route path="/admin">
//             <Route index element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             } />
//             <Route path="dashboard" element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             } />
//             <Route path="routes" element={
//               <AdminRoute>
//                 <ManageRoutes />
//               </AdminRoute>
//             } />
//             <Route path="vehicles" element={
//               <AdminRoute>
//                 <ManageVehicles />
//               </AdminRoute>
//             } />
//             <Route path="users" element={
//               <AdminRoute>
//                 <ManageUsers />
//               </AdminRoute>
//             } />
//             <Route path="assign-vehicle" element={
//   <AdminRoute>
//     <AssignVehicle />
//   </AdminRoute>
// } />
//           </Route>
          
//           {/* Protected Driver Routes */}
//           <Route path="/driver">
//             <Route index element={
//               <DriverRoute>
//                 <DriverDashboard />
//               </DriverRoute>
//             } />
//             <Route path="dashboard" element={
//               <DriverRoute>
//                 <DriverDashboard />
//               </DriverRoute>
//             } />
//             <Route path="vehicle" element={
//               <DriverRoute>
//                 <MyVehicle />
//               </DriverRoute>
//             } />
//             <Route path="update-location" element={
//               <DriverRoute>
//                 <UpdateLocation />
//               </DriverRoute>
//             } />
//           </Route>
          
//           {/* 404 - Not Found */}
//           <Route path="*" element={
//             <div className="container mx-auto px-4 py-16 text-center">
//               <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
//               <p className="text-xl text-gray-600 mb-8">Page not found</p>
//               <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                 Go Home
//               </a>
//             </div>
//           } />
//         </Routes>
//       </main>
      
//       {/* Show footer for all pages except login */}
//       {!window.location.pathname.includes('/admin/login') && 
//        !window.location.pathname.includes('/driver/login') && <Footer />}
//     </div>
//   )
// }

// export default App



// import { useSelector } from 'react-redux'
// import Header from './components/common/Header'
// import Footer from './components/common/Footer'
// import Home from './pages/Home'
// import LiveMap from './pages/LiveMap'
// import RoutesPage from './pages/Routes'
// import AdminLogin from './pages/Admin/Login'
// import AdminDashboard from './pages/Admin/AdminDashboard'
// import ManageRoutes from './pages/Admin/ManageRoutes'
// import ManageVehicles from './pages/Admin/ManageVehicles'

// // Protected Route Component for Admin
// const AdminRoute = ({ children }) => {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
  
//   console.log('AdminRoute check:', { isAuthenticated, userRole: user?.role })
  
//   if (!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />
//   }
  
//   if (user?.role !== 'admin') {
//     return <Navigate to="/" replace />
//   }
  
//   return children
// }

// // Protected Route Component for Authenticated Users
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useSelector((state) => state.auth)
  
//   if (!isAuthenticated) {
//     return <Navigate to="/admin/login" replace />
//   }
  
//   return children
// }

// function App() {
//   const { isAuthenticated, user } = useSelector((state) => state.auth)
  
//   console.log('App auth state:', { isAuthenticated, userRole: user?.role })

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Show header for all pages except login */}
//       {!window.location.pathname.includes('/admin/login') && <Header />}
      
//       <main className="flex-grow">
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<Home />} />
//           <Route path="/live-map" element={<LiveMap />} />
//           <Route path="/routes" element={<RoutesPage />} />
          
//           {/* Admin Login - Public */}
//           <Route path="/admin/login" element={<AdminLogin />} />
          
//           {/* Protected Admin Routes */}
//           <Route path="/admin">
//             <Route index element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             } />
//             <Route path="dashboard" element={
//               <AdminRoute>
//                 <AdminDashboard />
//               </AdminRoute>
//             } />
//             <Route path="routes" element={
//               <AdminRoute>
//                 <ManageRoutes />
//               </AdminRoute>
//             } />
//             <Route path="vehicles" element={
//               <AdminRoute>
//                 <ManageVehicles />
//               </AdminRoute>
//             } />
//           </Route>
          
//           {/* Driver Routes (for Phase 4) */}
//           <Route path="/driver" element={
//             <ProtectedRoute>
//               <div>Driver Dashboard (Coming Soon)</div>
//             </ProtectedRoute>
//           } />
//         </Routes>
//       </main>
      
//       {/* Show footer for all pages except login */}
//       {!window.location.pathname.includes('/admin/login') && <Footer />}
//     </div>
//   )
// }

// export default App




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