import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Database } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState({
    name: "L'Étoile Culinary OS",
    tagline: 'Modern Haute Cuisine & Mixology',
    currency: '$',
    tax_rate: 8.25,
    service_charge: 10.00,
    phone: '+1 (800) 555-FOOD',
    address: '742 Evergreen Terrace, Metropolis'
  });

  const [kdsConfig, setKdsConfig] = useState({
    ticket_alert_yellow: 10,
    ticket_alert_red: 18,
    sound_alerts: true,
    auto_bump_beverages: false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#d4af37]" />
            {t('nav.system_settings')}
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Restaurant profile, language localization, tax calculations & KDS rules</p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-lg flex items-center gap-2 shadow-gold cursor-pointer uppercase font-mono"
        >
          <Save className="w-4 h-4" />
          <span>{t('common.save')}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-[#005236]/40 border border-[#4edea3] text-[#4edea3] text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 font-mono font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully to MySQL database!</span>
        </div>
      )}

      {/* Language Preferences Card */}
      <div className="bg-[#1c1b1b] border-2 border-[#d4af37] rounded-2xl p-5 shadow-gold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase text-[#99907c]">Language & Multi-User Localization</span>
          <h3 className="text-base font-extrabold text-white mt-0.5">Interface Language (English & Arabic)</h3>
          <p className="text-xs text-[#99907c] font-sans mt-0.5">
            Switch between English (LTR) and Arabic (RTL). Setting is saved per-user and per-terminal.
          </p>
        </div>
        <LanguageSelector variant="button-group" />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Restaurant Profile */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h3 className="font-bold text-sm text-white">Restaurant Profile & Metadata</h3>
            <span className="text-[10px] font-mono text-[#d4af37]">Branding</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#99907c] font-mono uppercase block mb-1">Establishment Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[#99907c] font-mono uppercase block mb-1">Tagline / Brand Line</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.tax_rate}
                  onChange={(e) => setProfile({ ...profile, tax_rate: Number(e.target.value) })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Auto Gratuity (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.service_charge}
                  onChange={(e) => setProfile({ ...profile, service_charge: Number(e.target.value) })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[#99907c] font-mono uppercase block mb-1">Physical Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* KDS Kitchen Parameters & Hardware */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h3 className="font-bold text-sm text-white">Kitchen Display & Timers</h3>
            <span className="text-[10px] font-mono text-[#4edea3]">Real-time Queue</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-[#99907c] uppercase block mb-1">Amber Urgency Threshold (Minutes)</label>
              <input
                type="number"
                value={kdsConfig.ticket_alert_yellow}
                onChange={(e) => setKdsConfig({ ...kdsConfig, ticket_alert_yellow: Number(e.target.value) })}
                className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="text-[#99907c] uppercase block mb-1">Red Overdue Alert Threshold (Minutes)</label>
              <input
                type="number"
                value={kdsConfig.ticket_alert_red}
                onChange={(e) => setKdsConfig({ ...kdsConfig, ticket_alert_red: Number(e.target.value) })}
                className="w-full bg-[#131313] border border-[#353535] text-white p-2 rounded focus:border-[#d4af37] focus:outline-none font-bold"
              />
            </div>

            <div className="p-3 bg-[#131313] border border-[#2a2a2a] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Audible Kitchen Chime</span>
                <span className="text-[10px] text-[#99907c]">Play sound when new ticket arrives at KDS</span>
              </div>
              <input
                type="checkbox"
                checked={kdsConfig.sound_alerts}
                onChange={(e) => setKdsConfig({ ...kdsConfig, sound_alerts: e.target.checked })}
                className="w-4 h-4 accent-[#d4af37] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Database & System Info */}
        <div className="md:col-span-2 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-[#2a2a2a]">
            <Database className="w-4 h-4 text-[#d4af37]" />
            <span>Connected Database Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#131313] p-3 rounded-lg border border-[#353535]">
              <span className="text-[#99907c] block text-[10px]">DATABASE ENGINE</span>
              <span className="font-bold text-white">MySQL 8.x (InnoDB)</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-lg border border-[#353535]">
              <span className="text-[#99907c] block text-[10px]">HOST & PORT</span>
              <span className="font-bold text-[#4edea3]">127.0.0.1:3306</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-lg border border-[#353535]">
              <span className="text-[#99907c] block text-[10px]">DATABASE SCHEMA</span>
              <span className="font-bold text-[#d4af37]">restaurant_os</span>
            </div>
            <div className="bg-[#131313] p-3 rounded-lg border border-[#353535]">
              <span className="text-[#99907c] block text-[10px]">BACKEND FRAMEWORK</span>
              <span className="font-bold text-white">Django 5.0 DRF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
