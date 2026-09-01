import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ variant = 'compact' }) {
  const { language, setLanguage } = useLanguage();
  const { currentStaff } = useAuth();

  const handleToggle = (newLang) => {
    setLanguage(newLang, currentStaff?.id);
  };

  if (variant === 'button-group') {
    return (
      <div className="inline-flex bg-[#131313] p-1 rounded-xl border border-[#2a2a2a]">
        <button
          type="button"
          onClick={() => handleToggle('en')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            language === 'en'
              ? 'bg-[#d4af37] text-black shadow-gold'
              : 'text-[#99907c] hover:text-white'
          }`}
        >
          English 🇬🇧
        </button>
        <button
          type="button"
          onClick={() => handleToggle('ar')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            language === 'ar'
              ? 'bg-[#d4af37] text-black shadow-gold'
              : 'text-[#99907c] hover:text-white'
          }`}
        >
          العربية 🇪🇬
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center bg-[#1c1b1b] border border-[#353535] hover:border-[#d4af37] rounded-xl p-1 shadow-card transition-colors">
        <Globe className="w-3.5 h-3.5 text-[#d4af37] mx-1.5" />
        <button
          onClick={() => handleToggle(language === 'en' ? 'ar' : 'en')}
          className="px-2 py-1 bg-[#131313] hover:bg-[#20201f] text-white font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer border border-[#2a2a2a]"
          title="Switch Language (English / العربية)"
        >
          <span>{language === 'en' ? '🇬🇧 EN' : '🇪🇬 عربي'}</span>
        </button>
      </div>
    </div>
  );
}
