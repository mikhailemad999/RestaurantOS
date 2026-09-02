import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { PhoneCall, PhoneIncoming, PhoneOff, User, ArrowRight, X } from 'lucide-react';

export default function IncomingCallSimulator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('01012345678');
  const [caller, setCaller] = useState(null);
  const [searching, setSearching] = useState(false);

  // Hide on customer storefront and live tracking pages
  const isCustomerRoute = ['/online-ordering', '/order', '/order-tracking', '/qr-ordering', '/kiosk'].some(r => location.pathname.startsWith(r));
  if (isCustomerRoute) return null;

  const simulateCall = async (phoneNumber) => {
    setTestPhone(phoneNumber);
    setIsOpen(true);
    setSearching(true);
    try {
      const res = await api.getCustomers(phoneNumber);
      if (res && res.length > 0) {
        setCaller(res[0]);
      } else {
        setCaller(null);
      }
    } catch (err) {
      console.error('Call simulation lookup error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenOrder = () => {
    setIsOpen(false);
    navigate('/delivery-order');
  };

  return (
    <>
      {/* Small Phone Simulator Toggle Button in bottom-right corner */}
      <button
        onClick={() => simulateCall('01012345678')}
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 bg-[#1c1b1b] hover:bg-[#20201f] border-2 border-[#d4af37] text-white rounded-2xl shadow-gold flex items-center gap-2 text-xs font-mono font-bold cursor-pointer group transition-all"
        title="Simulate incoming phone call from delivery customer"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4edea3]"></span>
        </span>
        <PhoneIncoming className="w-4 h-4 text-[#d4af37] group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Incoming Call Sim</span>
      </button>

      {/* Floating Incoming Call Modal / Toast */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-84 sm:w-96 bg-[#1c1b1b] border-2 border-[#d4af37] rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#d4af37]">
              <PhoneCall className="w-4 h-4 text-[#4edea3] animate-bounce" />
              <span>INCOMING PHONE CALL</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#99907c] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex justify-between items-center font-mono">
              <span className="text-[#99907c]">Calling Line:</span>
              <span className="text-white font-bold text-sm">{testPhone}</span>
            </div>

            {searching ? (
              <p className="text-[11px] text-[#d4af37] font-mono animate-pulse">
                Searching customer CRM database...
              </p>
            ) : caller ? (
              <div className="p-3 bg-[#131313] rounded-xl border border-[#4edea3]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{caller.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#005236] text-[#4edea3] font-mono">
                    {caller.vip_tier}
                  </span>
                </div>
                <p className="text-[10px] text-[#99907c] font-mono">
                  {caller.visit_count} Orders • ${parseFloat(caller.total_spent || 0).toLocaleString()} spent
                </p>
                <p className="text-[10px] text-[#d4af37] font-mono truncate">
                  {caller.addresses?.[0]?.area || 'Default Address'} • {caller.addresses?.[0]?.street}
                </p>
              </div>
            ) : (
              <div className="p-2.5 bg-[#131313] rounded-xl border border-[#2a2a2a] text-[11px] text-[#99907c]">
                New caller (No existing profile found).
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 bg-[#20201f] text-white rounded-xl text-xs font-mono flex items-center justify-center gap-1 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5 text-[#ff949c]" />
              <span>Dismiss</span>
            </button>
            <button
              onClick={handleOpenOrder}
              className="flex-1 py-2 bg-[#d4af37] text-black font-extrabold rounded-xl text-xs font-mono uppercase flex items-center justify-center gap-1 shadow-gold cursor-pointer"
            >
              <span>Take Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
