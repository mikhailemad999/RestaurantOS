import React, { useState } from 'react'
import {
  Package, AlertTriangle, CheckCircle2, ArrowUpDown,
  Plus, RefreshCw, Truck, DollarSign, Search
} from 'lucide-react'
import {
  useGetInventoryItemsQuery,
  useGetSuppliersQuery,
  useAdjustStockMutation,
  useCreateInventoryItemMutation,
  InventoryItem
} from '@/api/inventoryApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustDelta, setAdjustDelta] = useState<string>('')

  const { data: items = [], isLoading, refetch } = useGetInventoryItemsQuery()
  const { data: suppliers = [] } = useGetSuppliersQuery()
  const [adjustStock, { isLoading: isAdjusting }] = useAdjustStockMutation()

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.supplier_name && i.supplier_name.toLowerCase().includes(search.toLowerCase()))
  )

  const lowStockCount = items.filter((i) => i.is_low_stock).length

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustDelta('')
    setIsAdjustModalOpen(true)
  }

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !adjustDelta) return
    try {
      await adjustStock({ id: selectedItem.id, delta: parseFloat(adjustDelta) }).unwrap()
      setIsAdjustModalOpen(false)
      refetch()
    } catch (err: any) {
      alert('Failed to adjust stock')
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inventory & Stock Control
            </h1>
            {lowStockCount > 0 ? (
              <Badge variant="danger" size="sm">
                {lowStockCount} Low Stock Warnings
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                All Stocks Healthy
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time kitchen raw ingredient levels, par thresholds, and purchase order tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>
            Refresh Stock
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          placeholder="Search ingredients or supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Ingredient Name</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6">Par Safety Level</th>
                <th className="py-4 px-6">Cost / Unit</th>
                <th className="py-4 px-6">Supplier</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map((item) => {
                const stockVal = parseFloat(item.current_stock)
                const parVal = parseFloat(item.par_level)
                const percent = Math.min(100, Math.round((stockVal / parVal) * 100))

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-xs">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Unit: {item.unit}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {item.current_stock} {item.unit}
                        </span>
                        {item.is_low_stock && (
                          <span className="p-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200" title="Low Stock">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-500">
                        {item.par_level} {item.unit}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-800">
                        ${item.cost_per_unit}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-600">
                        {item.supplier_name || 'Direct Wholesale'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer transition-all"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: Adjust Stock ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedItem?.name}`}
        description={`Current Stock: ${selectedItem?.current_stock} ${selectedItem?.unit}`}
        footer={
          <Button variant="primary" size="md" isLoading={isAdjusting} onClick={handleSaveAdjustment}>
            Confirm Adjustment
          </Button>
        }
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4">
          <Input
            label={`Stock Delta (${selectedItem?.unit}) — use + for intake, - for waste`}
            type="number"
            step="0.1"
            value={adjustDelta}
            onChange={(e) => setAdjustDelta(e.target.value)}
            placeholder="+10.0 or -2.5"
            required
          />
        </form>
      </Modal>
    </div>
  )
}
