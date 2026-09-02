import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  CheckSquare, Square, Printer, AlertTriangle, 
  CheckCircle2, Clock, Utensils, Bike, ArrowRight, RefreshCw
} from 'lucide-react';

export default function KitchenExpoPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [expoData, setExpoData] = useState({ awaiting_items: [], ready_to_expo: [], active_orders_count: 0, delayed_count: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpoData();
    const interval = setInterval(loadExpoData, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadExpoData = async () => {
    try {
      const res = await api.getKitchenExpoOrders();
      setExpoData(res);
      if (!selectedOrder && res.ready_to_expo?.length > 0) {
        setSelectedOrder(res.ready_to_expo[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handlePrintSlip = () => {
    if (!selectedOrder) return;
    addToast(`Expo Packing Slip printed for Order #${selectedOrder.order_number}`, 'info');
  };

  const handleBumpDispatch = async () => {
    if (!selectedOrder) return;
    try {
      await api.bumpExpoOrder(selectedOrder.order_id);
      addToast(`Order #${selectedOrder.order_number} verified and dispatched!`, 'success');
      loadExpoData();
      setSelectedOrder(null);
      setCheckedItems({});
    } catch (err) {
      console.error(err);
      addToast('Failed to dispatch order', 'error');
    }
  };

  const focusOrder = selectedOrder || (expoData.ready_to_expo?.[0]) || (expoData.awaiting_items?.[0]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background text-on-surface">
      {/* Header Area */}
      <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-30">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Expediter Line Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
            {isAr ? 'محطة التجميع والتسليم (إكسبو المطبخ)' : 'Assembly & Expo Station'}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {isAr ? 'تدقيق مكونات الطلبات متعددة المحطات وتسليمها للكابتن أو المندوب' : 'Consolidate items across kitchen stations and verify for dispatch'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end font-mono">
            <span className="text-[10px] text-outline uppercase">{isAr ? 'الطلبات النشطة' : 'Active Orders'}</span>
            <span className="text-2xl font-bold text-primary">{expoData.active_orders_count || 0}</span>
          </div>

          <div className="flex flex-col items-end font-mono">
            <span className="text-[10px] text-outline uppercase">{isAr ? 'المتأخرة' : 'Delayed'}</span>
            <span className="text-2xl font-bold text-error">{expoData.delayed_count || 0}</span>
          </div>

          <button 
            onClick={loadExpoData}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: 2 Columns */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Awaiting Items Lane */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <h2 className="font-bold text-base text-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-outline" />
              <span>{isAr ? 'بانتظار اكتمال التحضير' : 'Awaiting Items'}</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-xs text-on-surface-variant">
              {expoData.awaiting_items?.length || 0} {isAr ? 'طلبات' : 'Orders'}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {expoData.awaiting_items?.map(ord => (
              <div 
                key={ord.order_id}
                onClick={() => setSelectedOrder(ord)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  focusOrder?.order_id === ord.order_id
                    ? 'bg-surface-container-high border-primary/60 shadow-lg'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-lg font-mono text-primary">#{ord.order_number}</span>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{ord.table_number}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {Math.floor(ord.elapsed_seconds / 60)}m {ord.elapsed_seconds % 60}s
                  </span>
                </div>

                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden my-3">
                  <div className="h-full bg-secondary w-2/3"></div>
                </div>

                <div className="space-y-1.5 text-xs">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={item.status === 'READY' ? 'text-on-surface font-medium' : 'text-on-surface-variant/70'}>
                        {item.quantity}x {item.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        item.status === 'READY' ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {item.station} - {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Ready to Expo Active Focus */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
              <h2 className="font-bold text-base text-on-surface">
                {isAr ? 'جاهز للتسليم والتدقيق النهائي' : 'Ready to Expo & Dispatch'}
              </h2>
            </div>
            <span className="bg-secondary-container/20 text-secondary px-2.5 py-0.5 rounded-full font-mono text-xs">
              {expoData.ready_to_expo?.length || 0} {isAr ? 'طلبات جاهزة' : 'Orders Ready'}
            </span>
          </div>

          {focusOrder ? (
            <div className="bg-surface-container-high rounded-2xl p-6 border border-primary/30 shadow-[0_0_30px_rgba(242,202,80,0.08)] space-y-6">
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-outline-variant/40 pb-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl md:text-4xl font-bold font-display text-primary">
                    #{focusOrder.order_number}
                  </div>
                  <div>
                    {focusOrder.is_delayed && (
                      <span className="text-xs font-mono font-bold text-error bg-error-container/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> DELAYED (+{Math.floor(focusOrder.elapsed_seconds / 60)}m)
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-sm text-on-surface">
                      <Bike className="w-4 h-4 text-primary" />
                      <span>{focusOrder.server_name || focusOrder.table_number}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePrintSlip}
                  className="bg-surface-container hover:bg-surface-bright text-on-surface px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors border border-outline-variant/40"
                >
                  <Printer className="w-4 h-4 text-primary" />
                  <span>{isAr ? 'طباعة إشعار التعبئة' : 'Print Slip'}</span>
                </button>
              </div>

              {/* Checklist & Verification */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-outline">
                  {isAr ? 'قائمة التحقق وتأكيد الأطباق' : 'Verification Checklist'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {focusOrder.items?.map((itm) => {
                    const isChecked = checkedItems[itm.item_id];
                    return (
                      <div
                        key={itm.item_id}
                        onClick={() => handleToggleCheck(itm.item_id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-surface-container border-secondary/60 text-secondary'
                            : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-secondary" />
                          ) : (
                            <Square className="w-5 h-5 text-outline" />
                          )}
                          <span className={`text-sm font-semibold ${isChecked ? 'line-through opacity-70' : ''}`}>
                            {itm.quantity}x {itm.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest uppercase text-outline">
                          {itm.station}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Packaging / Dispatch CTA */}
              <div className="pt-4 border-t border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-xs font-mono text-on-surface-variant">
                  {isAr ? 'تأكد من إرفاق الإيصال وأكياس التغليف الحراري' : 'Verify thermal seal, cutlery packs, and delivery bag seals.'}
                </div>

                <button
                  onClick={handleBumpDispatch}
                  className="px-8 py-3.5 rounded-xl bg-secondary text-on-secondary font-bold font-mono text-sm tracking-wide uppercase hover:bg-secondary-fixed transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isAr ? 'تسليم الطلب وإخلاء الإكسبو' : 'BUMP & DISPATCH ORDER'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center text-on-surface-variant border border-dashed border-outline-variant/40">
              <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-base text-on-surface">{isAr ? 'جميع طلبات الإكسبو تم تسليمها' : 'All Orders Dispatched'}</p>
              <p className="text-xs text-on-surface-variant mt-1">{isAr ? 'بانتظار اكتمال تجهيز طلبات جديدة في المطبخ' : 'Awaiting new completed tickets from cooking lines.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
