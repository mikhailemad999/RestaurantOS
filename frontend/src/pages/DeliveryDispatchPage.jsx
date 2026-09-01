import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Truck, Navigation, Clock, User, Phone, MapPin, 
  CheckCircle2, AlertCircle, RefreshCw, Send, ChevronRight
} from 'lucide-react';

export default function DeliveryDispatchPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [assigningDelivery, setAssigningDelivery] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [delData, drvData] = await Promise.all([
        api.getDeliveryOrders(),
        api.getDrivers()
      ]);
      setDeliveries(delData);
      setDrivers(drvData);
      if (drvData.length > 0) {
        setSelectedDriverId(drvData[0].id);
      }
    } catch (err) {
      console.error('Failed to load delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!assigningDelivery || !selectedDriverId) return;

    try {
      await api.assignDriver(assigningDelivery.id, selectedDriverId);
      setAssigningDelivery(null);
      loadData();
    } catch (err) {
      alert(`Error assigning driver: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (deliveryId, status) => {
    try {
      await api.updateDeliveryStatus(deliveryId, status);
      loadData();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Group deliveries into 3 Kanban columns
  const unassignedList = deliveries.filter(d => d.delivery_status === 'UNASSIGNED');
  const inTransitList = deliveries.filter(d => ['ASSIGNED', 'PICKED_UP'].includes(d.delivery_status));
  const deliveredList = deliveries.filter(d => d.delivery_status === 'DELIVERED');

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#d4af37]" />
            Delivery Dispatch & Courier Logistics Board
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Live fleet tracking, route assignment, and order dispatching</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#131313] border border-[#353535] px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-[#99907c] block text-[10px]">ACTIVE COURIERS</span>
            <span className="font-bold text-[#4edea3] text-sm">{drivers.length} Online</span>
          </div>
          <button
            onClick={loadData}
            title="Refresh Dispatch Board"
            className="p-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Kanban Dispatch Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {/* Column 1: Unassigned Deliveries */}
        <div className="bg-[#1c1b1b] rounded-xl border border-[#2a2a2a] flex flex-col overflow-hidden">
          <div className="p-3 bg-[#20201f] border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff949c]"></span>
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">Pending Assignment</h2>
            </div>
            <span className="bg-[#131313] text-[#ff949c] font-mono text-xs px-2 py-0.5 rounded font-bold">
              {unassignedList.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {unassignedList.length === 0 ? (
              <p className="text-xs text-center text-[#99907c] py-8">No pending orders waiting for dispatch.</p>
            ) : (
              unassignedList.map(del => (
                <div key={del.id} className="bg-[#20201f] border border-[#353535] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{del.customer_name}</h4>
                      <p className="text-[11px] text-[#99907c] font-mono">{del.customer_phone}</p>
                    </div>
                    <span className="bg-[#93000a]/40 text-[#ffb4ab] border border-[#ffb4ab]/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      Unassigned
                    </span>
                  </div>

                  <div className="text-xs text-[#d0c5af] flex items-start gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#d4af37] mt-0.5" />
                    <span className="line-clamp-2">{del.delivery_address}</span>
                  </div>

                  <button
                    onClick={() => setAssigningDelivery(del)}
                    className="w-full py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-gold cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign Courier</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Transit / Out for Delivery */}
        <div className="bg-[#1c1b1b] rounded-xl border border-[#2a2a2a] flex flex-col overflow-hidden">
          <div className="p-3 bg-[#20201f] border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f2ca50] animate-pulse"></span>
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">Out for Delivery</h2>
            </div>
            <span className="bg-[#131313] text-[#f2ca50] font-mono text-xs px-2 py-0.5 rounded font-bold">
              {inTransitList.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {inTransitList.length === 0 ? (
              <p className="text-xs text-center text-[#99907c] py-8">No active orders in transit.</p>
            ) : (
              inTransitList.map(del => (
                <div key={del.id} className="bg-[#20201f] border border-[#d4af37]/40 rounded-xl p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{del.customer_name}</h4>
                      <p className="text-[11px] text-[#4edea3] font-mono">Courier: {del.driver_name || 'Assigned'}</p>
                    </div>
                    <span className="bg-[#574500]/40 text-[#f2ca50] border border-[#f2ca50]/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {del.delivery_status}
                    </span>
                  </div>

                  <div className="text-xs text-[#d0c5af] flex items-start gap-1.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-[#d4af37] mt-0.5" />
                    <span className="line-clamp-2">{del.delivery_address}</span>
                  </div>

                  {del.driver_notes && (
                    <p className="text-[10px] text-[#99907c] italic font-mono bg-[#131313] p-1.5 rounded">
                      "{del.driver_notes}"
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(del.id, 'PICKED_UP')}
                      className="flex-1 py-1.5 bg-[#131313] hover:bg-[#2a2a2a] text-[#d0c5af] border border-[#353535] rounded text-[11px] font-mono"
                    >
                      Picked Up
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(del.id, 'DELIVERED')}
                      className="flex-1 py-1.5 bg-[#4edea3] hover:bg-[#6ffbbe] text-black rounded text-[11px] font-bold font-mono"
                    >
                      Mark Delivered
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Delivered Today */}
        <div className="bg-[#1c1b1b] rounded-xl border border-[#2a2a2a] flex flex-col overflow-hidden">
          <div className="p-3 bg-[#20201f] border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">Delivered & Complete</h2>
            </div>
            <span className="bg-[#131313] text-[#4edea3] font-mono text-xs px-2 py-0.5 rounded font-bold">
              {deliveredList.length}
            </span>
          </div>

          <div className="p-3 space-y-3 flex-1 overflow-y-auto">
            {deliveredList.length === 0 ? (
              <p className="text-xs text-center text-[#99907c] py-8">No completed deliveries yet today.</p>
            ) : (
              deliveredList.map(del => (
                <div key={del.id} className="bg-[#20201f] border border-[#2a2a2a] rounded-xl p-3.5 space-y-2 opacity-80">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{del.customer_name}</h4>
                      <p className="text-[11px] text-[#99907c] font-mono">{del.delivery_address}</p>
                    </div>
                    <span className="bg-[#005236]/40 text-[#4edea3] text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  </div>
                  <div className="text-[10px] text-[#99907c] font-mono">
                    Fulfilled by Courier {del.driver_name || 'Staff'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ASSIGN DRIVER MODAL */}
      {assigningDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Assign Courier to Order</h3>
            <p className="text-xs text-[#99907c] font-mono mb-4">
              Destination: {assigningDelivery.delivery_address}
            </p>

            <form onSubmit={handleAssignDriver} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Select Available Driver:</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.phone || 'Courier'})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningDelivery(null)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Dispatch to Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
