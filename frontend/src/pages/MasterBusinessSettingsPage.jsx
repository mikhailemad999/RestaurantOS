import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, Sliders, ToggleLeft, ToggleRight, DollarSign, 
  ShieldCheck, History, Save, CheckCircle2, AlertCircle, 
  Utensils, Coffee, Truck, Layers, Pizza, PartyPopper, Store
} from 'lucide-react';

export default function MasterBusinessSettingsPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState('business-model');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [brands, setBrands] = useState([]);

  // Business models catalogue
  const operatingModels = [
    {
      id: 'FAST_FOOD',
      nameEn: 'QSR / Fast Casual',
      nameAr: 'خدمة سريعة / كاجوال',
      descEn: 'High throughput, counter service, integrated KDS & order throttling.',
      descAr: 'تدفق طلبات سريع، طلب كاشير، شاشات مطبخ فورية وتنظيم ضغط الطلبات.',
      icon: Utensils,
    },
    {
      id: 'FINE_DINING',
      nameEn: 'Fine Dining & Banquet',
      nameAr: 'فاين داينينج وضيافة راقية',
      descEn: 'Table management, coursing logic, advanced guest CRM integration.',
      descAr: 'إدارة طاولات متقدمة، نظام أطباق وكورسات، وسجل ضيوف VIP مخصص.',
      icon: Utensils,
    },
    {
      id: 'CAFE',
      nameEn: 'Specialty Cafe & Bakery',
      nameAr: 'مقهى مختص ومخبوزات',
      descEn: 'Barista workflow, batch pastry production, quick ticket dispatch.',
      descAr: 'تنظيم باريستا، إدارة دفعات المخبوزات، وسرعة تحضير المشروبات.',
      icon: Coffee,
    },
    {
      id: 'PIZZERIA',
      nameEn: 'Pizzeria & Woodfire',
      nameAr: 'بيتزا وخبز حطبي',
      descEn: 'Station routing, crust/topping modifier engine, rapid oven queues.',
      descAr: 'توجيه طابعات الفرن، محرك الإضافات والجبن، وتنظيم قائمة الخبز.',
      icon: Pizza,
    },
    {
      id: 'CLOUD_KITCHEN',
      nameEn: 'Cloud / Ghost Kitchen',
      nameAr: 'مطبخ سحابي / متعدد العلامات',
      descEn: 'Virtual brands aggregation, centralized dispatcher, delivery-only focus.',
      descAr: 'إدارة علامات تجارية افتراضية، تجميع المنصات، وتركيز توصيل كامل.',
      icon: Layers,
    },
    {
      id: 'CATERING',
      nameEn: 'Catering & Event Hub',
      nameAr: 'تموين وبوفيهات وحفلات',
      descEn: 'Banquets, guest pax scheduling, deposit tracking & off-site delivery.',
      descAr: 'عقود ولائم، حساب أعداد الضيوف، دفعات مقدمة ولوجستيات خارجية.',
      icon: PartyPopper,
    },
    {
      id: 'FOOD_TRUCK',
      nameEn: 'Mobile Food Truck',
      nameAr: 'عربة طعام متنقلة',
      descEn: 'Location shifts, lightweight offline-friendly POS, quick inventory.',
      descAr: 'مواقع متغيرة، نقطة بيع خفيفة وسريعة، ومخزون يومي مبسط.',
      icon: Truck,
    },
    {
      id: 'FRANCHISE',
      nameEn: 'Franchise Network',
      nameAr: 'شبكة امتياز تجاري',
      descEn: 'Centralized master catalog, branch SOP enforcement, royalty metrics.',
      descAr: 'قائمة موحدة مركزياً، التزام بمعايير الفروع، وتقارير أداء شاملة.',
      icon: Store,
    }
  ];

  const flagDefinitions = [
    { key: 'enable_dine_in', label: 'Dine-In Table Service', desc: 'Floor plan seating, guest coursing & waiter assignments', group: 'Front of House' },
    { key: 'enable_takeaway', label: 'Takeaway / Pickup', desc: 'Direct counter ordering and express customer call numbers', group: 'Front of House' },
    { key: 'enable_delivery', label: 'Delivery Logistics', desc: 'Zone fee calculations, driver assignments & COD settlement', group: 'Front of House' },
    { key: 'enable_catering', label: 'Catering & Events Hub', desc: 'Corporate gala contracts, guest pax counting & deposits', group: 'Growth' },
    { key: 'enable_kiosk', label: 'Bilingual Self-Service Kiosk', desc: 'Touchscreen ordering with automated idle reset', group: 'Self-Service' },
    { key: 'enable_qr_ordering', label: 'QR Table Ordering', desc: 'Digital menu browsing, call waiter & instant bill request', group: 'Self-Service' },
    { key: 'enable_online_ordering', label: 'Public Online Ordering', desc: 'Gourmet customer portal with live order milestone tracking', group: 'Self-Service' },
    { key: 'enable_loyalty', label: 'VIP Customer CRM & Loyalty', desc: 'Points accumulation, cashback rewards & tiered profiles', group: 'Growth' },
    { key: 'enable_marketing', label: 'Automated Marketing Campaigns', desc: 'Targeted SMS/Email promotions & churn recovery', group: 'Growth' },
    { key: 'enable_inventory', label: 'Real-time Stock Control', desc: 'Live raw ingredient balances, minimum alerts & supplier POs', group: 'Back of House' },
    { key: 'enable_recipes', label: 'Recipe BOM & Costing', desc: 'Automatic ingredient deduction on order completion', group: 'Back of House' },
    { key: 'enable_kds', label: 'Kitchen Display System & Expo', desc: 'Line stations routing, SLA timers & verification assembly', group: 'Back of House' },
    { key: 'enable_printers', label: 'Smart Thermal Printer Routing', desc: 'Hierarchical item/station dispatch with automatic failover', group: 'Hardware' },
    { key: 'enable_ai', label: 'Executive AI Manager & BI', desc: 'Natural language queries, menu engineering & predictive insights', group: 'Intelligence' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cfg, brs] = await Promise.all([
        api.getBusinessConfig(),
        api.getBrands()
      ]);
      setConfig(cfg);
      setBrands(brs || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load master configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMode = (modeId) => {
    setConfig(prev => ({
      ...prev,
      business_mode: modeId
    }));
  };

  const handleToggleFlag = (key) => {
    setConfig(prev => ({
      ...prev,
      feature_flags: {
        ...prev.feature_flags,
        [key]: !prev.feature_flags?.[key]
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await api.setBusinessMode(config.business_mode);
      await api.updateFeatureFlags(config.feature_flags);
      addToast('Configuration committed successfully!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-primary">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-mono text-sm tracking-widest text-on-surface-variant">LOADING MASTER ARCHITECTURE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Universal Architecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
            {isAr ? 'إعدادات النظام العامة والمنصة' : 'Master Settings'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'التهيئة الجذرية، نماذج العمل، مفاتيح الميزات وسياسة الضرائب والعملات' : 'Root Configuration, Operating Models & Feature Flag Entitlements'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider border border-outline-variant rounded bg-surface-container-low hover:border-primary text-on-surface transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4 text-on-surface-variant" />
            {isAr ? 'إعادة تحميل' : 'Reload'}
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-wider rounded bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,202,80,0.2)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? (isAr ? 'جاري الحفظ...' : 'Committing...') : (isAr ? 'حفظ التغييرات' : 'Commit Changes')}
          </button>
        </div>
      </div>

      {/* Main Layout: Subnav + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sub-nav sidebar */}
        <div className="lg:col-span-3 bg-surface-container-low border border-outline-variant/40 rounded-xl p-4 space-y-2 sticky top-24">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/80 px-3 py-1">
            {isAr ? 'وحدات التهيئة' : 'Configuration Modules'}
          </div>

          <button
            onClick={() => setActiveTab('business-model')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'business-model'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? 'نموذج العمل' : 'Business Model'}</span>
          </button>

          <button
            onClick={() => setActiveTab('feature-flags')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'feature-flags'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{isAr ? 'مفاتيح الميزات' : 'Feature Flags'}</span>
          </button>

          <button
            onClick={() => setActiveTab('brand-topology')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'brand-topology'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'العلامات والفروع' : 'Brand Topology'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tax-currency')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tax-currency'
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{isAr ? 'الضرائب والعملة' : 'Tax & Currency'}</span>
          </button>

          <div className="pt-4 mt-4 border-t border-outline-variant/40 px-3">
            <div className="flex items-center gap-2 text-secondary text-xs">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-mono tracking-wider">{isAr ? 'النظام نشط' : 'System Online'}</span>
            </div>
            <div className="font-mono text-xs text-on-surface-variant mt-1">v2.15.0-stable</div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: BUSINESS MODEL */}
          {activeTab === 'business-model' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-outline-variant/30 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-on-surface">{isAr ? 'نمط تشغيل المنشأة' : 'Operating Model Pattern'}</h2>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isAr ? 'حدد الهيكل التشغيلي الافتراضي للنظام' : 'Select the primary operational model to configure automated workflows'}
                  </p>
                </div>
                <div className="px-3 py-1 rounded bg-surface-container border border-outline-variant font-mono text-xs text-primary">
                  {isAr ? 'النموذج الحالي:' : 'Current:'} {operatingModels.find(m => m.id === config.business_mode)?.nameEn || config.business_mode}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operatingModels.map(model => {
                  const Icon = model.icon;
                  const isSelected = config.business_mode === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleSelectMode(model.id)}
                      className={`relative p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                        isSelected
                          ? 'bg-surface-container-highest border-primary shadow-[0_0_25px_rgba(242,202,80,0.15)] ring-1 ring-primary'
                          : 'bg-surface-container-low border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-2.5 rounded-lg border ${isSelected ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container border-outline-variant/50 text-on-surface-variant'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-on-primary"></div>}
                        </div>
                      </div>

                      <div>
                        <h3 className={`font-bold text-base ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {isAr ? model.nameAr : model.nameEn}
                        </h3>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                          {isAr ? model.descAr : model.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FEATURE FLAGS */}
          {activeTab === 'feature-flags' && (
            <div className="space-y-6">
              <div className="border-b border-outline-variant/30 pb-4">
                <h2 className="text-xl font-bold text-on-surface">{isAr ? 'مفاتيح الميزات والمكونات' : 'Feature Flag Entitlements'}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isAr ? 'تحكم بالوحدات المتاحة للشاشات وفريق العمل' : 'Granular module enablement across branches and terminal stations'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flagDefinitions.map(flag => {
                  const isEnabled = Boolean(config.feature_flags?.[flag.key]);
                  return (
                    <div 
                      key={flag.key}
                      onClick={() => handleToggleFlag(flag.key)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEnabled
                          ? 'bg-surface-container border-primary/40'
                          : 'bg-surface-container-low border-outline-variant/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                            {flag.group}
                          </span>
                          <span className="font-semibold text-sm text-on-surface">{flag.label}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{flag.desc}</p>
                      </div>

                      <button className="flex-shrink-0 text-primary">
                        {isEnabled ? (
                          <ToggleRight className="w-8 h-8 text-primary" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-outline" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BRAND TOPOLOGY */}
          {activeTab === 'brand-topology' && (
            <div className="space-y-6">
              <div className="border-b border-outline-variant/30 pb-4">
                <h2 className="text-xl font-bold text-on-surface">{isAr ? 'العلامات التجارية الموحدة' : 'Multi-Brand Topology'}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isAr ? 'العلامات المدارة تحت مظلة المجموعة القابضة' : 'Virtual & brick-and-mortar brands under Noir Hospitality Group'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {brands.map(brand => (
                  <div key={brand.code} className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest text-primary">
                          {brand.code}
                        </span>
                        <h3 className="font-bold text-lg text-on-surface mt-2">{isAr && brand.name_ar ? brand.name_ar : brand.name_en}</h3>
                        <p className="text-xs text-on-surface-variant">{brand.cuisine_type}</p>
                      </div>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: brand.theme_color }}></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-outline-variant/30 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-outline uppercase">{isAr ? 'الإيرادات' : 'Revenue'}</span>
                        <div className="font-bold text-on-surface">${Number(brand.gross_revenue).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-outline uppercase">{isAr ? 'نسبة الهالك' : 'COGS %'}</span>
                        <div className="font-bold text-secondary">{brand.cogs_percentage}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TAX & CURRENCY */}
          {activeTab === 'tax-currency' && (
            <div className="space-y-6">
              <div className="border-b border-outline-variant/30 pb-4">
                <h2 className="text-xl font-bold text-on-surface">{isAr ? 'الضرائب والعملات والرسوم' : 'Tax & Currency Configuration'}</h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {isAr ? 'معايير حساب فواتير المبيعات' : 'Configure VAT, service charges, currency symbols, and invoice rules'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-primary uppercase font-mono tracking-wider">{isAr ? 'الضرائب والخدمة' : 'Tax & Service Charges'}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'ضريبة القيمة المضافة (VAT %)' : 'Value Added Tax (VAT %)'}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.tax_percentage}
                        onChange={(e) => setConfig({ ...config, tax_percentage: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'رسوم الخدمة (% Dine-in)' : 'Service Charge (% Dine-in)'}</label>
                      <input
                        type="number"
                        step="0.01"
                        value={config.service_charge_percentage}
                        onChange={(e) => setConfig({ ...config, service_charge_percentage: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/40 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-primary uppercase font-mono tracking-wider">{isAr ? 'العملة والتسعير' : 'Currency & Display'}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'رمز العملة (ISO Code)' : 'Currency Code (ISO)'}</label>
                      <input
                        type="text"
                        value={config.currency_code}
                        onChange={(e) => setConfig({ ...config, currency_code: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-on-surface-variant mb-1">{isAr ? 'رمز العملة المختصر' : 'Currency Symbol'}</label>
                      <input
                        type="text"
                        value={config.currency_symbol}
                        onChange={(e) => setConfig({ ...config, currency_symbol: e.target.value })}
                        className="w-full bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
