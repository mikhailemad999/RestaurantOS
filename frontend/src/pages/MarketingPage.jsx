import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Megaphone, Plus, Rocket, DollarSign, Users, Mail, 
  MessageSquare, RefreshCw, Sparkles, TrendingUp, CheckCircle2
} from 'lucide-react';

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    campaign_type: 'WIN_BACK',
    channel: 'SMS',
    target_segment: 'AT_RISK',
    discount_percent: 15,
    budget: 150
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.getCampaigns();
      setCampaigns(res);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id) => {
    try {
      await api.launchCampaign(id);
      loadCampaigns();
    } catch (err) {
      alert(`Error launching campaign: ${err.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCampaign({
        ...newCampaign,
        messages_sent: 0,
        redeemed_count: 0,
        revenue_generated: '0.00',
        profit_generated: '0.00',
        status: 'DRAFT'
      });
      setIsCreateOpen(false);
      loadCampaigns();
    } catch (err) {
      alert(`Error creating campaign: ${err.message}`);
    }
  };

  const totalRevenue = campaigns.reduce((s, c) => s + parseFloat(c.revenue_generated || 0), 0);
  const totalProfit = campaigns.reduce((s, c) => s + parseFloat(c.profit_generated || 0), 0);

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#d4af37]" />
            Marketing Campaign Engine & Automated Guest Win-Back
          </h1>
          <p className="text-xs text-[#99907c] font-mono">SMS, Email, WhatsApp multi-channel outreach with measured revenue ROI tracking</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Campaign</span>
        </button>
      </div>

      {/* ROI Aggregate Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1c1b1b] border border-[#005236] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Total Marketing Revenue</span>
            <div className="text-2xl font-extrabold text-[#4edea3] font-mono mt-1">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <DollarSign className="w-8 h-8 text-[#4edea3]/40" />
        </div>

        <div className="bg-[#1c1b1b] border border-[#554300] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Total Net Profit Generated</span>
            <div className="text-2xl font-extrabold text-[#d4af37] font-mono mt-1">
              ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-[#d4af37]/40" />
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#99907c]">Total Messages Dispatched</span>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">
              {campaigns.reduce((s, c) => s + (c.messages_sent || 0), 0)} SMS / WhatsApp
            </div>
          </div>
          <Users className="w-8 h-8 text-white/30" />
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.map(c => (
          <div key={c.id} className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-[#20201f] text-[#d0c5af] px-2.5 py-1 rounded">
                  {c.channel} • {c.target_segment}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  c.status === 'ACTIVE' ? 'bg-[#005236] text-[#4edea3]' : 'bg-[#554300] text-[#d4af37]'
                }`}>
                  {c.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mt-3 font-sans">{c.name}</h3>

              <div className="grid grid-cols-3 gap-2 mt-4 bg-[#131313] p-3 rounded-xl text-center text-xs font-mono border border-[#2a2a2a]">
                <div>
                  <span className="text-[9px] text-[#99907c] block">DISPATCHED</span>
                  <span className="font-bold text-white">{c.messages_sent}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">REDEEMED</span>
                  <span className="font-bold text-[#d4af37]">{c.redeemed_count}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#99907c] block">PROFIT</span>
                  <span className="font-bold text-[#4edea3]">${parseFloat(c.profit_generated).toFixed(0)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#99907c]">Incentive: {c.discount_percent}% OFF</span>

              {c.status === 'DRAFT' ? (
                <button
                  onClick={() => handleLaunch(c.id)}
                  className="px-3.5 py-1.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-emerald cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Launch Campaign</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono text-[#4edea3] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Running Live
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-[#2a2a2a]">Create Marketing Campaign</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Truffle Tasting Incentive"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-sans focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Channel</label>
                  <select
                    value={newCampaign.channel}
                    onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="SMS">SMS Direct</option>
                    <option value="WHATSAPP">WhatsApp Business</option>
                    <option value="EMAIL">Email Newsletter</option>
                    <option value="PUSH">Mobile App Push</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Target Segment</label>
                  <select
                    value={newCampaign.target_segment}
                    onChange={(e) => setNewCampaign({ ...newCampaign, target_segment: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                  >
                    <option value="AT_RISK">At-Risk Inactive Diners (&gt;30d)</option>
                    <option value="VIP">Platinum VIP Guests</option>
                    <option value="ALL">All CRM Contacts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newCampaign.discount_percent}
                    onChange={(e) => setNewCampaign({ ...newCampaign, discount_percent: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
