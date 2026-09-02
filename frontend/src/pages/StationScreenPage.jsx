import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Flame, CheckCircle, Clock, Volume2, AlertCircle, ArrowLeft,
  RotateCcw, Utensils, Pizza, Sandwich, Coffee, ChefHat, Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function StationScreenPage() {
  const { stationCode = 'PIZZA' } = useParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // ACTIVE, COMPLETED

  const fetchStationData = async () => {
    try {
      const [stnList, tktList] = await Promise.all([
        api.getKitchenStations(),
        api.getStationTickets(stationCode)
      ]);
      setStations(stnList || []);
      setTickets(tktList || []);
    } catch (err) {
      console.error('Failed to load station screen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
    const interval = setInterval(fetchStationData, 4000);
    return () => clearInterval(interval);
  }, [stationCode]);

  const currentStation = stations.find(s => s.code === stationCode) || {
    code: stationCode,
    name_en: `${stationCode} Station`,
    name_ar: `قسم ${stationCode}`,
    sla_minutes: 12
  };

  const handleBumpReady = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, 'READY');
      // Play web audio chime if sound enabled
      if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
          // Ignore audio restriction
        }
      }
      fetchStationData();
    } catch (err) {
      console.error('Failed to bump order:', err);
    }
  };

  const formatElapsed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStationIcon = (code) => {
    switch (code) {
      case 'PIZZA': return <Pizza className="w-6 h-6 text-amber-400" />;
      case 'SANDWICH': return <Sandwich className="w-6 h-6 text-rose-400" />;
      case 'GRILL': return <Flame className="w-6 h-6 text-orange-400" />;
      case 'FRYER': return <Utensils className="w-6 h-6 text-yellow-400" />;
      case 'BAR': return <Coffee className="w-6 h-6 text-emerald-400" />;
      default: return <ChefHat className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] p-4 lg:p-8 font-sans flex flex-col">
      {/* Top Station Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <Link
            to="/kitchen"
            className="p-3 bg-[#1c1b1b] hover:bg-[#2a2a2a] rounded-xl border border-[#353535] text-[#99907c] hover:text-white transition-colors"
            title="Back to Command Center"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-3 bg-[#1c1b1b] border border-[#f2ca50]/30 rounded-xl">
            {getStationIcon(stationCode)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase font-mono">
                {currentStation.name_en}
              </h1>
              <span className="text-sm text-[#f2ca50] font-arabic font-bold">
                {currentStation.name_ar}
              </span>
            </div>
            <p className="text-xs text-[#99907c] font-mono mt-0.5">
              LINE DISPLAY • TARGET SLA: {currentStation.sla_minutes} MINS • ACTIVE LOAD: {tickets.length} TICKETS
            </p>
          </div>
        </div>

        {/* Station Navigation Dropdown & Audio Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={stationCode}
            onChange={(e) => navigate(`/kitchen/station/${e.target.value}`)}
            className="bg-[#1c1b1b] border border-[#353535] text-white text-xs font-mono font-bold px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#f2ca50] cursor-pointer"
          >
            {stations.map(stn => (
              <option key={stn.code} value={stn.code}>
                {stn.name_en} ({stn.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-mono ${
              soundEnabled 
                ? 'bg-[#00a572]/20 border-[#00a572] text-[#4edea3]' 
                : 'bg-[#1c1b1b] border-[#353535] text-[#99907c]'
            }`}
            title="Toggle Sound Alerts"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="flex-1 mt-6">
        {tickets.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-2xl bg-[#131313]/60 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1c1b1b] flex items-center justify-center mb-4 text-[#4edea3]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Station All Clear</h3>
            <p className="text-sm text-[#99907c] max-w-sm">
              All tickets for {currentStation.name_en} are fulfilled. New orders will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {tickets.map(ticket => {
              const stationItems = ticket.items.filter(it => it.station === stationCode);
              const elapsedMins = Math.floor(ticket.elapsed_seconds / 60);
              const isUrgent = elapsedMins >= currentStation.sla_minutes;
              const isWarning = elapsedMins >= Math.floor(currentStation.sla_minutes * 0.7);

              return (
                <div
                  key={ticket.order_id}
                  className={`bg-[#181818] rounded-2xl overflow-hidden shadow-2xl border flex flex-col transition-transform hover:-translate-y-1 duration-200 ${
                    isUrgent
                      ? 'border-[#ff949c] shadow-[#ff949c]/20'
                      : isWarning
                      ? 'border-[#f59e0b] shadow-[#f59e0b]/15'
                      : 'border-[#2a2a2a]'
                  }`}
                >
                  {/* Ticket Header */}
                  <div className={`p-4 flex justify-between items-start border-b ${
                    isUrgent
                      ? 'bg-[#ff949c]/20 border-[#ff949c]/30 text-[#ff949c]'
                      : isWarning
                      ? 'bg-[#f59e0b]/15 border-[#f59e0b]/25 text-[#f59e0b]'
                      : 'bg-[#20201f] border-[#2a2a2a] text-white'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono tracking-tight">
                          #{ticket.order_number}
                        </span>
                        {isUrgent && (
                          <span className="bg-[#ff949c] text-[#131313] text-[10px] font-black uppercase px-2 py-0.5 rounded">
                            OVER SLA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#e5e2e1] font-semibold mt-1">
                        {ticket.order_type === 'DINE_IN' 
                          ? `Table ${ticket.table_number} • ${ticket.server_name}` 
                          : `${ticket.order_type}`}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className={`text-xl font-black tracking-wider ${
                        isUrgent ? 'text-[#ff949c] animate-pulse' : 'text-white'
                      }`}>
                        {formatElapsed(ticket.elapsed_seconds)}
                      </div>
                      <span className="text-[10px] text-[#99907c] uppercase">Prep Time</span>
                    </div>
                  </div>

                  {/* Station Items List */}
                  <div className="p-4 flex-1 space-y-4">
                    {stationItems.map(item => (
                      <div key={item.id} className="border-b border-[#252525] pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#2a2a2a] text-[#f2ca50] font-mono font-black text-lg flex items-center justify-center flex-shrink-0 shadow-inner">
                            {item.quantity}
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-bold text-white leading-snug">
                              {item.menu_item_name}
                            </div>
                            {item.notes && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {item.notes.split(',').map((note, nIdx) => (
                                  <span 
                                    key={nIdx}
                                    className="bg-[#2a2a2a] text-[#f2ca50] border border-[#f2ca50]/30 font-mono text-xs font-bold px-2 py-0.5 rounded uppercase"
                                  >
                                    {note.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Ticket Instructions */}
                  {ticket.special_instructions && (
                    <div className="px-4 py-2 bg-[#20201f] border-t border-[#2a2a2a] text-xs text-[#ff949c] font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{ticket.special_instructions}</span>
                    </div>
                  )}

                  {/* Giant Touch "MARK READY" Button */}
                  <div className="p-4 bg-[#131313] border-t border-[#2a2a2a]">
                    <button
                      onClick={() => handleBumpReady(ticket.order_id)}
                      className="w-full h-14 bg-gradient-to-r from-[#4edea3] to-[#00a572] hover:brightness-110 active:scale-[0.98] text-[#131313] font-black text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-[#4edea3]/10 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5 text-[#131313]" />
                      BUMP STATION READY
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
