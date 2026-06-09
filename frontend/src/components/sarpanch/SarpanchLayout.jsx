import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import api from '../../api/axios'
import { LayoutDashboard, FileText, Users, Bell, User, LogOut, Leaf, Menu, X, Shield } from 'lucide-react'

const navItems = [
  { to: '/sarpanch', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/sarpanch/complaints', label: 'Complaints', icon: FileText },
  { to: '/sarpanch/citizens', label: 'Citizens', icon: Users },
  { to: '/sarpanch/notifications', label: 'Notifications', icon: Bell },
  { to: '/sarpanch/profile', label: 'Profile', icon: User },
]

export default function SarpanchLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try { const { data } = await api.get('/notifications/unread-count'); setUnreadCount(data.count) } catch {}
    }
    fetch()
    const iv = setInterval(fetch, 30000)
    return () => clearInterval(iv)
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout', { refreshToken: useAuthStore.getState().refreshToken }) } catch {}
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">GramConnect AI</div>
            <div className="text-xs text-navy-600 font-medium">Sarpanch Portal</div>
          </div>
        </div>
      </div>

      <div className="p-4 mx-3 mt-3 bg-navy-50 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-navy-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
              : <span className="text-navy-700 font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">Sarpanch · {user?.village?.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            {label === 'Notifications' && unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '-100%' }}
  transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
  style={{ willChange: 'transform' }}
  className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-2xl flex flex-col">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button className="lg:hidden text-gray-600 p-1" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
  <Menu className="w-6 h-6" />
</button>
<div className="flex-1 text-center lg:text-left">
  <span className="lg:hidden font-bold text-gray-900 text-sm">GramConnect AI</span>
  <h2 className="text-gray-500 text-sm hidden lg:block truncate">
    🏘️ Sarpanch of {user?.village?.name}, {user?.district?.name}, {user?.state?.name}
  </h2>
</div>
          <div className="flex items-center gap-3">
            <NavLink to="/sarpanch/notifications" className="relative p-2 text-gray-500 hover:text-blue-600">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
