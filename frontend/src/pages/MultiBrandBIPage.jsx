import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, TrendingUp, DollarSign, PieChart, Sparkles, 
  ArrowRight, Download, Calendar, CheckCircle2, AlertTriangle, 
  Layers, Lightbulb, Pizza, Utensils, Coffee
} from 'lucide-react';

export default function MultiBrandBIPage() {
  const { addToast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.getPortfolioSummary();
      setPortfolioData(res);
    } catch (err) {
      console.error(err);
      addToast('Failed to load portfolio BI', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployCampaign = (insight) => {
    addToast(`Automated Campaign triggered for ${insight.brand_code}! Expected lift: ${insight.expected_lift}`, 'success');
  };

  const handleExport = () => {
    addToast('Executive Portfolio Intelligence PDF report generated!', 'info');
  };

  if (loading || !portfolioData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-primary font-mono text-sm">
        COMPUTING PORTFOLIO INTELLIGENCE...
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">Executive Brief</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-on-surface tracking-tight">
            {isAr ? 'ذكاء المحفظة والعلامات التجارية المتعددة' : 'Portfolio Intelligence'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {isAr ? 'نظرة مالية موحدة وتحليلات استشرافية عبر جميع علامات مجموعة نوار للضيافة' : 'Consolidated financial overview and predictive brand insights across the Noir Hospitality Group'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-surface-container border border-outline-variant/40 flex items-center gap-2 text-on-surface">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Q3 2024</span>
          </button>
          <button 
            onClick={handleExport}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider rounded-lg bg-primary text-on-primary font-bold hover:bg-primary-container transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(242,202,80,0.2)]"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير التقرير' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid: Financials & AI Predictive */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {/* Metric 1: Gross Revenue */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'إجمالي الإيرادات' : 'Gross Revenue'}</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div className="my-6">
            <div className="text-4xl font-display font-bold text-on-surface">
              ${(portfolioData.gross_revenue / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{portfolioData.revenue_growth_percentage}% vs Last Qtr</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary w-4/5"></div>
          </div>
        </div>

        {/* Metric 2 & 3: Predictive AI Insights Area */}
        <div className="md:col-span-2 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/40 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'الذكاء الاصطناعي التنبؤي' : 'Predictive Intelligence'}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container uppercase text-secondary">
              AI Active
            </span>
          </div>

          <div className="space-y-3 my-4">
            {portfolioData.ai_insights?.map(insight => (
              <div 
                key={insight.id}
                className={`p-4 rounded-xl border transition-all ${
                  insight.severity === 'WARNING'
                    ? 'bg-surface-container border-l-4 border-l-primary border-outline-variant/30'
                    : 'bg-surface-container border-l-4 border-l-secondary border-outline-variant/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <Lightbulb className={`w-4 h-4 ${insight.severity === 'WARNING' ? 'text-primary' : 'text-secondary'}`} />
                    <span>{insight.title}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-on-surface-variant">{insight.expected_lift}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {insight.description}
                </p>
                <button
                  onClick={() => handleDeployCampaign(insight)}
                  className="mt-2.5 text-xs font-mono font-bold text-primary hover:text-primary-fixed uppercase flex items-center gap-1"
                >
                  <span>{insight.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="text-[11px] font-mono text-on-surface-variant">
            {isAr ? 'توصيات مستخرجة تلقائياً بناء على تحليل مبيعات الفروع' : 'Automated recommendations derived from cross-brand branch telemetry.'}
          </div>
        </div>

        {/* Metric 4: Est. COGS & Margin */}
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono uppercase tracking-wider text-outline">{isAr ? 'تكلفة المبيعات COGS' : 'Est. COGS %'}</span>
            <PieChart className="w-5 h-5 text-outline" />
          </div>
          <div className="my-6">
            <div className="text-4xl font-display font-bold text-on-surface">
              {portfolioData.cogs_percentage}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Net Profit Margin: {portfolioData.net_profit_margin_percentage}%</span>
            </div>
          </div>
          <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-3/5"></div>
          </div>
        </div>
      </div>

      {/* Brand-by-Brand Comparison */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h2 className="text-xl font-bold text-on-surface">
            {isAr ? 'تفصيل أداء العلامات التجارية' : 'Brand Performance Breakdown'}
          </h2>
          <span className="text-xs font-mono text-on-surface-variant">
            {portfolioData.active_brands_count} {isAr ? 'علامات نشطة' : 'Active Brands'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolioData.brands?.map(brand => (
            <div 
              key={brand.code}
              className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 space-y-4 hover:border-primary/50 transition-all shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brand.theme_color}20`, color: brand.theme_color }}>
                    {brand.code === 'NOIR_PIZZA' ? <Pizza className="w-5 h-5" /> : brand.code === 'LUMINA_CAFE' ? <Coffee className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface">{isAr && brand.name_ar ? brand.name_ar : brand.name_en}</h3>
                    <p className="text-xs text-on-surface-variant">{brand.cuisine_type}</p>
                  </div>
                </div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brand.theme_color }}></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/30 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'الإيرادات' : 'Revenue'}</span>
                  <div className="font-bold text-lg text-on-surface mt-0.5">${Number(brand.gross_revenue).toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'الطلبات' : 'Orders'}</span>
                  <div className="font-bold text-lg text-on-surface mt-0.5">{brand.order_count.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'تكلفة الطعام' : 'COGS %'}</span>
                  <div className="font-bold text-secondary mt-0.5">{brand.cogs_percentage}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-outline uppercase">{isAr ? 'تحسن الربح' : 'Profit Lift'}</span>
                  <div className="font-bold text-primary mt-0.5">+{brand.profit_lift_percentage}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
