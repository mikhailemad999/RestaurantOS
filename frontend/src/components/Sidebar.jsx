import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Compass, Activity, Grid, DollarSign, Package, 
  Truck, Flame, Users, Megaphone, QrCode, ShoppingBag, 
  Calendar, ShieldCheck, ShieldAlert, MessageSquare, 
  Sparkles, Smartphone, Building2, Receipt, Server, 
  Settings, ShoppingCart, LayoutGrid, Tablet, Monitor, 
  TrendingUp, BarChart3, BookOpen, Navigation, KeyRound, 
  ChevronLeft, ChevronRight, UserCheck, ChefHat, Printer, Layers, Terminal
} from 'lucide-react';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { t, isRTL } = useLanguage();

  const navSections = [
    {
      group: t('nav.executive_intelligence'),
      items: [
        { path: '/command-center', label: t('nav.command_center'), icon: Compass },
        { path: '/daily-brief', label: t('nav.daily_brief'), icon: Sparkles },
        { path: '/health', label: t('nav.health_score'), icon: Activity },
        { path: '/ai-manager', label: t('nav.ai_manager'), icon: Sparkles },
        { path: '/branch-intelligence', label: t('nav.multi_branch'), icon: Building2 },
      ]
    },
    {
      group: t('nav.foh_guest_flow'),
      items: [
        { path: '/pos', label: t('nav.pos_terminal'), icon: ShoppingCart },
        { path: '/delivery-order', label: t('nav.delivery_order'), icon: Truck },
        { path: '/tables', label: t('nav.floor_plan'), icon: LayoutGrid },
        { path: '/waitlist', label: t('nav.waitlist_reservations'), icon: Calendar },
        { path: '/waiter-pos', label: t('nav.waiter_pos'), icon: Tablet },
        { path: '/kiosk', label: t('nav.self_kiosk'), icon: Monitor },
        { path: '/qr-ordering', label: t('nav.qr_ordering'), icon: QrCode },
        { path: '/online-ordering', label: t('nav.online_ordering'), icon: ShoppingBag },
      ]
    },
    {
      group: t('nav.boh_supply'),
      items: [
        { path: '/kds', label: t('nav.kds_station'), icon: Flame },
        { path: '/menu-engineering', label: t('nav.menu_engineering'), icon: Grid },
        { path: '/pricing', label: t('nav.smart_pricing'), icon: DollarSign },
        { path: '/inventory-intelligence', label: t('nav.inventory_intelligence'), icon: Package },
        { path: '/suppliers', label: t('nav.supplier_scorecards'), icon: Truck },
        { path: '/waste-analytics', label: t('nav.waste_ledger'), icon: Receipt },
        { path: '/kitchen-analytics', label: t('nav.kitchen_analytics'), icon: Flame },
        { path: '/menu', label: t('nav.menu_recipes'), icon: BookOpen },
        { path: '/inventory', label: t('nav.raw_inventory'), icon: Package },
      ]
    },
    {
      group: t('nav.printers_kitchen_hardware') || 'Kitchen & Printer Hardware',
      items: [
        { path: '/kitchen', label: t('nav.kitchen_command_center') || 'Kitchen Command Center', icon: ChefHat },
        { path: '/station-screens', label: t('nav.station_screens') || 'Line Station Screens', icon: Flame },
        { path: '/settings/printers/monitor', label: t('nav.printer_monitor') || 'Printer Fleet Monitor', icon: Printer },
        { path: '/settings/printers/routing', label: t('nav.printer_routing') || 'Printer Routing Engine', icon: Layers },
        { path: '/settings/printers/template', label: t('nav.ticket_template') || 'Thermal Ticket Layout', icon: Terminal },
        { path: '/settings/printers', label: t('nav.printer_settings') || 'Printer Devices Config', icon: Settings },
      ]
    },
    {
      group: t('nav.growth_crm'),
      items: [
        { path: '/customer-intelligence', label: t('nav.customer_churn'), icon: Users },
        { path: '/marketing', label: t('nav.marketing_campaigns'), icon: Megaphone },
        { path: '/approvals', label: t('nav.manager_approvals'), icon: ShieldCheck },
        { path: '/risk-center', label: t('nav.risk_fraud_center'), icon: ShieldAlert },
        { path: '/feedback', label: t('nav.customer_reviews'), icon: MessageSquare },
        { path: '/expenses', label: t('nav.expenses_target'), icon: Receipt },
        { path: '/staff-performance', label: t('nav.staff_attendance'), icon: UserCheck },
        { path: '/dispatch', label: t('nav.delivery_dispatch'), icon: Truck },
        { path: '/driver', label: t('nav.driver_app'), icon: Navigation },
        { path: '/crm', label: t('nav.guest_crm'), icon: Users },
      ]
    },
    {
      group: t('nav.reports_system'),
      items: [
        { path: '/dashboard', label: t('nav.bi_dashboard'), icon: BarChart3 },
        { path: '/reports', label: t('nav.financial_analytics'), icon: TrendingUp },
        { path: '/owner-mobile', label: t('nav.owner_mobile'), icon: Smartphone },
        { path: '/staff', label: t('nav.staff_rbac'), icon: ShieldCheck },
        { path: '/system-health', label: t('nav.system_health'), icon: Server },
        { path: '/settings', label: t('nav.system_settings'), icon: Settings },
        { path: '/login', label: t('nav.pin_login'), icon: KeyRound },
      ]
    }
  ];

  return (
    <aside className={`bg-[#0e0e0e] ${isRTL ? 'border-l' : 'border-r'} border-[#20201f] flex flex-col justify-between transition-all duration-300 select-none z-30 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
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
            <span className="text-[9px] font-mono text-[#d4af37]">RestaurantOS v3.2 Enterprise</span>
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
