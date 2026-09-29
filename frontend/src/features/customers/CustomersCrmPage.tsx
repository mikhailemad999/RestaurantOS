import React, { useState } from 'react'
import {
  Users, Crown, Gift, Sparkles, Heart,
  Phone, Mail, RefreshCw, Plus, Award
} from 'lucide-react'
import {
  useGetCustomersQuery,
  useAddLoyaltyPointsMutation,
  useCreateCustomerMutation,
  Customer
} from '@/api/customersApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export const CustomersCrmPage: React.FC = () => {
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false)
  const [pointsToAdd, setPointsToAdd] = useState('100')

  const { data: customers = [], isLoading, refetch } = useGetCustomersQuery()
  const [addLoyaltyPoints, { isLoading: isAdding }] = useAddLoyaltyPointsMutation()

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const getTierBadge = (tier: Customer['tier']) => {
    switch (tier) {
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'GOLD':
        return 'bg-amber-100 text-amber-900 border-amber-200'
      case 'SILVER':
        return 'bg-slate-200 text-slate-800 border-slate-300'
      case 'BRONZE':
      default:
        return 'bg-amber-50 text-amber-800 border-amber-100'
    }
  }

  const handleOpenPoints = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPointsToAdd('100')
    setIsPointsModalOpen(true)
  }

  const handleSavePoints = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomer || !pointsToAdd) return
    try {
      await addLoyaltyPoints({ id: selectedCustomer.id, points: parseInt(pointsToAdd) || 0 }).unwrap()
      setIsPointsModalOpen(false)
      refetch()
    } catch (err: any) {
      alert('Failed to update loyalty points')
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer & Loyalty CRM
            </h1>
            <Badge variant="accent" size="sm">
              {customers.length} VIP Members
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Guest directory, lifetime spend, VIP reward tiers, and automated promotion rewards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => refetch()}>
            Refresh CRM
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          placeholder="Search VIP customer by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white"
        />
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-indigo-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm">
                  {cust.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{cust.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{cust.phone}</span>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shadow-2xs ${getTierBadge(cust.tier)}`}>
                {cust.tier}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Spent</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">${cust.total_spent}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Visits</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">{cust.total_visits}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Points</span>
                <span className="text-sm font-extrabold font-mono text-indigo-600">{cust.loyalty_points}</span>
              </div>
            </div>

            {cust.notes && (
              <p className="text-xs text-slate-500 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80">
                "{cust.notes}"
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400">Fav: {cust.favorite_dish}</span>
              <button
                onClick={() => handleOpenPoints(cust)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
              >
                + Issue Points / Reward
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── MODAL: Issue Points ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        title={`Loyalty Points: ${selectedCustomer?.name}`}
        description={`Current Balance: ${selectedCustomer?.loyalty_points} points`}
        footer={
          <Button variant="primary" size="md" isLoading={isAdding} onClick={handleSavePoints}>
            Grant Points
          </Button>
        }
      >
        <form onSubmit={handleSavePoints} className="space-y-4">
          <Input
            label="Bonus Loyalty Points to Award"
            type="number"
            value={pointsToAdd}
            onChange={(e) => setPointsToAdd(e.target.value)}
            placeholder="100"
            required
          />
        </form>
      </Modal>
    </div>
  )
}
