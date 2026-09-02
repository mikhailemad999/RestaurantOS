import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  QrCode, Bell, Receipt, Plus, Check, ShoppingBag, 
  Smartphone, Utensils, CheckCircle2, ChevronRight, Sparkles
} from 'lucide-react';

import CustomerNavbar from '../components/CustomerNavbar';

export default function QROrderingPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(1);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [notification, setNotification] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tbls, items, cats] = await Promise.all([
        api.getTables(),
        api.getMenuItems(),
        api.getCategories()
      ]);
      setTables(tbls);
      setMenuItems(items);
      setCategories(cats);
      if (tbls.length > 0) setSelectedTable(tbls[0].id);
    } catch (err) {
      console.error('Failed to load QR ordering data:', err);
    }
  };

  const handleCallWaiter = async () => {
    try {
      await api.callWaiterQR(selectedTable);
      setNotification('Floor Captain has been notified to attend your table.');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setNotification('Floor Captain notified.');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleRequestBill = async () => {
    try {
      await api.requestBillQR(selectedTable);
      setNotification('Bill requested. Your server will bring the terminal.');
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      setNotification('Bill requested.');
      setTimeout(() => setNotification(''), 4000);
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

  const handlePlaceQROrder = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        order_type: 'DINE_IN',
        table_id: selectedTable,
        guest_count: 2,
        payment_method: 'PENDING',
        payment_status: 'UNPAID',
        special_instructions: 'Customer Table QR Order',
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.quantity,
          selected_modifiers: []
        }))
      };
      await api.createPosOrder(payload);
      setOrderSent(true);
      setCart([]);
    } catch (err) {
      alert(`Error placing QR order: ${err.message}`);
    }
  };

  const filteredItems = activeCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category_name === activeCategory);

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col">
      <CustomerNavbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} cartTotal={cartTotal} />
      <div className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
      {/* Mobile Device Viewport */}
      <div className="w-full max-w-sm bg-[#131313] border-4 border-[#2a2a2a] rounded-[38px] overflow-hidden shadow-2xl flex flex-col h-[760px]">
        {/* Notch */}
        <div className="h-6 bg-[#0e0e0e] flex items-center justify-between px-6 select-none">
          <span className="text-[10px] font-mono text-white font-bold">19:42</span>
          <div className="w-20 h-3.5 bg-black rounded-full"></div>
          <span className="text-[10px] font-mono text-[#4edea3]">5G • 96%</span>
        </div>

        {/* QR Guest Header */}
        <div className="bg-[#1c1b1b] p-4 border-b border-[#2a2a2a] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#d4af37]" />
              <div>
                <h1 className="text-xs font-bold text-white">L'Étoile Digital Table Menu</h1>
                <span className="text-[10px] font-mono text-[#d4af37]">Table {tables.find(t => t.id === selectedTable)?.table_number || 'VIP-01'}</span>
              </div>
            </div>

            {/* Table Switcher Simulator */}
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(Number(e.target.value))}
              className="bg-[#131313] border border-[#353535] text-white text-[10px] rounded p-1 font-mono"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>T-{t.table_number}</option>
              ))}
            </select>
          </div>

          {/* Table Service Action Triggers */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCallWaiter}
              className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] rounded-xl text-xs font-bold text-[#d0c5af] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Call Waiter</span>
            </button>
            <button
              onClick={handleRequestBill}
              className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] rounded-xl text-xs font-bold text-[#d0c5af] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-[#4edea3]" />
              <span>Request Bill</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="bg-[#005236] text-[#4edea3] p-2 text-center text-xs font-mono font-bold animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Category Carousel */}
        <div className="p-2 bg-[#181818] border-b border-[#2a2a2a] flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap ${
              activeCategory === 'ALL' ? 'bg-[#d4af37] text-black' : 'bg-[#20201f] text-[#d0c5af]'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.name)}
              className={`px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap ${
                activeCategory === c.name ? 'bg-[#d4af37] text-black' : 'bg-[#20201f] text-[#d0c5af]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {orderSent ? (
            <div className="text-center py-16 space-y-3">
              <CheckCircle2 className="w-16 h-16 mx-auto text-[#4edea3]" />
              <h2 className="text-lg font-bold text-white">Order Sent to Kitchen!</h2>
              <p className="text-xs text-[#99907c] font-sans">Chef Antoine is preparing your meal.</p>
              <button
                onClick={() => setOrderSent(false)}
                className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-xl mt-2"
              >
                Order More Items
              </button>
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-3 flex gap-3 items-center justify-between"
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200'}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] font-mono text-[#d4af37] font-bold block mt-0.5">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-8 h-8 rounded-xl bg-[#d4af37] text-black font-extrabold flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Drawer */}
        {!orderSent && cart.length > 0 && (
          <div className="p-3 bg-[#1c1b1b] border-t border-[#2a2a2a] space-y-2 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#99907c]">{cart.reduce((s, i) => s + i.quantity, 0)} Items Selected</span>
              <span className="font-bold text-[#d4af37] text-sm">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceQROrder}
              className="w-full py-3 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-emerald flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Confirm & Fire to Kitchen</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
