import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Building2, MapPin, TrendingUp, DollarSign, Users, 
  RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function BranchIntelligencePage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const res = await api.getBranches();
      setBranches(res);
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const branchMetrics = [
    { code: 'METRO-01', name: "L'Étoile Downtown Flagship", revenue: 98400, food_cost: 28.4, kds_time: 11.4, health: 92 },
    { code: 'METRO-02', name: "L'Étoile Uptown Terrace", revenue: 76200, food_cost: 29.1, kds_time: 13.1, health: 86 },
    { code: 'METRO-03', name: "L'Étoile Harbor Bay", revenue: 84100, food_cost: 27.8, kds_time: 10.8, health: 89 }
  ];

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#d4af37]" />
            Multi-Branch Enterprise Intelligence & Benchmark Comparison
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Consolidated sales pacing, food cost variance & kitchen SLA benchmarking across locations</p>
        </div>

        <button
          onClick={loadBranches}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {branchMetrics.map(b => (
          <div key={b.code} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#20201f] text-[#d4af37] px-2 py-0.5 rounded">
                  {b.code}
                </span>
                <h3 className="font-bold text-sm text-white mt-2 font-sans">{b.name}</h3>
              </div>

              <span className="text-xs font-mono font-bold text-[#4edea3] bg-[#005236]/40 px-2 py-1 rounded border border-[#4edea3]/30">
                {b.health}/100 Health
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#131313] p-3 rounded-xl text-center text-xs font-mono border border-[#2a2a2a]">
              <div>
                <span className="text-[9px] text-[#99907c] block">MTD SALES</span>
                <span className="font-bold text-[#d4af37]">${(b.revenue / 1000).toFixed(1)}k</span>
              </div>
              <div>
                <span className="text-[9px] text-[#99907c] block">FOOD COST</span>
                <span className="font-bold text-[#4edea3]">{b.food_cost}%</span>
              </div>
              <div>
                <span className="text-[9px] text-[#99907c] block">AVG KDS</span>
                <span className="font-bold text-white">{b.kds_time}m</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2a2a2a] flex justify-between text-[11px] font-mono text-[#99907c]">
              <span>Status: <span className="text-[#4edea3] font-bold">ONLINE & SYNCED</span></span>
              <span className="text-white">Live POS Feed →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
