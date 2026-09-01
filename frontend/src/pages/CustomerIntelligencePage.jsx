import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Crown, Heart, AlertTriangle, RefreshCw, 
  Sparkles, DollarSign, Send, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerIntelligencePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers();
      setCustomers(res);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            Customer Intelligence, RFM Scoring & Churn Prevention
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Recency, Frequency, Monetary (RFM) segmentation, guest lifetime value & retention marketing</p>
        </div>

        <button
          onClick={loadCustomers}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* RFM Segments Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] border-2 border-[#d4af37] rounded-2xl p-4 shadow-gold">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#d4af37] flex items-center gap-1.5">
              <Crown className="w-4 h-4" /> Platinum VIPs
            </span>
            <span className="text-lg font-extrabold text-white font-mono">2 Guests</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Avg Spend: $5,475.00 • LTV High</p>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#4edea3] flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> Loyal Regulars
            </span>
            <span className="text-lg font-extrabold text-white font-mono">1 Guest</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Visits: 11+ • High frequency</p>
        </div>

        <div className="bg-[#1c1b1b] border border-[#ff949c]/40 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#ff949c] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> At-Risk (&gt;30d Inactive)
            </span>
            <span className="text-lg font-extrabold text-white font-mono">1 Guest</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Trigger 15% SMS win-back</p>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> New Diners
            </span>
            <span className="text-lg font-extrabold text-white font-mono">1 Guest</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">1st & 2nd time visitors</p>
        </div>
      </div>

      {/* CRM Customer List */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Segmented Guest Directory</h2>
          <button
            onClick={() => navigate('/marketing')}
            className="px-3 py-1 bg-[#d4af37] text-black font-bold text-xs rounded-lg font-mono flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Launch Marketing Blast</span>
          </button>
        </div>

        <div className="divide-y divide-[#2a2a2a]">
          {customers.map(c => (
            <div key={c.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#20201f]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-white font-sans">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    c.vip_tier === 'PLATINUM' ? 'bg-[#554300] text-[#d4af37]' :
                    c.vip_tier === 'GOLD' ? 'bg-[#005236] text-[#4edea3]' : 'bg-[#20201f] text-[#d0c5af]'
                  }`}>
                    {c.vip_tier}
                  </span>
                  {c.dietary_tags && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#20201f] text-amber-300">
                      {c.dietary_tags}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#99907c] font-mono mt-1">
                  {c.phone} • {c.email} • Lifetime Spent: <span className="font-bold text-[#d4af37]">${parseFloat(c.total_spent).toFixed(2)}</span> ({c.visit_count} visits)
                </p>
                {c.notes && (
                  <p className="text-[11px] text-[#d0c5af] italic font-sans mt-0.5">"{c.notes}"</p>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#4edea3] font-bold">{c.loyalty_points} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
