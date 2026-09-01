import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Flame, Clock, CheckCircle2, RotateCcw, AlertCircle, 
  Utensils, ChefHat, RefreshCw, Layers, CheckSquare
} from 'lucide-react';

export default function KDSPage() {
  const [station, setStation] = useState('ALL');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadTickets();
    const interval = setInterval(loadTickets, 6000);
    return () => clearInterval(interval);
  }, [station]);

  const loadTickets = async () => {
    try {
      const data = await api.getKDSTickets(station);
      setTickets(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load KDS tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBumpItem = async (itemId) => {
    try {
      await api.bumpKDSItem(itemId);
      loadTickets();
    } catch (err) {
      console.error('Failed to bump item:', err);
    }
  };

  const handleBumpTicket = async (orderId) => {
    try {
      await api.bumpKDSTicket(orderId);
      loadTickets();
    } catch (err) {
      console.error('Failed to bump ticket:', err);
    }
  };

  const handleRecallTicket = async (orderId) => {
    try {
      await api.recallKDSTicket(orderId);
      loadTickets();
    } catch (err) {
      console.error('Failed to recall ticket:', err);
    }
  };

  const stations = [
    { id: 'ALL', label: 'All Kitchen Stations' },
    { id: 'GRILL', label: 'Grill & Steaks' },
    { id: 'FRYER', label: 'Fryer & Apps' },
    { id: 'ASSEMBLY', label: 'Cold & Assembly' },
    { id: 'BAR', label: 'Beverage & Bar' },
  ];

  const getTimerColor = (elapsedSec) => {
    const minutes = elapsedSec / 60;
    if (minutes < 10) return 'text-[#4edea3] bg-[#005236]/30 border-[#4edea3]/40';
    if (minutes < 18) return 'text-[#f2ca50] bg-[#574500]/30 border-[#f2ca50]/40';
    return 'text-[#ffb4ab] bg-[#93000a]/40 border-[#ffb4ab] animate-pulse';
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Kitchen Display System (KDS)</h1>
            <p className="text-xs text-[#99907c] font-mono">Live production line queue • Auto-syncing</p>
          </div>
        </div>

        {/* Station Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#131313] p-1 rounded-lg border border-[#353535]">
          {stations.map(s => (
            <button
              key={s.id}
              onClick={() => setStation(s.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                station === s.id
                  ? 'bg-[#d4af37] text-black font-bold shadow-sm'
                  : 'text-[#d0c5af] hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={loadTickets}
            title="Refresh KDS Queue"
            className="p-1.5 text-[#99907c] hover:text-white rounded ml-1"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ticket Board Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 text-[#99907c]">
          <span className="font-mono text-xs animate-pulse">Loading Kitchen Tickets...</span>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#99907c] bg-[#1c1b1b]/50 rounded-xl border border-dashed border-[#2a2a2a]">
          <CheckCircle2 className="w-12 h-12 text-[#4edea3] mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">All Kitchen Orders Cleared!</h3>
          <p className="text-xs text-[#99907c] mt-1">No active tickets waiting at {station === 'ALL' ? 'any station' : station}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tickets.map(t => {
            const isReady = t.status === 'READY';
            const elapsedMin = Math.floor(t.elapsed_seconds / 60);
            const elapsedSec = t.elapsed_seconds % 60;

            return (
              <div 
                key={t.order_id}
                className={`bg-[#1c1b1b] rounded-xl border flex flex-col justify-between overflow-hidden shadow-card transition-all ${
                  isReady ? 'border-[#4edea3]/50 bg-[#003824]/15' : 'border-[#353535] hover:border-[#d4af37]'
                }`}
              >
                {/* Ticket Top Banner */}
                <div className="p-3 bg-[#20201f] border-b border-[#2a2a2a] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-white">#{t.order_number}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#131313] text-[#d4af37] border border-[#d4af37]/30">
                        {t.order_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#99907c] font-mono mt-0.5">
                      {t.table_number !== 'N/A' ? `Table ${t.table_number} (${t.section})` : 'Direct / Pickup'}
                    </p>
                  </div>

                  {/* Elapsed Timer Badge */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${getTimerColor(t.elapsed_seconds)}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsedMin}:{elapsedSec < 10 ? `0${elapsedSec}` : elapsedSec}</span>
                  </div>
                </div>

                {/* Special Chef Instructions if any */}
                {t.special_instructions && (
                  <div className="bg-[#92002a]/30 border-b border-[#ff949c]/30 px-3 py-1.5 text-[11px] text-[#ffdadb] flex items-center gap-1.5 font-mono">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#ff949c]" />
                    <span>{t.special_instructions}</span>
                  </div>
                )}

                {/* Line Items */}
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-72">
                  {t.items.map(item => {
                    const itemDone = item.status === 'READY' || item.status === 'SERVED';
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleBumpItem(item.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-start justify-between ${
                          itemDone 
                            ? 'bg-[#005236]/30 border-[#4edea3]/40 opacity-60' 
                            : 'bg-[#20201f] border-[#2a2a2a] hover:border-[#99907c]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#d4af37]">{item.quantity}x</span>
                            <span className={`text-xs font-bold ${itemDone ? 'line-through text-[#d0c5af]' : 'text-white'}`}>
                              {item.menu_item_name}
                            </span>
                          </div>

                          {/* Selected Modifiers */}
                          {item.selected_modifiers && item.selected_modifiers.length > 0 && (
                            <div className="text-[10px] text-[#4edea3] font-mono pl-5">
                              {item.selected_modifiers.map(m => m.name).join(', ')}
                            </div>
                          )}

                          {item.notes && (
                            <p className="text-[10px] text-[#ffb4ab] italic font-mono pl-5">
                              * {item.notes}
                            </p>
                          )}
                        </div>

                        <div className={`p-1 rounded ${itemDone ? 'text-[#4edea3]' : 'text-[#99907c]'}`}>
                          <CheckSquare className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="p-3 bg-[#20201f] border-t border-[#2a2a2a] flex items-center gap-2">
                  <button
                    onClick={() => handleBumpTicket(t.order_id)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      isReady 
                        ? 'bg-[#4edea3] hover:bg-[#6ffbbe] text-black shadow-emerald' 
                        : 'bg-[#d4af37] hover:bg-[#f2ca50] text-black shadow-gold'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isReady ? 'Mark Served / Expedite' : 'Bump Ticket'}</span>
                  </button>

                  <button
                    onClick={() => handleRecallTicket(t.order_id)}
                    title="Recall to Cooking"
                    className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
