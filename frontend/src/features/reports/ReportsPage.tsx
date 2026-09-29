import React, { useState } from 'react'
import {
  BarChart3, DollarSign, TrendingUp, Users, ShoppingBag,
  Download, Calendar, Award, PieChart, Clock, CreditCard,
  Percent, ArrowUpRight, Filter, RefreshCw
} from 'lucide-react'
import {
  useGetSalesSummaryQuery,
  useGetHourlySalesQuery,
  useGetTopItemsQuery,
  useGetCategoryBreakdownQuery,
  useGetPaymentMethodsQuery
} from '@/api/reportsApi'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('today')

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useGetSalesSummaryQuery({ period })
  const { data: hourlySales = [], refetch: refetchHourly } = useGetHourlySalesQuery({ period })
  const { data: topItems = [], refetch: refetchTop } = useGetTopItemsQuery({ period })
  const { data: categories = [], refetch: refetchCat } = useGetCategoryBreakdownQuery({ period })
  const { data: paymentMethods = [], refetch: refetchPay } = useGetPaymentMethodsQuery({ period })

  const handleRefresh = () => {
    refetchSummary()
    refetchHourly()
    refetchTop()
    refetchCat()
    refetchPay()
  }

  const handleExportCSV = () => {
    if (!summary) return
    const rows = [
      ['Metric', 'Value'],
      ['Period', period],
      ['Gross Revenue', summary.total_revenue],
      ['Net Sales', summary.net_sales],
      ['Taxes', summary.taxes],
      ['Discounts', summary.discounts],
      ['Tips Collected', summary.total_tips],
      ['Total Orders', summary.total_orders],
      ['Average Check', summary.avg_check],
      ['Total Guests', summary.total_guests],
      [],
      ['Top Menu Items', 'Category', 'Quantity Sold', 'Sales ($)'],
      ...topItems.map((item) => [item.item_name, item.category_name, item.quantity, item.sales]),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `restaurantos_report_${period}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const maxHourlySales = Math.max(...hourlySales.map((h) => parseFloat(h.sales || '0')), 1)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Business Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time revenue, gross margin, hourly rush distribution & menu engineering matrices
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: '7 Days' },
              { id: 'month', label: '30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  period === p.id
                    ? 'bg-white text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">
            ${summary ? summary.total_revenue : '0.00'}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Net: ${summary ? summary.net_sales : '0.00'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Check</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">
            ${summary ? summary.avg_check : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Per guest table seating
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">
            {summary ? summary.total_orders : 0}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            {summary ? summary.completed_orders : 0} completed & paid
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tips / Gratuity</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-600 block">
            ${summary ? summary.total_tips : '0.00'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Staff service recognition
          </span>
        </div>
      </div>

      {/* Visual Chart: Hourly Sales Activity */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Hourly Sales Activity & Peak Rush Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of revenue and volume across restaurant service hours</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Peak scale: ${maxHourlySales.toFixed(2)}</span>
        </div>

        <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 overflow-x-auto">
          {hourlySales.map((h, i) => {
            const val = parseFloat(h.sales || '0')
            const pct = Math.max(8, (val / maxHourlySales) * 100)
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 min-w-[28px] group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                  ${val.toFixed(0)} ({h.orders})
                </div>
                <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      val > 0 ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' : 'bg-transparent'
                    }`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{h.hour}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Two Column Section: Top Sellers & Channel / Tender Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Best Sellers */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top 10 Menu Engineering Stars
            </h3>
            <span className="text-xs font-semibold text-slate-400">By Total Revenue</span>
          </div>

          <div className="space-y-3">
            {topItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales entries recorded in this period.</p>
            ) : (
              topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{item.item_name}</h4>
                      <span className="text-[11px] text-slate-400">{item.category_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-xs text-slate-900 block">${item.sales}</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">{item.quantity} orders</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Channels & Payment Methods */}
        <div className="space-y-6">
          {/* Order Channel Mix */}
          {summary && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                Service Channel Distribution
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Dine-In Tables</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">
                    {summary.order_type_breakdown.dine_in}
                  </span>
                  <span className="text-[10px] text-slate-400">In-house table seating</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Takeout / Pickup</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">
                    {summary.order_type_breakdown.takeout}
                  </span>
                  <span className="text-[10px] text-slate-400">Direct counter pickup</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Delivery Fleet</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">
                    {summary.order_type_breakdown.delivery}
                  </span>
                  <span className="text-[10px] text-slate-400">Dispatched drivers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">QR Code Dining</span>
                  <span className="text-xl font-bold text-slate-900 mt-1 block">
                    {summary.order_type_breakdown.qr_order}
                  </span>
                  <span className="text-[10px] text-slate-400">Contactless table scan</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Share */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Settlement Tenders Breakdown
            </h3>

            <div className="space-y-3">
              {paymentMethods.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No payment entries in selected period.</p>
              ) : (
                paymentMethods.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-800 capitalize">
                      {p.method.replace('_', ' ').toLowerCase()}
                    </span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">${p.amount}</span>
                      <span className="text-[11px] text-slate-400 block">{p.count} transactions</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
