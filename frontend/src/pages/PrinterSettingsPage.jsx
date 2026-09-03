import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, Plus, Edit3, Trash2, CheckCircle, ShieldCheck, 
  Layers, Terminal, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import { api } from '../services/api';

export default function PrinterSettingsPage() {
  const [printers, setPrinters] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [testPrintModal, setTestPrintModal] = useState(null);
  const [testingPrinterId, setTestingPrinterId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    printer_type: 'KITCHEN',
    station: '',
    connection_type: 'NETWORK',
    ip_address: '192.168.1.100',
    port: 9100,
    paper_width: '80MM',
    status: 'ONLINE',
    auto_print: true,
    copies: 1,
    backup_printer: ''
  });

  const loadData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api.getPrinters(),
        api.getKitchenStations()
      ]);
      setPrinters(pRes || []);
      setStations(sRes || []);
    } catch (err) {
      console.error('Failed to load printer settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePrinter = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        station: formData.station ? parseInt(formData.station) : null,
        backup_printer: formData.backup_printer ? parseInt(formData.backup_printer) : null
      };

      if (editingPrinter) {
        await api.updatePrinter(editingPrinter.id, payload);
      } else {
        await api.createPrinter(payload);
      }
      setShowAddModal(false);
      setEditingPrinter(null);
      loadData();
    } catch (err) {
      alert('Failed to save printer: ' + err.message);
    }
  };

  const handleEditClick = (p) => {
    setEditingPrinter(p);
    setFormData({
      name: p.name,
      display_name: p.display_name || '',
      printer_type: p.printer_type,
      station: p.station || '',
      connection_type: p.connection_type,
      ip_address: p.ip_address,
      port: p.port,
      paper_width: p.paper_width,
      status: p.status,
      auto_print: p.auto_print,
      copies: p.copies,
      backup_printer: p.backup_printer || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to remove this printer device?')) return;
    try {
      await api.deletePrinter(id);
      loadData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleTestPrint = async (printerId) => {
    setTestingPrinterId(printerId);
    try {
      const res = await api.testPrintPrinter(printerId);
      setTestPrintModal(res);
      loadData();
    } catch (err) {
      alert('Test print sequence failed: ' + (err.message || err));
    } finally {
      setTestingPrinterId(null);
    }
  };

  const handleToggleStatus = async (printerId, currentStatus) => {
    const nextStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await api.togglePrinterStatus(printerId, nextStatus);
      loadData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] p-4 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white mb-2">
            Printer Configuration & Hardware
          </h1>
          <p className="text-sm text-[#99907c] font-mono">
            Manage thermal receipt printers, network endpoints, failover links and paper specs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/settings/printers/monitor"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#f2ca50]" />
            Fleet Monitor
          </Link>
          <Link
            to="/settings/printers/routing"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#4edea3]" />
            Routing Rules
          </Link>
          <Link
            to="/settings/printers/template"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-[#f2ca50]" />
            Ticket Template
          </Link>
          <button
            onClick={() => {
              setEditingPrinter(null);
              setFormData({
                name: '',
                display_name: '',
                printer_type: 'KITCHEN',
                station: '',
                connection_type: 'NETWORK',
                ip_address: '192.168.1.100',
                port: 9100,
                paper_width: '80MM',
                status: 'ONLINE',
                auto_print: true,
                copies: 1,
                backup_printer: ''
              });
              setShowAddModal(true);
            }}
            className="bg-[#f2ca50] hover:bg-[#ffe088] text-[#131313] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Printer Device
          </button>
        </div>
      </div>

      {/* Grid of Configured Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {printers.map(printer => (
          <div 
            key={printer.id}
            className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#353535] transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {printer.name}
                  </h3>
                  <p className="text-xs text-[#99907c] font-mono mt-0.5">
                    {printer.display_name || printer.printer_type}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  printer.status === 'ONLINE'
                    ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#00a572]/30'
                    : 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/30'
                }`}>
                  {printer.status}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-[#2a2a2a] text-xs font-mono">
                <div className="flex justify-between text-[#99907c]">
                  <span>Connection:</span>
                  <span className="text-white">{printer.connection_type}</span>
                </div>
                <div className="flex justify-between text-[#99907c]">
                  <span>Endpoint:</span>
                  <span className="text-white">{printer.ip_address}:{printer.port}</span>
                </div>
                <div className="flex justify-between text-[#99907c]">
                  <span>Paper Width:</span>
                  <span className="text-[#f2ca50] font-bold">{printer.paper_width}</span>
                </div>
                <div className="flex justify-between text-[#99907c]">
                  <span>Assigned Station:</span>
                  <span className="text-white">{printer.station_name || 'All / General'}</span>
                </div>
                <div className="flex justify-between text-[#99907c]">
                  <span>Failover Backup:</span>
                  <span className="text-[#4edea3]">{printer.backup_printer_name || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2 border-t border-[#2a2a2a]">
              <button
                onClick={() => handleTestPrint(printer.id)}
                disabled={testingPrinterId === printer.id}
                className="bg-[#20201f] hover:bg-[#2a2a2a] text-xs font-bold text-[#f2ca50] hover:text-white px-3 py-2 rounded-xl border border-[#353535] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5 text-[#f2ca50]" />
                <span>{testingPrinterId === printer.id ? 'Printing...' : 'Test Print'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleToggleStatus(printer.id, printer.status)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-colors border cursor-pointer ${
                    printer.status === 'ONLINE'
                      ? 'bg-[#181818] border-[#353535] text-[#99907c] hover:text-[#ff949c]'
                      : 'bg-[#00a572]/20 border-[#00a572]/40 text-[#4edea3] hover:bg-[#00a572]/30'
                  }`}
                  title="Toggle Online/Offline"
                >
                  {printer.status === 'ONLINE' ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleEditClick(printer)}
                  className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] text-[#99907c] hover:text-white rounded-xl border border-[#353535] transition-colors cursor-pointer"
                  title="Edit Device"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(printer.id)}
                  className="p-2 bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] rounded-xl border border-[#93000a]/30 transition-colors cursor-pointer"
                  title="Remove Device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#353535] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#20201f] border-b border-[#353535] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono">
                {editingPrinter ? 'Edit Thermal Device' : 'Configure New Printer'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#99907c] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePrinter} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Device Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pizza Oven P1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Display Label</label>
                  <input
                    type="text"
                    placeholder="Stone Oven Thermal"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Printer Type</label>
                  <select
                    value={formData.printer_type}
                    onChange={(e) => setFormData({ ...formData, printer_type: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    <option value="KITCHEN">KITCHEN</option>
                    <option value="PIZZA">PIZZA</option>
                    <option value="SANDWICH">SANDWICH</option>
                    <option value="GRILL">GRILL</option>
                    <option value="FRYER">FRYER</option>
                    <option value="BAR">BAR</option>
                    <option value="DESSERT">DESSERT</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Primary Station</label>
                  <select
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    <option value="">-- General / Cashier --</option>
                    {stations.map(stn => (
                      <option key={stn.id} value={stn.id}>{stn.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">IP Address</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Port</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Paper Width</label>
                  <select
                    value={formData.paper_width}
                    onChange={(e) => setFormData({ ...formData, paper_width: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    <option value="80MM">80MM (Standard POS)</option>
                    <option value="58MM">58MM (Compact)</option>
                    <option value="A4">A4 (Invoicing)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Failover Backup</label>
                  <select
                    value={formData.backup_printer}
                    onChange={(e) => setFormData({ ...formData, backup_printer: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    <option value="">-- None --</option>
                    {printers.filter(p => !editingPrinter || p.id !== editingPrinter.id).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#353535]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#20201f] text-[#99907c] text-xs font-mono rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f2ca50] text-[#131313] text-xs font-bold rounded-xl hover:brightness-110"
                >
                  {editingPrinter ? 'Save Changes' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thermal Receipt Simulation Modal */}
      {testPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#353535] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 bg-[#20201f] border-b border-[#353535] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#f2ca50]" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Thermal Test Receipt — {testPrintModal.job_number}
                </h3>
              </div>
              <button
                onClick={() => setTestPrintModal(null)}
                className="text-[#99907c] hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-[#0e0e0e] max-h-[70vh] overflow-y-auto">
              <div className="bg-white text-black font-mono text-xs p-6 rounded-lg shadow-inner border-y-4 border-dashed border-neutral-400 space-y-4 printable-receipt">
                <pre className="whitespace-pre-wrap text-center font-bold pb-2 border-b border-dashed border-neutral-300 font-mono text-[11px] leading-relaxed">
                  {testPrintModal.rendered_text_en}
                </pre>

                {testPrintModal.rendered_text_ar && (
                  <pre className="whitespace-pre-wrap text-right font-semibold pt-2 border-t border-dashed border-neutral-300 text-neutral-800 font-mono text-[11px] leading-relaxed" dir="rtl">
                    {testPrintModal.rendered_text_ar}
                  </pre>
                )}
              </div>
            </div>

            <div className="p-4 bg-[#20201f] border-t border-[#353535] flex justify-between items-center gap-3">
              <div className="text-[11px] font-mono text-[#4edea3] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Job Created & Emulated [OK]</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#2a2a2a] hover:bg-[#353535] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#f2ca50]" />
                  <span>Print to Paper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestPrintModal(null)}
                  className="bg-[#f2ca50] text-[#131313] font-bold text-xs px-5 py-2 rounded-xl hover:brightness-110 transition-all cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
