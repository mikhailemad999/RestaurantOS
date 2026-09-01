import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Smartphone, DollarSign, TrendingUp, Users, Flame, 
  ShieldCheck, RefreshCw, Check, X, Sparkles
} from 'lucide-react';

export default function OwnerMobilePage() {
  const [data, setData] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [cmd, app] = await Promise.all([
        api.getCommandCenter(),
        api.getApprovals()
      ]);
      setData(cmd);
      setApprovals(app.filter(a => a.status === 'PENDING'));
    } catch (err) {
      console.error('Failed to load owner mobile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveRequest(id);
      loadData();
    } catch (err) {
      alert(`Error approving: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 bg-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Mobile Shell */}
      <div className="w-full max-w-sm bg-[#131313] border-4 border-[#2a2a2a] rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[780px]">
        {/* Top Status */}
        <div className="h-6 bg-[#0a0a0a] flex items-center justify-between px-6 select-none">
          <span className="text-[10px] font-mono text-white font-bold">20:15</span>
          <div className="w-20 h-3.5 bg-black rounded-full"></div>
          <span className="text-[10px] font-mono text-[#4edea3]">5G • 100%</span>
        </div>

        {/* Mobile Header */}
        <div className="p-4 bg-[#1c1b1b] border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <h1 className="text-xs font-extrabold text-white">L'Étoile Owner Executive Hub</h1>
            <span className="text-[10px] font-mono text-[#4edea3]">● LIVE RESTAURANT METRICS</span>
          </div>

          <button onClick={loadData} className="p-1.5 text-[#99907c] hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Big Revenue Counter */}
          <div className="bg-gradient-to-br from-[#1c1b1b] to-[#141414] border border-[#d4af37]/40 rounded-3xl p-5 shadow-gold text-center space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Gross Revenue Today</span>
            <div className="text-3xl font-extrabold text-[#d4af37] font-mono">
              ${data?.revenue?.today ? data.revenue.today.toFixed(2) : '3,480.50'}
            </div>
            <span className="text-[11px] font-mono text-[#4edea3] flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +{data?.revenue?.growth_pct || 11.5}% vs yesterday
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] p-3 rounded-2xl">
              <span className="text-[10px] text-[#99907c] block">FLOOR OCCUPANCY</span>
              <span className="text-lg font-bold text-white mt-1 block">{data?.operations?.occupancy_pct || 68.5}%</span>
              <span className="text-[10px] text-[#d0c5af]">{data?.operations?.occupied_tables || 8} Tables Seated</span>
            </div>

            <div className="bg-[#1c1b1b] border border-[#2a2a2a] p-3 rounded-2xl">
              <span className="text-[10px] text-[#99907c] block">FOOD COST (COGS)</span>
              <span className="text-lg font-bold text-[#4edea3] mt-1 block">{data?.profitability?.food_cost_pct || 28.4}%</span>
              <span className="text-[10px] text-[#4edea3]">Optimal Target</span>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                Pending Approvals ({approvals.length})
              </h3>
              <span className="text-[9px] font-mono text-[#4edea3]">1-Tap Auth</span>
            </div>

            {approvals.length === 0 ? (
              <p className="text-[11px] text-[#99907c] text-center py-2">No pending approvals.</p>
            ) : (
              approvals.map(a => (
                <div key={a.id} className="p-2.5 bg-[#131313] rounded-xl border border-[#2a2a2a] space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-white bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                      {a.request_type}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#d4af37]">${parseFloat(a.amount).toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-[#d0c5af] font-sans">{a.reason}</p>
                  <button
                    onClick={() => handleApprove(a.id)}
                    className="w-full py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold text-xs rounded-xl font-mono flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
