import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShoppingBag, Truck, MapPin, Plus, Check, Search, 
  Utensils, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function OnlineOrderingPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [deliveryType, setDeliveryType] = useState('DELIVERY');
  const [address, setAddress] = useState('742 Evergreen Terrace, Metropolis');
  const [customerName, setCustomerName] = useState('Clara Beauchamp');
  const [customerPhone, setCustomerPhone] = useState('+1 (555) 567-8901');
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const [items, cats] = await Promise.all([
        api.getMenuItems(),
        api.getCategories()
      ]);
      setMenuItems(items);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load online menu:', err);
    }
  };

  const handleAddToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        order_type: deliveryType,
        payment_method: 'CARD',
        payment_status: 'PAID',
        delivery_address: address,
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.quantity,
          selected_modifiers: []
        }))
      };
      await api.createPosOrder(payload);
      setOrderPlaced(true);
      setCart([]);
    } catch (err) {
      alert(`Error placing order: ${err.message}`);
    }
  };

  const filteredItems = activeCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category_name === activeCategory);

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Brand Hero Header */}
      <div className="bg-gradient-to-r from-[#1c1b1b] via-[#20201f] to-[#1c1b1b] p-6 rounded-2xl border border-[#d4af37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gold">
        <div>
          <span className="text-[10px] font-mono text-[#d4af37] font-bold tracking-widest uppercase block">Gourmet Online Ordering</span>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">L'Étoile Fine Dining Direct</h1>
          <p className="text-xs text-[#d0c5af] mt-1 font-sans">Artisanal gastronomy delivered directly from our master kitchen to your door.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#131313] p-1.5 rounded-xl border border-[#2a2a2a]">
          <button
            onClick={() => setDeliveryType('DELIVERY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-colors ${
              deliveryType === 'DELIVERY' ? 'bg-[#d4af37] text-black' : 'text-[#99907c]'
            }`}
          >
            Delivery (30-40 min)
          </button>
          <button
            onClick={() => setDeliveryType('TAKEOUT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-colors ${
              deliveryType === 'TAKEOUT' ? 'bg-[#d4af37] text-black' : 'text-[#99907c]'
            }`}
          >
            Pickup & Takeout
          </button>
        </div>
      </div>

      {/* Main Split: Menu Catalog vs Live Cart Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Categories & Menu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeCategory === 'ALL' ? 'bg-[#d4af37] text-black' : 'bg-[#1c1b1b] text-[#d0c5af] border border-[#2a2a2a]'
              }`}
            >
              All Categories
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeCategory === c.name ? 'bg-[#d4af37] text-black' : 'bg-[#1c1b1b] text-[#d0c5af] border border-[#2a2a2a]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-card flex flex-col justify-between">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300'}
                  alt={item.name}
                  className="w-full h-36 object-cover"
                />

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white font-sans">{item.name}</h3>
                    <p className="text-[11px] text-[#99907c] font-sans mt-0.5 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2a2a2a]">
                    <span className="text-base font-extrabold text-[#d4af37] font-mono">${parseFloat(item.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1 shadow-gold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Checkout Cart */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4 h-fit">
          <h2 className="font-bold text-sm text-white flex items-center gap-2 pb-3 border-b border-[#2a2a2a]">
            <ShoppingBag className="w-4 h-4 text-[#d4af37]" />
            Your Order Basket ({cart.reduce((s, i) => s + i.quantity, 0)})
          </h2>

          {orderPlaced ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#4edea3] mx-auto" />
              <h3 className="font-bold text-base text-white">Order Confirmed!</h3>
              <p className="text-xs text-[#99907c] font-sans">Our courier will deliver to your address shortly.</p>
              <button
                onClick={() => setOrderPlaced(false)}
                className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-xl"
              >
                Place Another Order
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-[#2a2a2a]">
                {cart.length === 0 ? (
                  <p className="text-xs text-[#99907c] text-center py-6">Your basket is empty.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="pt-2 flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-white font-sans">{item.name}</span>
                        <span className="text-[10px] text-[#99907c] block">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-[#d4af37]">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#2a2a2a]">
                  <div className="space-y-2 text-xs font-sans">
                    <input
                      type="text"
                      placeholder="Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Contact Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm font-mono font-bold pt-2 border-t border-[#2a2a2a]">
                    <span className="text-white">Order Total:</span>
                    <span className="text-[#d4af37] text-lg">${cartTotal.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-emerald cursor-pointer"
                  >
                    Confirm & Pay with Card
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
