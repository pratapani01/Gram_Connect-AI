import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import ScrollToTop from './components/common/ScrollToTop'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'

// Citizen pages
import CitizenLayout from './components/citizen/CitizenLayout'
import CitizenDashboard from './pages/citizen/Dashboard'
import CitizenComplaints from './pages/citizen/Complaints'
import NewComplaint from './pages/citizen/NewComplaint'
import ComplaintDetail from './pages/citizen/ComplaintDetail'
import CitizenProfile from './pages/citizen/Profile'
import CitizenNotifications from './pages/citizen/Notifications'

// Sarpanch pages
import SarpanchLayout from './components/sarpanch/SarpanchLayout'
import SarpanchDashboard from './pages/sarpanch/Dashboard'
import SarpanchComplaints from './pages/sarpanch/Complaints'
import SarpanchComplaintDetail from './pages/sarpanch/ComplaintDetail'
import SarpanchProfile from './pages/sarpanch/Profile'
import SarpanchNotifications from './pages/sarpanch/Notifications'
import SarpanchCitizens from './pages/sarpanch/Citizens'

// Admin pages
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminComplaints from './pages/admin/Complaints'
import AdminUsers from './pages/admin/Users'
import AdminSarpanchRequests from './pages/admin/SarpanchRequests'
import AdminLocations from './pages/admin/Locations'
import AdminProfile from './pages/admin/Profile'
import AdminNotifications from './pages/admin/Notifications'

// Guards
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={`/${user?.role}`} replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) return <Navigate to={`/${user?.role}`} replace />
  return children
}

const RoleRedirect = () => {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={`/${user?.role}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<RoleRedirect />} />

        {/* Auth */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

        {/* Citizen */}
        <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><CitizenLayout /></ProtectedRoute>}>
          <Route index element={<CitizenDashboard />} />
          <Route path="complaints" element={<CitizenComplaints />} />
          <Route path="complaints/new" element={<NewComplaint />} />
          <Route path="complaints/:id" element={<ComplaintDetail />} />
          <Route path="notifications" element={<CitizenNotifications />} />
          <Route path="profile" element={<CitizenProfile />} />
        </Route>

        {/* Sarpanch */}
        <Route path="/sarpanch" element={<ProtectedRoute roles={['sarpanch']}><SarpanchLayout /></ProtectedRoute>}>
          <Route index element={<SarpanchDashboard />} />
          <Route path="complaints" element={<SarpanchComplaints />} />
          <Route path="complaints/:id" element={<SarpanchComplaintDetail />} />
          <Route path="citizens" element={<SarpanchCitizens />} />
          <Route path="notifications" element={<SarpanchNotifications />} />
          <Route path="profile" element={<SarpanchProfile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sarpanch-requests" element={<AdminSarpanchRequests />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
