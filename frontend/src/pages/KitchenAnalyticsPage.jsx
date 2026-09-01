import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Flame, Clock, AlertTriangle, CheckCircle, RefreshCw, 
  TrendingUp, BarChart3, ChefHat
} from 'lucide-react';

export default function KitchenAnalyticsPage() {
  const [loading, setLoading] = useState(false);

  const stations = [
    { name: 'GRILL', avg_time: 14.2, sla_target: 15.0, delayed_pct: 4.5, active_tickets: 3, status: 'BUSY' },
    { name: 'SAUTE', avg_time: 10.8, sla_target: 12.0, delayed_pct: 1.2, active_tickets: 2, status: 'OPTIMAL' },
    { name: 'FRYER', avg_time: 6.5, sla_target: 8.0, delayed_pct: 0.8, active_tickets: 1, status: 'OPTIMAL' },
    { name: 'SEAFOOD', avg_time: 12.1, sla_target: 14.0, delayed_pct: 2.1, active_tickets: 1, status: 'OPTIMAL' },
    { name: 'DESSERT', avg_time: 5.4, sla_target: 7.0, delayed_pct: 0.0, active_tickets: 0, status: 'IDLE' },
    { name: 'BAR', avg_time: 3.2, sla_target: 5.0, delayed_pct: 0.0, active_tickets: 1, status: 'OPTIMAL' },
  ];

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            Kitchen Velocity, Station SLA & Prep Bottleneck Analytics
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Real-time KDS bump pacing, station workload balancing & delayed ticket prevention</p>
        </div>

        <button
          onClick={() => {}}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Avg Kitchen Ticket Time</span>
          <div className="text-2xl font-extrabold text-[#4edea3] font-mono mt-1">11.4 min</div>
          <span className="text-[10px] text-[#4edea3] font-mono">SLA Target: 15.0 min</span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Overall SLA Compliance</span>
          <div className="text-2xl font-extrabold text-[#4edea3] font-mono mt-1">98.2%</div>
          <span className="text-[10px] text-[#4edea3] font-mono">Optimal Velocity</span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Busiest Station Load</span>
          <div className="text-2xl font-extrabold text-[#d4af37] font-mono mt-1">Grill (64%)</div>
          <span className="text-[10px] text-[#99907c] font-mono">A5 Wagyu & Ribeye volume</span>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4">
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Order Accuracy Score</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">99.6%</div>
          <span className="text-[10px] text-[#4edea3] font-mono">Zero modifier errors</span>
        </div>
      </div>

      {/* Station SLA Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map(st => (
          <div key={st.name} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white font-mono">{st.name} STATION</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                st.status === 'BUSY' ? 'bg-[#554300] text-[#d4af37]' :
                st.status === 'OPTIMAL' ? 'bg-[#005236] text-[#4edea3]' : 'bg-[#20201f] text-[#99907c]'
              }`}>
                {st.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <div>
                <span className="text-[9px] text-[#99907c] block">AVG PREP TIME</span>
                <span className="font-bold text-white text-base">{st.avg_time} min</span>
              </div>
              <div>
                <span className="text-[9px] text-[#99907c] block">SLA BENCHMARK</span>
                <span className="font-bold text-[#d0c5af] text-base">{st.sla_target} min</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-[#99907c]">
                <span>Station Delay Rate</span>
                <span className="text-[#4edea3] font-bold">{st.delayed_pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#20201f] rounded-full overflow-hidden">
                <div className="h-full bg-[#4edea3] rounded-full" style={{ width: `${100 - st.delayed_pct}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
