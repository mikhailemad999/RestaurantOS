import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Flame, Clock, CheckCircle2, AlertTriangle, 
  RotateCcw, RefreshCw, ChefHat, Layers, Pizza, Coffee, Utensils
} from 'lucide-react';

export default function ChefWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [station, setStation] = useState('ALL');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const stations = ['ALL', 'GRILL', 'PIZZA', 'SANDWICH', 'FRYER', 'BAR', 'ASSEMBLY'];

  useEffect(() => {
    loadKDSTickets();
    const interval = setInterval(loadKDSTickets, 5000);
    return () => clearInterval(interval);
  }, [station]);

  const loadKDSTickets = async () => {
    try {
      const res = await api.getKDSTickets(station);
      setTickets(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBumpItem = async (itemId) => {
    try {
      await api.bumpKDSItem(itemId);
      addToast('Item ready!', 'success');
      loadKDSTickets();
    } catch (e) {
      addToast('Failed to bump item', 'error');
    }
  };

  const handleBumpTicket = async (orderId) => {
    try {
      await api.bumpKDSTicket(orderId);
      addToast(`Order #${orderId} marked ready for Expo pass!`, 'success');
      loadKDSTickets();
    } catch (e) {
      addToast('Failed to bump ticket', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Kitchen Display System (KDS) • Line Live</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'شاشات محطات الطهاة (KDS)' : "Chef's Multi-Station KDS"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'توجيه طلبات الأطباق حسب المحطة، ضبط درجات الاستواء وتأكيد الإنجاز الفوري' : 'Station-isolated ticket dispatch, cooking timers, modifier alerts & instant pass bumping'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xs hidden sm:block">
            <span className="text-outline uppercase">Active Queue</span>
            <div className="text-2xl font-bold text-primary">{tickets.length} Tickets</div>
          </div>
          <button
            onClick={loadKDSTickets}
            className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="flex flex-wrap gap-2 bg-surface-container-low p-2 rounded-2xl border border-outline-variant/30">
        {stations.map(st => (
          <button
            key={st}
            onClick={() => setStation(st)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 ${
              station === st
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            {st === 'PIZZA' ? <Pizza className="w-3.5 h-3.5" /> :
             st === 'BAR' ? <Coffee className="w-3.5 h-3.5" /> :
             <Flame className="w-3.5 h-3.5" />}
            <span>{st}</span>
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => {
            const isDelayed = ticket.elapsed_minutes > 15;
            return (
              <div
                key={ticket.id}
                className={`bg-surface-container-low rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl ${
                  isDelayed
                    ? 'border-error ring-1 ring-error/60'
                    : 'border-outline-variant/40 hover:border-primary/40'
                }`}
              >
                {/* Ticket Top Banner */}
                <div className={`p-4 flex items-center justify-between border-b ${
                  isDelayed ? 'bg-error-container/30 border-error/40' : 'bg-surface-container border-outline-variant/30'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-primary">#{ticket.order_number}</span>
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-xs font-mono font-semibold">
                      {ticket.table ? `Table ${ticket.table}` : ticket.order_type}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1 font-mono text-xs font-bold ${
                    isDelayed ? 'text-error animate-pulse' : 'text-on-surface-variant'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ticket.elapsed_minutes || 6}m</span>
                  </div>
                </div>

                {/* Items List (Strict Data Privacy: No customer phone or payment details) */}
                <div className="p-5 space-y-3 flex-1">
                  {ticket.items?.map(itm => (
                    <div
                      key={itm.id}
                      onClick={() => handleBumpItem(itm.id)}
                      className="p-3 rounded-xl bg-surface-container border border-outline-variant/30 cursor-pointer hover:border-secondary transition-all flex items-start justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                          <span className="text-primary font-mono">{itm.quantity}x</span>
                          <span>{itm.name}</span>
                        </div>
                        {itm.modifiers && (
                          <div className="text-xs text-secondary font-mono mt-1">
                            {itm.modifiers}
                          </div>
                        )}
                        {itm.notes && (
                          <div className="text-[11px] text-tertiary mt-1 italic">
                            "{itm.notes}"
                          </div>
                        )}
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        itm.status === 'READY' ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-highest text-outline'
                      }`}>
                        {itm.status || 'COOKING'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Bump Bar */}
                <div className="p-4 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-outline uppercase">
                    Station: {ticket.station || station}
                  </span>

                  <button
                    onClick={() => handleBumpTicket(ticket.id)}
                    className="px-5 py-2 rounded-xl bg-secondary text-on-secondary font-bold font-mono text-xs uppercase tracking-wider hover:bg-secondary-fixed transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(78,222,163,0.2)]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bump Ticket Ready</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
          <ChefHat className="w-12 h-12 text-secondary mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-lg text-on-surface">Kitchen Station Clear</h3>
          <p className="text-xs text-on-surface-variant mt-1">No active cooking tickets waiting for {station}.</p>
        </div>
      )}
    </div>
  );
}
