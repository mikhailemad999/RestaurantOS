import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Activity, TrendingUp, CheckCircle2, AlertTriangle, ArrowUpRight,
  ShieldCheck, RefreshCw, Sparkles, ChevronRight, BarChart3
} from 'lucide-react';

export default function HealthScorePage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    try {
      setLoading(true);
      const data = await api.getHealthScore();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load health score:', err);
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
            <Activity className="w-5 h-5 text-[#4edea3]" />
            Restaurant Health Score Index (0-100)
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Weighted composite index of sales pacing, margins, kitchen SLA, retention & waste</p>
        </div>

        <button
          onClick={loadHealthScore}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Score Hero & Positive/Negative Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 0-100 Circular Hero Card */}
        <div className="bg-[#1c1b1b] border-2 border-[#4edea3]/40 rounded-2xl p-6 shadow-emerald flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono uppercase text-[#99907c] tracking-wider mb-2">Overall Restaurant Health</span>
          <div className="relative w-40 h-40 rounded-full border-8 border-[#005236] flex items-center justify-center bg-[#131313] shadow-inner my-2">
            <div className="text-5xl font-extrabold text-[#4edea3] font-mono">
              {healthData?.health_score || 87}
            </div>
            <span className="text-xs font-mono text-[#99907c] absolute bottom-6">/ 100</span>
          </div>
          <span className="text-xs font-bold text-[#4edea3] font-mono bg-[#005236]/40 px-3 py-1 rounded-full border border-[#4edea3]/30 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Optimal Performance
          </span>
          <p className="text-[11px] text-[#d0c5af] font-mono mt-3">
            +{healthData?.health_score - healthData?.previous_period_score || 3} pts vs previous period (84/100)
          </p>
        </div>

        {/* Right 2 Cols: Positive vs Negative Drivers */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Positive Factors */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-[#4edea3] font-bold text-xs pb-2 border-b border-[#2a2a2a]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Growth Drivers (+)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#d0c5af]">
              {healthData?.positive_factors?.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#131313] p-2.5 rounded-lg border border-[#353535]">
                  <ArrowUpRight className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Negative Drag Factors */}
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-[#ff949c] font-bold text-xs pb-2 border-b border-[#2a2a2a]">
              <AlertTriangle className="w-4 h-4" />
              <span>Operational Drag Factors (-)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#d0c5af]">
              {healthData?.negative_factors?.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#131313] p-2.5 rounded-lg border border-[#353535]">
                  <AlertTriangle className="w-4 h-4 text-[#ff949c] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 6 Dimension Breakdown */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#d4af37]" />
            Operational Dimension Radar Breakdown
          </h2>
          <span className="text-[10px] font-mono text-[#99907c]">Audit Standards</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthData?.dimensions?.map(dim => (
            <div key={dim.name} className="bg-[#131313] border border-[#2a2a2a] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">{dim.name}</span>
                <span className="text-[#4edea3] font-extrabold">{dim.score}/100</span>
              </div>
              <div className="w-full h-2 bg-[#20201f] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d4af37] to-[#4edea3] rounded-full" style={{ width: `${dim.score}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#99907c]">
                <span>Weight: {dim.weight}</span>
                <span className="text-[#d0c5af]">{dim.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
