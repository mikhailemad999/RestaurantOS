import React, { useState, useMemo } from 'react'
import {
  Search, Plus, Minus, Trash2, ShoppingCart,
  CreditCard, Banknote, Split, Send, Clock,
  CheckCircle2, X, AlertCircle, Sparkles, User,
  UtensilsCrossed
} from 'lucide-react'
import { useGetCategoriesQuery, useGetMenuItemsQuery, MenuItem, ItemVariant } from '@/api/menuApi'
import { useGetTablesQuery } from '@/api/tablesApi'
import { useCreateOrderMutation } from '@/api/ordersApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

interface CartItem {
  id: string
  menuItem: MenuItem
  variant: ItemVariant | null
  quantity: number
  unitPrice: number
  totalPrice: number
  instructions: string
}

export const PosTerminalPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTable, setSelectedTable] = useState<string>('T-01')
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEOUT' | 'DELIVERY'>('DINE_IN')
  const [guestCount, setGuestCount] = useState(2)

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([])
  const [discountPercent, setDiscountPercent] = useState<number>(0)
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('')

  // Item Customization Modal
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const [pickedVariant, setPickedVariant] = useState<ItemVariant | null>(null)
  const [pickedModifiers, setPickedModifiers] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [qty, setQty] = useState(1)

  // Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payMethod, setPayMethod] = useState<'CARD' | 'CASH' | 'SPLIT'>('CARD')

  // API Hooks
  const { data: categories = [] } = useGetCategoriesQuery()
  const { data: menuItems = [] } = useGetMenuItemsQuery()
  const { data: tables = [] } = useGetTablesQuery()
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation()

  // Filtered menu
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory
      const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0)
  }, [cart])

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100
  }, [subtotal, discountPercent])

  const taxAmount = useMemo(() => {
    return (subtotal - discountAmount) * 0.085 // 8.5% Sales Tax
  }, [subtotal, discountAmount])

  const totalAmount = useMemo(() => {
    return subtotal - discountAmount + taxAmount
  }, [subtotal, discountAmount, taxAmount])

  // Open item modal
  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item)
    setPickedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : null)
    setPickedModifiers([])
    setNotes('')
    setQty(1)
    setIsCustomizeOpen(true)
  }

  const handleAddToCart = () => {
    if (!activeItem) return

    let unit = pickedVariant ? parseFloat(pickedVariant.price) : parseFloat(activeItem.base_price)
    if (activeItem.modifier_groups) {
      for (const group of activeItem.modifier_groups) {
        for (const opt of group.options) {
          if (pickedModifiers.includes(opt.id)) {
            unit += parseFloat(opt.price)
          }
        }
      }
    }

    const newItem: CartItem = {
      id: `${activeItem.id}-${pickedVariant?.id || 'std'}-${Date.now()}`,
      menuItem: activeItem,
      variant: pickedVariant,
      quantity: qty,
      unitPrice: unit,
      totalPrice: unit * qty,
      instructions: notes,
    }

    setCart([...cart, newItem])
    setIsCustomizeOpen(false)
  }

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
              : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const handleFireToKitchen = async () => {
    if (cart.length === 0) return

    try {
      await createOrder({
        table: tables.find((t) => t.table_number === selectedTable)?.id || null,
        order_type: orderType,
        guest_count: guestCount,
        subtotal: subtotal.toFixed(2),
        tax_amount: taxAmount.toFixed(2),
        discount_amount: discountAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        items: cart.map((c) => ({
          menu_item: c.menuItem.id,
          variant: c.variant?.id || null,
          quantity: c.quantity,
          unit_price: c.unitPrice.toFixed(2),
          total_price: c.totalPrice.toFixed(2),
          special_instructions: c.instructions,
        })),
      }).unwrap()

      setOrderSuccessMsg(`Order Fired to Kitchen! Ticket #${Math.floor(100 + Math.random() * 900)} for ${selectedTable}`)
      setCart([])
      setTimeout(() => setOrderSuccessMsg(''), 4000)
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit order to kitchen')
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-140px)] animate-entrance">
      {/* ─── LEFT: Terminal Menu & Catalog ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Terminal Header & Mode Bar */}
        <div className="bg-white p-5 rounded-3xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo-500/20">
              01
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                POS Terminal 01
              </h2>
              <p className="text-xs text-slate-400">Cashier: Owner Admin (Shift #402)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {(['DINE_IN', 'TAKEOUT', 'DELIVERY'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer
                  ${orderType === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                  }
                `}
              >
                {type === 'DINE_IN' ? '🍽️ Dine-In' : type === 'TAKEOUT' ? '🛍️ Takeout' : '🛵 Delivery'}
              </button>
            ))}
          </div>

          {orderType === 'DINE_IN' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Table:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
              >
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.table_number}>
                    {tbl.table_number} ({tbl.capacity}p - {tbl.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Category Horizontal Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 border
              ${selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }
            `}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`
                px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 border
                ${selectedCategory === c.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }
              `}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <input
            type="text"
            placeholder="Fast search menu items (e.g. pizza, burger, pasta)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        {/* Big Square Item Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto max-h-[600px] pr-1">
          {filteredItems.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0
            const startingPrice = hasVariants ? item.variants[0].price : item.base_price

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-150 cursor-pointer aspect-square select-none"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-100">
                    {item.category_name || 'Item'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.prep_time_minutes}m
                  </span>
                </div>

                <div className="my-auto py-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {item.description || 'Fresh kitchen dish'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900 font-mono-numbers">
                    ${startingPrice}
                  </span>
                  <span className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── RIGHT: Active Order Ticket Side Panel ───────────────────────────── */}
      <div className="w-full lg:w-96 bg-white rounded-3xl border border-[#E2E8F0] shadow-md flex flex-col justify-between overflow-hidden">
        {/* Ticket Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active POS Ticket
            </span>
            <Badge variant="accent" size="sm">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">
              {orderType === 'DINE_IN' ? `Table ${selectedTable}` : orderType}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {orderSuccessMsg && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-entrance">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
        )}

        {/* Ticket Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 max-h-[380px]">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-slate-600">Ticket is currently empty</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click any menu item to configure & add</p>
            </div>
          ) : (
            cart.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900">
                      {c.menuItem.name}
                    </span>
                    {c.variant && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {c.variant.name}
                      </span>
                    )}
                  </div>
                  {c.instructions && (
                    <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                      Note: {c.instructions}
                    </p>
                  )}
                  <span className="text-xs font-extrabold text-indigo-600 font-mono-numbers mt-1 block">
                    ${c.totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1.5 py-1">
                  <button
                    onClick={() => handleUpdateQty(c.id, -1)}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1.5 text-xs font-mono font-bold text-slate-800">
                    {c.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(c.id, 1)}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Financials & Tender Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-mono font-bold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (8.5%)</span>
              <span className="font-mono font-bold text-slate-800">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Balance</span>
              <span className="font-mono font-extrabold text-indigo-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="md"
              icon={<Send className="w-4 h-4 text-emerald-600" />}
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleFireToKitchen}
            >
              Fire Kitchen
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<CreditCard className="w-4 h-4 text-white" />}
              disabled={cart.length === 0}
              onClick={() => setIsPayModalOpen(true)}
            >
              Pay ${totalAmount.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── MODAL: Item Customizer ─────────────────────────────────────────── */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title={activeItem?.name || 'Customize Dish'}
        description="Select portion size, extra toppings, and chef notes."
        footer={
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4 text-white" />}
            onClick={handleAddToCart}
          >
            Add to Order
          </Button>
        }
      >
        {activeItem && (
          <div className="space-y-5">
            {activeItem.variants && activeItem.variants.length > 0 && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {activeItem.variants.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setPickedVariant(v)}
                      className={`p-3 rounded-2xl border cursor-pointer select-none text-center ${
                        pickedVariant?.id === v.id
                          ? 'bg-indigo-50 border-indigo-600 font-bold text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-xs">{v.name}</span>
                      <span className="block text-sm font-mono font-extrabold text-indigo-600 mt-0.5">
                        ${v.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1.5">
                Special Kitchen Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra crispy, dressing on side..."
                className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-indigo-600 bg-white"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL: Fast Payment Tender ─────────────────────────────────────── */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Fast Payment Tender"
        description={`Charge Total Amount: $${totalAmount.toFixed(2)}`}
        footer={
          <Button
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4 text-white" />}
            onClick={() => {
              setIsPayModalOpen(false)
              handleFireToKitchen()
            }}
          >
            Complete Tender & Print Receipt
          </Button>
        }
      >
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <span className="text-xs font-bold text-slate-500 uppercase block">Amount Due</span>
            <span className="text-3xl font-extrabold text-indigo-600 font-mono-numbers">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'CARD', label: 'Credit Card', icon: CreditCard },
              { id: 'CASH', label: 'Cash Exact', icon: Banknote },
              { id: 'SPLIT', label: 'Split Bill', icon: Split },
            ].map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.id}
                  onClick={() => setPayMethod(method.id as any)}
                  className={`p-4 rounded-2xl border cursor-pointer text-center select-none transition-all ${
                    payMethod === method.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-1.5" />
                  <span className="text-xs">{method.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
