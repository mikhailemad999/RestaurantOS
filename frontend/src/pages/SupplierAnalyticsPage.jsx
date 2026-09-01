import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Truck, Star, CheckCircle, Clock, DollarSign, Plus, 
  RefreshCw, ShieldCheck, ChevronRight, X, FileText
} from 'lucide-react';

export default function SupplierAnalyticsPage() {
  const { addToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_name: '',
    phone: '',
    email: '',
    lead_time_days: 2,
    quality_score: 95,
    on_time_rate: 98.0
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.getSuppliers();
      setSuppliers(res);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplier.name) return;

    try {
      await api.createSupplier({
        ...newSupplier,
        total_purchased: '0.00'
      });
      addToast(`Supplier ${newSupplier.name} onboarded successfully!`, 'success');
      setIsAddSupplierOpen(false);
      setNewSupplier({
        name: '',
        contact_name: '',
        phone: '',
        email: '',
        lead_time_days: 2,
        quality_score: 95,
        on_time_rate: 98.0
      });
      loadSuppliers();
    } catch (err) {
      addToast(`Error adding supplier: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#d4af37]" />
            Supplier Performance Scorecards & Purchasing
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Lead times, on-time delivery rates, ingredient quality scores & lifetime purchases</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Onboard Supplier</span>
          </button>
          <button
            onClick={loadSuppliers}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suppliers.map(s => (
          <div key={s.id} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4 hover:border-[#d4af37]/40 transition-colors">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white font-sans">{s.name}</h3>
                  <span className="text-[10px] text-[#99907c] font-mono">{s.contact_name} • {s.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#4edea3] bg-[#005236]/40 px-2 py-0.5 rounded border border-[#4edea3]/30">
                    {s.quality_score}/100 Score
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 bg-[#131313] p-3 rounded-xl text-center text-xs font-mono border border-[#2a2a2a]">
                <div>
                  <span className="text-[9px] text-[#99907c] block">LEAD TIME</span>
                  <span className="font-bold text-white">{s.lead_time_days} days</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">ON-TIME %</span>
                  <span className="font-bold text-[#4edea3]">{s.on_time_rate}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">PURCHASED</span>
                  <span className="font-bold text-[#d4af37]">${parseFloat(s.total_purchased || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2a2a2a] text-[11px] font-mono text-[#99907c] flex justify-between items-center">
              <span>Status: <span className="text-[#4edea3] font-bold">VERIFIED VENDOR</span></span>
              <span className="text-white text-xs">{s.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Onboard New Supplier Vendor</h3>
              <button onClick={() => setIsAddSupplierOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pacific Seafood Wholesale Ltd"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Account Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Marie DuPont"
                    value={newSupplier.contact_name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newSupplier.lead_time_days}
                    onChange={(e) => setNewSupplier({ ...newSupplier, lead_time_days: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@vendor.com"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
