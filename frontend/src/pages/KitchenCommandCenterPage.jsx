import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, Clock, CheckCircle, AlertTriangle, Printer, RotateCcw, 
  Search, Utensils, Coffee, Pizza, Sandwich, ChefHat, Eye, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function KitchenCommandCenterPage() {
  const [tickets, setTickets] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchStationsAndTickets = async () => {
    try {
      const [stnRes, tktRes] = await Promise.all([
        api.getKitchenStations(),
        api.getStationTickets(selectedStation)
      ]);
      setStations(stnRes || []);
      setTickets(tktRes || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching kitchen command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationsAndTickets();
    const interval = setInterval(fetchStationsAndTickets, 5000);
    return () => clearInterval(interval);
  }, [selectedStation]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchStationsAndTickets();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleToggleItemCheck = (ticketId, itemId) => {
    const key = `${ticketId}-${itemId}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReprint = async (printerId = 1) => {
    try {
      await api.testPrintPrinter(printerId);
      alert('Kitchen Ticket dispatched to thermal printer queue!');
    } catch (err) {
      console.error('Reprint failed:', err);
    }
  };

  // Group tickets by Kanban column
  const newTickets = tickets.filter(t => t.status === 'PENDING');
  const preparingTickets = tickets.filter(t => t.status === 'PREPARING');
  const readyTickets = tickets.filter(t => t.status === 'READY');

  const formatElapsed = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStationIcon = (code) => {
    switch (code) {
      case 'PIZZA': return <Pizza className="w-4 h-4 text-amber-400" />;
      case 'SANDWICH': return <Sandwich className="w-4 h-4 text-rose-400" />;
      case 'GRILL': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'FRYER': return <Utensils className="w-4 h-4 text-yellow-400" />;
      case 'BAR': return <Coffee className="w-4 h-4 text-emerald-400" />;
      default: return <ChefHat className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] p-4 lg:p-6 font-sans">
      {/* Top Header Live Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-[#00a572]/20 text-[#4edea3] text-xs font-mono font-bold px-2.5 py-1 rounded border border-[#00a572]/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              LIVE OPS
            </span>
            <span className="text-xs text-[#99907c] font-mono">
              SYNCED • {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mt-1">
            Kitchen Command Center
          </h1>
          <p className="text-xs text-[#99907c]">
            Real-time station dispatch, preparation flow & automated printer routing
          </p>
        </div>

        {/* Live Metrics Header Gauges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-ping"></div>
            <div>
              <div className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">Active Tickets</div>
              <div className="text-lg font-bold text-white font-mono">{tickets.length}</div>
            </div>
          </div>

          <div className="bg-[#1c1b1b] border border-[#2a2a2a] px-4 py-2 rounded-xl flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#4edea3]" />
            <div>
              <div className="text-[10px] text-[#99907c] uppercase font-mono tracking-wider">Avg Prep Time</div>
              <div className="text-lg font-bold text-white font-mono">11.4 min</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link 
              to="/settings/printers/monitor" 
              className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-3 py-2 rounded-lg text-[#e5e2e1] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4 text-[#f2ca50]" />
              Printer Fleet
            </Link>
            <Link 
              to="/settings/printers/routing" 
              className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-3 py-2 rounded-lg text-[#e5e2e1] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Layers className="w-4 h-4 text-[#4edea3]" />
              Routing Rules
            </Link>
          </div>
        </div>
      </div>

      {/* Station Filter Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-[#2a2a2a]/60 scrollbar-none">
        <button
          onClick={() => setSelectedStation('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
            selectedStation === 'ALL'
              ? 'bg-[#f2ca50] text-[#131313] shadow-md shadow-[#f2ca50]/10 font-bold'
              : 'bg-[#1c1b1b] text-[#99907c] hover:text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          All Stations
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
            selectedStation === 'ALL' ? 'bg-[#131313] text-[#f2ca50]' : 'bg-[#2a2a2a] text-[#e5e2e1]'
          }`}>
            {tickets.length}
          </span>
        </button>

        {stations.map(stn => {
          const count = tickets.filter(t => t.items.some(it => it.station === stn.code)).length;
          const isSelected = selectedStation === stn.code;
          return (
            <button
              key={stn.code}
              onClick={() => setSelectedStation(stn.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#f2ca50] text-[#131313] shadow-md shadow-[#f2ca50]/10 font-bold'
                  : 'bg-[#1c1b1b] text-[#99907c] hover:text-white hover:bg-[#2a2a2a] border border-[#2a2a2a]'
              }`}
            >
              {getStationIcon(stn.code)}
              <span>{stn.name_en}</span>
              <span className="text-[10px] opacity-75 font-arabic">({stn.name_ar})</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isSelected ? 'bg-[#131313] text-[#f2ca50]' : 'bg-[#2a2a2a] text-[#e5e2e1]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Column 1: NEW / INCOMING */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Incoming / New
              </h2>
            </div>
            <span className="bg-[#1c1b1b] border border-[#2a2a2a] text-xs font-mono px-2 py-0.5 rounded text-[#99907c]">
              {newTickets.length}
            </span>
          </div>

          {newTickets.length === 0 ? (
            <div className="bg-[#1c1b1b]/50 border border-dashed border-[#2a2a2a] rounded-xl p-8 text-center text-xs text-[#99907c]">
              No new incoming orders in queue
            </div>
          ) : (
            newTickets.map(ticket => (
              <div 
                key={ticket.order_id} 
                className="bg-[#1c1b1b] border border-[#3b82f6]/40 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#3b82f6]"
              >
                {/* Header */}
                <div className="bg-[#3b82f6]/10 p-3 flex justify-between items-start border-b border-[#3b82f6]/20">
                  <div>
                    <span className="text-base font-bold font-mono text-[#3b82f6]">
                      #{ticket.order_number}
                    </span>
                    <div className="text-xs text-[#e5e2e1] font-semibold mt-0.5">
                      {ticket.order_type === 'DINE_IN' ? `Table ${ticket.table_number} • ${ticket.section}` : ticket.order_type}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white">
                      {formatElapsed(ticket.elapsed_seconds)}
                    </span>
                    <span className="block text-[10px] text-[#99907c] uppercase">Elapsed</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-3 space-y-2.5 divide-y divide-[#2a2a2a]">
                  {ticket.items.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0 flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded bg-[#20201f] text-[#f2ca50] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {item.quantity}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white leading-tight">
                          {item.menu_item_name}
                        </div>
                        {item.notes && (
                          <div className="text-[11px] text-[#ff949c] font-mono mt-0.5">
                            • {item.notes}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono bg-[#2a2a2a] text-[#99907c] px-1.5 py-0.5 rounded">
                        {item.station}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-[#131313]/50 border-t border-[#2a2a2a] flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(ticket.order_id, 'PREPARING')}
                    className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Accept & Start Prep
                  </button>
                  <button
                    onClick={() => handleReprint(1)}
                    title="Reprint Kitchen Ticket"
                    className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#99907c] hover:text-white rounded-lg transition-colors border border-[#353535]"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Column 2: PREPARING (IN KITCHEN) */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Preparing ({preparingTickets.length})
              </h2>
            </div>
            <span className="bg-[#1c1b1b] border border-[#2a2a2a] text-xs font-mono px-2 py-0.5 rounded text-[#99907c]">
              In Kitchen
            </span>
          </div>

          {preparingTickets.length === 0 ? (
            <div className="bg-[#1c1b1b]/50 border border-dashed border-[#2a2a2a] rounded-xl p-8 text-center text-xs text-[#99907c]">
              No tickets currently preparing
            </div>
          ) : (
            preparingTickets.map(ticket => {
              const isOverSLA = ticket.elapsed_seconds > 14 * 60;
              return (
                <div 
                  key={ticket.order_id} 
                  className={`bg-[#1c1b1b] rounded-xl overflow-hidden shadow-lg border transition-all ${
                    isOverSLA ? 'border-[#ff949c] shadow-[#ff949c]/10' : 'border-[#f59e0b]/40'
                  }`}
                >
                  {/* Header */}
                  <div className={`p-3 flex justify-between items-start border-b ${
                    isOverSLA ? 'bg-[#ff949c]/15 border-[#ff949c]/30' : 'bg-[#f59e0b]/10 border-[#f59e0b]/20'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold font-mono ${isOverSLA ? 'text-[#ff949c]' : 'text-[#f59e0b]'}`}>
                          #{ticket.order_number}
                        </span>
                        {isOverSLA && (
                          <span className="bg-[#ff949c] text-[#131313] text-[9px] font-black uppercase px-1.5 py-0.5 rounded animate-pulse">
                            RUSH SLA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#e5e2e1] font-semibold mt-0.5">
                        {ticket.order_type === 'DINE_IN' ? `Table ${ticket.table_number} • ${ticket.server_name}` : ticket.order_type}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className={`text-sm font-bold ${isOverSLA ? 'text-[#ff949c]' : 'text-white'}`}>
                        {formatElapsed(ticket.elapsed_seconds)}
                      </span>
                      <span className="block text-[10px] text-[#99907c] uppercase">Prep Time</span>
                    </div>
                  </div>

                  {/* Items with interactive check-off */}
                  <div className="p-3 space-y-2.5 divide-y divide-[#2a2a2a]">
                    {ticket.items.map(item => {
                      const itemKey = `${ticket.order_id}-${item.id}`;
                      const isChecked = checkedItems[itemKey];
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => handleToggleItemCheck(ticket.order_id, item.id)}
                          className={`pt-2 first:pt-0 flex items-start gap-2.5 cursor-pointer select-none transition-opacity ${
                            isChecked ? 'opacity-40 line-through' : 'opacity-100'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!isChecked}
                            onChange={() => {}}
                            className="mt-1 accent-[#4edea3] cursor-pointer"
                          />
                          <span className="w-6 h-6 rounded bg-[#20201f] text-[#f2ca50] font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {item.quantity}
                          </span>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white leading-tight">
                              {item.menu_item_name}
                            </div>
                            {item.notes && (
                              <div className="text-[11px] text-[#f2ca50] font-mono mt-0.5">
                                • {item.notes}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono bg-[#2a2a2a] text-[#99907c] px-1.5 py-0.5 rounded">
                            {item.station}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Footer */}
                  <div className="p-3 bg-[#131313]/50 border-t border-[#2a2a2a] flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateOrderStatus(ticket.order_id, 'READY')}
                      className="flex-1 bg-[#4edea3] hover:bg-[#38c98e] text-[#131313] text-xs font-black py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5 uppercase tracking-wide"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Bump to Ready
                    </button>
                    <button
                      onClick={() => handleReprint(1)}
                      title="Reprint Ticket"
                      className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#99907c] hover:text-white rounded-lg transition-colors border border-[#353535]"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Column 3: READY / PLATED */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Ready for Pickup ({readyTickets.length})
              </h2>
            </div>
            <span className="bg-[#1c1b1b] border border-[#2a2a2a] text-xs font-mono px-2 py-0.5 rounded text-[#99907c]">
              Plated
            </span>
          </div>

          {readyTickets.length === 0 ? (
            <div className="bg-[#1c1b1b]/50 border border-dashed border-[#2a2a2a] rounded-xl p-8 text-center text-xs text-[#99907c]">
              No tickets awaiting pickup
            </div>
          ) : (
            readyTickets.map(ticket => (
              <div 
                key={ticket.order_id} 
                className="bg-[#1c1b1b] border border-[#4edea3]/40 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#4edea3]"
              >
                {/* Header */}
                <div className="bg-[#4edea3]/10 p-3 flex justify-between items-start border-b border-[#4edea3]/20">
                  <div>
                    <span className="text-base font-bold font-mono text-[#4edea3]">
                      #{ticket.order_number}
                    </span>
                    <div className="text-xs text-[#e5e2e1] font-semibold mt-0.5">
                      {ticket.order_type === 'DINE_IN' ? `Table ${ticket.table_number}` : ticket.order_type}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-[#4edea3]">
                      READY
                    </span>
                    <span className="block text-[10px] text-[#99907c] uppercase">Notify Server</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-3 space-y-2">
                  {ticket.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-white font-semibold">
                        {item.quantity}x {item.menu_item_name}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-[#4edea3]" />
                    </div>
                  ))}
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-[#131313]/50 border-t border-[#2a2a2a] flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(ticket.order_id, 'COMPLETED')}
                    className="flex-1 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                  >
                    Complete & Archive
                  </button>
                  <button
                    onClick={() => handleReprint(1)}
                    title="Reprint Ticket"
                    className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#99907c] hover:text-white rounded-lg transition-colors border border-[#353535]"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
