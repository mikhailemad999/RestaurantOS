import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, Flame, Utensils, ShoppingBag, Plus, Minus, 
  Trash2, CreditCard, CheckCircle2, ChevronRight, X
} from 'lucide-react';

export default function KioskPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [kioskCart, setKioskCart] = useState([]);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedMods, setSelectedMods] = useState([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [kioskOrderComplete, setKioskOrderComplete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        api.getCategories(),
        api.getMenuItems()
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      console.error('Failed to load kiosk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomizer = (item) => {
    setCustomizingItem(item);
    setSelectedMods([]);
  };

  const handleAddToKioskCart = () => {
    if (!customizingItem) return;
    setKioskCart([...kioskCart, {
      ...customizingItem,
      quantity: 1,
      selectedModifiers: selectedMods
    }]);
    setCustomizingItem(null);
  };

  const updateQuantity = (idx, delta) => {
    const updated = [...kioskCart];
    updated[idx].quantity += delta;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    setKioskCart(updated);
  };

  const cartSubtotal = kioskCart.reduce((acc, item) => {
    const modTotal = (item.selectedModifiers || []).reduce((mAcc, m) => mAcc + parseFloat(m.price_extra || 0), 0);
    return acc + (parseFloat(item.price) + modTotal) * item.quantity;
  }, 0);

  const cartTax = cartSubtotal * 0.0825;
  const cartTotal = cartSubtotal + cartTax;

  const handleKioskCheckout = async () => {
    if (kioskCart.length === 0) return;

    const payload = {
      order_type: 'KIOSK',
      guest_count: 1,
      payment_method: 'CARD',
      payment_status: 'PAID',
      special_instructions: 'Self-Service Kiosk Order',
      items: kioskCart.map(c => ({
        menu_item_id: c.id,
        quantity: c.quantity,
        selected_modifiers: c.selectedModifiers
      }))
    };

    try {
      const res = await api.createPosOrder(payload);
      setKioskOrderComplete(res);
      setKioskCart([]);
      setIsCheckoutModalOpen(false);
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    }
  };

  const filteredItems = activeCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category_name === activeCategory);

  return (
    <div className="min-h-full bg-[#0e0e0e] text-white flex flex-col justify-between">
      {/* Kiosk Hero Top Banner */}
      <div className="bg-gradient-to-r from-[#1c1b1b] via-[#2a2a2a] to-[#1c1b1b] p-6 border-b border-[#d4af37]/30 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37] text-black font-extrabold flex items-center justify-center text-xl shadow-gold">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-sans text-white">
              L'ÉTOILE CULINARY <span className="text-[#d4af37]">EXPRESS</span>
            </h1>
            <p className="text-xs text-[#d0c5af] font-mono">Touch screen to customize your chef-curated selection</p>
          </div>
        </div>

        <div className="bg-[#131313] border border-[#d4af37]/50 px-4 py-2 rounded-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span className="text-xs font-mono font-bold text-[#d4af37]">SELF-ORDER KIOSK #04</span>
        </div>
      </div>

      {/* Main Kiosk Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Category Sidebar */}
        <div className="w-full md:w-60 bg-[#131313] p-3 border-r border-[#20201f] flex md:flex-col gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`p-4 rounded-xl text-left font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
              activeCategory === 'ALL'
                ? 'bg-[#d4af37] text-black shadow-gold scale-105'
                : 'bg-[#1c1b1b] text-[#d0c5af] hover:text-white border border-[#2a2a2a]'
            }`}
          >
            <Utensils className="w-5 h-5 shrink-0" />
            <span className="truncate">All Creations</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`p-4 rounded-xl text-left font-bold text-xs flex items-center gap-3 transition-all cursor-pointer ${
                activeCategory === cat.name
                  ? 'bg-[#d4af37] text-black shadow-gold scale-105'
                  : 'bg-[#1c1b1b] text-[#d0c5af] hover:text-white border border-[#2a2a2a]'
              }`}
            >
              <Flame className="w-5 h-5 shrink-0" />
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Center: Large Touch Item Cards */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleOpenCustomizer(item)}
                className="bg-[#1c1b1b] border border-[#2a2a2a] hover:border-[#d4af37] rounded-2xl overflow-hidden p-4 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-gold cursor-pointer group select-none"
              >
                <div className="w-full h-44 rounded-xl bg-black overflow-hidden relative mb-4">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-[#d4af37] border border-[#d4af37]/40">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white group-hover:text-[#d4af37] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#99907c] mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
                  <span className="text-xs text-[#4edea3] font-mono font-bold">{item.calories || 480} kcal</span>
                  <button className="px-4 py-2 bg-[#d4af37] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm group-hover:bg-[#f2ca50]">
                    <Plus className="w-4 h-4" />
                    <span>Customize & Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Kiosk Cart Drawer */}
        <div className="w-full md:w-80 bg-[#1c1b1b] border-l border-[#2a2a2a] p-4 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                <h2 className="font-bold text-sm text-white">Your Tray</h2>
              </div>
              <span className="text-xs font-mono bg-[#131313] px-2 py-0.5 rounded text-[#d0c5af]">
                {kioskCart.reduce((sum, i) => sum + i.quantity, 0)} Items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="py-3 space-y-2.5 max-h-[380px] overflow-y-auto">
              {kioskCart.length === 0 ? (
                <div className="text-center py-12 text-[#99907c] text-xs">
                  Your meal tray is empty. Tap any dish to begin your order!
                </div>
              ) : (
                kioskCart.map((item, idx) => (
                  <div key={idx} className="bg-[#20201f] border border-[#2a2a2a] rounded-xl p-2.5 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-white">{item.name}</span>
                      <span className="font-mono text-xs text-[#d4af37] font-bold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {item.selectedModifiers?.map((m, mIdx) => (
                      <span key={mIdx} className="text-[10px] text-[#4edea3] block font-mono">
                        +{m.name}
                      </span>
                    ))}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 bg-[#131313] border border-[#353535] rounded-lg p-0.5">
                        <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-0.5 text-[#d0c5af]">-</button>
                        <span className="font-mono text-xs font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-0.5 text-[#d0c5af]">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Summary */}
          <div className="pt-3 border-t border-[#2a2a2a] space-y-3">
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#99907c]">
                <span>Subtotal:</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#99907c]">
                <span>Tax:</span>
                <span>${cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-[#353535]">
                <span>Total:</span>
                <span className="text-[#d4af37]">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              disabled={kioskCart.length === 0}
              className="w-full py-4 bg-[#4edea3] hover:bg-[#6ffbbe] disabled:opacity-40 text-black font-extrabold rounded-xl text-sm uppercase tracking-wider shadow-emerald flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CreditCard className="w-5 h-5" />
              <span>Pay & Print Ticket (${cartTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KIOSK MODIFIER CUSTOMIZER MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#1c1b1b] border-2 border-[#d4af37] rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">{customizingItem.name}</h2>
                <p className="text-sm font-mono text-[#d4af37] mt-0.5">${parseFloat(customizingItem.price).toFixed(2)}</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-[#99907c] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-2 font-bold">Select Preparation Style:</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Medium Rare (Chef Rec.)', 'Medium Well', 'Rare', 'Extra Sizzling'].map(temp => (
                    <button
                      key={temp}
                      onClick={() => setSelectedMods([{ name: temp, price_extra: 0 }])}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedMods.some(m => m.name === temp)
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-[#20201f] text-[#d0c5af] border-[#353535]'
                      }`}
                    >
                      {temp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToKioskCart}
              className="w-full py-4 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-extrabold text-sm rounded-2xl uppercase tracking-wider shadow-gold"
            >
              Add to Tray
            </button>
          </div>
        </div>
      )}

      {/* KIOSK CHECKOUT SIMULATION MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border-2 border-[#4edea3] rounded-3xl p-8 text-center shadow-emerald animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#005236]/40 border-2 border-[#4edea3] flex items-center justify-center text-[#4edea3] mb-4">
              <CreditCard className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Tap Card or Phone</h2>
            <p className="text-xs text-[#d0c5af] font-mono mt-1">Insert chip, swipe, or tap Apple Pay / Google Pay</p>
            <div className="text-3xl font-extrabold text-[#d4af37] font-mono my-4">
              ${cartTotal.toFixed(2)}
            </div>

            <button
              onClick={handleKioskCheckout}
              className="w-full py-4 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold text-sm rounded-2xl uppercase tracking-wider"
            >
              Simulate Card Tap (Approve)
            </button>
          </div>
        </div>
      )}

      {/* KIOSK ORDER COMPLETE SCREEN */}
      {kioskOrderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border-2 border-[#d4af37] rounded-3xl p-8 text-center shadow-gold animate-in zoom-in-95">
            <CheckCircle2 className="w-20 h-20 mx-auto text-[#4edea3] mb-4" />
            <h2 className="text-2xl font-extrabold text-white">Order Received!</h2>
            <p className="text-xs text-[#99907c] font-mono mt-1">Your meal is being prepared by the kitchen.</p>

            <div className="my-6 bg-[#131313] border border-[#d4af37]/50 rounded-2xl p-4">
              <span className="text-xs font-mono text-[#99907c] uppercase">Your Pick-up Order Number:</span>
              <div className="text-4xl font-extrabold text-[#d4af37] font-mono mt-1">
                #{kioskOrderComplete.order_number}
              </div>
            </div>

            <button
              onClick={() => setKioskOrderComplete(null)}
              className="w-full py-4 bg-[#d4af37] text-black font-extrabold text-sm rounded-2xl uppercase tracking-wider"
            >
              Start New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
