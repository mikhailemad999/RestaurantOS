import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Users, Clock, CheckCircle, AlertCircle, 
  X, ShoppingCart, RefreshCw, Layers, Sparkles, Plus, Trash2, Shield
} from 'lucide-react';

export default function TablesPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [sections, setSections] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add New Table Modal
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableData, setNewTableData] = useState({
    section: '',
    table_number: '',
    capacity: 4,
    shape: 'SQUARE',
    status: 'AVAILABLE'
  });

  const isManagerOrAdmin = !currentUser || currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 8000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [secs, tbls] = await Promise.all([
        api.getSections(),
        api.getTables()
      ]);
      setSections(secs);
      setTables(tbls);
      if (secs.length > 0 && !activeSection) {
        setActiveSection(secs[0].id);
        setNewTableData(prev => ({ ...prev, section: secs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load table floor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const sectionId = newTableData.section || activeSection || (sections[0]?.id);
      const payload = {
        section: Number(sectionId),
        table_number: newTableData.table_number,
        capacity: Number(newTableData.capacity),
        shape: newTableData.shape,
        status: newTableData.status,
        pos_x: 100,
        pos_y: 100,
        width: newTableData.shape === 'RECTANGLE' ? 140 : 90,
        height: 90
      };
      const created = await api.createTable(payload);
      setTables(prev => [...prev, created]);
      setIsAddTableOpen(false);
      setNewTableData({
        section: activeSection || (sections[0]?.id),
        table_number: '',
        capacity: 4,
        shape: 'SQUARE',
        status: 'AVAILABLE'
      });
      loadData();
    } catch (err) {
      alert(`Error creating table: ${err.message}`);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Are you sure you want to remove this table from the floor plan?')) return;
    try {
      await api.deleteTable(tableId);
      setTables(tables.filter(t => t.id !== tableId));
      setSelectedTable(null);
    } catch (err) {
      alert(`Error removing table: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (tableId, newStatus) => {
    try {
      const updated = await api.updateTableStatus(tableId, newStatus);
      setTables(tables.map(t => t.id === tableId ? updated : t));
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable(updated);
      }
    } catch (err) {
      alert(`Error updating table status: ${err.message}`);
    }
  };

  const handleClearTable = async (tableId) => {
    try {
      const updated = await api.clearTable(tableId);
      setTables(tables.map(t => t.id === tableId ? updated : t));
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable(updated);
      }
    } catch (err) {
      alert(`Error clearing table: ${err.message}`);
    }
  };

  const filteredTables = activeSection 
    ? tables.filter(t => t.section === activeSection)
    : tables;

  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'bg-[#1c1b1b]', border: 'border-[#353535]', text: 'text-[#4edea3]', label: 'Available' };
      case 'OCCUPIED': return { bg: 'bg-[#554300]/25', border: 'border-[#d4af37]', text: 'text-[#d4af37]', label: 'Occupied' };
      case 'RESERVED': return { bg: 'bg-[#2a2a2a]', border: 'border-[#99907c]', text: 'text-[#99907c]', label: 'Reserved' };
      case 'BILL_REQUESTED': return { bg: 'bg-[#92002a]/25', border: 'border-[#ff949c]', text: 'text-[#ff949c]', label: 'Bill Requested' };
      default: return { bg: 'bg-[#1c1b1b]', border: 'border-[#353535]', text: 'text-white', label: status };
    }
  };

  // Status Counts
  const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const reservedCount = tables.filter(t => t.status === 'RESERVED').length;
  const billCount = tables.filter(t => t.status === 'BILL_REQUESTED').length;

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Top Header & Status Overview */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#d4af37]" />
            Floor Plan & Table Management
          </h1>
          <p className="text-xs text-[#99907c] font-mono">
            Real-time floor occupancy • Admin & Manager Table Builder
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Table Button (for Admin & Manager) */}
          {isManagerOrAdmin && (
            <button
              onClick={() => {
                setNewTableData({
                  section: activeSection || sections[0]?.id || '',
                  table_number: `T${tables.length + 1}`,
                  capacity: 4,
                  shape: 'SQUARE',
                  status: 'AVAILABLE'
                });
                setIsAddTableOpen(true);
              }}
              className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-gold cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Table</span>
            </button>
          )}

          {/* Status Counters */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="bg-[#131313] border border-[#353535] px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
              <span className="text-[#d0c5af]">Available:</span>
              <span className="font-bold text-white">{availableCount}</span>
            </div>
            <div className="bg-[#131313] border border-[#d4af37]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]"></span>
              <span className="text-[#d0c5af]">Occupied:</span>
              <span className="font-bold text-[#d4af37]">{occupiedCount}</span>
            </div>
            <div className="bg-[#131313] border border-[#ff949c]/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff949c]"></span>
              <span className="text-[#d0c5af]">Bill Req:</span>
              <span className="font-bold text-[#ff949c]">{billCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sections.map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSection === sec.id
                ? 'bg-[#d4af37] text-black shadow-gold'
                : 'bg-[#1c1b1b] border border-[#353535] text-[#d0c5af] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{sec.name}</span>
          </button>
        ))}
      </div>

      {/* Main Floor Layout Canvas / Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        {/* Visual 2D Table Layout Area */}
        <div className="flex-1 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-6 relative overflow-auto min-h-[460px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-mono uppercase text-[#99907c] tracking-wider">
              Floor Matrix View • Click Table to Inspect / Seat
            </span>
            {isManagerOrAdmin && (
              <span className="text-[10px] font-mono text-[#4edea3] flex items-center gap-1">
                <Shield className="w-3 h-3" /> Manager Layout Permissions Active
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredTables.map(tbl => {
              const statusCfg = getStatusColor(tbl.status);
              const isSelected = selectedTable?.id === tbl.id;

              return (
                <div
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
                    statusCfg.bg
                  } ${statusCfg.border} ${
                    isSelected ? 'ring-2 ring-[#d4af37] scale-105 shadow-gold' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-base font-extrabold text-white block">
                        Table {tbl.table_number}
                      </span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${statusCfg.text}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#99907c] bg-[#131313] px-2 py-0.5 rounded border border-[#353535]">
                      <Users className="w-3 h-3" />
                      <span>{tbl.guest_count > 0 ? `${tbl.guest_count}/${tbl.capacity}` : `${tbl.capacity} max`}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-[#99907c]">{tbl.shape}</span>
                    {tbl.status === 'OCCUPIED' && (
                      <span className="text-[10px] text-[#d4af37] flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3" /> Seated
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Table Inspection Drawer */}
        {selectedTable && (
          <div className="w-full lg:w-80 bg-[#1c1b1b] border border-[#d4af37]/40 rounded-xl p-5 shadow-2xl flex flex-col justify-between shrink-0 animate-in fade-in">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
                <div>
                  <h3 className="text-lg font-bold text-white">Table {selectedTable.table_number}</h3>
                  <p className="text-xs text-[#d4af37] font-mono">{selectedTable.section_name}</p>
                </div>
                <button onClick={() => setSelectedTable(null)} className="text-[#99907c] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table Details */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between bg-[#131313] p-2.5 rounded border border-[#353535]">
                  <span className="text-[#99907c]">Current Status:</span>
                  <span className="font-bold text-white">{selectedTable.status}</span>
                </div>
                <div className="flex justify-between bg-[#131313] p-2.5 rounded border border-[#353535]">
                  <span className="text-[#99907c]">Max Capacity:</span>
                  <span className="text-white">{selectedTable.capacity} Guests</span>
                </div>
                <div className="flex justify-between bg-[#131313] p-2.5 rounded border border-[#353535]">
                  <span className="text-[#99907c]">Active Guests:</span>
                  <span className="text-[#d4af37] font-bold">{selectedTable.guest_count || 0} Seated</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-mono uppercase text-[#99907c]">Change Table Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedTable.id, 'AVAILABLE')}
                    className="p-2 bg-[#131313] hover:bg-[#005236]/30 border border-[#4edea3]/40 text-[#4edea3] text-xs font-bold rounded"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTable.id, 'OCCUPIED')}
                    className="p-2 bg-[#131313] hover:bg-[#574500]/30 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded"
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTable.id, 'RESERVED')}
                    className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#99907c]/40 text-[#99907c] text-xs font-bold rounded"
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedTable.id, 'BILL_REQUESTED')}
                    className="p-2 bg-[#131313] hover:bg-[#92002a]/30 border border-[#ff949c]/40 text-[#ff949c] text-xs font-bold rounded"
                  >
                    Bill Req.
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#2a2a2a] space-y-2">
              <button
                onClick={() => navigate('/pos')}
                className="w-full py-3 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center justify-center gap-2 uppercase tracking-wider shadow-gold cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Open in POS Terminal</span>
              </button>

              <button
                onClick={() => handleClearTable(selectedTable.id)}
                className="w-full py-2 bg-[#2a2a2a] hover:bg-[#353535] text-[#ffb4ab] font-bold text-xs rounded-lg uppercase font-mono cursor-pointer"
              >
                Clear & Reset Table
              </button>

              {isManagerOrAdmin && (
                <button
                  onClick={() => handleDeleteTable(selectedTable.id)}
                  className="w-full py-1.5 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Table from Floor</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD NEW TABLE MODAL (Admin & Manager) */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Add New Dining Table</h3>
              <button onClick={() => setIsAddTableOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Floor Section *</label>
                <select
                  value={newTableData.section}
                  onChange={(e) => setNewTableData({ ...newTableData, section: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  {sections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Table Number *</label>
                  <input
                    type="text"
                    required
                    value={newTableData.table_number}
                    onChange={(e) => setNewTableData({ ...newTableData, table_number: e.target.value })}
                    placeholder="e.g. T9 or VIP-04"
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Capacity (Guests) *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newTableData.capacity}
                    onChange={(e) => setNewTableData({ ...newTableData, capacity: Number(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Shape</label>
                  <select
                    value={newTableData.shape}
                    onChange={(e) => setNewTableData({ ...newTableData, shape: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  >
                    <option value="SQUARE">SQUARE</option>
                    <option value="ROUND">ROUND</option>
                    <option value="RECTANGLE">RECTANGLE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Initial Status</label>
                  <select
                    value={newTableData.status}
                    onChange={(e) => setNewTableData({ ...newTableData, status: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
