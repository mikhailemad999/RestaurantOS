import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Tablet, ShoppingCart, Send, Plus, Minus, Trash2, 
  Check, RefreshCw, Layers, Clock, ChefHat
} from 'lucide-react';

export default function WaiterPOSPage() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');

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
      console.error('Failed to load waiter POS data:', err);
    }
  };

  const handleAddItem = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const handleFireOrder = async () => {
    if (cart.length === 0 || !selectedTable) return;
    try {
      const payload = {
        order_type: 'DINE_IN',
        table_id: selectedTable,
        guest_count: 2,
        payment_method: 'PENDING',
        payment_status: 'UNPAID',
        special_instructions: 'Table-side Waiter Order',
        items: cart.map(c => ({
          menu_item_id: c.id,
          quantity: c.quantity,
          selected_modifiers: []
        }))
      };
      const res = await api.createPosOrder(payload);
      setSuccessMsg(`Order #${res.order_number} fired to Kitchen!`);
      setCart([]);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadData();
    } catch (err) {
      alert(`Error firing order: ${err.message}`);
    }
  };

  const filteredItems = activeCategory === 'ALL'
    ? menuItems
    : menuItems.filter(i => i.category_name === activeCategory);

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <div className="min-h-full p-4 flex items-center justify-center bg-[#0e0e0e]">
      {/* Mobile Device Mockup */}
      <div className="w-full max-w-sm bg-[#131313] border-4 border-[#2a2a2a] rounded-[36px] overflow-hidden shadow-2xl flex flex-col h-[740px]">
        {/* Device Notch */}
        <div className="h-6 bg-[#0e0e0e] flex items-center justify-between px-6 select-none">
          <span className="text-[10px] font-mono text-white font-bold">13:15</span>
          <div className="w-20 h-3.5 bg-black rounded-full"></div>
          <span className="text-[10px] font-mono text-[#4edea3]">5G • 88%</span>
        </div>

        {/* Handheld Header */}
        <div className="bg-[#1c1b1b] p-3 border-b border-[#2a2a2a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tablet className="w-4 h-4 text-[#d4af37]" />
              <span className="text-xs font-bold text-white">Waiter Handheld POS</span>
            </div>
            <span className="text-[9px] font-mono text-[#4edea3] bg-[#005236]/30 px-2 py-0.5 rounded border border-[#4edea3]/40">
              Online
            </span>
          </div>

          {/* Table Selector */}
          <div>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(Number(e.target.value))}
              className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded-lg p-2 font-mono"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} ({t.section_name}) - {t.status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="p-2 bg-[#181818] border-b border-[#2a2a2a] flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap ${
              activeCategory === 'ALL' ? 'bg-[#d4af37] text-black' : 'bg-[#20201f] text-[#d0c5af]'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.name)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap ${
                activeCategory === c.name ? 'bg-[#d4af37] text-black' : 'bg-[#20201f] text-[#d0c5af]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-[#005236]/40 border-b border-[#4edea3] text-[#4edea3] p-2 text-xs text-center font-mono font-bold">
            {successMsg}
          </div>
        )}

        {/* Menu Items Compact List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="p-2.5 bg-[#1c1b1b] hover:bg-[#20201f] border border-[#2a2a2a] rounded-xl flex items-center justify-between cursor-pointer transition-colors"
            >
              <div>
                <h4 className="font-bold text-xs text-white">{item.name}</h4>
                <span className="text-[10px] text-[#99907c] font-mono">{item.station}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#d4af37]">
                  ${parseFloat(item.price).toFixed(2)}
                </span>
                <button className="w-6 h-6 rounded-lg bg-[#d4af37] text-black font-bold flex items-center justify-center text-xs">
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Cart Drawer */}
        <div className="p-3 bg-[#1c1b1b] border-t border-[#2a2a2a] space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#99907c]">{cart.length} item(s) selected:</span>
            <span className="font-bold text-white">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleFireOrder}
            disabled={cart.length === 0}
            className="w-full py-3.5 bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-gold"
          >
            <Send className="w-4 h-4" />
            <span>Fire to Kitchen KDS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
