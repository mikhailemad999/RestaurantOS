import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/api/authApi'
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  NotificationItem
} from '@/api/notificationsApi'
import {
  LayoutDashboard, Users, ShieldCheck, Settings,
  UtensilsCrossed, ChevronLeft, ChevronRight, LogOut,
  Bell, Search, Menu, X, ChefHat, Truck, Package,
  ShoppingCart, Receipt, CreditCard, BookUser, Tag,
  BarChart3, ClipboardList, Check, Sparkles, AlertCircle
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permissions?: string[]
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Floor & Orders',
    items: [
      { label: 'POS Terminal', path: '/orders', icon: ShoppingCart, badge: 'Live', permissions: ['orders.view'] },
      { label: 'Floor & Tables', path: '/tables', icon: Receipt, permissions: ['tables.view'] },
      { label: 'Kitchen (KDS)', path: '/kitchen', icon: ChefHat, permissions: ['kitchen.view'] },
      { label: 'Delivery Hub', path: '/delivery', icon: Truck, permissions: ['delivery.view'] },
    ],
  },
  {
    title: 'Catalog & Stock',
    items: [
      { label: 'Menu Catalog', path: '/menu', icon: UtensilsCrossed, permissions: ['menu.view'] },
      { label: 'Inventory & BOM', path: '/inventory', icon: Package, permissions: ['inventory.view'] },
    ],
  },
  {
    title: 'Guests & Sales',
    items: [
      { label: 'Customers & CRM', path: '/customers', icon: BookUser, permissions: ['customers.view'] },
      { label: 'Promotions', path: '/promotions', icon: Tag, permissions: ['promotions.manage'] },
      { label: 'Payments & Shifts', path: '/payments', icon: CreditCard, permissions: ['sales.view'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Staff Directory', path: '/users', icon: Users, permissions: ['users.view'] },
      { label: 'Roles & Access', path: '/roles', icon: ShieldCheck, permissions: ['roles.view'] },
      { label: 'Analytics & BI', path: '/reports', icon: BarChart3, permissions: ['reports.view'] },
      { label: 'Audit Trail', path: '/audit-logs', icon: ClipboardList, permissions: ['audit_logs.view'] },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Restaurant Setup', path: '/settings/restaurant', icon: Settings, permissions: ['settings.restaurant'] },
    ],
  },
]

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { user, refreshToken } = useAppSelector((state) => state.auth)
  const [logoutApi] = useLogoutMutation()

  // Notifications API
  const { data: notifications = [], refetch: refetchNotifs } = useGetNotificationsQuery()
  const { data: unreadData } = useGetUnreadCountQuery()
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  const unreadCount = unreadData?.unread_count ?? 0

  const handleLogout = async () => {
    try {
      if (refreshToken) { await logoutApi({ refresh: refreshToken }).unwrap() }
    } catch {
      // Ignore API logout error and proceed with local clearing
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markRead(notif.id)
    }
    if (notif.link_url) {
      setNotifsOpen(false)
      navigate(notif.link_url)
    }
  }

  // Granular RBAC checking
  const canAccess = (requiredPerms?: string[]) => {
    if (!requiredPerms || requiredPerms.length === 0) return true
    if (!user) return false
    if (user.role?.name === 'Owner') return true

    const userPerms = new Set(user.permissions || [])
    return requiredPerms.some((p) => userPerms.has(p))
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Primary Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#E2E8F0] shadow-xs
          transition-all duration-250 ease-out lg:static
          ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}
          ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-extrabold text-base shadow-xs shrink-0">
              R
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-extrabold text-sm tracking-tight block text-[#0F172A]">
                  RestaurantOS
                </span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Main Branch &bull; Online
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4 space-y-6">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((i) => canAccess(i.permissions))
            if (visibleItems.length === 0) return null

            return (
              <div key={section.title} className="space-y-1.5">
                {!collapsed && (
                  <h4 className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {section.title}
                  </h4>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`
                          group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold
                          transition-all duration-150 cursor-pointer no-underline
                          ${collapsed ? 'justify-center px-0' : ''}
                          ${isActive
                            ? 'bg-[#EEF2FF] text-[#4F46E5] font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }
                        `}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Left Active Accent Pill */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#4F46E5]" />
                        )}

                        {/* Centered Icon Container */}
                        <div
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                            ${isActive
                              ? 'text-[#4F46E5] bg-white shadow-2xs'
                              : 'text-slate-500 group-hover:text-slate-800'
                            }
                          `}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {!collapsed && (
                          <span className="truncate flex-1">
                            {item.label}
                          </span>
                        )}

                        {!collapsed && item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E2E8F0] shrink-0 hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between shrink-0 z-20 shadow-xs">
          {/* Left: Search Bar */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all w-80 lg:w-96">
              <Search className="w-4 h-4 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, menu, tables, staff..."
                className="bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none w-full"
              />
            </div>
          </div>

          {/* Right: Notifications, User Profile & Sign Out */}
          <div className="flex items-center gap-3 relative">
            {/* Interactive Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Popover */}
              {notifsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifsOpen(false)} />
                  <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">Notifications & Alerts</h4>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllRead()}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                          <Check className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                          All caught up! No notifications right now.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                              !n.is_read ? 'bg-indigo-50/30' : ''
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-indigo-600' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 truncate">{n.title}</h5>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3 pl-1 sm:pl-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {user?.full_name || 'Owner'}
                </span>
                <span className="inline-block text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 leading-tight mt-0.5">
                  {user?.role?.name || 'Owner'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Spacious Main Container */}
        <main className="flex-1 overflow-y-auto overscroll-contain px-6 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto w-full pb-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
