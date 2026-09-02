import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Compass, DollarSign, ShoppingCart, LayoutGrid, ChefHat, 
  Package, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, 
  Users, Flame, Printer, Clock, Bell
} from 'lucide-react';

export default function ManagerWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      setLoading(true);
      const [apprs, tbls] = await Promise.all([
        api.getApprovals(),
        api.getTables()
      ]);
      setApprovals(apprs || []);
      setTables(tbls || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id) => {
    try {
      await api.approveRequest(id);
      setApprovals(prev => prev.filter(a => a.id !== id));
      addToast('Manager approval granted!', 'success');
    } catch (e) {
      addToast('Failed to approve request', 'error');
    }
  };

  const occupiedTables = tables.filter(t => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Branch Operations • Downtown Flagship</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'مركز قيادة مدير الفرع' : 'Manager Command Center'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'متابعة العمليات اللحظية، الصالة، طابور المطبخ، الموافقات الإدارية والمخزون' : 'Real-time floor velocity, kitchen queue, cashier approvals & daily staff attendance'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/pos"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isAr ? 'نقطة البيع POS' : 'Open POS Terminal'}</span>
          </Link>
          <Link
            to="/tables"
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-on-surface hover:border-primary transition-colors"
          >
            <LayoutGrid className="w-4 h-4 text-primary" />
            <span>{isAr ? 'مخطط الطاولات' : 'Floor Plan'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'مبيعات الوردية اليوم' : 'Today Sales'}</span>
          <div className="text-3xl font-bold font-display text-primary">$3,840.50</div>
          <div className="text-xs text-secondary flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>42 Orders Settled</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'الطاولات المشغولة' : 'Open Tables'}</span>
          <div className="text-3xl font-bold font-display text-on-surface">
            {occupiedTables.length} / {tables.length}
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            {tables.filter(t => t.status === 'BILL_REQUESTED').length} Bill Requests
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'طابور المطبخ' : 'Kitchen Queue'}</span>
          <div className="text-3xl font-bold font-display text-secondary">
            12 Active
          </div>
          <div className="text-xs text-secondary flex items-center gap-1 font-mono">
            <Flame className="w-3.5 h-3.5" />
            <span>Avg SLA: 9.4 mins</span>
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'طلبات الموافقة' : 'Pending Approvals'}</span>
          <div className="text-3xl font-bold font-display text-tertiary">
            {approvals.length} Pending
          </div>
          <div className="text-xs text-tertiary flex items-center gap-1 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Void & Discount Authorizations</span>
          </div>
        </div>
      </div>

      {/* Quick Operational Launchpad */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-base text-on-surface uppercase font-mono tracking-wider">
          {isAr ? 'لوحة الوصول السريع للعمليات' : 'Operational Quick Launchpad'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/kitchen/expo" className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all flex flex-col items-center text-center gap-2 group">
            <ChefHat className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-on-surface">Expo &amp; Assembly</span>
            <span className="text-[10px] text-on-surface-variant">Order verification</span>
          </Link>

          <Link to="/dispatch" className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all flex flex-col items-center text-center gap-2 group">
            <Compass className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-on-surface">Delivery Board</span>
            <span className="text-[10px] text-on-surface-variant">Courier tracking</span>
          </Link>

          <Link to="/inventory" className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all flex flex-col items-center text-center gap-2 group">
            <Package className="w-6 h-6 text-tertiary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-on-surface">Stock Control</span>
            <span className="text-[10px] text-on-surface-variant">Raw balances</span>
          </Link>

          <Link to="/settings/printers" className="p-4 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all flex flex-col items-center text-center gap-2 group">
            <Printer className="w-6 h-6 text-outline group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-on-surface">Printer Hardware</span>
            <span className="text-[10px] text-on-surface-variant">Fleet &amp; routing</span>
          </Link>
        </div>
      </div>

      {/* Approvals & Authorizations Queue */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-base text-on-surface">
              {isAr ? 'قائمة تفويضات وموافقات المدير' : 'Manager Authorization Queue'}
            </h3>
          </div>
          <span className="text-xs font-mono text-on-surface-variant">
            {approvals.length} Requests
          </span>
        </div>

        {approvals.length > 0 ? (
          <div className="space-y-3">
            {approvals.map(appr => (
              <div key={appr.id} className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container-highest text-primary font-bold">
                      {appr.request_type || 'VOID_ITEM'}
                    </span>
                    <span className="text-xs font-mono text-outline">{appr.time_ago || '3m ago'}</span>
                  </div>
                  <h4 className="font-bold text-sm text-on-surface mt-1">{appr.reason || 'Customer requested dish cancellation before cooking'}</h4>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                    Requested by: <strong className="text-on-surface">{appr.requested_by_name || 'Cashier Sarah C.'}</strong> • Amount: ${appr.amount || '45.00'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuickApprove(appr.id)}
                    className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-bold text-xs font-mono uppercase hover:bg-secondary-fixed transition-all"
                  >
                    Authorize
                  </button>
                  <button
                    onClick={() => setApprovals(prev => prev.filter(a => a.id !== appr.id))}
                    className="px-3 py-2 rounded-lg bg-surface-container-highest text-xs font-mono hover:text-error transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-on-surface-variant text-xs font-mono">
            <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-2 opacity-60" />
            No pending manager approvals. All operations normal.
          </div>
        )}
      </div>
    </div>
  );
}
