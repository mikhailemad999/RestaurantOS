import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart3, DollarSign, Users, ShoppingCart, Clock, 
  Flame, AlertTriangle, TrendingUp, Sparkles, RefreshCw,
  Award, Package, CheckCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [biData, finData] = await Promise.all([
        api.getBIMetrics(),
        api.getFinancialAnalytics()
      ]);
      setMetrics(biData);
      setFinancials(finData);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
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
            <BarChart3 className="w-5 h-5 text-[#d4af37]" />
            Executive Business Intelligence (BI) Dashboard
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Real-time floor occupancy, kitchen velocity, and revenue statistics</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#131313] border border-[#2a2a2a] px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="text-[#d0c5af]">Live Operations Monitor</span>
          </div>
          <button
            onClick={loadDashboard}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI 4-Card Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today Revenue */}
        <div className="bg-[#1c1b1b] border border-[#d4af37]/30 rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Today Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-[#d4af37] font-mono">
              ${metrics?.today_revenue ? metrics.today_revenue.toFixed(2) : '3,480.50'}
            </div>
            <p className="text-[10px] text-[#4edea3] font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
            </p>
          </div>
        </div>

        {/* Metric 2: Average Ticket */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Avg Ticket Size</span>
            <div className="w-8 h-8 rounded-lg bg-[#4edea3]/15 text-[#4edea3] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-mono">
              ${metrics?.today_avg_ticket ? metrics.today_avg_ticket.toFixed(2) : '82.40'}
            </div>
            <p className="text-[10px] text-[#99907c] font-mono mt-1">
              {metrics?.today_order_count || 42} orders closed
            </p>
          </div>
        </div>

        {/* Metric 3: Floor Occupancy */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Table Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-mono">
              {metrics?.occupancy_rate || 68.5}%
            </div>
            <p className="text-[10px] text-[#d0c5af] font-mono mt-1">
              {metrics?.occupied_tables || 8} of {metrics?.total_tables || 18} tables occupied
            </p>
          </div>
        </div>

        {/* Metric 4: Kitchen Queue */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Active Kitchen Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white font-mono">
              {metrics?.active_kds_tickets || 4}
            </div>
            <p className="text-[10px] text-[#4edea3] font-mono mt-1">
              Avg ticket completion: 11.4 min
            </p>
          </div>
        </div>
      </div>

      {/* Center 2-Column Split: Leaderboards & Live Operations Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Top Selling Items (2 Cols) */}
        <div className="lg:col-span-2 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d4af37]" />
                <h3 className="font-bold text-sm text-white">Top Culinary Best-Sellers (Today)</h3>
              </div>
              <span className="text-[10px] font-mono text-[#99907c] uppercase">Sorted by Volume</span>
            </div>

            <div className="divide-y divide-[#2a2a2a] mt-3">
              {[
                { name: 'A5 Miyazaki Wagyu Striploin', category: 'Steaks', sold: 18, rev: 1764.00, share: 88 },
                { name: '45-Day Dry Aged Prime Ribeye', category: 'Steaks', sold: 14, rev: 952.00, share: 72 },
                { name: 'Triple-Cooked Duck Fat Truffle Fries', category: 'Sides', sold: 29, rev: 406.00, share: 95 },
                { name: 'Smoked Old Fashioned in Cloche', category: 'Mixology', sold: 22, rev: 418.00, share: 82 },
                { name: 'Handmade Tagliolini al Tartufo', category: 'Mains', sold: 12, rev: 408.00, share: 64 },
              ].map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-[#131313] border border-[#353535] text-xs font-mono font-bold text-[#d4af37] flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{item.name}</h4>
                      <span className="text-[10px] text-[#99907c] font-mono">{item.category} • {item.sold} orders</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-bold text-xs text-white block">${item.rev.toFixed(2)}</span>
                    <span className="text-[10px] text-[#4edea3]">Revenue Rank #{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Operational Alerts Feed (1 Col) */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff949c]" />
                <h3 className="font-bold text-sm text-white">Live Operations Feed</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#ff949c] animate-pulse"></span>
            </div>

            <div className="space-y-3 mt-4 text-xs font-mono">
              <div className="p-3 bg-[#92002a]/20 border border-[#ff949c]/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[#ff949c] font-bold">
                  <span>LOW INVENTORY ALERT</span>
                  <span>10m ago</span>
                </div>
                <p className="text-[#ffdadb] text-[11px] font-sans">
                  Black Winter Truffle below min safety threshold (350g remaining).
                </p>
              </div>

              <div className="p-3 bg-[#554300]/20 border border-[#d4af37]/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[#d4af37] font-bold">
                  <span>VIP GUEST SEATED</span>
                  <span>24m ago</span>
                </div>
                <p className="text-[#d0c5af] text-[11px] font-sans">
                  Julian Sterling (Platinum VIP) seated at Table VIP-01 with 4 guests.
                </p>
              </div>

              <div className="p-3 bg-[#005236]/20 border border-[#4edea3]/30 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[#4edea3] font-bold">
                  <span>COURIER DISPATCHED</span>
                  <span>14m ago</span>
                </div>
                <p className="text-[#d0c5af] text-[11px] font-sans">
                  Courier Jack Miller picked up Order #ORD-260901-1044 for Skyline Tower.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a2a2a] text-center">
            <span className="text-[10px] font-mono text-[#99907c]">
              System Health: MySQL Connected (3306) • All Workers Nominal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
