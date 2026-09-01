import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Trash2, DollarSign, AlertTriangle, Plus, RefreshCw, 
  Sparkles, CheckCircle2, TrendingDown
} from 'lucide-react';

export default function WasteAnalyticsPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wasteItem, setWasteItem] = useState('');
  const [wasteQty, setWasteQty] = useState(1);
  const [wasteReason, setWasteReason] = useState('Prep trimming & test plate');
  const [isWasteOpen, setIsWasteOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const items = await api.getInventory();
      setInventory(items);
      if (items.length > 0) setWasteItem(items[0].id);
    } catch (err) {
      console.error('Failed to load inventory for waste:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWaste = async (e) => {
    e.preventDefault();
    try {
      await api.logWaste(wasteItem, wasteQty, wasteReason);
      setIsWasteOpen(false);
      alert('Waste movement logged successfully.');
      loadData();
    } catch (err) {
      alert(`Error logging waste: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#ff949c]" />
            Food Waste & Spoilage Financial Analytics
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Kitchen trimming, expiration, prep error tracking & cost reduction insights</p>
        </div>

        <button
          onClick={() => setIsWasteOpen(true)}
          className="px-4 py-2 bg-[#92002a] hover:bg-[#b00035] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-card cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Log Waste Incident</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Total Waste Cost (MTD)</span>
            <div className="text-2xl font-extrabold text-[#ff949c] font-mono mt-1">$482.50</div>
          </div>
          <DollarSign className="w-8 h-8 text-[#ff949c]/40" />
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Waste as % of Food Spend</span>
            <div className="text-2xl font-extrabold text-[#4edea3] font-mono mt-1">1.8% (Target: &lt;2.5%)</div>
          </div>
          <TrendingDown className="w-8 h-8 text-[#4edea3]/40" />
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Top Waste Category</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">Produce / Herbs</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400/40" />
        </div>
      </div>

      {/* Waste Audit Log */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Recent Waste & Spoilage Incidents</h2>
          <span className="text-[10px] font-mono text-[#99907c]">Verified Kitchen Logs</span>
        </div>

        <div className="p-4 divide-y divide-[#2a2a2a] text-xs font-mono">
          {[
            { id: 1, item: 'French Truffle & Butter Prep', qty: '0.15 KG', cost: '$27.00', station: 'GRILL', reason: 'Chef seasoning adjustment', time: 'Yesterday 21:15' },
            { id: 2, item: 'Atlantic Salmon Fillet Trim', qty: '0.40 KG', cost: '$12.80', station: 'SEAFOOD', reason: 'Skin portioning & trim loss', time: 'Yesterday 17:30' },
            { id: 3, item: 'Duck Fat Fries (Overcooked batch)', qty: '1.20 KG', cost: '$6.50', station: 'FRYER', reason: 'Ticket delay hold timer exceeded', time: '2 days ago' },
          ].map(w => (
            <div key={w.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block font-sans">{w.item}</span>
                <span className="text-[10px] text-[#99907c]">{w.station} • {w.reason}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#ff949c] block">-{w.cost}</span>
                <span className="text-[10px] text-[#99907c]">{w.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Waste Modal */}
      {isWasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#ff949c] rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-[#2a2a2a]">Log Kitchen Waste Incident</h3>

            <form onSubmit={handleLogWaste} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Ingredient *</label>
                <select
                  value={wasteItem}
                  onChange={(e) => setWasteItem(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#ff949c] focus:outline-none"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Wasted Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value))}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#ff949c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Reason / Station *</label>
                <input
                  type="text"
                  required
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-sans focus:border-[#ff949c] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWasteOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#92002a] text-white font-bold rounded shadow-card uppercase font-mono"
                >
                  Record Waste Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
