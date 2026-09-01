import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Package, TrendingUp, AlertTriangle, CheckCircle, ShoppingCart, 
  RefreshCw, Sparkles, Plus, Clock, FileText, Check
} from 'lucide-react';

export default function InventoryIntelligencePage() {
  const [forecasts, setForecasts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [foreData, poData] = await Promise.all([
        api.getInventoryForecasting(),
        api.getPurchaseOrders()
      ]);
      setForecasts(foreData);
      setPurchaseOrders(poData);
    } catch (err) {
      console.error('Failed to load inventory intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePO = async (id) => {
    try {
      await api.approvePurchaseOrder(id);
      loadData();
    } catch (err) {
      alert(`Error approving purchase order: ${err.message}`);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Package className="w-5 h-5 text-[#d4af37]" />
            Smart Inventory Forecasting & Purchase Order Automation
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Consumption velocity modeling, reorder points & supplier PO dispatching</p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Forecast Intelligence Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            Ingredient Depletion Velocity & Stockout Risk Forecasting
          </h2>
          <span className="text-[10px] font-mono text-[#99907c]">Next 7-Day & 30-Day Projections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#20201f] text-[#99907c] uppercase text-[10px] tracking-wider border-b border-[#2a2a2a]">
              <tr>
                <th className="p-3.5">Raw Ingredient</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Daily Velocity</th>
                <th className="p-3.5">7-Day Demand</th>
                <th className="p-3.5">Reorder Point</th>
                <th className="p-3.5">Days Left</th>
                <th className="p-3.5">Stockout Risk</th>
                <th className="p-3.5">Suggested Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {forecasts.map(item => (
                <tr key={item.id} className="hover:bg-[#20201f]">
                  <td className="p-3.5">
                    <span className="font-bold text-white font-sans block">{item.name}</span>
                    <span className="text-[10px] text-[#99907c]">{item.category} • {item.supplier_name}</span>
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {item.current_stock.toFixed(1)} {item.unit}
                  </td>
                  <td className="p-3.5 text-[#d0c5af]">{item.daily_avg_consumption} {item.unit}/day</td>
                  <td className="p-3.5 text-[#d4af37] font-bold">{item.forecast_7d} {item.unit}</td>
                  <td className="p-3.5 text-[#99907c]">{item.reorder_point.toFixed(1)} {item.unit}</td>
                  <td className="p-3.5">
                    <span className={`font-bold ${item.days_remaining < 3 ? 'text-[#ff949c]' : 'text-white'}`}>
                      {item.days_remaining} days
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                      item.stockout_risk === 'CRITICAL' ? 'bg-[#92002a]/40 border-[#ff949c] text-[#ff949c]' :
                      item.stockout_risk === 'WARNING' ? 'bg-[#554300]/40 border-[#d4af37] text-[#d4af37]' :
                      'bg-[#005236]/40 border-[#4edea3] text-[#4edea3]'
                    }`}>
                      {item.stockout_risk}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {item.suggested_order_qty > 0 ? (
                      <span className="text-[#4edea3] font-bold">
                        +{item.suggested_order_qty} {item.unit} (${item.estimated_order_cost.toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-[#99907c]">Sufficient</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested & Active Purchase Orders */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4edea3]" />
            Generated Purchase Orders (POs)
          </h2>
          <span className="text-[10px] font-mono text-[#99907c]">Supplier Direct Dispatch</span>
        </div>

        <div className="divide-y divide-[#2a2a2a]">
          {purchaseOrders.map(po => (
            <div key={po.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-white">#{po.po_number}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    po.status === 'SUBMITTED' ? 'bg-[#005236] text-[#4edea3]' : 'bg-[#554300] text-[#d4af37]'
                  }`}>
                    {po.status}
                  </span>
                </div>
                <p className="text-xs text-[#d0c5af] mt-1 font-sans">
                  Supplier: <span className="font-bold text-white">{po.supplier_name}</span> • Total Amount: <span className="font-bold text-[#d4af37]">${parseFloat(po.total_amount).toFixed(2)}</span>
                </p>
                <p className="text-[11px] text-[#99907c] font-sans mt-0.5">{po.notes}</p>
              </div>

              {po.status === 'DRAFT' && (
                <button
                  onClick={() => handleApprovePO(po.id)}
                  className="px-4 py-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-emerald cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Dispatch to Supplier</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
