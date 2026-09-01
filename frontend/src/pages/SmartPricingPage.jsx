import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  DollarSign, TrendingUp, AlertTriangle, ShieldCheck, Plus, 
  Check, X, RefreshCw, Clock, ArrowUpRight, Sparkles
} from 'lucide-react';

export default function SmartPricingPage() {
  const [priceRequests, setPriceRequests] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    menu_item: '',
    old_price: 0,
    new_price: 0,
    reason: 'Ingredient wholesale price inflation (+8.5%)'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, items] = await Promise.all([
        api.getPriceRequests(),
        api.getMenuItems()
      ]);
      setPriceRequests(reqs);
      setMenuItems(items);
      if (items.length > 0) {
        setNewRequest(prev => ({
          ...prev,
          menu_item: items[0].id,
          old_price: Number(items[0].price),
          new_price: Number(items[0].price) + 4
        }));
      }
    } catch (err) {
      console.error('Failed to load pricing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.createPriceRequest({
        menu_item: newRequest.menu_item,
        old_price: newRequest.old_price,
        new_price: newRequest.new_price,
        reason: newRequest.reason,
        requested_by: 1, // Marcus Vance
        status: 'PENDING'
      });
      setIsCreateModalOpen(false);
      loadData();
    } catch (err) {
      alert(`Error creating price request: ${err.message}`);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approvePriceRequest(id);
      loadData();
    } catch (err) {
      alert(`Error approving price change: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectPriceRequest(id);
      loadData();
    } catch (err) {
      alert(`Error rejecting price change: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#d4af37]" />
            Smart Pricing Intelligence & Approval Workflow
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Ingredient cost inflation tracking, margin erosion alerts & manager price governance</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-gold"
        >
          <Plus className="w-4 h-4" />
          <span>Request Price Change</span>
        </button>
      </div>

      {/* Inflation Alerts Banner */}
      <div className="bg-[#554300]/20 border border-[#d4af37]/40 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-[#d4af37] block">Ingredient Inflation Alert Detected:</span>
          <p className="text-[#d0c5af] font-sans">
            French Truffle supplier price increased by <span className="font-bold text-white">8.5%</span>. 
            Tagliolini al Tartufo margin has declined from <span className="font-bold text-white">74.2%</span> to <span className="font-bold text-amber-300">64.1%</span>. 
            Recommended adjustment: <span className="font-bold text-[#4edea3]">+$4.00</span> ($34.00 ➔ $38.00).
          </p>
        </div>
      </div>

      {/* Price Change Requests Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
            Price Change Authorization Queue
          </h2>
          <span className="text-[10px] font-mono text-[#99907c]">Strict Server-Side Governance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
              <tr>
                <th className="p-3.5">Menu Dish</th>
                <th className="p-3.5">Current Price</th>
                <th className="p-3.5">Proposed Price</th>
                <th className="p-3.5">Change Delta</th>
                <th className="p-3.5">Reason & Justification</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Manager Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {priceRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-[#99907c]">
                    No pending price change requests.
                  </td>
                </tr>
              ) : (
                priceRequests.map(req => (
                  <tr key={req.id} className="hover:bg-[#20201f]">
                    <td className="p-3.5 font-bold text-white font-sans">{req.menu_item_name}</td>
                    <td className="p-3.5 text-[#99907c]">${parseFloat(req.old_price).toFixed(2)}</td>
                    <td className="p-3.5 font-bold text-[#d4af37]">${parseFloat(req.new_price).toFixed(2)}</td>
                    <td className="p-3.5 text-[#4edea3] font-bold">
                      +${(parseFloat(req.new_price) - parseFloat(req.old_price)).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-[#d0c5af] max-w-xs truncate font-sans">{req.reason}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        req.status === 'APPROVED' ? 'bg-[#005236]/40 border-[#4edea3] text-[#4edea3]' :
                        req.status === 'REJECTED' ? 'bg-[#92002a]/40 border-[#ff949c] text-[#ff949c]' :
                        'bg-[#554300]/40 border-[#d4af37] text-[#d4af37]'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-2.5 py-1 bg-[#005236] hover:bg-[#00704a] text-[#4edea3] border border-[#4edea3]/40 rounded font-bold text-[11px] flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-2.5 py-1 bg-[#92002a]/30 hover:bg-[#92002a]/60 text-[#ffb4ab] border border-[#ffb4ab]/40 rounded font-bold text-[11px] flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#99907c] text-[10px]">Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PRICE REQUEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Request Menu Price Adjustment</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Select Menu Item *</label>
                <select
                  value={newRequest.menu_item}
                  onChange={(e) => {
                    const item = menuItems.find(m => m.id === Number(e.target.value));
                    setNewRequest({
                      ...newRequest,
                      menu_item: Number(e.target.value),
                      old_price: item ? Number(item.price) : 0,
                      new_price: item ? Number(item.price) + 2 : 0
                    });
                  }}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (${parseFloat(m.price).toFixed(2)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Current Price ($)</label>
                  <input
                    type="number"
                    disabled
                    value={newRequest.old_price}
                    className="w-full bg-[#20201f] border border-[#353535] text-[#99907c] p-2 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">New Proposed Price ($) *</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={newRequest.new_price}
                    onChange={(e) => setNewRequest({ ...newRequest, new_price: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-[#d4af37] font-bold p-2 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Justification / Inflation Reason *</label>
                <textarea
                  rows="3"
                  required
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Submit For Manager Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
