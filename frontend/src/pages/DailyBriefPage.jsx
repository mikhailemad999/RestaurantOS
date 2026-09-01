import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, Calendar, TrendingUp, AlertTriangle, CheckCircle2, 
  ArrowUpRight, DollarSign, Users, RefreshCw, ChefHat
} from 'lucide-react';

export default function DailyBriefPage() {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrief();
  }, []);

  const loadBrief = async () => {
    try {
      setLoading(true);
      const res = await api.getDailyBrief();
      setBrief(res);
    } catch (err) {
      console.error('Failed to load daily brief:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-5 rounded-2xl border border-[#d4af37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gold">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#d4af37] text-black font-extrabold flex items-center justify-center shadow-gold">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold tracking-widest block">Executive Briefing</span>
            <h1 className="text-xl font-extrabold text-white tracking-wide">
              {brief?.date || 'Today\'s Executive Morning Brief'}
            </h1>
          </div>
        </div>

        <button
          onClick={loadBrief}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Layout for Brief Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Yesterday's Performance Summary */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4edea3]" />
              Yesterday's Performance Audit
            </h2>
            <span className="text-[10px] font-mono text-[#4edea3] font-bold">{brief?.yesterday_summary?.revenue_growth}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">SETTLED REVENUE</span>
              <span className="text-lg font-extrabold text-[#d4af37]">${brief?.yesterday_summary?.revenue}</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">AVERAGE TICKET</span>
              <span className="text-lg font-extrabold text-white">${brief?.yesterday_summary?.average_ticket}</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">FOOD COST (COGS)</span>
              <span className="text-sm font-bold text-[#4edea3]">{brief?.yesterday_summary?.food_cost_pct}</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">CUSTOMER RETENTION</span>
              <span className="text-sm font-bold text-[#4edea3]">{brief?.yesterday_summary?.customer_retention}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Top Product & Biggest Bottleneck */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#99907c] block">Top Product Spotlight</span>
            <div className="p-3 bg-[#005236]/30 border border-[#4edea3]/40 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-white">{brief?.top_product?.name}</h3>
                <span className="text-[11px] font-mono text-[#d0c5af]">{brief?.top_product?.orders} orders • ${brief?.top_product?.revenue}</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#4edea3]">{brief?.top_product?.margin} Margin</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#99907c] block">Operational Bottleneck Identified</span>
            <div className="p-3 bg-[#92002a]/20 border border-[#ff949c]/40 rounded-xl space-y-1">
              <h3 className="font-bold text-xs text-[#ff949c]">{brief?.biggest_problem?.title}</h3>
              <p className="text-[11px] text-[#ffdadb] font-sans">{brief?.biggest_problem?.description}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Forecast & Prep Guidance */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2a] text-[#d4af37] font-bold text-sm">
            <ChefHat className="w-4 h-4" />
            <span>Today's Forecast & Kitchen Prep</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">EXPECTED REVENUE</span>
              <span className="text-base font-bold text-[#d4af37]">${brief?.today_forecast?.expected_revenue}</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
              <span className="text-[10px] text-[#99907c] block">PEAK SERVICE RUSH</span>
              <span className="text-base font-bold text-white">{brief?.today_forecast?.expected_peak_window}</span>
            </div>
          </div>

          <p className="text-xs text-[#d0c5af] font-sans bg-[#131313] p-3 rounded-xl border border-[#2a2a2a]">
            💡 <span className="font-bold text-white">Kitchen Prep Note:</span> {brief?.today_forecast?.recommended_prep}
          </p>
        </div>

        {/* Card 4: Top 3 Urgent Actions */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <h2 className="font-bold text-sm text-white">Top 3 Executive Action Items</h2>
            <span className="text-[10px] font-mono text-[#d4af37]">Priority Queue</span>
          </div>

          <div className="space-y-2.5">
            {brief?.top_actions?.map(act => (
              <div key={act.id} className="p-3 bg-[#131313] border border-[#2a2a2a] rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#20201f] text-[#d4af37] font-bold flex items-center justify-center shrink-0 text-[11px] font-mono">
                    {act.id}
                  </span>
                  <span className="text-[#d0c5af] font-sans">{act.action}</span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 ${
                  act.urgency === 'HIGH' ? 'bg-[#92002a]/40 text-[#ff949c]' : 'bg-[#554300]/40 text-[#d4af37]'
                }`}>
                  {act.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
