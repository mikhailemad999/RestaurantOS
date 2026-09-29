import React, { useState } from 'react'
import {
  Tag, Percent, Gift, Sparkles, CheckCircle2,
  XCircle, Copy, Plus, Trash2, ArrowRight,
  TrendingUp, Calendar, AlertCircle, ShoppingBag
} from 'lucide-react'
import {
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useValidatePromoMutation,
  Promotion
} from '@/api/promotionsApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export const PromotionsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Sandbox Tester state
  const [testCode, setTestCode] = useState('HAPPY20')
  const [testAmount, setTestAmount] = useState('85.00')
  const [testChannel, setTestChannel] = useState('ALL')
  const [testResult, setTestResult] = useState<any>(null)

  // New promo form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('15')
  const [minOrder, setMinOrder] = useState('30')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [usageLimit, setUsageLimit] = useState('200')
  const [targetChannel, setTargetChannel] = useState<'ALL' | 'DINE_IN' | 'TAKEOUT' | 'DELIVERY'>('ALL')

  const { data: promotions = [], isLoading, refetch } = useGetPromotionsQuery()
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation()
  const [updatePromotion] = useUpdatePromotionMutation()
  const [deletePromotion] = useDeletePromotionMutation()
  const [validatePromo, { isLoading: isValidating }] = useValidatePromoMutation()

  const activePromos = promotions.filter((p) => p.is_active)
  const totalRedemptions = promotions.reduce((sum, p) => sum + p.times_used, 0)

  const handleCopyCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode)
    setCopiedCode(promoCode)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleActive = async (promo: Promotion) => {
    try {
      await updatePromotion({ id: promo.id, is_active: !promo.is_active }).unwrap()
      refetch()
    } catch {
      alert('Failed to update promotion status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return
    try {
      await deletePromotion(id).unwrap()
      refetch()
    } catch {
      alert('Failed to delete promotion')
    }
  }

  const handleTestCoupon = async () => {
    try {
      const res = await validatePromo({
        code: testCode,
        order_amount: parseFloat(testAmount) || 0,
        order_type: testChannel,
      }).unwrap()
      setTestResult(res)
    } catch (err: any) {
      setTestResult({
        valid: false,
        message: err?.data?.message || 'Invalid promotion or coupon code',
      })
    }
  }

  const handleCreate = async () => {
    if (!name || !code || !discountValue) {
      alert('Please fill out all required fields')
      return
    }

    try {
      await createPromotion({
        name,
        code: code.trim().toUpperCase(),
        description,
        discount_type: discountType,
        discount_value: discountValue,
        min_order_amount: minOrder || '0.00',
        max_discount_amount: maxDiscount ? maxDiscount : null,
        usage_limit: parseInt(usageLimit) || 100,
        applicable_order_types: targetChannel,
        is_active: true,
      }).unwrap()

      setIsCreateModalOpen(false)
      setName('')
      setCode('')
      setDescription('')
      refetch()
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create promotion')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Tag className="w-7 h-7 text-indigo-600" />
            Promotions & Discount Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure coupons, happy hour pricing rules, item bundles, and real-time checkout validator
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Campaigns</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">{activePromos.length}</span>
            <span className="text-[11px] text-slate-400">Out of {promotions.length} total rules</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Redemptions</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">{totalRedemptions}</span>
            <span className="text-[11px] text-slate-400">Customer checkout conversions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Promo Formats</span>
            <span className="text-2xl font-extrabold text-purple-600 mt-0.5 block">3 Types</span>
            <span className="text-[11px] text-slate-400">Percentage, Fixed $ & BOGO</span>
          </div>
        </div>
      </div>

      {/* Interactive Coupon Validation Sandbox */}
      <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 border border-indigo-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Live Coupon Discount Simulator</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            Checkout Engine API
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Promo Code
            </label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="e.g. HAPPY20"
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Order Subtotal ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              placeholder="85.00"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Order Channel
            </label>
            <select
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="ALL">All Channels</option>
              <option value="DINE_IN">Dine-In Only</option>
              <option value="TAKEOUT">Takeout Only</option>
              <option value="DELIVERY">Delivery Only</option>
            </select>
          </div>

          <div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTestCoupon}
              disabled={isValidating}
              className="w-full h-9 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              {isValidating ? 'Validating...' : 'Test & Calculate'}
            </Button>
          </div>
        </div>

        {/* Simulator Result Banner */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-xl border text-xs flex items-center justify-between gap-4 ${
            testResult.valid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {testResult.valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">{testResult.message}</span>
                {testResult.valid && (
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Original: ${testAmount} &rarr; Discount: -${testResult.discount_amount}
                  </p>
                )}
              </div>
            </div>

            {testResult.valid && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Final Order Total</span>
                <span className="text-base font-extrabold text-emerald-800">${testResult.final_amount}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
              promo.is_active ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
            }`}
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  promo.discount_type === 'PERCENTAGE'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : promo.discount_type === 'BOGO'
                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                  {promo.discount_type === 'PERCENTAGE' && `${promo.discount_value}% OFF`}
                  {promo.discount_type === 'FIXED_AMOUNT' && `$${promo.discount_value} OFF`}
                  {promo.discount_type === 'BOGO' && 'BOGO DEAL'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(promo)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      promo.is_active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {promo.is_active ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-bold text-slate-900 text-sm mb-1">{promo.name}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{promo.description || 'No description provided'}</p>

              {/* Promo Code Pill with Copy */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                <span className="font-mono font-extrabold text-sm text-indigo-700 tracking-wider">
                  {promo.code}
                </span>
                <button
                  onClick={() => handleCopyCode(promo.code)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedCode === promo.code ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Criteria details */}
              <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Order:</span>
                  <span className="font-semibold">${promo.min_order_amount}</span>
                </div>
                {promo.max_discount_amount && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Discount:</span>
                    <span className="font-semibold">${promo.max_discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Channel:</span>
                  <span className="font-semibold">{promo.applicable_order_types.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Usage Progress */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                <span>Redemptions</span>
                <span className="font-bold text-slate-800">
                  {promo.times_used} / {promo.usage_limit}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{ width: `${Math.min(100, (promo.times_used / promo.usage_limit) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Campaign */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Promotional Discount Rule"
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Campaign Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Late Night Happy Hour"
          />

          <Input
            label="Voucher / Coupon Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. NIGHT20"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="PERCENTAGE">Percentage Discount (%)</option>
              <option value="FIXED_AMOUNT">Fixed Dollar Off ($)</option>
              <option value="BOGO">Buy One Get One (50% Off)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Value ($)'}
              type="number"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="15"
            />
            <Input
              label="Minimum Order Subtotal ($)"
              type="number"
              step="0.01"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              placeholder="30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Discount Cap ($)"
              type="number"
              step="0.01"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="Optional cap (e.g. 50)"
            />
            <Input
              label="Max Total Redemptions"
              type="number"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Applicable Channels</label>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(e.target.value as any)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="ALL">All Order Types (Dine-in, Takeout, Delivery)</option>
              <option value="DINE_IN">Dine-In Tables Only</option>
              <option value="TAKEOUT">Takeout / Pickup Only</option>
              <option value="DELIVERY">Delivery Hub Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Valid on all pizzas and beverages after 9pm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating Campaign...' : 'Publish Campaign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PromotionsPage
