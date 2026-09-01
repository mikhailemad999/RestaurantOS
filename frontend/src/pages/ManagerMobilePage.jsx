import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Smartphone, Users, DollarSign, Flame, Clock, 
  RefreshCw, TrendingUp, AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react';

export default function ManagerMobilePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getBIMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load manager mobile metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 flex items-center justify-center bg-[#0e0e0e]">
      {/* Mobile Device Frame */}
      <div className="w-full max-w-sm bg-[#131313] border-4 border-[#2a2a2a] rounded-[36px] overflow-hidden shadow-2xl flex flex-col h-[740px]">
        {/* Device Notch */}
        <div className="h-6 bg-[#0e0e0e] flex items-center justify-between px-6 select-none">
          <span className="text-[10px] font-mono text-white font-bold">13:10</span>
          <div className="w-20 h-3.5 bg-black rounded-full"></div>
          <span className="text-[10px] font-mono text-[#4edea3]">5G • 94%</span>
        </div>

        {/* Manager Header */}
        <div className="bg-[#1c1b1b] p-3.5 border-b border-[#2a2a2a] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">Manager Floor View</span>
            <span className="text-[9px] font-mono text-[#d4af37]">L'Étoile Metropolis</span>
          </div>
          <button onClick={loadMetrics} className="p-1.5 bg-[#131313] rounded text-[#99907c] hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Revenue Card */}
          <div className="bg-[#1c1b1b] border border-[#d4af37]/40 rounded-2xl p-4 shadow-gold">
            <span className="text-[10px] font-mono uppercase text-[#99907c] block">Live Revenue Today</span>
            <div className="text-2xl font-extrabold text-[#d4af37] font-mono mt-1">
              ${metrics?.today_revenue ? metrics.today_revenue.toFixed(2) : '3,480.50'}
            </div>
            <p className="text-[10px] text-[#4edea3] font-mono mt-1">
              +14.2% pacing vs target
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-3">
              <span className="text-[10px] text-[#99907c] uppercase block">Occupancy</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{metrics?.occupancy_rate || 68.5}%</span>
              <span className="text-[9px] text-[#4edea3]">{metrics?.occupied_tables || 8} Tables Seated</span>
            </div>

            <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-3">
              <span className="text-[10px] text-[#99907c] uppercase block">Kitchen Queue</span>
              <span className="text-lg font-bold text-white mt-0.5 block">{metrics?.active_kds_tickets || 4} Orders</span>
              <span className="text-[9px] text-[#d4af37]">Avg: 11.4 min</span>
            </div>
          </div>

          {/* Urgent Floor Alerts */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#ff949c] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Urgent Alerts
              </span>
              <span className="text-[9px] font-mono text-[#99907c]">Live</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#92002a]/20 border border-[#ff949c]/30 rounded-lg">
                <span className="font-bold text-[#ffb4ab] text-[11px] block">Table T5 Requested Check</span>
                <span className="text-[10px] text-[#d0c5af] font-mono">Total $182.40 • Waiting 4 min</span>
              </div>
              <div className="p-2.5 bg-[#554300]/20 border border-[#d4af37]/30 rounded-lg">
                <span className="font-bold text-[#d4af37] text-[11px] block">VIP Seated: Julian Sterling</span>
                <span className="text-[10px] text-[#d0c5af] font-mono">Table VIP-01 • Platinum Guest</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#1c1b1b] border-t border-[#2a2a2a] text-center text-[10px] font-mono text-[#99907c]">
          Terminal Node 01 Connected
        </div>
      </div>
    </div>
  );
}
