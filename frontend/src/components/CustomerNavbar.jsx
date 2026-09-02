import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChefHat, ShoppingBag, QrCode, Search, PhoneCall, 
  Clock, ShieldCheck, Compass, Sparkles, Utensils
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function CustomerNavbar({ cartCount = 0, cartTotal = 0, onOpenCart }) {
  const { t, isRTL } = useLanguage();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#131313]/95 backdrop-blur-md border-b border-[#2a2a2a] px-4 lg:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/online-ordering" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3d375] to-[#96791e] flex items-center justify-center text-black font-extrabold shadow-gold group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base lg:text-lg tracking-wider text-white font-serif">
                  L'ÉTOILE
                </span>
                <span className="text-[9px] bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">
                  HAUTE CUISINE
                </span>
              </div>
              <p className="text-[10px] text-[#a89e87] font-mono tracking-widest uppercase -mt-0.5">
                Fine Dining & Private Cellar
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-sans text-xs">
            <Link
              to="/online-ordering"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                location.pathname === '/online-ordering' || location.pathname === '/order'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                  : 'text-[#d0c5af] hover:text-white hover:bg-[#1f1e1e]'
              }`}
            >
              {isRTL ? 'قائمة الطعام والطلب' : 'Gourmet Menu & Order'}
            </Link>
            <Link
              to="/qr-ordering"
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                location.pathname === '/qr-ordering'
                  ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30'
                  : 'text-[#d0c5af] hover:text-white hover:bg-[#1f1e1e]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{isRTL ? 'طلب الطاولة بالرمز' : 'Dine-In QR'}</span>
            </Link>
          </nav>
        </div>

        {/* Operating Hours / Info Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-[#a89e87] bg-[#1a1919] border border-[#2e2d2d] px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span>{isRTL ? 'المطبخ يستقبل الطلبات الآن • 12:00 م – 11:30 م' : 'Kitchen Active • Fresh To Order (12:00 PM – 11:30 PM)'}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSelector />

          {/* Cart Floating Button (If onOpenCart is provided) */}
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              id="customer-cart-trigger"
              className="relative flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] hover:from-[#e4bf47] hover:to-[#ffd868] text-black font-extrabold text-xs rounded-xl shadow-gold transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
              <span className="hidden sm:inline font-mono font-bold">
                {isRTL ? 'السلة' : 'Bag'}
              </span>
              {cartCount > 0 && (
                <span className="bg-black text-[#d4af37] text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                  {cartCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="font-mono text-xs border-l border-black/20 pl-2 hidden sm:inline">
                  ${cartTotal.toFixed(2)}
                </span>
              )}
            </button>
          )}

          {/* Discrete Switcher to Staff Management Portal */}
          <Link
            to="/command-center"
            title="Switch to Restaurant Operations Backoffice"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1f1e1e] hover:bg-[#2a2929] text-[#99907c] hover:text-[#d4af37] border border-[#353535] rounded-lg text-[11px] font-mono transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isRTL ? 'بوابة الموظفين' : 'Staff Portal'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
