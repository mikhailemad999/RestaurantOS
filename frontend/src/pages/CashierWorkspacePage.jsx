import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShoppingCart, Receipt, DollarSign, Users, Clock, 
  Printer, CheckCircle2, ArrowRight, Utensils, Truck, 
  ShoppingBag, Search, Lock
} from 'lucide-react';

export default function CashierWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCashierData();
  }, []);

  const loadCashierData = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders();
      setOrders(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReprint = (orderNum) => {
    addToast(`Guest receipt reprinted for #${orderNum}`, 'info');
  };

  const handleCloseShift = () => {
    addToast('Shift reconciliation summary generated. Drawer balanced.', 'success');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Terminal 01 • Shift Active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'مساحة عمل الكاشير ونقاط البيع' : 'Cashier POS Workspace'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'إصدار الفواتير الفوري، إدارة الوردية، تسوية النقدية والبحث عن العملاء' : 'Express order creation, drawer reconciliation & fast payment settlement'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseShift}
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-on-surface hover:border-error hover:text-error transition-colors"
          >
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'إغلاق الوردية' : 'End Shift (Z-Report)'}</span>
          </button>
          <Link
            to="/pos"
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAr ? 'فتح الكاشير' : 'Launch Full POS'}</span>
          </Link>
        </div>
      </div>

      {/* Shift Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'مبيعات الوردية' : 'Shift Sales'}</span>
          <div className="text-3xl font-bold font-display text-primary">$1,420.00</div>
          <div className="text-xs text-secondary font-mono">Drawer: $250.00 float</div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'طلبات الوردية' : 'Completed Checks'}</span>
          <div className="text-3xl font-bold font-display text-on-surface">28</div>
          <div className="text-xs text-secondary font-mono">100% Settled</div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'فواتير معلقة' : 'Open Unpaid Checks'}</span>
          <div className="text-3xl font-bold font-display text-secondary">
            {orders.filter(o => o.payment_status === 'UNPAID').length}
          </div>
          <div className="text-xs text-on-surface-variant font-mono">Awaiting Settlement</div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'حالة الطابعة' : 'Receipt Printer'}</span>
          <div className="text-3xl font-bold font-display text-secondary">Online</div>
          <div className="text-xs text-secondary font-mono">Counter Thermal P1 Ready</div>
        </div>
      </div>

      {/* Giant Fast-Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/pos"
          className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-primary hover:bg-surface-container transition-all group flex flex-col justify-between h-44 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
              {isAr ? 'طلب صالة جديد' : 'New Dine-In Check'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Select table and seat guests</p>
          </div>
        </Link>

        <Link
          to="/pos"
          className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-secondary hover:bg-surface-container transition-all group flex flex-col justify-between h-44 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface group-hover:text-secondary transition-colors">
              {isAr ? 'طلب سفري / تيك أواي' : 'New Takeaway Check'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Express counter pickup queue</p>
          </div>
        </Link>

        <Link
          to="/delivery-order"
          className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-tertiary hover:bg-surface-container transition-all group flex flex-col justify-between h-44 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface group-hover:text-tertiary transition-colors">
              {isAr ? 'طلب توصيل هاتفي' : 'Phone Delivery Order'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Caller lookup and zone fee</p>
          </div>
        </Link>

        <Link
          to="/crm"
          className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/40 hover:border-primary hover:bg-surface-container transition-all group flex flex-col justify-between h-44 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-surface-container-high text-outline flex items-center justify-center group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">
              {isAr ? 'البحث عن عميل' : 'Customer Search'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Find profile, points & history</p>
          </div>
        </Link>
      </div>

      {/* Recent Shift Checks */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-on-surface">
              {isAr ? 'الفواتير الأخيرة في الوردية' : 'Recent Shift Receipts'}
            </h3>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">{orders.length} Records</span>
        </div>

        <div className="space-y-2.5">
          {orders.slice(0, 5).map(ord => (
            <div key={ord.id} className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-4">
                <span className="font-bold text-primary text-sm">#{ord.order_number}</span>
                <span className="text-on-surface">{ord.order_type}</span>
                <span className="text-on-surface-variant">Table {ord.table?.table_number || 'Takeaway'}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-bold text-on-surface text-sm">${ord.total_amount}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  ord.payment_status === 'PAID' ? 'bg-secondary/20 text-secondary' : 'bg-tertiary/20 text-tertiary'
                }`}>
                  {ord.payment_status}
                </span>
                <button
                  onClick={() => handleReprint(ord.order_number)}
                  className="p-1.5 rounded bg-surface-container-high hover:text-primary transition-colors"
                  title="Reprint Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
