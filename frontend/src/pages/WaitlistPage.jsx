import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Calendar, Clock, Plus, Check, X, RefreshCw, 
  Phone, Sparkles, CheckCircle2, UserCheck
} from 'lucide-react';

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddWaitlistOpen, setIsAddWaitlistOpen] = useState(false);
  const [newWaitlist, setNewWaitlist] = useState({
    customer_name: '',
    phone: '',
    party_size: 2,
    preferred_section: 'Main Dining Room',
    estimated_wait_minutes: 15
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wList, resList] = await Promise.all([
        api.getWaitlist(),
        api.getReservations()
      ]);
      setWaitlist(wList);
      setReservations(resList);
    } catch (err) {
      console.error('Failed to load waitlist/reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatGuest = async (id) => {
    try {
      await api.seatWaitlistEntry(id);
      loadData();
    } catch (err) {
      alert(`Error seating guest: ${err.message}`);
    }
  };

  const handleAddWaitlist = async (e) => {
    e.preventDefault();
    try {
      await api.createWaitlistEntry({
        ...newWaitlist,
        status: 'WAITING'
      });
      setIsAddWaitlistOpen(false);
      setNewWaitlist({ customer_name: '', phone: '', party_size: 2, preferred_section: 'Main Dining Room', estimated_wait_minutes: 15 });
      loadData();
    } catch (err) {
      alert(`Error adding waitlist entry: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            Waitlist & VIP Table Reservations Management
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Live guest queue, wait time estimation algorithm & reservation schedule</p>
        </div>

        <button
          onClick={() => setIsAddWaitlistOpen(true)}
          className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Guest to Waitlist</span>
        </button>
      </div>

      {/* 2-Column Split: Active Waitlist Queue vs Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Live Waitlist */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4edea3]" />
              Live Door Waitlist Queue ({waitlist.filter(w => w.status === 'WAITING').length} Parties)
            </h2>
            <span className="text-[10px] font-mono text-[#4edea3]">● Real-Time Queue</span>
          </div>

          <div className="space-y-3">
            {waitlist.length === 0 ? (
              <p className="text-xs text-[#99907c] text-center py-8">No parties currently on waitlist.</p>
            ) : (
              waitlist.map(w => (
                <div
                  key={w.id}
                  className={`p-3.5 bg-[#131313] border rounded-xl flex items-center justify-between ${
                    w.status === 'WAITING' ? 'border-[#d4af37]/30' : 'border-[#2a2a2a] opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white font-sans">{w.customer_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#20201f] text-[#d0c5af]">
                        Party of {w.party_size}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        w.status === 'WAITING' ? 'bg-[#554300] text-[#d4af37]' : 'bg-[#005236] text-[#4edea3]'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#99907c] font-mono flex items-center gap-2">
                      <span>{w.phone}</span>
                      <span>• Pref: {w.preferred_section}</span>
                      <span>• Est: {w.estimated_wait_minutes} min</span>
                    </p>
                  </div>

                  {w.status === 'WAITING' && (
                    <button
                      onClick={() => handleSeatGuest(w.id)}
                      className="px-3 py-1.5 bg-[#005236] hover:bg-[#00704a] text-[#4edea3] border border-[#4edea3]/40 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Seat Table</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: VIP Table Reservations */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#d4af37]" />
              Upcoming VIP Table Reservations
            </h2>
            <span className="text-[10px] font-mono text-[#99907c]">Sync with CRM</span>
          </div>

          <div className="space-y-3">
            {reservations.map(res => (
              <div key={res.id} className="p-3.5 bg-[#131313] border border-[#2a2a2a] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">{res.customer_name}</span>
                    <span className="text-[10px] font-mono text-[#d4af37] bg-[#554300]/40 px-2 py-0.5 rounded">
                      Table {res.table_number || 'VIP-01'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#4edea3]">
                    {new Date(res.reservation_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[11px] text-[#99907c] font-sans">
                  Party of {res.party_size} • Phone: {res.phone} • Deposit: ${parseFloat(res.deposit_amount).toFixed(2)}
                </p>
                {res.notes && (
                  <p className="text-[11px] text-[#d0c5af] font-sans italic bg-[#20201f] p-1.5 rounded">
                    "{res.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Waitlist Modal */}
      {isAddWaitlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Add Walk-in to Waitlist</h3>
              <button onClick={() => setIsAddWaitlistOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWaitlist} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Guest Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Gilbert"
                  value={newWaitlist.customer_name}
                  onChange={(e) => setNewWaitlist({ ...newWaitlist, customer_name: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-sans focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Party Size</label>
                  <input
                    type="number"
                    min="1"
                    value={newWaitlist.party_size}
                    onChange={(e) => setNewWaitlist({ ...newWaitlist, party_size: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Est. Wait (Min)</label>
                  <input
                    type="number"
                    min="5"
                    value={newWaitlist.estimated_wait_minutes}
                    onChange={(e) => setNewWaitlist({ ...newWaitlist, estimated_wait_minutes: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Phone Number for SMS Alert</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={newWaitlist.phone}
                  onChange={(e) => setNewWaitlist({ ...newWaitlist, phone: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Preferred Section</label>
                <select
                  value={newWaitlist.preferred_section}
                  onChange={(e) => setNewWaitlist({ ...newWaitlist, preferred_section: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="Main Dining Room">Main Dining Room</option>
                  <option value="VIP Terrace">VIP Terrace</option>
                  <option value="Cocktail Lounge">Cocktail Lounge</option>
                  <option value="Garden Patio">Garden Patio</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWaitlistOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Confirm & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
