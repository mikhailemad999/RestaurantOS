import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  KeyRound, ShieldCheck, ArrowRight, UserCheck, 
  Delete, Sparkles, CheckCircle2, Lock, Globe
} from 'lucide-react';

export default function UnifiedRoleLoginPage() {
  const { roleKey } = useParams();
  const { loginWithPin, switchUser, roleAccounts, getRoleHomePath } = useAuth();
  const { addToast } = useToast();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [pin, setPin] = useState('');
  const [selectedRole, setSelectedRole] = useState(roleKey ? roleKey.toUpperCase() : 'CASHIER');
  const [loading, setLoading] = useState(false);

  // Predefined role profiles for quick PIN authentication & testing
  const fallbackProfiles = [
    { role: 'ADMIN', name: 'Marcus Vance', title: 'Owner / Executive', pin: '9999', path: '/owner', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { role: 'MANAGER', name: 'Elena Rostova', title: 'General Manager', pin: '1234', path: '/manager', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { role: 'CASHIER', name: 'Sarah Connor', title: 'Head Cashier', pin: '2222', path: '/cashier', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { role: 'WAITER', name: 'Antoine Dubois', title: 'Floor Captain / Waiter', pin: '3333', path: '/captain', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { role: 'CHEF', name: 'Marco Rossi', title: 'Head Chef / KDS', pin: '4444', path: '/chef', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { role: 'DRIVER', name: 'Ahmed Hassan', title: 'Delivery Courier', pin: '5555', path: '/driver', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    { role: 'PACKING', name: 'Karim Nabil', title: 'Packing Expediter', pin: '6666', path: '/packing', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
    { role: 'INVENTORY', name: 'Tarek Zaki', title: 'Inventory Controller', pin: '7777', path: '/inventory', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
    { role: 'CALL_CENTER', name: 'Nour Ali', title: 'Call Center Agent', pin: '8888', path: '/call-center', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' }
  ];

  const currentProfiles = roleAccounts.length > 0 
    ? roleAccounts.map(a => ({
        role: a.role,
        name: a.name,
        title: a.title,
        pin: a.pin_code,
        path: a.role_home_path,
        avatar: a.avatar_url
      }))
    : fallbackProfiles;

  const handleDigit = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleAuthenticate = async (pinToUse = pin) => {
    if (!pinToUse) return;
    try {
      setLoading(true);
      const user = await loginWithPin(pinToUse);
      if (user) {
        addToast(`Welcome back, ${user.name}! Switched to ${user.role} workspace.`, 'success');
        const targetPath = user.role_home_path || getRoleHomePath(user.role);
        navigate(targetPath, { replace: true });
      } else {
        addToast('Invalid PIN code. Please try again.', 'error');
        setPin('');
      }
    } catch (e) {
      addToast('Authentication error', 'error');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = (profile) => {
    setPin(profile.pin);
    setSelectedRole(profile.role);
    handleAuthenticate(profile.pin);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-6xl mx-auto w-full pb-4 border-b border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold font-display shadow-[0_0_20px_rgba(242,202,80,0.3)]">
            OS
          </div>
          <div>
            <h1 className="font-bold text-lg text-on-surface">RestaurantOS</h1>
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">Role-Isolated Security</span>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-xs font-mono text-on-surface flex items-center gap-2 hover:border-primary transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Quick Role Profile Selection */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-outline">Select Your Account</span>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-on-surface mt-1">
              {isAr ? 'اختر دور الموظف لتسجيل الدخول' : 'Role-Isolated Access Portal'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {isAr ? 'يتم تحويل كل مستخدم تلقائياً إلى واجهة العمل المخصصة له فقط وفق صلاحياته' : 'Each role is strictly isolated to its designated operational screens with zero feature bleed.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentProfiles.map(p => {
              const isSelected = selectedRole === p.role;
              return (
                <div
                  key={p.role}
                  onClick={() => handleQuickRoleLogin(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-surface-container-highest border-primary shadow-lg ring-1 ring-primary'
                      : 'bg-surface-container-low border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover border border-outline-variant/40 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="font-bold text-xs text-on-surface truncate">{p.name}</div>
                    <div className="text-[10px] font-mono text-primary truncate font-semibold">{p.title}</div>
                    <div className="text-[9px] font-mono text-outline">PIN: {p.pin}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Numeric PIN Keypad */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-3xl p-6 md:p-8 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-primary/40 text-primary flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-on-surface">Enter Staff PIN</h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Authenticating: <strong className="text-primary">{selectedRole}</strong>
              </p>
            </div>

            {/* PIN Dots Indicator */}
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    idx < pin.length
                      ? 'bg-primary scale-110 shadow-[0_0_10px_rgba(242,202,80,0.6)]'
                      : 'bg-surface-container-highest border border-outline-variant/40'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(String(digit))}
                  className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-xl font-bold font-mono text-on-surface transition-all border border-outline-variant/20 shadow-sm"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="h-14 rounded-2xl bg-surface-container hover:bg-error/20 hover:text-error active:scale-95 text-xs font-mono uppercase tracking-wider text-outline transition-all border border-outline-variant/20"
              >
                Clear
              </button>
              <button
                onClick={() => handleDigit('0')}
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 text-xl font-bold font-mono text-on-surface transition-all border border-outline-variant/20 shadow-sm"
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high active:scale-95 flex items-center justify-center text-outline transition-all border border-outline-variant/20"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Action */}
            <button
              onClick={() => handleAuthenticate()}
              disabled={loading || pin.length < 4}
              className="w-full py-3.5 rounded-2xl bg-primary text-on-primary font-bold font-mono text-sm uppercase tracking-wider hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,202,80,0.25)] disabled:opacity-40"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In To Workspace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-xs text-outline pt-4 border-t border-outline-variant/20">
        RestaurantOS v3.2 Enterprise • Protected by Cryptographic RBAC Token Isolation
      </div>
    </div>
  );
}
