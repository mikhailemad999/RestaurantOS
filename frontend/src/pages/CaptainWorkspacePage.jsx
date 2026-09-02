import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutGrid, Users, Receipt, Clock, Flame, 
  CheckCircle2, AlertTriangle, ArrowRight, Tablet, 
  Bell, Utensils
} from 'lucide-react';

export default function CaptainWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaptainData();
  }, []);

  const loadCaptainData = async () => {
    try {
      setLoading(true);
      const res = await api.getTables();
      setTables(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursingFire = async (tblId, course) => {
    try {
      await api.updateTableCoursing(tblId, course);
      addToast(`Table coursing updated: ${course}`, 'success');
      loadCaptainData();
    } catch (e) {
      addToast('Failed to update coursing', 'error');
    }
  };

  const myTables = tables.slice(0, 8); // Captain's assigned section
  const billRequestedTables = tables.filter(t => t.status === 'BILL_REQUESTED');

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">Floor Section A • Captain On Duty</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'لوحة عمليات كابتن الصالة' : "Captain's Operational Dashboard"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'متابعة طاولات قسمك، تقديم الكورسات، طلبات الحساب وتنبيهات جاهزية الأطباق' : 'My section tables, guest seating, course progression & instant kitchen pass notifications'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tables"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{isAr ? 'مخطط الصالة 2.0' : 'Universal Floor Plan'}</span>
          </Link>
          <Link
            to="/waiter-pos"
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-on-surface hover:border-primary transition-colors"
          >
            <Tablet className="w-4 h-4 text-primary" />
            <span>{isAr ? 'جهاز الويتر المتنقل' : 'Handheld POS'}</span>
          </Link>
        </div>
      </div>

      {/* Bill Requests Alert Banner if any */}
      {billRequestedTables.length > 0 && (
        <div className="p-4 rounded-2xl bg-error-container/30 border border-error/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-error" />
            <div>
              <h4 className="font-bold text-sm text-on-surface">
                {billRequestedTables.length} Table(s) Requesting Final Bill Settlement!
              </h4>
              <p className="text-xs text-on-surface-variant font-mono">
                Tables: {billRequestedTables.map(t => `#${t.table_number}`).join(', ')}
              </p>
            </div>
          </div>
          <Link to="/tables" className="px-4 py-2 rounded-lg bg-error text-on-error font-mono text-xs font-bold uppercase">
            Settle Checks
          </Link>
        </div>
      )}

      {/* Section Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'طاولاتي المخصصة' : 'My Section Tables'}</span>
          <div className="text-3xl font-bold font-display text-primary">{myTables.length} Tables</div>
          <div className="text-xs text-secondary font-mono">Section A &amp; Terrace</div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'الطاولات المشغولة' : 'Occupied'}</span>
          <div className="text-3xl font-bold font-display text-on-surface">
            {myTables.filter(t => t.status === 'OCCUPIED').length}
          </div>
          <div className="text-xs text-on-surface-variant font-mono">
            {myTables.filter(t => t.status === 'AVAILABLE').length} Available
          </div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'جاهز عند الباص' : 'Ready at Pass'}</span>
          <div className="text-3xl font-bold font-display text-secondary">3 Dishes</div>
          <div className="text-xs text-secondary font-mono">Pick up from Line 1</div>
        </div>

        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'متوسط سرعة الخدمة' : 'Avg Service SLA'}</span>
          <div className="text-3xl font-bold font-display text-on-surface">14m</div>
          <div className="text-xs text-secondary font-mono">+12% faster than shift target</div>
        </div>
      </div>

      {/* My Section Tables Live Grid */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            <span>{isAr ? 'الطاولات المخصصة لك في الوردية' : 'Assigned Section Tables'}</span>
          </h3>
          <span className="text-xs font-mono text-on-surface-variant">Live Coursing Control</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {myTables.map(tbl => {
            const isOccupied = tbl.status === 'OCCUPIED' || tbl.status === 'BILL_REQUESTED';
            return (
              <div 
                key={tbl.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  tbl.status === 'BILL_REQUESTED'
                    ? 'bg-surface-container border-error/80 ring-1 ring-error'
                    : isOccupied
                    ? 'bg-surface-container border-primary/40'
                    : 'bg-surface-container-lowest border-outline-variant/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-outline uppercase">{tbl.zone}</span>
                    <h4 className="font-bold text-2xl font-display text-on-surface mt-0.5">Table {tbl.table_number}</h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    tbl.status === 'AVAILABLE' ? 'bg-secondary/20 text-secondary' :
                    tbl.status === 'BILL_REQUESTED' ? 'bg-error text-on-error animate-pulse' :
                    'bg-surface-container-highest text-primary'
                  }`}>
                    {tbl.status}
                  </span>
                </div>

                <div className="my-4 text-xs font-mono text-on-surface-variant space-y-1">
                  <div>Capacity: {tbl.capacity} Pax</div>
                  {isOccupied && (
                    <div className="text-primary font-bold">
                      Course: {tbl.coursing_status || 'MAIN_FIRE'}
                    </div>
                  )}
                </div>

                {isOccupied ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/30 text-[11px] font-mono">
                    <button
                      onClick={() => handleCoursingFire(tbl.id, 'MAIN_FIRE')}
                      className="p-1.5 rounded bg-primary text-on-primary font-bold hover:bg-primary-container transition-all"
                    >
                      🔥 Main Fire
                    </button>
                    <button
                      onClick={() => handleCoursingFire(tbl.id, 'DESSERT_FIRE')}
                      className="p-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface"
                    >
                      🍰 Dessert
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/waiter-pos"
                    className="w-full py-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary transition-all text-center text-xs font-mono font-bold"
                  >
                    Seat Guests
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
