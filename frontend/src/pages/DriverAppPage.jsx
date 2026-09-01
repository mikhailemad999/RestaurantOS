import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Navigation, Phone, MapPin, CheckCircle, Package, 
  Clock, ShieldCheck, RefreshCw, ChevronRight, CheckSquare,
  AlertTriangle, DollarSign, X, Check, ArrowRight
} from 'lucide-react';

export default function DriverAppPage() {
  const { addToast } = useToast();
  const [deliveries, setDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveredSuccess, setDeliveredSuccess] = useState(false);

  // Failed Delivery Modal
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);
  const [failReason, setFailReason] = useState('Customer unavailable / unreachable');

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await api.getDeliveryOrders();
      const inTransit = data.filter(d => ['ASSIGNED', 'PICKED_UP', 'UNASSIGNED'].includes(d.delivery_status));
      setDeliveries(inTransit);
      if (inTransit.length > 0) {
        setActiveDelivery(inTransit[0]);
      } else {
        setActiveDelivery(null);
      }
    } catch (err) {
      console.error('Failed to load driver orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!activeDelivery) return;
    try {
      await api.markDeliveryPickedUp(activeDelivery.id);
      addToast('Order marked as Picked Up / Out for Delivery', 'info');
      loadDeliveries();
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleConfirmDelivered = async () => {
    if (!activeDelivery) return;
    try {
      const isCod = activeDelivery.order?.payment_method === 'CASH' || !activeDelivery.order?.payment_status?.includes('PAID');
      await api.markDeliveryDelivered(activeDelivery.id, isCod ? activeDelivery.order?.total_amount : 0);
      setDeliveredSuccess(true);
      addToast('Order successfully marked as DELIVERED & payment confirmed!', 'success');
      setTimeout(() => {
        setDeliveredSuccess(false);
        loadDeliveries();
      }, 2500);
    } catch (err) {
      addToast(`Error updating delivery: ${err.message}`, 'error');
    }
  };

  const handleReportFailed = async (e) => {
    e.preventDefault();
    if (!activeDelivery) return;
    try {
      await api.markDeliveryFailed(activeDelivery.id, failReason);
      addToast(`Delivery marked as failed: ${failReason}`, 'warning');
      setIsFailModalOpen(false);
      loadDeliveries();
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    }
  };

  const isOnlinePaid = activeDelivery?.order?.payment_status === 'PAID' || activeDelivery?.order?.payment_method === 'ONLINE';

  return (
    <div className="min-h-full p-4 flex items-center justify-center bg-[#0e0e0e]">
      {/* Mobile Device Frame Mockup */}
      <div className="w-full max-w-sm bg-[#131313] border-4 border-[#2a2a2a] rounded-[36px] overflow-hidden shadow-2xl flex flex-col h-[760px] relative">
        {/* Device Notch / Header */}
        <div className="h-6 bg-[#0e0e0e] flex items-center justify-between px-6 select-none">
          <span className="text-[10px] font-mono text-white font-bold">12:45</span>
          <div className="w-20 h-3.5 bg-black rounded-full"></div>
          <span className="text-[10px] font-mono text-[#4edea3]">5G • 98%</span>
        </div>

        {/* Courier App Nav */}
        <div className="bg-[#1c1b1b] p-3.5 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#d4af37] text-black font-bold flex items-center justify-center text-xs">
              JM
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Jack Miller</span>
              <span className="text-[9px] font-mono text-[#4edea3]">● On Duty Courier</span>
            </div>
          </div>
          <button onClick={loadDeliveries} className="text-[#99907c] hover:text-white p-1 cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {deliveredSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#003824]/20 rounded-2xl border border-[#4edea3] animate-in zoom-in-95">
              <CheckCircle className="w-16 h-16 text-[#4edea3] mb-3" />
              <h3 className="text-lg font-bold text-white">Delivery Confivered!</h3>
              <p className="text-xs text-[#d0c5af] font-mono mt-1">Payment verified & receipt dispatched to customer.</p>
            </div>
          ) : activeDelivery ? (
            <>
              {/* Order Status & Number */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#99907c] uppercase">CURRENT ASSIGNMENT</span>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    Order #{activeDelivery.order?.order_number || activeDelivery.id}
                  </h2>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  activeDelivery.delivery_status === 'PICKED_UP' ? 'bg-[#005236] text-[#4edea3]' : 'bg-[#20201f] text-[#d4af37]'
                }`}>
                  {activeDelivery.delivery_status}
                </span>
              </div>

              {/* Payment Collection Banner (COD vs Online) */}
              {isOnlinePaid ? (
                <div className="p-3 bg-[#005236]/30 border border-[#4edea3] rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#4edea3]" />
                    <div>
                      <span className="text-xs font-bold text-[#4edea3] block">PAID ONLINE</span>
                      <span className="text-[10px] text-[#99907c] font-mono">Do NOT collect cash from guest</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">$0.00 DUE</span>
                </div>
              ) : (
                <div className="p-3 bg-[#d4af37]/20 border-2 border-[#d4af37] rounded-2xl flex items-center justify-between shadow-gold">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#d4af37]" />
                    <div>
                      <span className="text-[10px] font-mono text-[#d4af37] font-bold block uppercase">COLLECT ON DELIVERY</span>
                      <span className="text-[10px] text-white font-mono">Cash / POS Card Machine</span>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-[#d4af37] font-mono">
                    ${parseFloat(activeDelivery.order?.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Customer & Address Details Card */}
              <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#20201f] text-[#d4af37] font-bold flex items-center justify-center text-xs">
                      {activeDelivery.customer_name ? activeDelivery.customer_name[0] : 'C'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{activeDelivery.customer_name}</h4>
                      <span className="text-[10px] text-[#99907c] font-mono">{activeDelivery.customer_phone}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${activeDelivery.customer_phone}`}
                    className="p-2 bg-[#005236] text-[#4edea3] rounded-xl hover:bg-[#00704a] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#99907c] uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#d4af37]" /> Destination Address
                  </span>
                  <p className="text-xs text-white mt-1 font-sans font-medium">
                    {activeDelivery.delivery_address}
                  </p>
                </div>

                {activeDelivery.delivery_note && (
                  <div className="p-2.5 bg-[#131313] rounded-xl border border-[#353535] text-[11px] text-[#d4af37] font-mono">
                    <span className="text-[#99907c] block text-[9px] uppercase">Driver Instructions:</span>
                    "{activeDelivery.delivery_note}"
                  </div>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-[#99907c] uppercase block">Package Contents</span>
                <div className="space-y-1 text-[#d0c5af]">
                  {activeDelivery.order?.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.quantity}x {it.menu_item_name || it.name}</span>
                      <span className="text-white">${parseFloat(it.total_price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {activeDelivery.delivery_status !== 'PICKED_UP' ? (
                  <button
                    onClick={handleStartDelivery}
                    className="w-full py-3 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-extrabold text-xs font-mono uppercase rounded-xl flex items-center justify-center gap-2 shadow-gold cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Start Delivery (Picked Up)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmDelivered}
                    className="w-full py-3 bg-[#4edea3] hover:bg-[#6ef5ba] text-black font-extrabold text-xs font-mono uppercase rounded-xl flex items-center justify-center gap-2 shadow-emerald cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Delivered & Collected</span>
                  </button>
                )}

                <button
                  onClick={() => setIsFailModalOpen(true)}
                  className="w-full py-2 bg-[#20201f] hover:bg-[#ff949c]/20 text-[#ff949c] font-bold text-xs font-mono rounded-xl border border-[#ff949c]/30 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Delivery Issue / Failed</span>
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Package className="w-12 h-12 text-[#353535]" />
              <h3 className="font-bold text-sm text-white">No Active Deliveries</h3>
              <p className="text-xs text-[#99907c] font-mono">You're all caught up. Waiting for dispatch to assign new orders.</p>
            </div>
          )}
        </div>

        {/* Failed Delivery Modal */}
        {isFailModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/90 p-5 flex flex-col justify-center rounded-[36px]">
            <div className="bg-[#1c1b1b] border border-[#ff949c] rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#ff949c]" />
                  Report Delivery Failure
                </h4>
                <button onClick={() => setIsFailModalOpen(false)} className="text-[#99907c]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportFailed} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-[#99907c] uppercase block mb-1">Reason for Failure</label>
                  <select
                    value={failReason}
                    onChange={(e) => setFailReason(e.target.value)}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded-xl font-mono text-xs focus:border-[#ff949c] focus:outline-none"
                  >
                    <option value="Customer unavailable / unreachable">Customer unavailable / unreachable</option>
                    <option value="Incorrect delivery address / wrong location">Incorrect address / wrong location</option>
                    <option value="Customer refused order upon arrival">Customer refused order</option>
                    <option value="Phone disconnected / unreachable">Phone disconnected</option>
                    <option value="Extreme weather / road blocked">Extreme weather / road blocked</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFailModalOpen(false)}
                    className="flex-1 py-2 bg-[#20201f] text-white rounded-xl font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#ff949c] text-black font-bold rounded-xl font-mono uppercase"
                  >
                    Submit Return
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
