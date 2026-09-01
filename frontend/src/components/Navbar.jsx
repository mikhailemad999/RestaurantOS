import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Lock, Shield, User, Clock, Bell, RefreshCw, 
  Smartphone, Database, ChefHat, Sparkles
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { currentUser, setIsPinModalOpen, logout } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
      case '/pos': return 'POS Terminal 01';
      case '/kds': return 'Kitchen Display System (KDS)';
      case '/tables': return 'Floor Plan & Table Management';
      case '/menu': return 'Menu & Recipe Costing';
      case '/inventory': return 'Inventory & Stock Control';
      case '/dispatch': return 'Logistics Dispatch Board';
      case '/driver': return 'Driver Logistics Mobile App';
      case '/crm': return 'Customer Loyalty & CRM';
      case '/kiosk': return 'Customer Self-Order Kiosk';
      case '/dashboard': return 'Executive BI Dashboard';
      case '/reports': return 'Financial Reports & Accounting';
      case '/manager-mobile': return 'Manager Mobile Floor View';
      case '/waiter-pos': return 'Waiter Handheld POS';
      case '/staff': return 'Staff & RBAC Permissions';
      case '/settings': return 'Global System Settings';
      case '/login': return 'Terminal PIN Access';
      default: return 'RestaurantOS Platform';
    }
  };

  return (
    <header className="h-14 bg-[#131313] border-b border-[#2a2a2a] px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Page Info */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#d4af37] to-[#8c7322] flex items-center justify-center text-black font-extrabold shadow-gold group-hover:scale-105 transition-transform">
            <ChefHat className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-white">RESTAURANT<span className="text-[#d4af37]">OS</span></span>
              <span className="text-[10px] bg-[#d4af37]/15 text-[#d4af37] px-1.5 py-0.5 rounded font-mono font-bold">PRO</span>
            </div>
          </div>
        </Link>

        <div className="h-4 w-px bg-[#2a2a2a] hidden sm:block"></div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-mono text-[#99907c]">Active Station:</span>
          <h1 className="text-xs font-semibold text-[#e5e2e1] bg-[#1c1b1b] border border-[#353535] px-2.5 py-1 rounded">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      {/* Center Status Badges */}
      <div className="hidden md:flex items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 bg-[#1c1b1b] border border-[#2a2a2a] px-3 py-1 rounded text-[#d0c5af]">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-glow-pulse"></span>
          <span>MySQL :3306</span>
          <span className="text-[#99907c]">|</span>
          <span className="text-[#4edea3]">LIVE SYNC</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#1c1b1b] border border-[#2a2a2a] px-3 py-1 rounded text-[#d0c5af]">
          <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span className="font-bold text-white">{time}</span>
        </div>
      </div>

      {/* Right Controls / Staff Profile */}
      <div className="flex items-center gap-2.5">
        <LanguageSelector />

        {currentUser ? (
          <div className="flex items-center gap-2 bg-[#1c1b1b] border border-[#353535] hover:border-[#d4af37]/50 transition-colors p-1 pl-2.5 rounded-lg">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider">{currentUser.role}</span>
            </div>
            {currentUser.avatar_url ? (
              <img src={currentUser.avatar_url} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover border border-[#d4af37]" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#2a2a2a] text-[#d4af37] flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            
            {/* PIN Switcher Trigger */}
            <button 
              onClick={() => setIsPinModalOpen(true)}
              title="Switch Staff Terminal / Enter PIN"
              className="p-1.5 hover:bg-[#2a2a2a] text-[#99907c] hover:text-[#d4af37] rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PIN Login</span>
          </button>
        )}

        <button
          onClick={() => setIsPinModalOpen(true)}
          title="Lock Terminal"
          className="p-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#ffb4ab] hover:text-[#ff949c] transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
