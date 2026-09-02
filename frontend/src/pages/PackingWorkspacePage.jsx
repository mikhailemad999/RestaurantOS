import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Package, CheckSquare, Square, Printer, AlertTriangle, 
  CheckCircle2, Clock, Truck, Bike, ArrowRight, RefreshCw, ShieldAlert
} from 'lucide-react';

export default function PackingWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [expoData, setExpoData] = useState({ ready_to_expo: [], awaiting_items: [] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [packedItems, setPackedItems] = useState({});
  const [tamperSeal, setTamperSeal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackingOrders();
    const interval = setInterval(loadPackingOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadPackingOrders = async () => {
    try {
      const res = await api.getKitchenExpoOrders();
      setExpoData(res);
      if (!selectedOrder && res.ready_to_expo?.length > 0) {
        setSelectedOrder(res.ready_to_expo[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = (id) => {
    setPackedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDispatch = async () => {
    if (!selectedOrder) return;
    try {
      await api.bumpExpoOrder(selectedOrder.order_id);
      addToast(`Order #${selectedOrder.order_number} packed, sealed & dispatched to courier!`, 'success');
      setSelectedOrder(null);
      setPackedItems({});
      setTamperSeal(false);
      loadPackingOrders();
    } catch (e) {
      addToast('Failed to complete dispatch', 'error');
    }
  };

  const handleReportMissing = (itemName) => {
    addToast(`Alert sent to line chefs: Missing item '${itemName}' required at Packing pass!`, 'warning');
  };

  const activeOrder = selectedOrder || expoData.ready_to_expo?.[0];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Dispatch Pass • Expediter Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'مركز التعبئة والتغليف وتجهيز الطلبات' : 'Packing & Dispatch Center'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'مطابقة أطباق الطلب، إضافة الصوصات، وضع ملصق الأمان وتسليم المندوب' : 'Order item checklist, condiment verification, tamper seal & driver handoff'}
          </p>
        </div>

        <button
          onClick={loadPackingOrders}
          className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Queue on Left, Active Assembly on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Orders Queue */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-sm font-mono uppercase tracking-wider text-outline flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span>Ready for Packing ({expoData.ready_to_expo?.length || 0})</span>
          </h3>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {expoData.ready_to_expo?.map(ord => (
              <div
                key={ord.order_id}
                onClick={() => setSelectedOrder(ord)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeOrder?.order_id === ord.order_id
                    ? 'bg-surface-container border-primary shadow-lg ring-1 ring-primary'
                    : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg font-mono text-primary">#{ord.order_number}</span>
                  <span className="text-xs font-mono text-secondary font-bold">READY</span>
                </div>
                <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>{ord.server_name || ord.table_number}</span>
                </div>
                <div className="text-[11px] font-mono text-outline mt-2">
                  {ord.items?.length} items to pack
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Packing Card */}
        <div className="lg:col-span-8">
          {activeOrder ? (
            <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl md:text-4xl font-display font-bold text-primary">
                      #{activeOrder.order_number}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-secondary/20 text-secondary font-mono text-xs uppercase font-bold">
                      {activeOrder.order_type}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono mt-1">
                    Courier: <strong className="text-on-surface">{activeOrder.server_name || 'Designated Driver'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => addToast('Packing slip sent to thermal printer', 'info')}
                  className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/40 text-xs font-mono flex items-center gap-2 text-on-surface hover:text-primary transition-colors"
                >
                  <Printer className="w-4 h-4 text-primary" />
                  <span>Print Slip</span>
                </button>
              </div>

              {/* Items Verification Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-outline">
                  Box Items Verification
                </h4>

                <div className="space-y-2">
                  {activeOrder.items?.map(itm => {
                    const isPacked = packedItems[itm.item_id];
                    return (
                      <div
                        key={itm.item_id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isPacked
                            ? 'bg-surface-container border-secondary/60 text-secondary'
                            : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface'
                        }`}
                      >
                        <div
                          onClick={() => handleToggleItem(itm.item_id)}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          {isPacked ? (
                            <CheckSquare className="w-5 h-5 text-secondary" />
                          ) : (
                            <Square className="w-5 h-5 text-outline" />
                          )}
                          <span className={`text-sm font-semibold ${isPacked ? 'line-through opacity-70' : ''}`}>
                            {itm.quantity}x {itm.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest uppercase text-outline">
                            {itm.station}
                          </span>
                          {!isPacked && (
                            <button
                              onClick={() => handleReportMissing(itm.name)}
                              className="text-xs text-error font-mono hover:underline flex items-center gap-1"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>Missing?</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Seal Toggle */}
              <div 
                onClick={() => setTamperSeal(!tamperSeal)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  tamperSeal
                    ? 'bg-secondary/10 border-secondary text-secondary'
                    : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${tamperSeal ? 'bg-secondary text-on-secondary border-secondary' : 'border-outline'}`}>
                    {tamperSeal && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-on-surface">Tamper-Evident Thermal Seal Attached</div>
                    <div className="text-xs text-on-surface-variant">Verify bag is sealed and ticket attached to exterior</div>
                  </div>
                </div>
              </div>

              {/* Bump & Dispatch CTA */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
                <button
                  onClick={handleDispatch}
                  className="px-8 py-3.5 rounded-xl bg-secondary text-on-secondary font-bold font-mono text-sm tracking-wide uppercase hover:bg-secondary-fixed transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.25)]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Mark Packed &amp; Dispatch to Courier</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
              <Package className="w-12 h-12 text-secondary mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-lg text-on-surface">Packing Station Ready</h3>
              <p className="text-xs text-on-surface-variant mt-1">Awaiting next batch of completed items from kitchen expo pass.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
