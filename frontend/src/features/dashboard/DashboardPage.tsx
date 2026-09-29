import React from 'react'
import {
  TrendingUp, Users, DollarSign, Clock,
  ArrowUpRight, Plus, ChefHat, Receipt,
  Sparkles, CheckCircle2, ShieldCheck, Activity,
  Layers, ShoppingBag, ArrowRight
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  const stats = [
    {
      title: "Today's Gross Sales",
      value: '$4,289.40',
      change: '+18.4% vs yesterday',
      trend: 'up',
      icon: DollarSign,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    {
      title: 'Active Live Orders',
      value: '21 Orders',
      change: '8 currently cooking',
      trend: 'up',
      icon: Receipt,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      gradient: 'from-indigo-500/10 to-transparent',
    },
    {
      title: 'Floor Occupancy',
      value: '14 / 22 Tables',
      change: '64% Table Capacity',
      trend: 'neutral',
      icon: Users,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      gradient: 'from-amber-500/10 to-transparent',
    },
    {
      title: 'Avg Kitchen SLA',
      value: '12m 40s',
      change: 'Fast (-2.5m vs target)',
      trend: 'up',
      icon: Clock,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      gradient: 'from-blue-500/10 to-transparent',
    },
  ]

  const liveOrders = [
    { id: '#ORD-2041', target: 'Table 6 (Patio)', type: 'Dine-In', items: 5, total: '$78.50', status: 'cooking', waiter: 'Marco V.', time: '3m ago' },
    { id: '#ORD-2040', target: 'Table 14 (VIP)', type: 'Dine-In', items: 3, total: '$112.00', status: 'ready', waiter: 'Elena R.', time: '9m ago' },
    { id: '#ORD-2039', target: 'Delivery #882', type: 'Delivery', items: 4, total: '$64.20', status: 'dispatch', waiter: 'UberEats', time: '14m ago' },
    { id: '#ORD-2038', target: 'Pickup #104', type: 'Takeaway', items: 2, total: '$24.90', status: 'completed', waiter: 'Counter', time: '22m ago' },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cooking':
        return <Badge variant="warning" dot>Kitchen Cooking</Badge>
      case 'ready':
        return <Badge variant="success" dot>Ready to Serve</Badge>
      case 'dispatch':
        return <Badge variant="info" dot>Driver Assigned</Badge>
      case 'completed':
        return <Badge variant="neutral">Paid & Closed</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-entrance">
      {/* Editorial Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/80 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Operation Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.full_name || 'Restaurant Owner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              System is running smoothly with active POS, synchronized kitchen display, and real-time inventory ledger.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="md"
              icon={<ChefHat className="w-4 h-4 text-slate-700" />}
              onClick={() => navigate('/kitchen')}
            >
              Kitchen Station
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4 text-white" />}
              onClick={() => navigate('/orders')}
            >
              Take POS Order
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${stat.iconColor} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono-numbers block">
                  {stat.value}
                </span>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Orders Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Live Order Queue"
            subtitle="Real-time order statuses across Dine-in, Takeaway, and Delivery channels"
            icon={<Activity className="w-4 h-4" />}
            action={
              <Button
                variant="ghost"
                size="xs"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/orders')}
              >
                View POS Board
              </Button>
            }
            className="!p-0"
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Ticket</th>
                    <th>Destination</th>
                    <th>Staff / Channel</th>
                    <th>Total Bill</th>
                    <th>Status</th>
                    <th className="text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {liveOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-extrabold text-indigo-600 font-mono-numbers text-xs">
                        {order.id}
                      </td>
                      <td>
                        <span className="font-bold text-slate-900 block">
                          {order.target}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {order.type} &bull; {order.items} items
                        </span>
                      </td>
                      <td className="text-xs font-medium text-slate-600">
                        {order.waiter}
                      </td>
                      <td className="font-extrabold text-slate-900 font-mono-numbers text-xs">
                        {order.total}
                      </td>
                      <td>
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="text-right text-xs font-mono text-slate-400">
                        {order.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Launchpad & Health Check */}
        <div className="space-y-6">
          <Card
            title="Quick Launchpad"
            subtitle="Instant shortcuts to operational modules"
            icon={<Layers className="w-4 h-4" />}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-slate-900">POS Checkout</span>
                <span className="block text-[10px] text-slate-500">Take customer order</span>
              </button>

              <button
                onClick={() => navigate('/tables')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50 hover:border-emerald-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-slate-900">Floor Layout</span>
                <span className="block text-[10px] text-slate-500">Manage 22 tables</span>
              </button>

              <button
                onClick={() => navigate('/users')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-purple-50 hover:border-purple-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-slate-900">Staff Access</span>
                <span className="block text-[10px] text-slate-500">Roles & permissions</span>
              </button>

              <button
                onClick={() => navigate('/settings/restaurant')}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50 hover:border-amber-200 text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ChefHat className="w-4 h-4" />
                </div>
                <span className="block text-xs font-bold text-slate-900">Store Setup</span>
                <span className="block text-[10px] text-slate-500">Receipts & taxes</span>
              </button>
            </div>
          </Card>

          {/* Engine Status Card */}
          <Card
            title="System Telemetry"
            subtitle="Platform architecture readiness"
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  MySQL Database Engine
                </span>
                <Badge variant="success" size="xs">Connected</Badge>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Granular RBAC Security
                </span>
                <Badge variant="accent" size="xs">70 Permissions Active</Badge>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  POS Offline Sync Engine
                </span>
                <Badge variant="warning" size="xs">Ready</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
