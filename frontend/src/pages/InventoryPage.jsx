import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Package, Plus, AlertTriangle, ArrowUpDown, Trash2, 
  Search, RefreshCw, Layers, DollarSign, Check
} from 'lucide-react';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('Stock In / Purchase');
  const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
  const [wasteItem, setWasteItem] = useState(null);
  const [wasteQuantity, setWasteQuantity] = useState('');
  const [wasteReason, setWasteReason] = useState('Spoilage / Expired');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustingItem || !adjustQuantity) return;

    try {
      await api.adjustStock(adjustingItem.id, parseFloat(adjustQuantity), adjustReason);
      setAdjustingItem(null);
      setAdjustQuantity('');
      setActionSuccess('Stock updated successfully in MySQL!');
      setTimeout(() => setActionSuccess(''), 3500);
      loadInventory();
    } catch (err) {
      alert(`Error adjusting stock: ${err.message}`);
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    if (!wasteItem || !wasteQuantity) return;

    try {
      await api.logWaste(wasteItem.id, parseFloat(wasteQuantity), wasteReason);
      setIsWasteModalOpen(false);
      setWasteItem(null);
      setWasteQuantity('');
      setActionSuccess('Wastage logged & inventory deducted.');
      setTimeout(() => setActionSuccess(''), 3500);
      loadInventory();
    } catch (err) {
      alert(`Error logging waste: ${err.message}`);
    }
  };

  const filteredItems = inventory.filter(item => {
    const isLow = parseFloat(item.current_stock) <= parseFloat(item.minimum_stock);
    const matchesLow = !filterLowStock || isLow;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLow && matchesSearch;
  });

  const totalStockValue = inventory.reduce((acc, item) => 
    acc + (parseFloat(item.current_stock) * parseFloat(item.cost_per_unit)), 0
  );

  const lowStockCount = inventory.filter(item => 
    parseFloat(item.current_stock) <= parseFloat(item.minimum_stock)
  ).length;

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Top Header & Metrics */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Package className="w-5 h-5 text-[#d4af37]" />
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Raw ingredients, automated recipe deductions & waste log</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#131313] border border-[#353535] px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-[#99907c] block text-[10px]">TOTAL INVENTORY VALUE</span>
            <span className="font-bold text-[#d4af37] text-sm">${totalStockValue.toFixed(2)}</span>
          </div>

          <div className="bg-[#131313] border border-[#ff949c]/30 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-[#ff949c] block text-[10px]">LOW STOCK ALERTS</span>
            <span className="font-bold text-[#ffb4ab] text-sm">{lowStockCount} items</span>
          </div>
        </div>
      </div>

      {/* Filter / Actions Bar */}
      <div className="bg-[#1c1b1b] p-3 rounded-xl border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ingredient, category, supplier..."
              className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterLowStock 
                ? 'bg-[#93000a] text-white font-bold' 
                : 'bg-[#131313] border border-[#353535] text-[#d0c5af]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>

        <button
          onClick={() => {
            setWasteItem(inventory[0] || null);
            setIsWasteModalOpen(true);
          }}
          className="px-3.5 py-2 bg-[#2a2a2a] hover:bg-[#353535] text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-lg text-xs font-bold flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Log Spoilage / Wastage</span>
        </button>
      </div>

      {/* Success Banner */}
      {actionSuccess && (
        <div className="bg-[#00a572]/20 border border-[#4edea3] text-[#4edea3] text-xs py-2 px-4 rounded-lg flex items-center gap-2 font-mono">
          <Check className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
              <tr>
                <th className="p-3.5">SKU & Item Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Min Reorder Level</th>
                <th className="p-3.5">Unit Cost</th>
                <th className="p-3.5">Total Value</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5 text-right">Quick Stock In/Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#99907c] font-sans">
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-[#99907c] font-sans">
                    No inventory records match.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const cur = parseFloat(item.current_stock);
                  const min = parseFloat(item.minimum_stock);
                  const isLow = cur <= min;
                  const itemVal = cur * parseFloat(item.cost_per_unit);

                  return (
                    <tr key={item.id} className="hover:bg-[#20201f] transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-white font-sans block">{item.name}</span>
                        <span className="text-[10px] text-[#99907c]">{item.sku}</span>
                      </td>

                      <td className="p-3.5 text-[#d0c5af]">{item.category}</td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isLow ? 'text-[#ff949c]' : 'text-[#4edea3]'}`}>
                            {cur.toFixed(2)} {item.unit}
                          </span>
                          {isLow && (
                            <span className="bg-[#93000a] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                              LOW
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-[#99907c]">{min.toFixed(2)} {item.unit}</td>
                      <td className="p-3.5 text-[#d0c5af]">${parseFloat(item.cost_per_unit).toFixed(2)}</td>
                      <td className="p-3.5 font-bold text-white">${itemVal.toFixed(2)}</td>
                      <td className="p-3.5 text-[#99907c]">{item.supplier_name}</td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustQuantity('');
                          }}
                          className="px-2.5 py-1 bg-[#131313] hover:bg-[#d4af37] hover:text-black text-[#d4af37] border border-[#d4af37]/40 rounded text-xs font-bold transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Adjust Inventory: {adjustingItem.name}</h3>
            <p className="text-xs text-[#99907c] font-mono mb-4">
              Current stock: {adjustingItem.current_stock} {adjustingItem.unit}
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">
                  Quantity Delta (Positive for Stock-In, Negative for Deduct):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="e.g. +10 or -5"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Reason / Note:</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Stock In / Purchase">Stock In / Purchase</option>
                  <option value="Inventory Audit Adjustment">Inventory Audit Adjustment</option>
                  <option value="Kitchen Usage">Kitchen Usage</option>
                  <option value="Return to Supplier">Return to Supplier</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Apply Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG WASTE MODAL */}
      {isWasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#ff949c] rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Log Kitchen Spoilage / Wastage</h3>
            <p className="text-xs text-[#ffb4ab] font-mono mb-4">
              Wastage will be logged with cost calculation and subtracted from inventory.
            </p>

            <form onSubmit={handleLogWaste} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Select Ingredient:</label>
                <select
                  value={wasteItem?.id || ''}
                  onChange={(e) => {
                    const found = inventory.find(i => i.id === Number(e.target.value));
                    setWasteItem(found);
                  }}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#ff949c] focus:outline-none"
                >
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Wasted Quantity ({wasteItem?.unit}):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={wasteQuantity}
                  onChange={(e) => setWasteQuantity(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#ff949c] focus:outline-none font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Wastage Reason:</label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#ff949c] focus:outline-none"
                >
                  <option value="Spoilage / Expired">Spoilage / Expired</option>
                  <option value="Prep Error / Kitchen Drop">Prep Error / Kitchen Drop</option>
                  <option value="Quality Inspection Rejection">Quality Inspection Rejection</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWasteModalOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff949c] text-black font-bold rounded shadow-crimson uppercase font-mono"
                >
                  Confirm Wastage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
