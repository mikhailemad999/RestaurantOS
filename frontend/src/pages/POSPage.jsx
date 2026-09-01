import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Plus, Minus, Trash2, Send, CreditCard, 
  DollarSign, Sparkles, Tag, Users, Check, X,
  Clock, Flame, ShieldAlert, UtensilsCrossed, Receipt
} from 'lucide-react';

export default function POSPage() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Cart State
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('DINE_IN');
  const [selectedTable, setSelectedTable] = useState(null);
  const [guestCount, setGuestCount] = useState(2);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);

  // Modals
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [itemNotes, setItemNotes] = useState('');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsData, itemsData, tablesData] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
        api.getTables()
      ]);
      setCategories(catsData);
      setMenuItems(itemsData);
      setTables(tablesData);
      if (tablesData.length > 0) {
        setSelectedTable(tablesData[0].id);
      }
    } catch (err) {
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category_name === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenCustomizer = (item) => {
    if (!item.is_available) return;
    setCustomizingItem(item);
    setSelectedModifiers([]);
    setItemNotes('');
  };

  const handleAddToCart = () => {
    if (!customizingItem) return;

    const existingIndex = cart.findIndex(c => 
      c.id === customizingItem.id && 
      JSON.stringify(c.selectedModifiers) === JSON.stringify(selectedModifiers) &&
      c.notes === itemNotes
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        ...customizingItem,
        quantity: 1,
        selectedModifiers,
        notes: itemNotes
      }]);
    }

    setCustomizingItem(null);
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setTipAmount(0);
    setSpecialInstructions('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const modTotal = (item.selectedModifiers || []).reduce((mAcc, m) => mAcc + parseFloat(m.price_extra || 0), 0);
    return acc + (parseFloat(item.price) + modTotal) * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * 0.0825;
  const total = taxableAmount + taxAmount + tipAmount;

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;

    const payload = {
      order_type: orderType,
      table_id: orderType === 'DINE_IN' ? selectedTable : null,
      server_id: currentUser?.id,
      guest_count: guestCount,
      discount_amount: discountAmount,
      tip_amount: tipAmount,
      payment_method: 'PENDING',
      payment_status: 'UNPAID',
      special_instructions: specialInstructions,
      items: cart.map(c => ({
        menu_item_id: c.id,
        quantity: c.quantity,
        selected_modifiers: c.selectedModifiers,
        notes: c.notes
      }))
    };

    try {
      const res = await api.createPosOrder(payload);
      setLastOrder(res);
      setActionSuccess(`Order #${res.order_number} sent to Kitchen KDS!`);
      clearCart();
      setTimeout(() => setActionSuccess(''), 4000);
      loadData(); // Refresh table status
    } catch (err) {
      alert(`Error submitting order: ${err.message}`);
    }
  };

  const handlePayNow = async () => {
    if (cart.length === 0) return;

    const payload = {
      order_type: orderType,
      table_id: orderType === 'DINE_IN' ? selectedTable : null,
      server_id: currentUser?.id,
      guest_count: guestCount,
      discount_amount: discountAmount,
      tip_amount: tipAmount,
      payment_method: paymentMethod,
      payment_status: 'PAID',
      special_instructions: specialInstructions,
      items: cart.map(c => ({
        menu_item_id: c.id,
        quantity: c.quantity,
        selected_modifiers: c.selectedModifiers,
        notes: c.notes
      }))
    };

    try {
      const res = await api.createPosOrder(payload);
      setLastOrder(res);
      setIsPayModalOpen(false);
      setIsReceiptOpen(true);
      clearCart();
      loadData();
    } catch (err) {
      alert(`Payment failed: ${err.message}`);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#131313]">
      {/* LEFT COLUMN: Categories & Menu Grid */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#2a2a2a]">
        {/* Top Controls & Category Tabs */}
        <div className="p-4 bg-[#1c1b1b] border-b border-[#2a2a2a] space-y-3">
          {/* Search Bar & Order Type */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish, steak, cocktail, SKU..."
                className="w-full bg-[#131313] border border-[#353535] focus:border-[#d4af37] text-white text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none placeholder:text-[#99907c]"
              />
            </div>

            {/* Order Type Toggle */}
            <div className="flex bg-[#131313] p-1 rounded-lg border border-[#353535]">
              {[
                { type: 'DINE_IN', label: 'Dine-In' },
                { type: 'TAKEOUT', label: 'Takeout' },
                { type: 'DELIVERY', label: 'Delivery' },
              ].map(t => (
                <button
                  key={t.type}
                  onClick={() => setOrderType(t.type)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                    orderType === t.type 
                      ? 'bg-[#d4af37] text-black shadow-sm' 
                      : 'text-[#d0c5af] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#20201f] text-[#d0c5af] hover:bg-[#2a2a2a] border border-[#353535]'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-[#d4af37] text-black font-bold'
                    : 'bg-[#20201f] text-[#d0c5af] hover:bg-[#2a2a2a] border border-[#353535]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Success Toast */}
        {actionSuccess && (
          <div className="bg-[#00a572]/20 border-b border-[#4edea3] text-[#4edea3] text-xs py-2 px-4 flex items-center gap-2 font-mono">
            <Check className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-[#99907c]">
              <span className="font-mono text-xs animate-pulse">Loading Menu Catalog from MySQL...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#99907c] gap-2">
              <UtensilsCrossed className="w-8 h-8 opacity-40" />
              <p className="text-xs">No menu items found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleOpenCustomizer(item)}
                  disabled={!item.is_available}
                  className={`bg-[#1c1b1b] border rounded-xl overflow-hidden text-left flex flex-col justify-between transition-all duration-150 p-2.5 group relative select-none ${
                    item.is_available 
                      ? 'border-[#2a2a2a] hover:border-[#d4af37] hover:shadow-gold cursor-pointer' 
                      : 'border-[#353535] opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="w-full h-28 rounded-lg bg-[#0e0e0e] overflow-hidden relative mb-2">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#99907c]">
                        <UtensilsCrossed className="w-6 h-6" />
                      </div>
                    )}

                    {/* Station Tag */}
                    <span className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur-sm text-[10px] font-mono px-2 py-0.5 rounded text-[#d0c5af] border border-white/10">
                      {item.station}
                    </span>

                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <span className="bg-[#93000a] text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                          86 / SOLD OUT
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-[#d4af37] line-clamp-1 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#99907c] line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Prep Time */}
                  <div className="mt-2.5 pt-2 border-t border-[#2a2a2a] flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-[#d4af37]">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-[#99907c] font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{item.prep_time_minutes}m</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart / Order Column */}
      <div className="w-full md:w-96 bg-[#1c1b1b] flex flex-col justify-between shrink-0 shadow-2xl border-l border-[#2a2a2a]">
        {/* Cart Header */}
        <div className="p-3.5 bg-[#20201f] border-b border-[#2a2a2a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4af37]"></span>
              <h2 className="font-bold text-sm text-white font-sans">Active Order</h2>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-[11px] text-[#ffb4ab] hover:underline font-mono flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Table / Guest selector if Dine-In */}
          {orderType === 'DINE_IN' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-mono text-[#99907c] uppercase">Dining Table:</label>
                <select
                  value={selectedTable || ''}
                  onChange={(e) => setSelectedTable(Number(e.target.value))}
                  className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded p-1.5 focus:outline-none focus:border-[#d4af37]"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Table {t.table_number} ({t.section_name}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#99907c] uppercase">Guests:</label>
                <div className="flex items-center bg-[#131313] border border-[#353535] rounded overflow-hidden">
                  <button 
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="px-2 py-1 hover:bg-[#2a2a2a] text-[#d0c5af]"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-mono text-xs font-bold text-white">
                    {guestCount}
                  </span>
                  <button 
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="px-2 py-1 hover:bg-[#2a2a2a] text-[#d0c5af]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#99907c] p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#131313] border border-[#353535] flex items-center justify-center text-[#d4af37] mb-2">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-white">Cart is empty</p>
              <p className="text-[11px] text-[#99907c] mt-1">Select items from the catalog on the left to build order.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const modTotal = (item.selectedModifiers || []).reduce((acc, m) => acc + parseFloat(m.price_extra || 0), 0);
              const linePrice = (parseFloat(item.price) + modTotal) * item.quantity;

              return (
                <div key={idx} className="bg-[#20201f] border border-[#2a2a2a] rounded-lg p-2.5 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{item.name}</h4>
                      <span className="text-[11px] font-mono text-[#d4af37]">
                        ${parseFloat(item.price).toFixed(2)} each
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-white">
                      ${linePrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Modifiers Pill List */}
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.selectedModifiers.map((m, mIdx) => (
                        <span key={mIdx} className="text-[10px] bg-[#131313] border border-[#353535] text-[#d0c5af] px-1.5 py-0.5 rounded font-mono">
                          +{m.name} {m.price_extra > 0 && `(+$${m.price_extra})`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-[10px] text-[#99907c] italic mt-1 font-mono">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a2a]">
                    <div className="flex items-center gap-1.5 bg-[#131313] border border-[#353535] rounded p-0.5">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-[#2a2a2a] text-[#d0c5af] rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-[#2a2a2a] text-[#d0c5af] rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-[#ffb4ab] hover:text-[#ff949c] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Summary & Order Actions */}
        <div className="p-3.5 bg-[#1c1b1b] border-t border-[#2a2a2a] space-y-3">
          {/* Quick Discount / Tip Row */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setDiscountPercent(discountPercent === 10 ? 0 : 10)}
              className={`flex-1 py-1 px-2 border rounded font-mono text-[11px] transition-colors ${
                discountPercent === 10 
                  ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                  : 'bg-[#20201f] border-[#353535] text-[#99907c] hover:text-white'
              }`}
            >
              10% Disc
            </button>
            <button
              onClick={() => setTipAmount(tipAmount === 15 ? 0 : 15)}
              className={`flex-1 py-1 px-2 border rounded font-mono text-[11px] transition-colors ${
                tipAmount === 15 
                  ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]' 
                  : 'bg-[#20201f] border-[#353535] text-[#99907c] hover:text-white'
              }`}
            >
              +$15 Tip
            </button>
          </div>

          {/* Numbers */}
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[#d0c5af]">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#ff949c]">
                <span>Discount ({discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#d0c5af]">
              <span>Tax (8.25%):</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-[#4edea3]">
                <span>Gratuity / Tip:</span>
                <span>+${tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-[#353535]">
              <span className="font-sans">Total Due:</span>
              <span className="text-[#d4af37]">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons: Kitchen vs Pay Now */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0}
              className="py-3 bg-[#2a2a2a] hover:bg-[#353535] disabled:opacity-40 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 border border-[#353535] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#d4af37]" />
              <span>Fire to KDS</span>
            </button>

            <button
              onClick={() => setIsPayModalOpen(true)}
              disabled={cart.length === 0}
              className="py-3 bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-gold transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-black" />
              <span>Pay Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMIZE MODIFIER MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#1c1b1b] border border-[#d4af37]/40 rounded-xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{customizingItem.name}</h3>
                <p className="text-xs font-mono text-[#d4af37] mt-0.5">${parseFloat(customizingItem.price).toFixed(2)}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Modifiers */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-2">Cooking Temperature / Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Rare', 'Medium Rare (Chef Rec.)', 'Medium', 'Well Done'].map(temp => {
                    const isSel = selectedModifiers.some(m => m.name === temp);
                    return (
                      <button
                        key={temp}
                        onClick={() => {
                          const withoutTemp = selectedModifiers.filter(m => !['Rare', 'Medium Rare (Chef Rec.)', 'Medium', 'Well Done'].includes(m.name));
                          setSelectedModifiers([...withoutTemp, { name: temp, price_extra: 0 }]);
                        }}
                        className={`p-2 rounded text-xs text-left font-semibold border transition-all ${
                          isSel 
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]' 
                            : 'bg-[#20201f] border-[#353535] text-[#d0c5af] hover:border-[#99907c]'
                        }`}
                      >
                        {temp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-2">Artisan Add-ons & Sauces:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Truffle Bearnaise', price: 4.00 },
                    { name: 'Cognac Peppercorn', price: 3.50 },
                    { name: 'Smoked Bone Marrow', price: 5.00 },
                    { name: 'Hand-carved Ice Sphere', price: 2.00 },
                  ].map(mod => {
                    const isSel = selectedModifiers.some(m => m.name === mod.name);
                    return (
                      <button
                        key={mod.name}
                        onClick={() => {
                          if (isSel) {
                            setSelectedModifiers(selectedModifiers.filter(m => m.name !== mod.name));
                          } else {
                            setSelectedModifiers([...selectedModifiers, { name: mod.name, price_extra: mod.price }]);
                          }
                        }}
                        className={`p-2 rounded text-xs flex justify-between items-center font-semibold border transition-all ${
                          isSel 
                            ? 'bg-[#4edea3]/20 border-[#4edea3] text-[#4edea3]' 
                            : 'bg-[#20201f] border-[#353535] text-[#d0c5af] hover:border-[#99907c]'
                        }`}
                      >
                        <span>{mod.name}</span>
                        <span className="font-mono text-[11px]">+${mod.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Special Chef Request / Allergies:</label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. Extra crispy, no garlic, dressing on the side..."
                  className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded p-2.5 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg uppercase tracking-wider shadow-gold"
            >
              Add to Order Cart
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Process Checkout</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#131313] p-4 rounded-xl border border-[#353535] mb-5 text-center">
              <span className="text-xs font-mono text-[#99907c] uppercase">Amount to Charge:</span>
              <div className="text-3xl font-extrabold text-[#d4af37] font-mono mt-1">
                ${total.toFixed(2)}
              </div>
              <p className="text-[11px] text-[#d0c5af] mt-1">{cart.length} item(s) • Tax & tip included</p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { method: 'CARD', label: 'Credit Card / NFC', icon: CreditCard },
                { method: 'CASH', label: 'Cash Drawer', icon: DollarSign },
                { method: 'POINTS', label: 'VIP Loyalty Pts', icon: Sparkles },
                { method: 'SPLIT', label: 'Split Bill (50/50)', icon: Users },
              ].map(p => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.method}
                    onClick={() => setPaymentMethod(p.method)}
                    className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === p.method
                        ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                        : 'bg-[#20201f] border-[#353535] text-[#d0c5af] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">{p.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handlePayNow}
              className="w-full py-3.5 bg-[#4edea3] hover:bg-[#34d399] text-[#003824] font-extrabold rounded-lg text-sm uppercase tracking-wider shadow-emerald transition-all"
            >
              Complete Payment (${total.toFixed(2)})
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {isReceiptOpen && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-5 shadow-2xl text-left">
            <div className="text-center pb-3 border-b border-dashed border-[#4d4635]">
              <h2 className="font-extrabold text-white text-base">L'ÉTOILE CULINARY OS</h2>
              <p className="text-[10px] text-[#99907c] font-mono">742 Evergreen Terrace, Metropolis</p>
              <p className="text-[10px] text-[#99907c] font-mono">Order #{lastOrder.order_number}</p>
            </div>

            <div className="py-3 border-b border-dashed border-[#4d4635] space-y-1.5 font-mono text-xs">
              {lastOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-white">
                  <span>{item.quantity}x {item.menu_item_name}</span>
                  <span>${parseFloat(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="py-3 border-b border-dashed border-[#4d4635] space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#99907c]">
                <span>Subtotal:</span>
                <span>${parseFloat(lastOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#99907c]">
                <span>Tax:</span>
                <span>${parseFloat(lastOrder.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#4edea3]">
                <span>Tip / Gratuity:</span>
                <span>${parseFloat(lastOrder.tip_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#d4af37] pt-1">
                <span>TOTAL PAID:</span>
                <span>${parseFloat(lastOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-[#99907c] font-mono my-3">
              Thank you for dining with us!
            </p>

            <button
              onClick={() => setIsReceiptOpen(false)}
              className="w-full py-2.5 bg-[#d4af37] text-black font-bold rounded text-xs uppercase font-mono"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
