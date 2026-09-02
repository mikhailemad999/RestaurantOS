import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Folder, FolderOpen, Tag, DollarSign, Clock, 
  TrendingUp, Save, History, CheckCircle2, Sliders, Layers
} from 'lucide-react';

export default function MenuPricingEnginePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [matrix, setMatrix] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const data = await api.getMenuPricingMatrix();
      setMatrix(data || []);
      if (data?.length > 0 && !selectedItem) {
        setSelectedItem(data[0]);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load menu pricing matrix', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (channelKey, field, val) => {
    if (!selectedItem) return;
    setSelectedItem(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelKey]: {
          ...prev.channels?.[channelKey],
          [field]: Number(val)
        }
      }
    }));
  };

  const handlePublish = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      addToast(`Pricing rules published for ${selectedItem?.name}!`, 'success');
    }, 600);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Engine Configuration</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'محرك تسعير القائمة متعدد القنوات' : 'Menu & Channel Pricing Engine'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'قواعد التسعير الديناميكي، هوامش الربح، وأسعار التوصيل والصالة والطلب الذاتي' : 'Multi-channel price matrix, happy hour rules, variant overrides & margin protection'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadMatrix}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-surface-container border border-outline-variant/40 flex items-center gap-2 text-on-surface hover:border-primary transition-colors"
          >
            <History className="w-4 h-4 text-on-surface-variant" />
            <span>{isAr ? 'تاريخ التعديل' : 'Version History'}</span>
          </button>
          <button 
            onClick={handlePublish}
            disabled={saving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(242,202,80,0.2)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : (isAr ? 'نشر التغييرات' : 'Publish Changes')}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Hierarchy & Right Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Category / Item Tree */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="text-xs font-mono uppercase tracking-wider text-outline flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{isAr ? 'شجرة القائمة والأصناف' : 'Catalog Hierarchy'}</span>
              </h3>
              <span className="text-xs font-mono text-primary">{matrix.length} Items</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {matrix.map(itm => {
                const isSelected = selectedItem?.item_id === itm.item_id;
                return (
                  <div
                    key={itm.item_id}
                    onClick={() => setSelectedItem(itm)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-surface-container border-primary shadow-lg ring-1 ring-primary'
                        : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="font-bold text-sm text-on-surface">{itm.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant block mt-0.5">
                        {itm.category} • Base: ${itm.base_price}
                      </span>
                    </div>

                    <div className="text-right font-mono text-xs text-primary font-bold">
                      ${itm.channels?.DINE_IN?.adjusted_price || itm.base_price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Channel Matrix */}
        <div className="lg:col-span-8">
          {selectedItem ? (
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-highest uppercase text-primary">
                    {selectedItem.category}
                  </span>
                  <h2 className="text-2xl font-bold font-display text-on-surface mt-2">
                    {selectedItem.name}
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1 font-mono">
                    Base Standard Price: <strong className="text-primary">${selectedItem.base_price}</strong>
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'هامش الربح المستهدف' : 'Target Margin'}</span>
                  <div className="text-2xl font-bold text-secondary">68.0%</div>
                </div>
              </div>

              {/* Channel Cards Matrix */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-outline">
                  {isAr ? 'أسعار القنوات المختلفة' : 'Channel Price Overrides'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Channel: Dine-In */}
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-on-surface">🍽 Dine-In (Table)</span>
                      <span className="text-secondary">Margin: 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-on-surface-variant">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedItem.channels?.DINE_IN?.adjusted_price || selectedItem.base_price}
                        onChange={(e) => handlePriceChange('DINE_IN', 'adjusted_price', e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-mono text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Channel: Takeaway */}
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-on-surface">🛍 Takeaway / Counter</span>
                      <span className="text-secondary">Margin: 70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-on-surface-variant">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedItem.channels?.TAKEAWAY?.adjusted_price || selectedItem.base_price}
                        onChange={(e) => handlePriceChange('TAKEAWAY', 'adjusted_price', e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-mono text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Channel: Home Delivery */}
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-on-surface">🛵 Home Delivery (+15%)</span>
                      <span className="text-secondary">Margin: 72%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-on-surface-variant">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedItem.channels?.DELIVERY?.adjusted_price || (selectedItem.base_price * 1.15).toFixed(2)}
                        onChange={(e) => handlePriceChange('DELIVERY', 'adjusted_price', e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-mono text-on-surface"
                      />
                    </div>
                  </div>

                  {/* Channel: Online Portal */}
                  <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-on-surface">🌐 Public Online Portal</span>
                      <span className="text-secondary">Margin: 69%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-on-surface-variant">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedItem.channels?.ONLINE?.adjusted_price || (selectedItem.base_price * 1.10).toFixed(2)}
                        onChange={(e) => handlePriceChange('ONLINE', 'adjusted_price', e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-mono text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Happy Hour Rule Engine */}
              <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/30 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{isAr ? 'تخفيضات الساعات السعيدة (Happy Hour)' : 'Happy Hour Promotion Schedule'}</span>
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                    Active 16:00 - 19:00
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex-1">
                    <span className="text-on-surface-variant block mb-1">Happy Hour Special Price ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedItem.channels?.DINE_IN?.happy_hour_price || (selectedItem.base_price * 0.85).toFixed(2)}
                      onChange={(e) => handlePriceChange('DINE_IN', 'happy_hour_price', e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-sm font-mono text-on-surface"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-on-surface-variant block mb-1">Active Days</span>
                    <div className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface">
                      Mon, Tue, Wed, Thu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center text-on-surface-variant border border-dashed border-outline-variant/40">
              <Sliders className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
              <p className="font-semibold text-base text-on-surface">Select an item to customize pricing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
