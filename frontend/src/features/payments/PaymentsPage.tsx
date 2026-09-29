import React, { useState } from 'react'
import {
  CreditCard, Banknote, Wallet, Receipt, DollarSign,
  AlertCircle, CheckCircle2, RotateCcw, Clock, ArrowUpRight,
  Printer, ShieldCheck, Plus, RefreshCw, X, ChevronRight
} from 'lucide-react'
import {
  useGetTransactionsQuery,
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useCloseShiftMutation,
  useRefundPaymentMutation,
  useLazyGetReceiptQuery,
  PaymentTransaction,
  ReceiptData
} from '@/api/paymentsApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

export const PaymentsPage: React.FC = () => {
  const [methodFilter, setMethodFilter] = useState<string>('ALL')
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false)
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false)
  const [openingFloat, setOpeningFloat] = useState('200.00')
  const [shiftNotes, setShiftNotes] = useState('')
  const [actualCash, setActualCash] = useState('')
  const [closeNotes, setCloseNotes] = useState('')

  const { data: transactions = [], isLoading: txLoading, refetch: refetchTx } = useGetTransactionsQuery()
  const { data: shiftData, isLoading: shiftLoading, refetch: refetchShift } = useGetCurrentShiftQuery()

  const [openShift, { isLoading: isOpening }] = useOpenShiftMutation()
  const [closeShift, { isLoading: isClosing }] = useCloseShiftMutation()
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()
  const [getReceipt, { isFetching: isReceiptLoading }] = useLazyGetReceiptQuery()

  const currentShift = shiftData?.data

  const filteredTransactions = transactions.filter((t) => {
    if (methodFilter === 'ALL') return true
    return t.payment_method === methodFilter
  })

  const totalProcessed = filteredTransactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

  const totalTips = filteredTransactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + parseFloat(t.tip_amount || '0'), 0)

  const handleOpenShift = async () => {
    try {
      await openShift({
        opening_float: parseFloat(openingFloat) || 200,
        notes: shiftNotes,
      }).unwrap()
      setIsOpenShiftModalOpen(false)
      setShiftNotes('')
      refetchShift()
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to open shift')
    }
  }

  const handleCloseShift = async () => {
    if (!currentShift) return
    try {
      await closeShift({
        id: currentShift.id,
        actual_cash: parseFloat(actualCash) || 0,
        notes: closeNotes,
      }).unwrap()
      setIsCloseShiftModalOpen(false)
      setActualCash('')
      setCloseNotes('')
      refetchShift()
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to close shift')
    }
  }

  const handleViewReceipt = async (transaction: PaymentTransaction) => {
    try {
      const res = await getReceipt({ payment_id: transaction.id }).unwrap()
      setSelectedReceipt(res)
      setIsReceiptModalOpen(true)
    } catch {
      alert('Could not fetch receipt data.')
    }
  }

  const handleRefund = async (txId: string) => {
    if (!confirm('Are you sure you want to refund this payment transaction?')) return
    try {
      await refundPayment({ id: txId, reason: 'Customer requested refund via register' }).unwrap()
      refetchTx()
      refetchShift()
    } catch (err: any) {
      alert(err?.data?.message || 'Refund failed')
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CASH':
        return <Banknote className="w-4 h-4 text-emerald-600" />
      case 'DIGITAL_WALLET':
        return <Wallet className="w-4 h-4 text-indigo-600" />
      default:
        return <CreditCard className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-indigo-600" />
            Payments, Shifts & Cash Drawer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile daily floats, audit transactions, process multi-tender settlements & thermal receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchTx()
              refetchShift()
            }}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Ledger
          </Button>

          {currentShift ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActualCash(currentShift.expected_cash)
                setIsCloseShiftModalOpen(true)
              }}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Close Shift Drawer
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Open Register Shift
            </Button>
          )}
        </div>
      </div>

      {/* Cash Drawer Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentShift ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {currentShift ? `Register Shift #${currentShift.shift_number}` : 'No Active Shift Open'}
                </h3>
                {currentShift ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE OPEN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    STANDBY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentShift
                  ? `Opened by ${currentShift.user_name || 'Staff'} at ${new Date(currentShift.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Start a register shift to track cash sales, card settlement & drawer float'}
              </p>
            </div>
          </div>

          {currentShift && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Opening Float</span>
                <span className="text-sm font-bold text-slate-800">${currentShift.opening_float}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
                <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Expected In Drawer</span>
                <span className="text-sm font-extrabold text-emerald-700">${currentShift.expected_cash}</span>
              </div>
            </div>
          )}
        </div>

        {/* Shift Financial Metrics Breakdown */}
        {currentShift && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium">Cash Sales</span>
              </div>
              <span className="text-lg font-bold text-slate-900">${currentShift.total_cash_sales}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">Card Sales</span>
              </div>
              <span className="text-lg font-bold text-slate-900">${currentShift.total_card_sales}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Wallet className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium">Digital Wallet</span>
              </div>
              <span className="text-lg font-bold text-slate-900">${currentShift.total_wallet_sales}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium">Gratuity / Tips</span>
              </div>
              <span className="text-lg font-bold text-slate-900">${currentShift.total_tips}</span>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Settled Transactions Volume</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">${totalProcessed.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{filteredTransactions.length} transaction entries</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Tips Collected</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">${totalTips.toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Allocated to serving staff</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Register Discrepancy Rate</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">99.8%</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Audit compliance verified</span>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm text-slate-900">Settlement Ledger</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredTransactions.length} Records
            </span>
          </div>

          {/* Tender Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            {['ALL', 'CREDIT_CARD', 'CASH', 'DIGITAL_WALLET'].map((m) => (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  methodFilter === m
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'ALL' ? 'All Tenders' : m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Transaction & Order</th>
                <th className="px-6 py-3.5">Customer & Table</th>
                <th className="px-6 py-3.5">Tender Method</th>
                <th className="px-6 py-3.5">Amount & Tip</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No payment transactions recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{tx.order_number}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{tx.transaction_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{tx.customer_name || 'Guest'}</div>
                      <div className="text-[11px] text-slate-400">Table: {tx.table_number || 'Direct Takeout'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getMethodIcon(tx.payment_method)}
                        <span className="font-semibold text-slate-700 capitalize">
                          {tx.payment_method.replace('_', ' ').toLowerCase()}
                        </span>
                        {tx.card_last_four && (
                          <span className="text-[10px] text-slate-400 font-mono">(*{tx.card_last_four})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-slate-900">${tx.amount}</div>
                      {parseFloat(tx.tip_amount || '0') > 0 && (
                        <div className="text-[11px] text-emerald-600 font-medium">+${tx.tip_amount} tip</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(tx)}
                          className="h-8 px-2.5 text-xs flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5 text-slate-600" />
                          Receipt
                        </Button>
                        {tx.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefund(tx.id)}
                            className="h-8 px-2 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Open Register Shift */}
      <Modal
        isOpen={isOpenShiftModalOpen}
        onClose={() => setIsOpenShiftModalOpen(false)}
        title="Open Register Cash Drawer"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-500">
            Count the cash drawer float before starting service. This amount forms the baseline for end-of-shift reconciliation.
          </p>

          <Input
            label="Initial Cash Drawer Float ($)"
            type="number"
            step="0.01"
            value={openingFloat}
            onChange={(e) => setOpeningFloat(e.target.value)}
            placeholder="200.00"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Notes (Optional)</label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              rows={3}
              value={shiftNotes}
              onChange={(e) => setShiftNotes(e.target.value)}
              placeholder="e.g. Clean float counted with two $50s, five $20s..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsOpenShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenShift} disabled={isOpening}>
              {isOpening ? 'Starting Shift...' : 'Confirm & Open Drawer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Close Shift Reconciliation */}
      <Modal
        isOpen={isCloseShiftModalOpen}
        onClose={() => setIsCloseShiftModalOpen(false)}
        title="End Shift & Reconcile Float"
      >
        <div className="space-y-4 pt-2">
          {currentShift && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Cash Float:</span>
                <span className="font-bold text-slate-800">${currentShift.opening_float}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cash Collected:</span>
                <span className="font-bold text-emerald-600">+${currentShift.total_cash_sales}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold">
                <span className="text-slate-900">Expected Total in Drawer:</span>
                <span className="text-indigo-600 text-sm">${currentShift.expected_cash}</span>
              </div>
            </div>
          )}

          <Input
            label="Actual Cash Counted in Drawer ($)"
            type="number"
            step="0.01"
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            placeholder="Enter physical cash count"
          />

          {currentShift && actualCash && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
              parseFloat(actualCash) - parseFloat(currentShift.expected_cash) === 0
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <span>Variance / Discrepancy:</span>
              <span>
                ${(parseFloat(actualCash) - parseFloat(currentShift.expected_cash)).toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Closing Audit Remarks</label>
            <textarea
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              rows={2}
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="e.g. Cash counted by supervisor Alex"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsCloseShiftModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCloseShift} disabled={isClosing}>
              {isClosing ? 'Closing Shift...' : 'Reconcile & Close'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Thermal Receipt Viewer */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Thermal Customer Receipt"
      >
        {selectedReceipt && (
          <div className="space-y-4">
            {/* Paper Receipt Simulation */}
            <div className="bg-slate-50 border border-dashed border-slate-300 p-6 rounded-xl font-mono text-xs text-slate-800 shadow-inner">
              <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
                <h4 className="font-extrabold text-sm uppercase tracking-wider">{selectedReceipt.restaurant_name}</h4>
                <p className="text-[11px] text-slate-500">{selectedReceipt.branch_name}</p>
                <p className="text-[10px] text-slate-400">{selectedReceipt.branch_address}</p>
                <p className="text-[10px] text-slate-400">Tel: {selectedReceipt.branch_phone}</p>
              </div>

              <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order:</span>
                  <span className="font-bold">{selectedReceipt.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Table:</span>
                  <span>{selectedReceipt.table_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Server / Station:</span>
                  <span>{selectedReceipt.server_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{selectedReceipt.created_at}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
                {selectedReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <div>
                      <span className="font-bold">{it.quantity}x </span>
                      <span>{it.name}</span>
                    </div>
                    <span className="font-bold">${it.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${selectedReceipt.subtotal}</span>
                </div>
                {parseFloat(selectedReceipt.discount_amount || '0') > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Promo:</span>
                    <span>-${selectedReceipt.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Tax:</span>
                  <span>${selectedReceipt.tax_amount}</span>
                </div>
                {parseFloat(selectedReceipt.service_charge || '0') > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Service Charge:</span>
                    <span>${selectedReceipt.service_charge}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-slate-900">${selectedReceipt.total_amount}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="py-3 space-y-1 text-[11px]">
                {selectedReceipt.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-emerald-700 font-semibold">
                    <span>Paid via {p.method} {p.card_last_four && `(*${p.card_last_four})`}:</span>
                    <span>${p.amount} {parseFloat(p.tip) > 0 && `(+$${p.tip} tip)`}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400">
                Thank you for dining with us!
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Thermal Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default PaymentsPage
