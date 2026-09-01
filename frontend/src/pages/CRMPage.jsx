import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Sparkles, Search, Plus, Phone, Mail, 
  Award, Calendar, Heart, Shield, X
} from 'lucide-react';

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // New Customer Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    vip_tier: 'BRONZE',
    dietary_tags: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers(searchQuery);
      setCustomers(data);
      if (data.length > 0 && !selectedCustomer) {
        setSelectedCustomer(data[0]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCust);
      setIsCreateModalOpen(false);
      setNewCust({ name: '', phone: '', email: '', vip_tier: 'BRONZE', dietary_tags: '', notes: '' });
      loadCustomers();
    } catch (err) {
      alert(`Error creating customer: ${err.message}`);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesTier = selectedTier === 'ALL' || c.vip_tier === selectedTier;
    return matchesTier;
  });

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 text-purple-200';
      case 'GOLD': return 'bg-[#574500]/40 border-[#d4af37] text-[#d4af37]';
      case 'SILVER': return 'bg-slate-700/40 border-slate-400 text-slate-200';
      case 'BRONZE': return 'bg-amber-900/30 border-amber-600 text-amber-300';
      default: return 'bg-[#20201f] border-[#353535] text-white';
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            Guest CRM & Loyalty Rewards
          </h1>
          <p className="text-xs text-[#99907c] font-mono">VIP tier progression, dietary preferences, and spending analytics</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-gold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Guest Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1c1b1b] p-3 rounded-xl border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full bg-[#131313] border border-[#353535] text-white text-xs rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedTier === tier
                  ? 'bg-[#d4af37] text-black font-bold'
                  : 'bg-[#131313] border border-[#353535] text-[#d0c5af]'
              }`}
            >
              {tier === 'ALL' ? 'All VIP Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Table + Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Customer Table */}
        <div className="flex-1 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
                <tr>
                  <th className="p-3.5">Guest & Contact</th>
                  <th className="p-3.5">VIP Tier</th>
                  <th className="p-3.5">Loyalty Points</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Visits</th>
                  <th className="p-3.5">Dietary / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#99907c] font-sans">
                      Loading CRM guest database...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-[#99907c] font-sans">
                      No guests match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <tr 
                        key={cust.id}
                        onClick={() => setSelectedCustomer(cust)}
                        className={`hover:bg-[#20201f] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#20201f] border-l-2 border-[#d4af37]' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <span className="font-bold text-white font-sans block">{cust.name}</span>
                          <span className="text-[10px] text-[#99907c]">{cust.phone}</span>
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(cust.vip_tier)}`}>
                            {cust.vip_tier}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-[#d4af37]">
                          {cust.loyalty_points} pts
                        </td>

                        <td className="p-3.5 font-bold text-white">
                          ${parseFloat(cust.total_spent).toFixed(2)}
                        </td>

                        <td className="p-3.5 text-[#d0c5af]">{cust.visit_count}</td>

                        <td className="p-3.5 text-[#99907c] max-w-xs truncate">
                          {cust.dietary_tags ? (
                            <span className="text-[#ff949c] font-semibold">{cust.dietary_tags} • </span>
                          ) : null}
                          {cust.notes || 'No special requests'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Profile Drawer */}
        {selectedCustomer && (
          <div className="w-full lg:w-80 bg-[#1c1b1b] border border-[#d4af37]/30 rounded-xl p-5 shadow-2xl flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div className="text-center pb-4 border-b border-[#2a2a2a]">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37] flex items-center justify-center text-xl font-bold text-[#d4af37] mb-2 font-sans">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <h3 className="text-base font-bold text-white font-sans">{selectedCustomer.name}</h3>
                <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getTierBadge(selectedCustomer.vip_tier)}`}>
                  {selectedCustomer.vip_tier} VIP MEMBER
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#131313] p-2.5 rounded border border-[#353535] text-center">
                  <span className="text-[10px] text-[#99907c] uppercase block">Points</span>
                  <span className="text-base font-bold text-[#d4af37]">{selectedCustomer.loyalty_points}</span>
                </div>
                <div className="bg-[#131313] p-2.5 rounded border border-[#353535] text-center">
                  <span className="text-[10px] text-[#99907c] uppercase block">Lifetime</span>
                  <span className="text-base font-bold text-white">${parseFloat(selectedCustomer.total_spent).toFixed(2)}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#d0c5af] bg-[#131313] p-2 rounded border border-[#353535]">
                  <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{selectedCustomer.phone}</span>
                </div>
                {selectedCustomer.email && (
                  <div className="flex items-center gap-2 text-[#d0c5af] bg-[#131313] p-2 rounded border border-[#353535]">
                    <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span className="truncate">{selectedCustomer.email}</span>
                  </div>
                )}
              </div>

              {/* Notes & Dietary Tags */}
              <div className="bg-[#131313] p-3 rounded-lg border border-[#353535] space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#99907c] block">Dietary & VIP Notes:</span>
                {selectedCustomer.dietary_tags && (
                  <span className="inline-block bg-[#92002a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30 px-2 py-0.5 rounded text-[10px] font-mono">
                    Allergy: {selectedCustomer.dietary_tags}
                  </span>
                )}
                <p className="text-white text-xs font-sans mt-1">
                  {selectedCustomer.notes || 'Guest has no custom preferences noted.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2a2a2a]">
              <button 
                onClick={() => alert(`Rewards voucher printed for ${selectedCustomer.name}!`)}
                className="w-full py-2.5 bg-[#2a2a2a] hover:bg-[#353535] text-[#d4af37] font-bold text-xs rounded-lg flex items-center justify-center gap-2 uppercase font-mono"
              >
                <Sparkles className="w-4 h-4" />
                <span>Issue 500 Pts Reward</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CUSTOMER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">New Guest Profile</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Lord Harrington"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">VIP Tier</label>
                  <select
                    value={newCust.vip_tier}
                    onChange={(e) => setNewCust({ ...newCust, vip_tier: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Dietary Tags / Allergies</label>
                <input
                  type="text"
                  value={newCust.dietary_tags}
                  onChange={(e) => setNewCust({ ...newCust, dietary_tags: e.target.value })}
                  placeholder="e.g. Gluten-Free, No Shellfish, Nut Allergy"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">VIP Notes</label>
                <textarea
                  rows="2"
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  placeholder="e.g. Prefers table 12, loves sparkling water"
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
