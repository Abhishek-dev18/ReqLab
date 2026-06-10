import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  FolderTree,
  Globe,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../api'
import EnvironmentSelector from './EnvironmentSelector'

const navItems = [
  { to: '/collections', icon: FolderTree, label: 'Collections', title: 'Collections' },
  { to: '/history', icon: Clock, label: 'History', title: 'History' },
  { to: '/environments', icon: Globe, label: 'Environments', title: 'Environments' },
  { to: '/import', icon: BookOpen, label: 'Import', title: 'OpenAPI Import' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', title: 'Dashboard' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-pm-bg">
      {/* Top header — Postman-style */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-pm-border bg-pm-header px-4">
        <div className="flex items-center gap-4">
          <Link to="/collections" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-pm-orange font-bold text-white">
              R
            </div>
            <span className="text-base font-semibold text-pm-text">ReqLab</span>
          </Link>
          <div className="hidden h-5 w-px bg-pm-border sm:block" />
          <span className="hidden text-sm text-pm-muted sm:block">My Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          <EnvironmentSelector />
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pm-surface text-pm-muted">
              <User className="h-4 w-4" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-tight text-pm-text">{user?.username}</p>
              <p className="max-w-[140px] truncate text-xs text-pm-muted">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="pm-icon-nav text-pm-muted hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <aside className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-pm-border bg-pm-sidebar py-3">
          {navItems.map(({ to, icon: Icon, title }) => (
            <NavLink
              key={to}
              to={to}
              title={title}
              className={({ isActive }) =>
                `pm-icon-nav ${isActive ? 'pm-icon-nav-active' : ''}`
              }
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          ))}
        </aside>

        {/* Main workspace */}
        <main className="min-w-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
