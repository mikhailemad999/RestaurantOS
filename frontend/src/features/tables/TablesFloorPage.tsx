import React, { useState } from 'react'
import {
  Users, DollarSign, Clock, Sparkles, CheckCircle2,
  AlertCircle, RefreshCw, Layers, Plus
} from 'lucide-react'
import { useGetFloorsQuery, useUpdateTableStatusMutation, Table } from '@/api/tablesApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const TablesFloorPage: React.FC = () => {
  const [selectedFloorId, setSelectedFloorId] = useState<string>('')
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  const { data: floors = [], isLoading, refetch } = useGetFloorsQuery()
  const [updateTableStatus, { isLoading: isUpdating }] = useUpdateTableStatusMutation()

  const currentFloor = floors.find((f) => f.id === selectedFloorId) || floors[0]
  const currentTables = currentFloor?.tables || []

  // Status Color Mapping
  const getStatusStyles = (status: Table['status']) => {
    switch (status) {
      case 'OCCUPIED':
        return {
          bg: 'bg-indigo-50/80 border-indigo-300 text-indigo-900 shadow-sm',
          dot: 'bg-indigo-600',
          label: 'Occupied',
        }
      case 'BILLED':
        return {
          bg: 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-sm',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Billed',
        }
      case 'RESERVED':
        return {
          bg: 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-sm',
          dot: 'bg-purple-600',
          label: 'Reserved',
        }
      case 'DIRTY':
        return {
          bg: 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-sm',
          dot: 'bg-rose-600',
          label: 'Needs Bus',
        }
      case 'VACANT':
      default:
        return {
          bg: 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400',
          dot: 'bg-emerald-500',
          label: 'Vacant',
        }
    }
  }

  const handleOpenStatusModal = (table: Table) => {
    setSelectedTable(table)
    setIsStatusModalOpen(true)
  }

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedTable) return
    try {
      await updateTableStatus({ id: selectedTable.id, status: newStatus }).unwrap()
      setIsStatusModalOpen(false)
      refetch()
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to update table status')
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Table & Floor Plan
            </h1>
            <Badge variant="accent" size="sm">
              {currentTables.length} Tables Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time floor occupancy, server table assignments, and guest turnaround status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>
            Refresh Canvas
          </Button>
        </div>
      </div>

      {/* Floor Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {floors.map((fl) => {
          const isSelected = (currentFloor?.id === fl.id)
          return (
            <button
              key={fl.id}
              onClick={() => setSelectedFloorId(fl.id)}
              className={`
                px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-2
                ${isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{fl.name} (Level {fl.level})</span>
            </button>
          )
        })}
      </div>

      {/* Floor Canvas Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {currentTables.map((tbl) => {
          const style = getStatusStyles(tbl.status)
          return (
            <div
              key={tbl.id}
              onClick={() => handleOpenStatusModal(tbl)}
              className={`
                relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-200 cursor-pointer
                aspect-square select-none group hover:shadow-md
                ${style.bg}
              `}
            >
              {/* Top Row: Table Number & Status Pill */}
              <div className="flex items-start justify-between">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {tbl.table_number}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/50 shadow-2xs">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
              </div>

              {/* Middle Section: Server & Guests */}
              <div className="my-auto">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {tbl.status === 'OCCUPIED' ? `${tbl.current_guest_count} / ${tbl.capacity} Guests` : `${tbl.capacity} Seats`}
                  </span>
                </div>
                {tbl.assigned_server && (
                  <p className="text-[11px] font-bold text-slate-500 mt-1">
                    Server: {tbl.assigned_server}
                  </p>
                )}
              </div>

              {/* Bottom: Current Total Check */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {tbl.status === 'OCCUPIED' || tbl.status === 'BILLED' ? 'Current Tab' : 'Shape'}
                </span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {tbl.status === 'OCCUPIED' || tbl.status === 'BILLED'
                    ? `$${tbl.current_order_total}`
                    : tbl.shape}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── MODAL: Change Table Status ──────────────────────────────────────── */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Manage Table ${selectedTable?.table_number}`}
        description="Change table state or clear tab upon guest departure."
        maxWidth="md"
      >
        {selectedTable && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Floor Location:</span>
                <span className="font-bold text-slate-900">{selectedTable.floor_name || currentFloor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-bold text-slate-900">{selectedTable.capacity} Guests</span>
              </div>
              {selectedTable.assigned_server && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Server:</span>
                  <span className="font-bold text-slate-900">{selectedTable.assigned_server}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase text-slate-500">
                Set Table Status:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'VACANT', label: '🟢 Vacant / Available' },
                  { key: 'OCCUPIED', label: '🔵 Occupied / Seated' },
                  { key: 'BILLED', label: '🟡 Billed / Paying' },
                  { key: 'RESERVED', label: '🟣 Reserved' },
                  { key: 'DIRTY', label: '🔴 Needs Bus / Cleaning' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => handleChangeStatus(st.key)}
                    className={`
                      p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer
                      ${selectedTable.status === st.key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
