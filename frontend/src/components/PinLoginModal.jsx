import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, ShieldCheck, X, Delete, UserCheck } from 'lucide-react';

export default function PinLoginModal() {
  const { isPinModalOpen, setIsPinModalOpen, loginWithPin, authError, setAuthError, switchUser } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isPinModalOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setAuthError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setAuthError('');
  };

  const handleSubmit = async () => {
    if (!pin) return;
    setLoading(true);
    const success = await loginWithPin(pin);
    setLoading(false);
    if (success) {
      setPin('');
    }
  };

  const quickUsers = [
    { name: 'Marcus Vance', role: 'ADMIN', pin: '1234', title: 'Admin / Owner' },
    { name: 'Elena Rostova', role: 'MANAGER', pin: '1234', title: 'General Manager' },
    { name: 'David Chen', role: 'CASHIER', pin: '1111', title: 'Head Cashier' },
    { name: 'Sophie Laurent', role: 'WAITER', pin: '2222', title: 'Floor Waiter' },
    { name: 'Chef Antoine', role: 'CHEF', pin: '3333', title: 'Head Chef' },
    { name: 'Jack Miller', role: 'DRIVER', pin: '4444', title: 'Courier' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37]/40 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={() => setIsPinModalOpen(false)}
          className="absolute top-4 right-4 text-[#99907c] hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37] flex items-center justify-center text-[#d4af37] mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">RestaurantOS Access</h2>
          <p className="text-sm text-[#d0c5af] mt-1">Enter your 4-digit staff terminal PIN</p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div 
              key={idx} 
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > idx 
                  ? 'bg-[#d4af37] border-[#d4af37] shadow-[0_0_10px_#d4af37]' 
                  : 'bg-transparent border-[#4d4635]'
              }`}
            />
          ))}
        </div>

        {authError && (
          <div className="bg-[#93000a]/40 border border-[#ffb4ab] text-[#ffb4ab] text-xs py-2 px-3 rounded mb-4 text-center font-mono">
            {authError}
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="h-14 bg-[#20201f] hover:bg-[#2a2a2a] active:bg-[#d4af37] active:text-black border border-[#353535] rounded-lg text-xl font-bold font-mono text-white transition-all duration-150 flex items-center justify-center cursor-pointer select-none"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-14 bg-[#20201f] hover:bg-[#353535] border border-[#353535] rounded-lg text-xs uppercase tracking-wider font-semibold font-mono text-[#d0c5af] transition-all duration-150 flex items-center justify-center cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-14 bg-[#20201f] hover:bg-[#2a2a2a] active:bg-[#d4af37] active:text-black border border-[#353535] rounded-lg text-xl font-bold font-mono text-white transition-all duration-150 flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 bg-[#20201f] hover:bg-[#353535] border border-[#353535] rounded-lg text-xl font-mono text-[#ffb4ab] transition-all duration-150 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          className="w-full py-3.5 bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 disabled:cursor-not-allowed text-[#3c2f00] font-bold rounded-lg transition-all text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          {loading ? 'Verifying PIN...' : 'Authorize Terminal'}
        </button>

        {/* Quick Demo Switcher */}
        <div className="mt-6 pt-4 border-t border-[#353535]">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#99907c] mb-2 text-center">Quick Role Switch (Demo PINs):</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {quickUsers.map(u => (
              <button
                key={u.name}
                onClick={() => {
                  setPin(u.pin);
                  loginWithPin(u.pin);
                }}
                className="p-1.5 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] rounded text-left transition-colors flex items-center justify-between"
              >
                <div className="truncate">
                  <span className="font-semibold text-white">{u.name}</span>
                  <span className="text-[10px] text-[#d4af37] block">{u.role}</span>
                </div>
                <span className="text-[10px] font-mono text-[#99907c] bg-[#131313] px-1 py-0.5 rounded">{u.pin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
