import React from 'react'
import {
  Clock, CheckCircle2, AlertTriangle, Flame,
  RefreshCw, ChefHat, Check, ArrowRight
} from 'lucide-react'
import {
  useGetKitchenKdsQuery,
  useUpdateOrderStatusMutation,
  useToggleOrderItemCompletedMutation,
  Order
} from '@/api/ordersApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const KitchenKdsPage: React.FC = () => {
  const { data: kdsOrders = [], isLoading, refetch } = useGetKitchenKdsQuery()
  const [updateOrderStatus] = useUpdateOrderStatusMutation()
  const [toggleItemCompleted] = useToggleOrderItemCompletedMutation()

  const getTimerBadge = (minutes: number) => {
    if (minutes > 20) {
      return {
        bg: 'bg-rose-500 text-white animate-pulse',
        icon: AlertTriangle,
        label: `${minutes}m OVERDUE`,
      }
    }
    if (minutes >= 10) {
      return {
        bg: 'bg-amber-500 text-white',
        icon: Clock,
        label: `${minutes}m PREP`,
      }
    }
    return {
      bg: 'bg-emerald-600 text-white',
      icon: Clock,
      label: `${minutes}m FRESH`,
    }
  }

  const handleBumpOrder = async (order: Order) => {
    const nextStatus = order.status === 'SENT_TO_KITCHEN'
      ? 'PREPARING'
      : order.status === 'PREPARING'
      ? 'READY'
      : 'SERVED'

    try {
      await updateOrderStatus({ id: order.id, status: nextStatus }).unwrap()
      refetch()
    } catch (err: any) {
      alert('Failed to bump order')
    }
  }

  const handleToggleItem = async (orderId: string, itemId: string) => {
    try {
      await toggleItemCompleted({ orderId, itemId }).unwrap()
      refetch()
    } catch (err: any) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Kitchen Display System (KDS)
              </h1>
              <Badge variant="accent" size="sm">
                {kdsOrders.length} Active Tickets
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live prep line: Green &lt;10m, Amber 10-20m, Red &gt;20m. Tap items to strike through.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>
            Refresh KDS
          </Button>
        </div>
      </div>

      {/* KDS Bump Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold text-slate-700">Loading live kitchen line...</p>
          </div>
        ) : kdsOrders.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-extrabold text-slate-800">All Kitchen Orders Cleared</p>
            <p className="text-xs text-slate-400 mt-1">No pending food tickets in queue.</p>
          </div>
        ) : (
          kdsOrders.map((order) => {
            const timer = getTimerBadge(order.elapsed_minutes || 5)
            const TimerIcon = timer.icon

            return (
              <div
                key={order.id}
                className="flex flex-col justify-between bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
              >
                {/* Header Strip */}
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-none">
                      {order.order_type === 'DINE_IN' ? `Table ${order.table_number || 'T-?'}` : order.order_type}
                    </span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      #{order.order_number}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shadow-2xs ${timer.bg}`}>
                    <TimerIcon className="w-3.5 h-3.5" />
                    {timer.label}
                  </span>
                </div>

                {/* Notes if any */}
                {order.kitchen_notes && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-[11px] font-bold text-amber-900 flex items-start gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{order.kitchen_notes}</span>
                  </div>
                )}

                {/* Items Checklist */}
                <div className="p-4 flex-1 space-y-2.5 min-h-[160px]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(order.id, item.id)}
                      className={`
                        p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-2
                        ${item.is_completed_in_kitchen
                          ? 'bg-emerald-50/50 border-emerald-200 opacity-50'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs mt-0.5 ${
                            item.is_completed_in_kitchen
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-slate-50 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className={`text-xs font-extrabold text-slate-900 block ${item.is_completed_in_kitchen ? 'line-through text-slate-400' : ''}`}>
                            {item.quantity}x {item.menu_item_name}
                          </span>
                          {item.variant_name && (
                            <span className="text-[10px] font-bold text-indigo-600 block">
                              Size: {item.variant_name}
                            </span>
                          )}
                          {item.special_instructions && (
                            <span className="text-[10px] text-amber-700 italic block">
                              {item.special_instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Bump Button */}
                <div className="p-3 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => handleBumpOrder(order)}
                    className={`
                      w-full py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2
                      ${order.status === 'READY'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-indigo-600 text-white'
                      }
                    `}
                  >
                    <span>
                      {order.status === 'SENT_TO_KITCHEN'
                        ? 'Start Preparing'
                        : order.status === 'PREPARING'
                        ? 'Mark Ready to Serve'
                        : 'Bump Order & Clear'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
