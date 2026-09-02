import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, CheckCircle, AlertTriangle, XCircle, RotateCcw, 
  Send, RefreshCw, Eye, Plus, ShieldCheck, Layers, Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function PrinterMonitorPage() {
  const [printers, setPrinters] = useState([]);
  const [fleetSummary, setFleetSummary] = useState(null);
  const [printJobs, setPrintJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [testPrintModal, setTestPrintModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrinterData = async () => {
    try {
      const [pRes, sRes, jRes] = await Promise.all([
        api.getPrinters(),
        api.getPrinterFleetSummary(),
        api.getPrintJobs('limit=25')
      ]);
      setPrinters(pRes || []);
      setFleetSummary(sRes || null);
      setPrintJobs(jRes?.results || jRes || []);
    } catch (err) {
      console.error('Failed to load printer monitor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinterData();
    const interval = setInterval(fetchPrinterData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestPrint = async (printerId) => {
    setActionLoading(true);
    try {
      const res = await api.testPrintPrinter(printerId);
      setTestPrintModal(res);
      fetchPrinterData();
    } catch (err) {
      alert('Test print sequence failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (printerId, currentStatus) => {
    const nextStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await api.togglePrinterStatus(printerId, nextStatus);
      fetchPrinterData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleRetryJob = async (jobId) => {
    try {
      await api.retryPrintJob(jobId);
      fetchPrinterData();
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  const handleRerouteJob = async (jobId) => {
    try {
      await api.reroutePrintJob(jobId);
      fetchPrinterData();
      alert('Job successfully re-routed to backup device!');
    } catch (err) {
      console.error('Re-route failed:', err);
    }
  };

  // Find any failed jobs
  const failedJobs = printJobs.filter(j => j.status === 'FAILED');

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] p-4 lg:p-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white mb-2">
            Printer Fleet Status
          </h1>
          <p className="text-sm text-[#99907c] flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] relative flex items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75 animate-ping"></span>
            </span>
            System Nominal — {fleetSummary?.online_count || printers.filter(p => p.status === 'ONLINE').length}/{printers.length} Online
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/settings/printers/routing"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#f2ca50]" />
            Routing Rules
          </Link>
          <Link
            to="/settings/printers/template"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-[#4edea3]" />
            Ticket Template
          </Link>
          <button
            onClick={fetchPrinterData}
            className="bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-white" />
            Force Sync
          </button>
        </div>
      </div>

      {/* Alert Panel (Failed Jobs Alert) */}
      {failedJobs.length > 0 && (
        <div className="bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-2xl p-4 lg:p-6 my-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="bg-[#ffb4ab]/20 p-3 rounded-xl text-[#ffb4ab]">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#ffdad6]">
                Failed Job Alert: {failedJobs[0].printer_name}
              </h3>
              <p className="text-xs font-mono text-[#ffb4ab] mt-0.5">
                Job #{failedJobs[0].job_number} — Error: {failedJobs[0].error_message || 'Device timeout or paper out'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleRetryJob(failedJobs[0].id)}
              className="bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 text-[#ffdad6] border border-[#ffb4ab]/30 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Retry Job
            </button>
            <button
              onClick={() => handleRerouteJob(failedJobs[0].id)}
              className="bg-[#ffb4ab] hover:bg-white text-[#690005] text-xs font-black px-4 py-2 rounded-xl transition-colors shadow-md flex items-center gap-1.5"
            >
              Force Re-route
            </button>
          </div>
        </div>
      )}

      {/* Fleet Printers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {printers.map(printer => {
          const isOnline = printer.status === 'ONLINE';
          return (
            <div
              key={printer.id}
              className="bg-[#1c1b1b] rounded-2xl p-5 border border-[#2a2a2a] shadow-lg flex flex-col justify-between hover:border-[#353535] transition-all relative overflow-hidden group"
            >
              {/* Left Color Indicator Accent */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isOnline ? 'bg-[#4edea3]' : 'bg-[#ff949c]'
                }`}
              />

              {/* Card Top */}
              <div>
                <div className="flex justify-between items-start mb-4 pl-1">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {printer.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#99907c] uppercase mt-0.5">
                      {printer.printer_type} • {printer.paper_width}
                    </p>
                  </div>

                  <div className={`px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase ${
                    isOnline 
                      ? 'bg-[#00a572]/20 text-[#4edea3] border border-[#00a572]/30' 
                      : 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#4edea3] animate-pulse' : 'bg-[#ffb4ab]'}`}></span>
                    {printer.status}
                  </div>
                </div>

                {/* Network Coordinates */}
                <div className="grid grid-cols-2 gap-2 bg-[#131313] p-3 rounded-xl border border-[#252525] mb-4 pl-3">
                  <div>
                    <span className="text-[9px] font-mono text-[#99907c] uppercase block">IP Address</span>
                    <span className="text-xs font-mono font-bold text-white">{printer.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-[#99907c] uppercase block">Port</span>
                    <span className="text-xs font-mono font-bold text-white">{printer.port}</span>
                  </div>
                </div>

                {/* Failover target */}
                {printer.backup_printer_name && (
                  <div className="text-[11px] font-mono text-[#99907c] mb-4 pl-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4edea3]" />
                    <span>Failover: {printer.backup_printer_name}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-[#2a2a2a] flex items-center gap-2 pl-1">
                <button
                  onClick={() => handleTestPrint(printer.id)}
                  disabled={actionLoading}
                  className="flex-1 bg-[#20201f] hover:bg-[#2a2a2a] text-xs font-bold text-white py-2 rounded-xl border border-[#353535] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#f2ca50]" />
                  Test Print
                </button>
                <button
                  onClick={() => handleToggleStatus(printer.id, printer.status)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors border ${
                    isOnline
                      ? 'bg-[#181818] border-[#353535] text-[#99907c] hover:text-[#ff949c]'
                      : 'bg-[#00a572]/20 border-[#00a572]/40 text-[#4edea3] hover:bg-[#00a572]/30'
                  }`}
                  title="Toggle Online/Offline"
                >
                  {isOnline ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Print Queue Table */}
      <div className="mt-12 bg-[#1c1b1b] rounded-2xl border border-[#2a2a2a] p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Live Print Queue & Telemetry</h2>
            <p className="text-xs text-[#99907c] font-mono">Simulated non-blocking thermal print queue with ESC/POS emulation</p>
          </div>
          <span className="text-xs font-mono text-[#4edea3] bg-[#00a572]/20 border border-[#00a572]/30 px-3 py-1 rounded-full">
            {printJobs.length} Jobs in Log
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-[11px] font-mono uppercase text-[#99907c]">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Target Printer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a] text-xs font-mono">
              {printJobs.map(job => (
                <tr key={job.id} className="hover:bg-[#20201f] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{job.job_number}</td>
                  <td className="py-3.5 px-4 text-[#f2ca50]">#{job.order_number || 'TEST'}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#2a2a2a] px-2 py-0.5 rounded text-[10px] text-[#e5e2e1]">
                      {job.station_code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#e5e2e1]">{job.printer_name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      job.status === 'PRINTED' 
                        ? 'bg-[#00a572]/20 text-[#4edea3]' 
                        : job.status === 'FAILED'
                        ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                        : 'bg-[#f59e0b]/20 text-[#f59e0b]'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#99907c]">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="p-1.5 bg-[#2a2a2a] hover:bg-[#353535] rounded text-[#e5e2e1] transition-colors"
                      title="View Thermal Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {job.status === 'FAILED' && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        className="p-1.5 bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 rounded text-[#ffdad6] transition-colors"
                        title="Retry Job"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Preview Modal */}
      {(selectedJob || testPrintModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1b1b] border border-[#353535] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="p-4 bg-[#20201f] border-b border-[#353535] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#f2ca50]" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Thermal Receipt Simulation — {selectedJob?.job_number || testPrintModal?.job_number}
                </h3>
              </div>
              <button
                onClick={() => { setSelectedJob(null); setTestPrintModal(null); }}
                className="text-[#99907c] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-[#0e0e0e] max-h-[70vh] overflow-y-auto">
              <div className="bg-white text-black font-mono text-xs p-6 rounded-lg shadow-inner border-y-4 border-dashed border-neutral-400 space-y-4">
                <div className="text-center font-bold pb-2 border-b border-dashed border-neutral-300">
                  {selectedJob?.rendered_text_en || testPrintModal?.rendered_text_en}
                </div>

                <div className="text-right font-arabic font-semibold pt-2 border-t border-dashed border-neutral-300 text-neutral-800" dir="rtl">
                  {selectedJob?.rendered_text_ar || testPrintModal?.rendered_text_ar}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#20201f] border-t border-[#353535] flex justify-end">
              <button
                onClick={() => { setSelectedJob(null); setTestPrintModal(null); }}
                className="bg-[#f2ca50] text-[#131313] font-bold text-xs px-5 py-2 rounded-xl hover:brightness-110 transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
