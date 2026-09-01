import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Delete, ChefHat, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { loginWithPin, authError, setAuthError } = useAuth();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      navigate('/pos');
    }
  };

  const quickUsers = [
    { name: 'Marcus Vance', role: 'ADMIN', pin: '1234' },
    { name: 'Elena Rostova', role: 'MANAGER', pin: '1234' },
    { name: 'David Chen', role: 'CASHIER', pin: '1111' },
    { name: 'Sophie Laurent', role: 'WAITER', pin: '2222' },
    { name: 'Chef Antoine', role: 'CHEF', pin: '3333' },
    { name: 'Jack Miller', role: 'DRIVER', pin: '4444' },
  ];

  return (
    <div className="min-h-full flex items-center justify-center bg-[#0e0e0e] p-4">
      <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37]/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Logo & Heading */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8c7322] flex items-center justify-center text-black mb-3 shadow-gold">
            <ChefHat className="w-9 h-9 text-black" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">RestaurantOS Terminal</h1>
          <p className="text-xs text-[#99907c] font-mono mt-1">High-Speed Culinary Precision Access</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 py-2">
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
          <div className="bg-[#93000a]/40 border border-[#ffb4ab] text-[#ffb4ab] text-xs py-2 px-3 rounded text-center font-mono">
            {authError}
          </div>
        )}

        {/* Numpad Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="h-16 bg-[#20201f] hover:bg-[#2a2a2a] active:bg-[#d4af37] active:text-black border border-[#353535] rounded-xl text-2xl font-bold font-mono text-white transition-all flex items-center justify-center cursor-pointer select-none"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 bg-[#20201f] hover:bg-[#353535] border border-[#353535] rounded-xl text-xs uppercase tracking-wider font-semibold font-mono text-[#d0c5af] flex items-center justify-center cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-16 bg-[#20201f] hover:bg-[#2a2a2a] active:bg-[#d4af37] active:text-black border border-[#353535] rounded-xl text-2xl font-bold font-mono text-white flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 bg-[#20201f] hover:bg-[#353535] border border-[#353535] rounded-xl text-xl font-mono text-[#ffb4ab] flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || pin.length < 4}
          className="w-full py-4 bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 text-black font-extrabold rounded-xl transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-gold cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{loading ? 'Verifying PIN...' : 'Authorize Terminal'}</span>
        </button>

        {/* Demo Fast Login Buttons */}
        <div className="pt-4 border-t border-[#2a2a2a]">
          <p className="text-[10px] font-mono uppercase text-[#99907c] text-center mb-2">Tap Staff to Login with Pre-Filled PIN:</p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {quickUsers.map(u => (
              <button
                key={u.name}
                onClick={async () => {
                  setPin(u.pin);
                  const ok = await loginWithPin(u.pin);
                  if (ok) navigate('/pos');
                }}
                className="p-2 bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-center transition-colors"
              >
                <span className="font-bold text-white text-[11px] block truncate">{u.name}</span>
                <span className="text-[10px] font-mono text-[#d4af37]">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
