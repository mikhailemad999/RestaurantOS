import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Phone, Users, ShoppingBag, Truck, RotateCcw, 
  MapPin, Plus, Search, CheckCircle2, Clock, DollarSign
} from 'lucide-react';

export default function CallCenterWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [phoneSearch, setPhoneSearch] = useState('01012345678');
  const [customer, setCustomer] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('DELIVERY');

  const handleSearchPhone = async (e) => {
    e?.preventDefault();
    if (!phoneSearch) return;
    try {
      setLoading(true);
      const custs = await api.getCustomers(phoneSearch);
      if (custs?.length > 0) {
        setCustomer(custs[0]);
        const last = await api.getCustomerLastOrder(custs[0].id);
        setLastOrder(last);
      } else {
        setCustomer({
          name: 'Walk-in Phone Caller',
          phone: phoneSearch,
          addresses: [{ address: 'Street 90, New Cairo, Building 14', zone_fee: 30.00 }]
        });
        setLastOrder(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearchPhone();
  }, []);

  const handleRepeatOrder = () => {
    addToast(`Past order replicated for ${customer?.name}! Sent to kitchen pass.`, 'success');
  };

  const handleCreateOrder = () => {
    addToast(`New ${orderType} phone check dispatched successfully!`, 'success');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Telephony CTI Hub • Inbound Live</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'مركز استقبال الطلبات الهاتفية' : 'Call Center Phone Order Entry'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'التعرف التلقائي على رقم المتصل، تكرار الطلبات السابقة وحساب رسوم التوصيل' : 'Inbound caller ID matching, past order repeat, saved address zones & rapid dispatch'}
          </p>
        </div>

        {/* Inbound Simulator Bar */}
        <form onSubmit={handleSearchPhone} className="flex items-center gap-2">
          <div className="relative">
            <Phone className="w-4 h-4 text-primary absolute left-3 top-3" />
            <input
              type="text"
              value={phoneSearch}
              onChange={e => setPhoneSearch(e.target.value)}
              placeholder="Enter caller phone..."
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-container border border-outline-variant/40 text-sm font-mono text-on-surface focus:outline-none focus:border-primary w-56"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider hover:bg-primary-container transition-all"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer Profile & Order Type */}
        <div className="lg:col-span-5 space-y-6">
          {customer ? (
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">
                    CALLER MATCHED
                  </span>
                  <h3 className="text-xl font-bold font-display text-on-surface mt-2">{customer.name}</h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-lg">
                  {customer.name?.charAt(0)}
                </div>
              </div>

              {/* Saved Address */}
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 text-xs space-y-1">
                <div className="text-outline font-mono uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Delivery Address</span>
                </div>
                <div className="font-bold text-on-surface">
                  {customer.addresses?.[0]?.address || 'Street 90, New Cairo, Building 14'}
                </div>
                <div className="text-secondary font-mono text-[11px]">
                  Zone Fee: $30.00 • Est. Arrival: 35 mins
                </div>
              </div>

              {/* Order Mode Switcher */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setOrderType('DELIVERY')}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'DELIVERY'
                      ? 'bg-primary text-on-primary shadow-md border-primary'
                      : 'bg-surface-container text-on-surface border-outline-variant/40'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Home Delivery</span>
                </button>
                <button
                  onClick={() => setOrderType('TAKEOUT')}
                  className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === 'TAKEOUT'
                      ? 'bg-primary text-on-primary shadow-md border-primary'
                      : 'bg-surface-container text-on-surface border-outline-variant/40'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pickup / Takeaway</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40 text-on-surface-variant">
              <Phone className="w-8 h-8 text-outline mx-auto mb-2 opacity-60" />
              <p className="text-xs font-mono">No caller active. Enter phone number above.</p>
            </div>
          )}
        </div>

        {/* Right Column: 1-Click Repeat Last Order or New Entry */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Repeat Card */}
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-secondary" />
                <h3 className="font-bold text-base text-on-surface">
                  {isAr ? 'تكرار الطلب السابق بضغطة واحدة' : 'Repeat Previous Order'}
                </h3>
              </div>
              <span className="text-xs font-mono text-outline">Order #{lastOrder?.order_number || 'ORD-9824'}</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                <span>2x Truffle Wagyu Burger (Well Done)</span>
                <span className="font-bold text-on-surface">$54.00</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                <span>1x Truffle Parmesan Fries</span>
                <span className="font-bold text-on-surface">$12.00</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
                <span>2x San Pellegrino Sparkling</span>
                <span className="font-bold text-on-surface">$9.00</span>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-outline uppercase">Total Amount</span>
                <div className="text-2xl font-bold font-display text-primary">$75.00</div>
              </div>

              <button
                onClick={handleRepeatOrder}
                className="px-6 py-3 rounded-xl bg-secondary text-on-secondary font-bold font-mono text-xs uppercase tracking-wider hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.25)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Repeat Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
