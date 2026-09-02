import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, Activity, Grid, DollarSign, Package, 
  Truck, Flame, Users, Megaphone, QrCode, ShoppingBag, 
  Calendar, ShieldCheck, ShieldAlert, MessageSquare, 
  Sparkles, Smartphone, Building2, Receipt, Server, 
  Settings, ShoppingCart, LayoutGrid, Tablet, Monitor, 
  TrendingUp, BarChart3, BookOpen, Navigation, KeyRound, 
  ChevronLeft, ChevronRight, UserCheck, ChefHat, Printer, 
  Layers, Terminal, CheckSquare, LogOut
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { t, isRTL } = useLanguage();
  const { currentUser, logout } = useAuth();

  const userRole = currentUser?.role || 'ADMIN';

  // Role-isolated navigation sections
  const getRoleNavigation = (role) => {
    switch (role) {
      case 'CASHIER':
        return [
          {
            group: 'Cashier Operations',
            items: [
              { path: '/cashier', label: 'Cashier Home', icon: ShoppingCart },
              { path: '/pos', label: 'POS Terminal', icon: ShoppingCart },
              { path: '/delivery-order', label: 'Delivery Phone POS', icon: Truck },
              { path: '/crm', label: 'Customer Lookup', icon: Users },
            ]
          }
        ];
      case 'WAITER':
        return [
          {
            group: 'Captain Workspace',
            items: [
              { path: '/captain', label: 'Captain Operations', icon: LayoutGrid },
              { path: '/tables', label: 'Floor Plan & Coursing', icon: LayoutGrid },
              { path: '/waiter-pos', label: 'Handheld POS', icon: Tablet },
              { path: '/waitlist', label: 'Waitlist & Reservations', icon: Calendar },
            ]
          }
        ];
      case 'CHEF':
        return [
          {
            group: 'Kitchen Display (KDS)',
            items: [
              { path: '/chef', label: 'Chef KDS Screen', icon: Flame },
              { path: '/kitchen', label: 'Kitchen Command Center', icon: ChefHat },
              { path: '/station-screens', label: 'Line Station Displays', icon: Flame },
              { path: '/kitchen/expo', label: 'Expo Assembly Line', icon: CheckSquare },
              { path: '/waste-analytics', label: 'Kitchen Waste Ledger', icon: Receipt },
            ]
          }
        ];
      case 'DRIVER':
        return [
          {
            group: 'Driver Logistics',
            items: [
              { path: '/driver', label: 'Driver App & Map', icon: Navigation },
              { path: '/dispatch', label: 'Active Dispatches', icon: Truck },
            ]
          }
        ];
      case 'PACKING':
        return [
          {
            group: 'Packing & Dispatch',
            items: [
              { path: '/packing', label: 'Packing Station', icon: Package },
              { path: '/kitchen/expo', label: 'Expo Assembly Station', icon: ChefHat },
              { path: '/dispatch', label: 'Delivery Dispatch Board', icon: Truck },
            ]
          }
        ];
      case 'INVENTORY':
        return [
          {
            group: 'Inventory Management',
            items: [
              { path: '/inventory', label: 'Raw Stock Inventory', icon: Package },
              { path: '/inventory-intelligence', label: 'Stock Forecasting & POs', icon: Package },
              { path: '/suppliers', label: 'Supplier Scorecards', icon: Truck },
              { path: '/waste-analytics', label: 'Spoilage Ledger', icon: Receipt },
            ]
          }
        ];
      case 'CALL_CENTER':
        return [
          {
            group: 'Call Center Workspace',
            items: [
              { path: '/call-center', label: 'Phone Order Entry', icon: Smartphone },
              { path: '/crm', label: 'Customer Profiles', icon: Users },
              { path: '/dispatch', label: 'Delivery Status', icon: Truck },
              { path: '/online-ordering', label: 'Online Storefront', icon: ShoppingBag },
            ]
          }
        ];
      case 'MANAGER':
        return [
          {
            group: 'Branch Operations',
            items: [
              { path: '/manager', label: 'Manager Command Center', icon: Compass },
              { path: '/tables', label: 'Floor Plan & Tables', icon: LayoutGrid },
              { path: '/pos', label: 'POS Terminal', icon: ShoppingCart },
              { path: '/kitchen/expo', label: 'Expo & Assembly', icon: ChefHat },
              { path: '/dispatch', label: 'Delivery Dispatch', icon: Truck },
              { path: '/waitlist', label: 'Waitlist & Bookings', icon: Calendar },
            ]
          },
          {
            group: 'Management & Control',
            items: [
              { path: '/approvals', label: 'Manager Approvals', icon: ShieldCheck },
              { path: '/staff-performance', label: 'Staff Attendance', icon: UserCheck },
              { path: '/inventory', label: 'Stock Control', icon: Package },
              { path: '/settings/printers', label: 'Printer Fleet Hardware', icon: Printer },
              { path: '/reports', label: 'Operational Reports', icon: TrendingUp },
            ]
          }
        ];
      case 'ADMIN':
      default:
        // Owner / Executive Workspace
        return [
          {
            group: 'Executive Intelligence',
            items: [
              { path: '/owner', label: 'Owner Strategic Console', icon: Compass },
              { path: '/multi-brand', label: 'Multi-Brand Portfolio BI', icon: Building2 },
              { path: '/command-center', label: 'Executive Command Center', icon: Compass },
              { path: '/daily-brief', label: 'Strategic Daily Brief', icon: Sparkles },
              { path: '/health', label: 'Health Score (0-100)', icon: Activity },
            ]
          },
          {
            group: 'Operations & Floor',
            items: [
              { path: '/tables', label: 'Floor Plan 2.0 & Coursing', icon: LayoutGrid },
              { path: '/catering', label: 'Catering & Events Hub', icon: Calendar },
              { path: '/pos', label: 'POS Terminal', icon: ShoppingCart },
              { path: '/kitchen/expo', label: 'Assembly & Expo Station', icon: ChefHat },
              { path: '/menu/pricing-engine', label: 'Channel Pricing Engine', icon: DollarSign },
            ]
          },
          {
            group: 'Governance & Settings',
            items: [
              { path: '/reports', label: 'Financial Analytics', icon: TrendingUp },
              { path: '/staff', label: 'Staff & Roles (RBAC)', icon: ShieldCheck },
              { path: '/system-health', label: 'Cluster Observability', icon: Server },
              { path: '/settings/business', label: 'Master Architecture & Flags', icon: Settings },
            ]
          }
        ];
    }
  };

  const navSections = getRoleNavigation(userRole);

  return (
    <aside className={`bg-[#0e0e0e] ${isRTL ? 'border-l' : 'border-r'} border-[#20201f] flex flex-col justify-between transition-all duration-300 select-none z-30 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Role Badge Indicator */}
      {!collapsed && currentUser && (
        <div className="p-3 mx-2 mt-2 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img 
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover border border-primary/40 shrink-0"
            />
            <div className="truncate">
              <div className="text-xs font-bold text-on-surface truncate">{currentUser.name}</div>
              <div className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">{currentUser.role}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            title="Switch User / PIN Lock"
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <div className="overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 flex-1">
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!collapsed && (
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#99907c] px-3 mb-1.5 font-bold">
                {section.group}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? `bg-[#20201f] text-[#d4af37] ${isRTL ? 'border-r-2' : 'border-l-2'} border-[#d4af37] shadow-sm`
                          : 'text-[#d0c5af] hover:bg-[#1c1b1b] hover:text-white'
                      } ${collapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-[#20201f] flex items-center justify-between">
        {!collapsed && (
          <div className="px-2">
            <span className="text-[10px] font-mono text-[#99907c] block">{t('common.powered_by')}</span>
            <span className="text-[9px] font-mono text-[#d4af37]">RestaurantOS v3.2 Role-Isolated</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-[#1c1b1b] text-[#99907c] hover:text-white transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
