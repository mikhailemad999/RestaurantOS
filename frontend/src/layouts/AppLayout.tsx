import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { useLogoutMutation } from '@/api/authApi'
import {
  LayoutDashboard, Users, ShieldCheck, Settings,
  UtensilsCrossed, ChevronLeft, ChevronRight, LogOut,
  Bell, Search, Menu, X, ChefHat, Truck, Package,
  ShoppingCart, Receipt, CreditCard, BookUser, Tag,
  BarChart3, ClipboardList, GitBranch
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
      { label: 'Store Profile', path: '/settings/restaurant', icon: Settings, permissions: ['settings.restaurant'] },
      { label: 'Branches', path: '/settings/branches', icon: GitBranch, permissions: ['settings.restaurant'] },
    ],
  },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const refreshToken = useAppSelector((s) => s.auth.refreshToken)
  const [logoutApi] = useLogoutMutation()

  const userPermissions = user?.permissions || []
  const isOwner = user?.role?.name === 'Owner'

  const canAccess = (perms?: string[]) => {
    if (!perms || perms.length === 0) return true
    if (isOwner) return true
    return perms.every((p) => userPermissions.includes(p))
  }

  const handleLogout = async () => {
    try {
      if (refreshToken) await logoutApi({ refresh: refreshToken }).unwrap()
    } catch {}
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed lg:static z-50 h-full flex flex-col shrink-0
          bg-white border-r border-[#E2E8F0] shadow-xs select-none
          transition-all duration-200 ease-in-out
          ${collapsed ? 'w-[74px]' : 'w-[264px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4338CA] to-[#6366F1] flex items-center justify-center text-white shadow-xs shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
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
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 lg:px-8 flex items-center justify-between shrink-0 z-10 shadow-xs">
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
          <div className="flex items-center gap-3">
            <button
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

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
