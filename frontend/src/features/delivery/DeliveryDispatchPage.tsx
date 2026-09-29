import React, { useState } from 'react'
import {
  Truck, Navigation, Clock, CheckCircle2,
  MapPin, Phone, RefreshCw, UserCheck
} from 'lucide-react'
import {
  useGetDeliveriesQuery,
  useGetDriversQuery,
  useAssignDriverMutation,
  useUpdateDeliveryStageMutation,
  DeliveryOrder
} from '@/api/deliveryApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const DeliveryDispatchPage: React.FC = () => {
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState('')

  const { data: deliveries = [], isLoading, refetch } = useGetDeliveriesQuery()
  const { data: drivers = [] } = useGetDriversQuery()
  const [assignDriver, { isLoading: isAssigning }] = useAssignDriverMutation()
  const [updateStage] = useUpdateDeliveryStageMutation()

  const stages = [
    { key: 'RECEIVED', label: '1. New Orders', bg: 'bg-slate-100 text-slate-700' },
    { key: 'PREPARING', label: '2. In Kitchen', bg: 'bg-amber-50 text-amber-800' },
    { key: 'READY_FOR_PICKUP', label: '3. Ready for Driver', bg: 'bg-indigo-50 text-indigo-800' },
    { key: 'OUT_FOR_DELIVERY', label: '4. Out on Route', bg: 'bg-purple-50 text-purple-800' },
    { key: 'DELIVERED', label: '5. Delivered', bg: 'bg-emerald-50 text-emerald-800' },
  ]

  const handleOpenAssign = (del: DeliveryOrder) => {
    setSelectedDelivery(del)
    setSelectedDriverId(drivers[0]?.id || '')
    setIsAssignModalOpen(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedDelivery || !selectedDriverId) return
    try {
      await assignDriver({ deliveryId: selectedDelivery.id, driverId: selectedDriverId }).unwrap()
      setIsAssignModalOpen(false)
      refetch()
    } catch (err: any) {
      alert('Failed to assign driver')
    }
  }

  const handleAdvanceStage = async (deliveryId: string, currentStage: string) => {
    const stageOrder = ['RECEIVED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED']
    const nextIdx = stageOrder.indexOf(currentStage) + 1
    if (nextIdx < stageOrder.length) {
      try {
        await updateStage({ deliveryId, stage: stageOrder[nextIdx] }).unwrap()
        refetch()
      } catch (err: any) {
        console.error(err)
      }
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Delivery Dispatch Board
            </h1>
            <Badge variant="accent" size="sm">
              {deliveries.length} Active Shipments
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Unified multi-channel dispatch across DoorDash, UberEats, Deliveroo, and In-House couriers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>
            Refresh Dispatch
          </Button>
        </div>
      </div>

      {/* Pipeline Kanban Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stages.map((st) => {
          const itemsInStage = deliveries.filter((d) => d.stage === st.key)

          return (
            <div key={st.key} className="flex flex-col bg-slate-50/80 rounded-3xl border border-slate-200 p-4 min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <span className="text-xs font-extrabold text-slate-800">{st.label}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {itemsInStage.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {itemsInStage.map((del) => (
                  <div
                    key={del.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {del.channel}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        ~{del.estimated_arrival_minutes}m
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Order #{del.order_details?.order_number || del.id.slice(0, 8)}
                      </span>
                      <p className="text-[11px] text-slate-500 flex items-start gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{del.delivery_address}</span>
                      </p>
                    </div>

                    {del.driver_name ? (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-800">🚴 {del.driver_name}</span>
                        <span className="font-mono text-slate-500">{del.driver_phone}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAssign(del)}
                        className="w-full py-1.5 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-bold hover:bg-indigo-50 cursor-pointer"
                      >
                        + Assign Courier
                      </button>
                    )}

                    <button
                      onClick={() => handleAdvanceStage(del.id, del.stage)}
                      className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Advance Stage →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── MODAL: Assign Driver ────────────────────────────────────────────── */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Courier Driver"
        description="Select an available driver from your fleet."
        footer={
          <Button variant="primary" size="md" isLoading={isAssigning} onClick={handleConfirmAssign}>
            Assign & Dispatch
          </Button>
        }
      >
        <div className="space-y-3">
          {drivers.map((drv) => (
            <div
              key={drv.id}
              onClick={() => setSelectedDriverId(drv.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between ${
                selectedDriverId === drv.id
                  ? 'bg-indigo-50 border-indigo-600 font-bold'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <span className="text-xs text-slate-900 block">{drv.name} ({drv.vehicle_type})</span>
                <span className="text-[10px] text-slate-400 font-mono">{drv.phone}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                drv.current_status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {drv.current_status}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
