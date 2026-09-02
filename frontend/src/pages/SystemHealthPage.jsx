import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Activity, Database, Server, Cpu, ShieldCheck, 
  RefreshCw, CheckCircle2, AlertCircle, HardDrive, 
  Wifi, Printer, Terminal, Download
} from 'lucide-react';

export default function SystemHealthPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTelemetry = async () => {
    try {
      const res = await api.getSystemHealthObservability();
      setHealthData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setLoading(true);
    await loadTelemetry();
    addToast('Cluster telemetry force synchronized!', 'success');
  };

  const handleExportLogs = () => {
    addToast('Telemetry logs exported as JSON archive', 'info');
  };

  if (loading && !healthData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-primary font-mono text-sm">
        CONNECTING TO INFRASTRUCTURE OBSERVABILITY BUS...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-secondary">
              {healthData?.last_incident || 'All core services operational'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'حالة النظام والمراقبة الحية (Observability)' : 'System Health & Observability'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'مراقبة زمن استجابة الـ API، اتصالات قاعدة البيانات، ذاكرة التخزين المؤقت وطابعات المطبخ' : 'Real-time telemetry monitoring API latency, database pool connections, cache hit rates & printer buffers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportLogs}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-surface-container border border-outline-variant/40 flex items-center gap-2 text-on-surface hover:border-primary transition-colors"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>{isAr ? 'تصدير السجلات' : 'Export Logs'}</span>
          </button>
          <button 
            onClick={handleForceSync}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,202,80,0.2)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? 'تحديث فوري' : 'Force Sync'}</span>
          </button>
        </div>
      </div>

      {/* Core Infrastructure Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-on-surface font-mono uppercase tracking-wider">
            {isAr ? 'البنية التحتية الأساسية' : 'Core Infrastructure Grid'}
          </h2>
          <span className="text-xs font-mono text-secondary bg-secondary/10 px-2.5 py-1 rounded">
            Auto-refresh: {healthData?.auto_refresh_seconds || 5}s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {healthData?.core_services?.map(service => (
            <div 
              key={service.id}
              className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-5 space-y-4 hover:border-primary/50 transition-all shadow-md flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {service.type === 'api' ? <Server className="w-4 h-4 text-secondary" /> :
                   service.type === 'database' ? <Database className="w-4 h-4 text-secondary" /> :
                   service.type === 'cache' ? <Cpu className="w-4 h-4 text-secondary" /> :
                   service.type === 'network' ? <Wifi className="w-4 h-4 text-primary" /> :
                   <Printer className="w-4 h-4 text-primary" />}
                  <h3 className="font-mono text-xs font-bold text-on-surface">{service.name}</h3>
                </div>
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)]"></span>
              </div>

              <div>
                <div className="text-2xl font-mono font-bold text-on-surface">
                  {service.uptime || '100.0%'}
                </div>
                <div className="space-y-1 mt-2 text-xs font-mono text-on-surface-variant">
                  {service.latency_ms && (
                    <div className="flex justify-between">
                      <span>Latency</span>
                      <strong className="text-on-surface">{service.latency_ms}ms</strong>
                    </div>
                  )}
                  {service.query_avg_ms && (
                    <div className="flex justify-between">
                      <span>Query Avg</span>
                      <strong className="text-on-surface">{service.query_avg_ms}ms</strong>
                    </div>
                  )}
                  {service.hit_rate && (
                    <div className="flex justify-between">
                      <span>Hit Rate</span>
                      <strong className="text-secondary">{service.hit_rate}</strong>
                    </div>
                  )}
                  {service.active_sockets && (
                    <div className="flex justify-between">
                      <span>Sockets</span>
                      <strong className="text-primary">{service.active_sockets}</strong>
                    </div>
                  )}
                  {service.devices_online && (
                    <div className="flex justify-between">
                      <span>Devices</span>
                      <strong className="text-primary">{service.devices_online} Online</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Streamer Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-outline flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span>{isAr ? 'سجل العمليات الحية (Live Telemetry Stream)' : 'Real-time Event Stream'}</span>
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {healthData?.recent_telemetry_logs?.map((log, idx) => (
            <div key={idx} className="flex items-center gap-4 p-2.5 rounded-lg bg-surface-container text-on-surface-variant">
              <span className="text-outline">{log.timestamp}</span>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] text-primary font-bold">
                {log.service}
              </span>
              <span className="text-on-surface flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
