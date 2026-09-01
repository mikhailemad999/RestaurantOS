import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, AlertTriangle, CheckCircle, RefreshCw, 
  Flame, DollarSign, Activity, FileWarning, Check
} from 'lucide-react';

export default function RiskCenterPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskAlerts();
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load risk alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveRiskAlert(id);
      loadAlerts();
    } catch (err) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-[#92002a]/30 border-[#ff949c] text-[#ff949c]';
      case 'HIGH': return 'bg-[#554300]/30 border-[#d4af37] text-[#d4af37]';
      case 'MEDIUM': return 'bg-blue-900/30 border-blue-400 text-blue-300';
      default: return 'bg-[#20201f] border-[#353535] text-[#d0c5af]';
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#ff949c]" />
            Restaurant Risk Center & Anomaly Detection
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Automated food cost spikes, ticket SLA delays, void audits & staff overtime detection</p>
        </div>

        <button
          onClick={loadAlerts}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
              alert.is_resolved
                ? 'bg-[#1c1b1b] border-[#2a2a2a] opacity-60'
                : 'bg-[#1c1b1b] border-[#ff949c]/40 shadow-card'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityStyle(alert.severity)}`}>
                  {alert.severity} • {alert.alert_type}
                </span>
                <span className="text-[10px] font-mono text-[#99907c]">
                  {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs text-white font-sans mt-3 leading-relaxed">
                {alert.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#99907c]">
                Status: {alert.is_resolved ? 'RESOLVED' : 'ACTIVE RISK'}
              </span>

              {!alert.is_resolved ? (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-3 py-1.5 bg-[#005236] hover:bg-[#00704a] text-[#4edea3] border border-[#4edea3]/40 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Acknowledge & Resolve</span>
                </button>
              ) : (
                <span className="text-[10px] font-mono text-[#4edea3] flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
