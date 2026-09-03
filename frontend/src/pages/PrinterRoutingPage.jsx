import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, ArrowRight, ShieldCheck, Play, Plus, CheckCircle, 
  AlertCircle, Trash2, Edit3, RefreshCw, Printer, Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function PrinterRoutingPage() {
  const [rules, setRules] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [stations, setStations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulator State
  const [simStation, setSimStation] = useState('PIZZA');
  const [simItemId, setSimItemId] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    rule_level: 'STATION',
    station_code: 'PIZZA',
    primary_printer: '',
    backup_printer: '',
    priority: 10
  });

  const fetchData = async () => {
    try {
      const [rRes, pRes, sRes, mRes] = await Promise.all([
        api.getPrinterRoutingRules(),
        api.getPrinters(),
        api.getKitchenStations(),
        api.getMenuItems()
      ]);
      setRules(rRes || []);
      setPrinters(pRes || []);
      setStations(sRes || []);
      setMenuItems(mRes || []);
      if (pRes && pRes.length > 0) {
        setNewRule(prev => ({
          ...prev,
          primary_printer: pRes[0].id,
          backup_printer: pRes[1]?.id || pRes[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load routing rules data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulatePrinterRoute({
        station_code: simStation,
        item_id: simItemId ? parseInt(simItemId) : null
      });
      setSimulationResult(res);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await api.createPrinterRoutingRule(newRule);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create routing rule: ' + err.message);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this routing rule?')) return;
    try {
      await api.deletePrinterRoutingRule(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] p-4 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white mb-2">
            Printer Routing Rule Engine
          </h1>
          <p className="text-sm text-[#99907c] font-mono">
            Hierarchical dispatch logic: Item Specific → Station Direct → Category Default → Global Fallback
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/settings/printers/monitor"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#f2ca50]" />
            Fleet Monitor
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#f2ca50] hover:bg-[#ffe088] text-[#131313] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Route Simulator Interactive Card */}
      <div className="bg-[#1c1b1b] border border-[#353535] rounded-2xl p-6 my-8 shadow-xl">
        <div className="flex items-center gap-2 text-[#f2ca50] text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Play className="w-4 h-4" />
          Interactive Route Simulator
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Test Order Dispatch Resolution</h2>
        <p className="text-xs text-[#99907c] mb-6">
          Select test criteria to trace how orders are routed through active station rules, primary thermal devices, and failover backups.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-mono uppercase text-[#99907c] block mb-1.5">
              Select Kitchen Station
            </label>
            <select
              value={simStation}
              onChange={(e) => setSimStation(e.target.value)}
              className="w-full bg-[#131313] border border-[#353535] text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-[#f2ca50]"
            >
              {stations.map(stn => (
                <option key={stn.code} value={stn.code}>
                  {stn.name_en} ({stn.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-[#99907c] block mb-1.5">
              Optional Menu Item Override
            </label>
            <select
              value={simItemId}
              onChange={(e) => setSimItemId(e.target.value)}
              className="w-full bg-[#131313] border border-[#353535] text-white text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-[#f2ca50]"
            >
              <option value="">-- Any Item in Station --</option>
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (${item.price})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full h-11 bg-[#4edea3] hover:bg-[#38c98e] text-[#131313] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Route Simulation
            </button>
          </div>
        </div>

        {/* Simulation Output Banner */}
        {simulationResult && (
          <div className="mt-6 p-4 bg-[#131313] border border-[#4edea3]/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00a572]/20 flex items-center justify-center text-[#4edea3]">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Resolved via: <span className="text-[#f2ca50] font-mono">{simulationResult.matched_level}</span>
                </div>
                <div className="text-[11px] text-[#99907c] font-mono">
                  Matched Rule: {simulationResult.rule_name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="bg-[#20201f] px-3 py-2 rounded-lg border border-[#353535]">
                <span className="text-[10px] text-[#99907c] uppercase block">Target Station</span>
                <span className="text-white font-bold">{simulationResult.routed_station}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#99907c]" />
              <div className="bg-[#20201f] px-3 py-2 rounded-lg border border-[#353535]">
                <span className="text-[10px] text-[#4edea3] uppercase block">Primary Printer</span>
                <span className="text-white font-bold">{simulationResult.primary_printer?.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#99907c]" />
              <div className="bg-[#20201f] px-3 py-2 rounded-lg border border-[#353535]">
                <span className="text-[10px] text-[#f2ca50] uppercase block">Failover Backup</span>
                <span className="text-white font-bold">{simulationResult.backup_printer?.name || 'Central KDS'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rules Table */}
      <div className="bg-[#1c1b1b] rounded-2xl border border-[#2a2a2a] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Active Routing Rules Registry</h2>
          <span className="text-xs font-mono text-[#99907c]">
            {rules.length} Configured Rules
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-[11px] font-mono uppercase text-[#99907c]">
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Target / Station</th>
                <th className="py-3 px-4">Primary Printer</th>
                <th className="py-3 px-4">Backup Printer</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] text-xs font-mono">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-[#20201f] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#f2ca50]">{rule.priority}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{rule.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#2a2a2a] text-[#4edea3] px-2 py-0.5 rounded text-[10px]">
                      {rule.rule_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#e5e2e1]">
                    {rule.menu_item_name || rule.station_code || 'GLOBAL'}
                  </td>
                  <td className="py-3.5 px-4 text-white font-bold">{rule.primary_printer_name}</td>
                  <td className="py-3.5 px-4 text-[#99907c]">{rule.backup_printer_name || 'None'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-[#ff949c] hover:bg-[#ff949c]/20 rounded transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#353535] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-[#20201f] border-b border-[#353535] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono">Create Printer Routing Rule</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#99907c] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Pizza Oven Express Route"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Rule Level</label>
                <select
                  value={newRule.rule_level}
                  onChange={(e) => setNewRule({ ...newRule, rule_level: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                >
                  <option value="STATION">STATION (Route by Kitchen Station)</option>
                  <option value="ITEM">ITEM (Specific High-Value Dish)</option>
                  <option value="GLOBAL">GLOBAL (Restaurant Default)</option>
                </select>
              </div>

              {newRule.rule_level === 'STATION' && (
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Station</label>
                  <select
                    value={newRule.station_code}
                    onChange={(e) => setNewRule({ ...newRule, station_code: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    {stations.map(stn => (
                      <option key={stn.code} value={stn.code}>{stn.name_en}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Primary Printer</label>
                  <select
                    value={newRule.primary_printer}
                    onChange={(e) => setNewRule({ ...newRule, primary_printer: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    {printers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono text-[#99907c] uppercase block mb-1">Backup Failover</label>
                  <select
                    value={newRule.backup_printer}
                    onChange={(e) => setNewRule({ ...newRule, backup_printer: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
                  >
                    {printers.map(p => (
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
