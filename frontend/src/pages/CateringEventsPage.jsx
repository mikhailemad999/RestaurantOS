import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, Users, DollarSign, MapPin, ChefHat, 
  AlertCircle, Plus, CheckCircle2, Clock, Phone, Mail, 
  PartyPopper, Utensils
} from 'lucide-react';

export default function CateringEventsPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositModal, setDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [newModal, setNewModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    event_number: `EVT-${Math.floor(100 + Math.random() * 900)}`,
    title: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    event_date: new Date().toISOString().slice(0, 16),
    guest_count: 50,
    venue_name: 'Grand Ballroom B',
    venue_type: 'ON_SITE',
    package_name: 'Royal Executive Buffet',
    total_amount: 5000,
    deposit_paid: 2000,
    special_instructions: ''
  });

  useEffect(() => {
    loadCatering();
  }, []);

  const loadCatering = async () => {
    try {
      setLoading(true);
      const [evs, st] = await Promise.all([
        api.getCateringEvents(),
        api.getCateringCalendarStats()
      ]);
      setEvents(evs || []);
      setStats(st);
      if (evs?.length > 0 && !selectedEvent) {
        setSelectedEvent(evs[0]);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load catering events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectDeposit = async () => {
    if (!selectedEvent || !depositAmount) return;
    try {
      const updated = await api.collectCateringDeposit(selectedEvent.id, depositAmount);
      setSelectedEvent(updated);
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      addToast(`Deposit of $${depositAmount} collected successfully!`, 'success');
      setDepositModal(false);
      setDepositAmount('');
      loadCatering();
    } catch (err) {
      console.error(err);
      addToast('Failed to collect deposit', 'error');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newEvent,
        balance_due: Number(newEvent.total_amount) - Number(newEvent.deposit_paid)
      };
      const created = await api.createCateringEvent(payload);
      setEvents(prev => [created, ...prev]);
      setSelectedEvent(created);
      setNewModal(false);
      addToast('Catering event booking created!', 'success');
      loadCatering();
    } catch (err) {
      console.error(err);
      addToast('Failed to create event', 'error');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Banquet &amp; Events</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'مركز إدارة الحفلات والتموين الخارجي' : 'Catering & Event Management Hub'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'حجوزات الولائم والفعاليات، إدارة العقود، دفعات التأمين ولوجستيات الضيافة' : 'Corporate galas, wedding banquets, guest pax scheduling & deposit balances'}
          </p>
        </div>

        <button 
          onClick={() => setNewModal(true)}
          className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'حجز فعالية جديدة' : 'New Event Booking'}</span>
        </button>
      </div>

      {/* Grid: Left Stats & Calendar, Right Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick Stats & Events List */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline">{isAr ? 'فعاليات الشهر' : 'Month Events'}</span>
              <div className="text-3xl font-bold font-display text-primary mt-1">
                {stats?.total_events_month || events.length}
              </div>
              <div className="text-xs text-secondary mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{stats?.confirmed_events || events.length} Confirmed</span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-outline">{isAr ? 'دفعات معلقة' : 'Pending Balances'}</span>
              <div className="text-3xl font-bold font-display text-error mt-1">
                ${stats?.pending_deposits_amount ? Number(stats.pending_deposits_amount).toLocaleString() : '12,000'}
              </div>
              <div className="text-xs text-error mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Action Required</span>
              </div>
            </div>
          </div>

          {/* Upcoming Lineup */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-on-surface uppercase font-mono tracking-wider">
              {isAr ? 'جدول الفعاليات القادمة' : 'Upcoming Event Lineup'}
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
              {events.map(ev => {
                const isSelected = selectedEvent?.id === ev.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-surface-container border-primary shadow-lg ring-1 ring-primary'
                        : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-primary">{ev.event_number}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest uppercase text-secondary">
                        {ev.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-on-surface mt-1.5 leading-tight">{ev.title}</h4>

                    <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant font-mono">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        <span>{ev.guest_count} pax</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-secondary" />
                        <span>${Number(ev.total_amount).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Event Inspector */}
        <div className="lg:col-span-8">
          {selectedEvent ? (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              {/* Event Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-primary/20 text-primary font-bold">
                      {selectedEvent.event_number}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-secondary/20 text-secondary uppercase font-bold">
                      {selectedEvent.status}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-on-surface mt-2">
                    {selectedEvent.title}
                  </h2>
                </div>

                <button
                  onClick={() => setDepositModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-secondary text-on-secondary font-bold font-mono text-xs uppercase flex items-center gap-2 hover:bg-secondary-fixed transition-all"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{isAr ? 'تحصيل دفعة مالية' : 'Collect Deposit'}</span>
                </button>
              </div>

              {/* Client & Specs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Profile */}
                <div className="bg-surface-container rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'بيانات العميل' : 'Client Profile'}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="font-bold text-base text-on-surface">{selectedEvent.client_name}</div>
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      <span>{selectedEvent.client_phone}</span>
                    </div>
                    {selectedEvent.client_email && (
                      <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span>{selectedEvent.client_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Venue & Operations */}
                <div className="bg-surface-container rounded-xl p-5 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'المكان والتشغيل' : 'Venue & Hospitality'}</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-on-surface">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedEvent.venue_name} ({selectedEvent.venue_type})</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <ChefHat className="w-4 h-4 text-secondary" />
                      <span>{selectedEvent.assigned_head_chef || 'Chef Antoine Dubois'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Users className="w-4 h-4 text-outline" />
                      <span>{selectedEvent.guest_count} Guests • {selectedEvent.staff_assigned_count} Assigned Staff</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-surface-container-high rounded-xl p-6 space-y-4 border border-outline-variant/30">
                <h3 className="text-xs font-mono uppercase tracking-wider text-primary">{isAr ? 'البيان المالي للحجز' : 'Financial Statement'}</h3>
                
                <div className="grid grid-cols-3 gap-4 font-mono text-center">
                  <div className="p-3 rounded-lg bg-surface-container">
                    <span className="text-[10px] text-outline uppercase">{isAr ? 'قيمة العقد' : 'Total Contract'}</span>
                    <div className="text-xl font-bold text-on-surface mt-1">${Number(selectedEvent.total_amount).toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container">
                    <span className="text-[10px] text-outline uppercase">{isAr ? 'المدفوع' : 'Deposit Paid'}</span>
                    <div className="text-xl font-bold text-secondary mt-1">${Number(selectedEvent.deposit_paid).toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container">
                    <span className="text-[10px] text-outline uppercase">{isAr ? 'المتبقي' : 'Balance Due'}</span>
                    <div className="text-xl font-bold text-error mt-1">${Number(selectedEvent.balance_due).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Menu & Special Instructions */}
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="text-xs font-mono uppercase text-outline mb-1">{isAr ? 'باقة الضيافة وقائمة الأطعمة' : 'Banquet Package & Menu'}</h4>
                  <div className="p-4 rounded-xl bg-surface-container text-on-surface leading-relaxed text-xs">
                    <strong className="text-primary block mb-1">{selectedEvent.package_name}</strong>
                    {selectedEvent.menu_summary || 'Multi-course plated artisanal selection with wine pairing and bespoke dessert service.'}
                  </div>
                </div>

                {selectedEvent.special_instructions && (
                  <div>
                    <h4 className="text-xs font-mono uppercase text-outline mb-1">{isAr ? 'تعليمات وتحذيرات خاصة' : 'Special Instructions & Dietary'}</h4>
                    <div className="p-3.5 rounded-xl bg-surface-container text-on-surface-variant text-xs border-l-2 border-primary">
                      {selectedEvent.special_instructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center text-on-surface-variant border border-dashed border-outline-variant/40">
              <PartyPopper className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-base text-on-surface">{isAr ? 'اختر فعالية للاطلاع على تفاصيلها' : 'Select an Event to View Details'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collect Deposit Modal */}
      {depositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">
              {isAr ? `تحصيل دفعة مالية لفعالية ${selectedEvent?.event_number}` : `Collect Deposit for ${selectedEvent?.event_number}`}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isAr ? `المبلغ المتبقي الحالي: $${selectedEvent?.balance_due}` : `Current Balance Due: $${selectedEvent?.balance_due}`}
            </p>

            <div>
              <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'المبلغ المستلم ($)' : 'Deposit Amount ($)'}</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => setDepositModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-highest text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleCollectDeposit}
                className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-xs font-mono"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Event Modal */}
      {newModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateEvent} className="bg-surface-container border border-outline-variant rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-on-surface">
              {isAr ? 'تسجيل حجز فعالية وتموين جديدة' : 'New Catering Event Booking'}
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-on-surface-variant mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="e.g. Forbes Annual Executive Dinner"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">Client Name</label>
                  <input
                    required
                    type="text"
                    value={newEvent.client_name}
                    onChange={e => setNewEvent({...newEvent, client_name: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1">Client Phone</label>
                  <input
                    required
                    type="text"
                    value={newEvent.client_phone}
                    onChange={e => setNewEvent({...newEvent, client_phone: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">Guest Count (Pax)</label>
                  <input
                    required
                    type="number"
                    value={newEvent.guest_count}
                    onChange={e => setNewEvent({...newEvent, guest_count: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1">Event Date &amp; Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newEvent.event_date}
                    onChange={e => setNewEvent({...newEvent, event_date: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-on-surface-variant mb-1">Total Contract ($)</label>
                  <input
                    required
                    type="number"
                    value={newEvent.total_amount}
                    onChange={e => setNewEvent({...newEvent, total_amount: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
                <div>
                  <label className="block text-on-surface-variant mb-1">Deposit ($)</label>
                  <input
                    required
                    type="number"
                    value={newEvent.deposit_paid}
                    onChange={e => setNewEvent({...newEvent, deposit_paid: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setNewModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-highest text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs font-mono"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
