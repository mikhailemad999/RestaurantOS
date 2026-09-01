import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, Check, X, Clock, AlertTriangle, RefreshCw, 
  DollarSign, FileText, UserCheck
} from 'lucide-react';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals();
      setApprovals(res);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveRequest(id);
      loadApprovals();
    } catch (err) {
      alert(`Error approving request: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectRequest(id);
      loadApprovals();
    } catch (err) {
      alert(`Error rejecting request: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
            Manager Approvals & Governance Center
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Authorization queue for voids, large discounts, refunds & recipe modifications</p>
        </div>

        <button
          onClick={loadApprovals}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Approvals Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Pending & Settled Authorization Requests</h2>
          <span className="text-[10px] font-mono text-[#99907c]">Audit Trail Logged</span>
        </div>

        <div className="divide-y divide-[#2a2a2a]">
          {approvals.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#99907c]">No approval requests in the queue.</div>
          ) : (
            approvals.map(req => (
              <div key={req.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#20201f] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white uppercase px-2 py-0.5 rounded bg-[#2a2a2a]">
                      {req.request_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      req.status === 'APPROVED' ? 'bg-[#005236]/40 border-[#4edea3] text-[#4edea3]' :
                      req.status === 'REJECTED' ? 'bg-[#92002a]/40 border-[#ff949c] text-[#ff949c]' :
                      'bg-[#554300]/40 border-[#d4af37] text-[#d4af37]'
                    }`}>
                      {req.status}
                    </span>
                    {req.amount && (
                      <span className="font-mono font-bold text-white text-xs">
                        Amount: ${parseFloat(req.amount).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#d0c5af] font-sans">{req.reason}</p>
                  <p className="text-[10px] font-mono text-[#99907c]">
                    Requested by: <span className="text-white">{req.requester_name || 'Cashier David'}</span> • Created: {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>

                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3.5 py-2 bg-[#005236] hover:bg-[#00704a] text-[#4edea3] border border-[#4edea3]/40 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <Check className="w-4 h-4" />
                      <span>Authorize</span>
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3.5 py-2 bg-[#92002a]/30 hover:bg-[#92002a]/60 text-[#ffb4ab] border border-[#ffb4ab]/40 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-[#99907c]">Settled</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
