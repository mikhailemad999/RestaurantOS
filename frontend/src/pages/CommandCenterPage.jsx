import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Compass, DollarSign, Users, Flame, Truck, AlertTriangle, 
  TrendingUp, Shield, Sparkles, RefreshCw, ChevronRight, Activity, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCommandCenter();
      setData(res);
    } catch (err) {
      console.error('Failed to load command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Top Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#d4af37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gold">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37] text-black font-extrabold flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Restaurant Command Center
              <span className="text-[10px] font-mono bg-[#005236] text-[#4edea3] px-2 py-0.5 rounded border border-[#4edea3]/30">
                LIVE METRICS ACTIVE
              </span>
            </h1>
            <p className="text-xs text-[#99907c] font-mono">Master operations, revenue pacing, kitchen SLA & risk governance</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/daily-brief')}
            className="px-3.5 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-gold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Brief</span>
          </button>
          <button
            onClick={() => navigate('/ai-manager')}
            className="px-3.5 py-2 bg-[#20201f] hover:bg-[#2a2a2a] text-white border border-[#353535] text-xs font-bold rounded-lg flex items-center gap-1.5"
          >
            <span>Ask AI Manager</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Quadrants: Revenue, Operations, Profitability, Governance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Velocity */}
        <div className="bg-[#1c1b1b] border border-[#d4af37]/30 rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Gross Revenue Today</span>
            <DollarSign className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-[#d4af37] font-mono">
              ${data?.revenue?.today ? data.revenue.today.toFixed(2) : '3,480.50'}
            </div>
            <span className="text-[10px] text-[#4edea3] font-mono flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +{data?.revenue?.growth_pct || 11.5}% vs yesterday
            </span>
          </div>
          <div className="pt-2 border-t border-[#2a2a2a] text-[10px] font-mono text-[#99907c] flex justify-between">
            <span>MTD: ${data?.revenue?.month_to_date?.toLocaleString() || '98,400'}</span>
            <span className="text-white font-bold">Pacing: High</span>
          </div>
        </div>

        {/* Card 2: Floor & Table Operations */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Floor Occupancy</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-white font-mono">
              {data?.operations?.occupancy_pct || 68.5}%
            </div>
            <span className="text-[10px] text-[#d0c5af] font-mono block mt-0.5">
              {data?.operations?.occupied_tables || 8} of {data?.operations?.total_tables || 18} Dining Tables Seated
            </span>
          </div>
          <div className="pt-2 border-t border-[#2a2a2a] text-[10px] font-mono text-[#99907c] flex justify-between">
            <span>Waitlist: {data?.operations?.active_waitlist_guests || 2} Parties</span>
            <span className="text-[#4edea3] cursor-pointer" onClick={() => navigate('/tables')}>View Floor →</span>
          </div>
        </div>

        {/* Card 3: Kitchen Velocity & Dispatch */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Kitchen Queue & Logistics</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-white font-mono">
              {data?.operations?.active_kds_tickets || 4} Orders Active
            </div>
            <span className="text-[10px] text-[#4edea3] font-mono block mt-0.5">
              Avg Ticket Prep: {data?.operations?.avg_kitchen_time_min || 11.4} min (SLA: 15.0m)
            </span>
          </div>
          <div className="pt-2 border-t border-[#2a2a2a] text-[10px] font-mono text-[#99907c] flex justify-between">
            <span>Dispatches: {data?.operations?.active_deliveries || 2} Couriers</span>
            <span className="text-amber-400 cursor-pointer" onClick={() => navigate('/kds')}>KDS Station →</span>
          </div>
        </div>

        {/* Card 4: Profitability & Margins */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Food Cost % (COGS)</span>
            <Activity className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-[#4edea3] font-mono">
              {data?.profitability?.food_cost_pct || 28.4}%
            </div>
            <span className="text-[10px] text-[#d0c5af] font-mono block mt-0.5">
              Gross Margin: {data?.profitability?.gross_margin_pct || 71.6}%
            </span>
          </div>
          <div className="pt-2 border-t border-[#2a2a2a] text-[10px] font-mono text-[#99907c] flex justify-between">
            <span>Est. Net Profit: ${data?.profitability?.estimated_net_profit?.toFixed(2) || '835.32'}</span>
            <span className="text-[#4edea3]">Optimal</span>
          </div>
        </div>
      </div>

      {/* Main Split: Governance Alert Center & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Actionable Decision Center */}
        <div className="lg:col-span-2 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <h2 className="font-bold text-sm text-white">Priority Actions for Today</h2>
            </div>
            <span className="text-[10px] font-mono text-[#99907c]">AI & Rules Engine</span>
          </div>

          <div className="space-y-3">
            {[
              { id: 1, title: 'Approve Truffle Tagliolini Price Adjustment', desc: 'Supplier unit cost increased by 8.5%. Recommended bump: $34 -> $38.', route: '/pricing', badge: 'PRICING', badgeColor: 'bg-[#554300] text-[#d4af37]' },
              { id: 2, title: 'Wagyu Striploin Reorder Point Triggered', desc: 'Current stock is 5.0 KG (safety: 7.5 KG). Purchase Order #PO-8821 ready.', route: '/inventory-intelligence', badge: 'INVENTORY', badgeColor: 'bg-blue-900/40 text-blue-300' },
              { id: 3, title: '1 Pending Refund Approval from Cashier David', desc: 'Order #ORD-1039 requested $45.00 manual discount override.', route: '/approvals', badge: 'APPROVAL', badgeColor: 'bg-purple-900/40 text-purple-300' },
              { id: 4, title: 'Launch Win-Back SMS Campaign to 14 Inactive Diners', desc: 'Historical ROI is 6.2x with expected +$336.00 profit.', route: '/marketing', badge: 'MARKETING', badgeColor: 'bg-[#005236] text-[#4edea3]' },
            ].map(item => (
              <div key={item.id} className="p-3.5 bg-[#131313] hover:bg-[#20201f] border border-[#2a2a2a] hover:border-[#d4af37]/40 rounded-xl flex items-center justify-between transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h3 className="font-bold text-xs text-white">{item.title}</h3>
                  </div>
                  <p className="text-[11px] text-[#99907c] font-sans">{item.desc}</p>
                </div>

                <button
                  onClick={() => navigate(item.route)}
                  className="px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0 font-mono"
                >
                  <span>Review</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Governance & Risk Alerts */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ff949c]" />
              <h2 className="font-bold text-sm text-white">Risk Center Feed</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#ff949c] animate-pulse"></span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 bg-[#92002a]/20 border border-[#ff949c]/30 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-[#ff949c]">
                <span>FOOD COST INFLATION</span>
                <span>CRITICAL</span>
              </div>
              <p className="text-[#ffdadb] text-[11px] font-sans">
                French Truffle supplier price jumped 8.5%. Tagliolini margin dropped below 65%.
              </p>
            </div>

            <div className="p-3 bg-[#554300]/20 border border-[#d4af37]/30 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-[#d4af37]">
                <span>GRILL BOTTLENECK</span>
                <span>MEDIUM</span>
              </div>
              <p className="text-[#d0c5af] text-[11px] font-sans">
                Grill station ticket times averaged 16.2 min during 20:00 rush yesterday.
              </p>
            </div>

            <div className="p-3 bg-[#005236]/20 border border-[#4edea3]/30 rounded-xl space-y-1">
              <div className="flex justify-between font-bold text-[#4edea3]">
                <span>VIP GUEST ARRIVAL</span>
                <span>CONFIRMED</span>
              </div>
              <p className="text-[#d0c5af] text-[11px] font-sans">
                Julian Sterling party reserved Table VIP-01 with champagne on ice.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2a2a2a] text-center">
            <button
              onClick={() => navigate('/risk-center')}
              className="text-xs text-[#d4af37] font-mono hover:underline"
            >
              Open Full Risk & Governance Center →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
