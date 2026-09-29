import React, { useState } from 'react'
import {
  ClipboardList, ShieldCheck, ShieldAlert, KeyRound,
  Search, Filter, RefreshCw, Eye, User, Laptop,
  Lock, AlertTriangle, FileCode
} from 'lucide-react'
import {
  useGetAuditLogsQuery,
  useGetAuditStatsQuery,
  AuditLogItem
} from '@/api/auditApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const AuditLogsPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)

  const { data: logs = [], isLoading, refetch } = useGetAuditLogsQuery({
    module: selectedModule || undefined,
    search: search || undefined,
  })

  const { data: stats } = useGetAuditStatsQuery()

  const handleInspect = (log: AuditLogItem) => {
    setSelectedLog(log)
    setIsInspectorOpen(true)
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'PAYMENT_PROCESSED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'PAYMENT_REFUND':
      case 'ORDER_CANCEL':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'PRICE_OVERRIDE':
      case 'ROLE_MODIFIED':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'SHIFT_OPEN':
      case 'SHIFT_CLOSE':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-indigo-600" />
            Security Audit Trail & Compliance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system activity log tracking staff authorizations, overrides, refunds, and access events
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stream
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Activity Logs</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
            {stats ? stats.total_logs : logs.length}
          </span>
          <span className="text-[11px] text-slate-400">Indexed events in database</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Staff PIN & Logins</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-0.5 block">
            {stats?.actions?.['LOGIN'] || 0}
          </span>
          <span className="text-[11px] text-slate-400">Terminal authentication</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Payment Settlements</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-0.5 block">
            {stats?.actions?.['PAYMENT_PROCESSED'] || 0}
          </span>
          <span className="text-[11px] text-slate-400">Ledger audit verification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Manager Overrides</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-0.5 block">
            {stats?.actions?.['PRICE_OVERRIDE'] || 0}
          </span>
          <span className="text-[11px] text-slate-400">Supervisory authorization</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search descriptions, orders, users..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['', 'ACCOUNTS', 'PAYMENTS', 'ORDERS', 'PROMOTIONS', 'ROLES', 'SETTINGS'].map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedModule === mod
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {mod === '' ? 'All Modules' : mod}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Action & Module</th>
                <th className="px-6 py-3.5">Staff & Origin</th>
                <th className="px-6 py-3.5">Audit Event Description</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Forensic Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No audit records found matching the criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getActionBadgeColor(log.action)}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          [{log.module}]
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {log.user_name ? log.user_name.charAt(0) : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{log.user_name || 'System Auto'}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Laptop className="w-3 h-3" />
                            {log.ip_address || '127.0.0.1'} {log.user_role && `• ${log.user_role}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-slate-800 font-medium leading-relaxed">{log.description}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInspect(log)}
                        className="h-8 px-2.5 text-xs flex items-center gap-1.5 ml-auto"
                      >
                        <FileCode className="w-3.5 h-3.5 text-slate-500" />
                        Inspect JSON
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      <Modal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        title="Audit Event Forensic Inspector"
      >
        {selectedLog && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Event ID:</span>
                <span className="font-mono text-slate-800">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-indigo-700">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Module:</span>
                <span className="font-semibold text-slate-800">{selectedLog.module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IP Address:</span>
                <span className="font-mono text-slate-700">{selectedLog.ip_address || '127.0.0.1'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{selectedLog.created_at}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payload Metadata</label>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-56">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsInspectorOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AuditLogsPage
