import { Link } from 'react-router-dom'
import { LogOut, LayoutDashboard, Zap } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 flex items-center px-4 gap-3">
      <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-slate-100 hover:text-brand-400 transition-colors">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        Taskflow
      </Link>

      <div className="flex-1" />

      <Link to="/" className="btn-ghost flex items-center gap-2 text-sm">
        <LayoutDashboard size={15} />
        <span className="hidden sm:block">Boards</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-slate-300 font-medium">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost flex items-center gap-1.5 text-sm text-slate-400">
          <LogOut size={15} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  )
}
