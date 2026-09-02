import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Users, Receipt, Clock, Sparkles, CheckCircle2, 
  AlertTriangle, ArrowRightLeft, Split, XCircle, 
  Accessibility, RefreshCw, Layers
} from 'lucide-react';

export default function UniversalTablesPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [tables, setTables] = useState([]);
  const [activeZone, setActiveZone] = useState('All');
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // 'transfer'
  const [transferTargetId, setTransferTargetId] = useState('');

  const zones = ['All', 'Main Dining', 'VIP Lounge', 'Terrace', 'Bar'];

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await api.getTables();
      setTables(data || []);
      if (selectedTable) {
        const updated = data.find(t => t.id === selectedTable.id);
        if (updated) setSelectedTable(updated);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load tables', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = activeZone === 'All' 
    ? tables 
    : tables.filter(t => t.zone === activeZone);

  const handleTableClick = (tbl) => {
    setSelectedTable(tbl);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedTable) return;
    try {
      const updated = await api.updateTableStatus(selectedTable.id, status);
      setSelectedTable(updated);
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      addToast(`Table #${updated.table_number} status updated to ${status}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error');
    }
  };

  const handleTableAction = async (actionName, targetId = null) => {
    if (!selectedTable) return;
    try {
      const updated = await api.tableAction(selectedTable.id, actionName, targetId);
      setSelectedTable(updated);
      loadTables();
      addToast(`Action ${actionName} applied successfully`, 'success');
      setActionModal(null);
    } catch (err) {
      console.error(err);
      addToast('Failed to perform table action', 'error');
    }
  };

  const handleUpdateCoursing = async (coursing) => {
    if (!selectedTable) return;
    try {
      const updated = await api.updateTableCoursing(selectedTable.id, coursing);
      setSelectedTable(updated);
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      addToast(`Coursing updated to ${coursing}`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to update coursing', 'error');
    }
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    try {
      const updated = await api.clearTable(selectedTable.id);
      setSelectedTable(updated);
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      addToast(`Table #${updated.table_number} cleared and reset`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to clear table', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-secondary text-on-secondary';
      case 'OCCUPIED':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'RESERVED':
        return 'bg-surface-tint text-on-primary';
      case 'BILL_REQUESTED':
        return 'bg-error-container text-on-error-container animate-pulse';
      case 'CLEANING':
        return 'bg-outline-variant text-on-surface';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-on-surface">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 md:px-8 bg-surface-container/60 backdrop-blur-md border-b border-outline-variant/30 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-on-surface flex items-center gap-2">
              <span>{isAr ? 'مخطط الصالة والطاولات 2.0' : 'Universal Floor Plan 2.0'}</span>
            </h1>
          </div>
          <div className="h-6 w-[1px] bg-outline-variant hidden md:block"></div>
          {/* Zone Selector Tabs */}
          <div className="flex gap-1 bg-surface-container-high p-1 rounded-lg">
            {zones.map(z => (
              <button
                key={z}
                onClick={() => setActiveZone(z)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  activeZone === z
                    ? 'bg-primary text-on-primary font-bold shadow'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden lg:flex items-center gap-4 font-mono text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
              <span>{isAr ? 'متاحة' : 'Available'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>
              <span>{isAr ? 'مشغولة' : 'Occupied'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <span>{isAr ? 'محجوزة' : 'Reserved'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-error-container animate-pulse"></span>
              <span>{isAr ? 'طلب حساب' : 'Bill Requested'}</span>
            </div>
          </div>

          <button
            onClick={loadTables}
            className="p-2 bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 relative overflow-auto p-8"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,144,124,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-primary font-mono text-sm">
            LOADING TABLES TOPOLOGY...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {filteredTables.map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isRound = table.shape === 'ROUND';
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableClick(table)}
                  className={`group relative flex flex-col items-center justify-center p-4 cursor-pointer transition-all ${
                    isRound ? 'rounded-full aspect-square' : 'rounded-2xl h-36'
                  } ${getStatusColor(table.status)} ${
                    isSelected ? 'ring-4 ring-primary ring-offset-4 ring-offset-background scale-105 shadow-2xl' : 'hover:scale-102 shadow-lg'
                  }`}
                >
                  {/* Table Number */}
                  <span className="font-bold text-2xl font-display tracking-tight">
                    {table.table_number}
                  </span>

                  {/* Seat Capacity */}
                  <span className="text-xs font-mono opacity-80 mt-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{table.guest_count || 0}/{table.capacity}</span>
                  </span>

                  {/* Zone Tag */}
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-70 mt-1">
                    {table.zone || table.section_name}
                  </span>

                  {/* Status Badges */}
                  {table.status === 'BILL_REQUESTED' && (
                    <div className="absolute -top-2 bg-error text-on-error rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                      <Receipt className="w-3 h-3" />
                      <span>BILL</span>
                    </div>
                  )}

                  {table.is_accessible && (
                    <div className="absolute -top-1 -right-1 bg-surface-container rounded-full p-1 text-primary shadow">
                      <Accessibility className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Seat Nodes surrounding table */}
                  <div className="absolute -top-1.5 w-3 h-3 rounded-full bg-black/30"></div>
                  <div className="absolute -bottom-1.5 w-3 h-3 rounded-full bg-black/30"></div>
                  <div className="absolute -left-1.5 w-3 h-3 rounded-full bg-black/30"></div>
                  <div className="absolute -right-1.5 w-3 h-3 rounded-full bg-black/30"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Table Bottom Slide-up Drawer */}
      {selectedTable && (
        <div className="bg-surface-container-high border-t border-outline-variant/40 p-4 md:p-6 shadow-2xl z-20 transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-surface-container-highest border border-primary/40 flex items-center justify-center text-primary font-bold text-2xl font-display">
                {selectedTable.table_number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${getStatusColor(selectedTable.status)}`}>
                    {selectedTable.status}
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono">
                    {selectedTable.zone} • Cap: {selectedTable.capacity}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>{isAr ? 'الضيوف:' : 'Guests:'} {selectedTable.guest_count}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>{isAr ? 'الكورس الحالي:' : 'Coursing:'} <strong className="text-primary">{selectedTable.coursing_status}</strong></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Coursing Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-on-surface-variant pr-2">{isAr ? 'تقديم الأطباق:' : 'Coursing:'}</span>
              <button
                onClick={() => handleUpdateCoursing('STARTER_FIRE')}
                className="px-3 py-1.5 rounded text-xs font-mono bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all"
              >
                🔥 Starter Fire
              </button>
              <button
                onClick={() => handleUpdateCoursing('MAIN_HOLD')}
                className="px-3 py-1.5 rounded text-xs font-mono bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all"
              >
                ⏸ Main Hold
              </button>
              <button
                onClick={() => handleUpdateCoursing('MAIN_FIRE')}
                className="px-3 py-1.5 rounded text-xs font-mono bg-primary text-on-primary font-bold shadow hover:bg-primary-container transition-all"
              >
                🔥 Main Fire
              </button>
              <button
                onClick={() => handleUpdateCoursing('DESSERT_FIRE')}
                className="px-3 py-1.5 rounded text-xs font-mono bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all"
              >
                🍰 Dessert
              </button>
            </div>

            {/* Table Operational Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTableAction('REQUEST_BILL')}
                className="px-3.5 py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error transition-colors text-xs font-bold font-mono flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>{isAr ? 'طلب حساب' : 'Request Bill'}</span>
              </button>

              <button
                onClick={() => setActionModal('transfer')}
                className="px-3.5 py-2 rounded-lg bg-surface-container-highest text-on-surface hover:border-primary border border-outline-variant text-xs font-mono flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                <span>{isAr ? 'نقل الطاولة' : 'Transfer'}</span>
              </button>

              <button
                onClick={handleClearTable}
                className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-error text-xs font-mono flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{isAr ? 'إخلاء الطاولة' : 'Clear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {actionModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">
              {isAr ? `نقل طاولة #${selectedTable?.table_number}` : `Transfer Table #${selectedTable?.table_number}`}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isAr ? 'اختر الطاولة المستهدفة لنقل الطلب الحالي وجميع الضيوف إليها.' : 'Select destination table to migrate seated guests and open order tickets.'}
            </p>

            <div>
              <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'الطاولة المستهدفة' : 'Target Table'}</label>
              <select
                value={transferTargetId}
                onChange={(e) => setTransferTargetId(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface"
              >
                <option value="">{isAr ? 'اختر طاولة...' : 'Select destination table...'}</option>
                {tables.filter(t => t.id !== selectedTable?.id && t.status === 'AVAILABLE').map(t => (
                  <option key={t.id} value={t.id}>Table {t.table_number} ({t.zone} - Cap: {t.capacity})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-highest text-xs font-mono"
              >
                Cancel
              </button>
              <button
                disabled={!transferTargetId}
                onClick={() => handleTableAction('TRANSFER', transferTargetId)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs font-mono disabled:opacity-50"
              >
                Execute Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
