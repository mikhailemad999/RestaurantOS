import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Compass, TrendingUp, DollarSign, PieChart, ShieldCheck, 
  Building2, Server, ArrowRight, CheckCircle2, AlertTriangle, 
  Sparkles, Layers, Sliders, Calendar
} from 'lucide-react';

export default function OwnerWorkspacePage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolioSummary();
      setPortfolio(res);
    } catch (err) {
      console.error(err);
      addToast('Failed to load strategic data', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Global HQ • Executive Suite</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'لوحة التحكم الاستراتيجية للمالك' : 'Owner Strategic Console'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'نظرة شمولية موحدة على الأرباح، أداء الفروع، استثمارات العلامات وصحة النظام' : 'Consolidated multi-brand executive overview, profit performance & portfolio architecture'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/multi-brand"
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-primary-container transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)]"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'ذكاء المحفظة والـ AI' : 'Portfolio BI'}</span>
          </Link>
          <Link
            to="/settings/business"
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs font-mono uppercase tracking-wider flex items-center gap-2 text-on-surface hover:border-primary transition-colors"
          >
            <Sliders className="w-4 h-4 text-primary" />
            <span>{isAr ? 'إعدادات المنظومة' : 'Master Settings'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'إجمالي المبيعات' : 'Gross Revenue'}</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="my-5">
            <div className="text-3xl md:text-4xl font-display font-bold text-on-surface">
              ${portfolio?.gross_revenue ? (portfolio.gross_revenue / 1000000).toFixed(2) + 'M' : '$4.20M'}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{portfolio?.revenue_growth_percentage || 12.4}% vs last month</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-4/5"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'الأرباح التشغيلية' : 'Operating Profit'}</span>
            <Building2 className="w-5 h-5 text-secondary" />
          </div>
          <div className="my-5">
            <div className="text-3xl md:text-4xl font-display font-bold text-on-surface">
              $840K
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Margin: {portfolio?.net_profit_margin_percentage || 24.8}%</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-3/4"></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'تكلفة الطعام' : 'Group COGS %'}</span>
            <PieChart className="w-5 h-5 text-outline" />
          </div>
          <div className="my-5">
            <div className="text-3xl md:text-4xl font-display font-bold text-on-surface">
              {portfolio?.cogs_percentage || 31.2}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1 font-mono">
              <span>Target: 28.0% (-3.2% gap)</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-tertiary w-3/5"></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'العلامات والفروع' : 'Portfolio Scale'}</span>
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div className="my-5">
            <div className="text-3xl md:text-4xl font-display font-bold text-on-surface">
              {portfolio?.active_brands_count || 3} Brands
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>24 Branches Active</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-full"></div>
          </div>
        </div>
      </div>

      {/* Brand Breakdown */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>{isAr ? 'أداء العلامات التجارية التابعة' : 'Consolidated Brand Performance'}</span>
          </h2>
          <Link to="/reports" className="text-xs font-mono text-primary hover:underline flex items-center gap-1">
            <span>{isAr ? 'التقرير المالي الكامل' : 'Full Financial Ledger'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {portfolio?.brands?.map(brand => (
            <div key={brand.code} className="bg-surface-container rounded-xl p-5 border border-outline-variant/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-container-highest text-primary font-bold">
                  {brand.code}
                </span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brand.theme_color }}></span>
              </div>
              <h3 className="font-bold text-lg text-on-surface">{isAr && brand.name_ar ? brand.name_ar : brand.name_en}</h3>
              <p className="text-xs text-on-surface-variant">{brand.cuisine_type}</p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-outline-variant/30 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'المبيعات' : 'Revenue'}</span>
                  <div className="font-bold text-on-surface mt-0.5">${Number(brand.gross_revenue).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'تكلفة الطعام' : 'COGS %'}</span>
                  <div className="font-bold text-secondary mt-0.5">{brand.cogs_percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Short-Cuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/system-health" className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary transition-all flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-surface-container-high text-secondary">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Cluster Observability</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">Live database pools, cache hit rate & printer hardware</p>
          </div>
        </Link>

        <Link to="/staff" className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary transition-all flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-surface-container-high text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Staff Roles & RBAC</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">Manage permissions, PIN codes & isolated workspaces</p>
          </div>
        </Link>

        <Link to="/catering" className="p-5 rounded-2xl bg-surface-container border border-outline-variant/30 hover:border-primary transition-all flex items-center gap-4 group">
          <div className="p-3 rounded-xl bg-surface-container-high text-tertiary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Catering & Banquets</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">Corporate galas, guest pax booking & deposits</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
