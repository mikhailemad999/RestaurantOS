import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Star, Flame, HelpCircle, AlertOctagon, TrendingUp, 
  DollarSign, Sparkles, RefreshCw, ChevronRight, ArrowUpRight,
  Sliders, Calculator, Check
} from 'lucide-react';

export default function MenuEngineeringPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // What-If Simulator State
  const [simSelectedDish, setSimSelectedDish] = useState(null);
  const [priceBumpPct, setPriceBumpPct] = useState(5);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      const res = await api.getMenuEngineering();
      setData(res);
      if (res.matrix && res.matrix.length > 0) {
        setSimSelectedDish(res.matrix[0]);
      }
    } catch (err) {
      console.error('Failed to load menu engineering data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = selectedQuadrant === 'ALL'
    ? (data?.matrix || [])
    : (data?.matrix?.filter(m => m.classification === selectedQuadrant) || []);

  const getQuadrantColor = (classification) => {
    switch (classification) {
      case 'STAR': return { border: 'border-[#4edea3]', text: 'text-[#4edea3]', badge: 'bg-[#005236] text-[#4edea3]' };
      case 'PLOWHORSE': return { border: 'border-[#d4af37]', text: 'text-[#d4af37]', badge: 'bg-[#554300] text-[#d4af37]' };
      case 'PUZZLE': return { border: 'border-blue-400', text: 'text-blue-300', badge: 'bg-blue-900 text-blue-300' };
      case 'DOG': return { border: 'border-rose-400', text: 'text-rose-300', badge: 'bg-rose-900 text-rose-300' };
      default: return { border: 'border-[#353535]', text: 'text-white', badge: 'bg-[#20201f] text-white' };
    }
  };

  // Live Simulator Calculations
  const origPrice = simSelectedDish ? simSelectedDish.price : 0;
  const origCost = simSelectedDish ? simSelectedDish.cost_price : 0;
  const newPrice = origPrice * (1 + priceBumpPct / 100);
  const origMargin = origPrice - origCost;
  const newMargin = newPrice - origCost;
  const origMarginPct = origPrice > 0 ? (origMargin / origPrice) * 100 : 0;
  const newMarginPct = newPrice > 0 ? (newMargin / newPrice) * 100 : 0;
  const monthlyVol = simSelectedDish ? simSelectedDish.sold * 4 : 40;
  const monthlyProfitGain = (newMargin - origMargin) * monthlyVol;

  const handleApplySimulatedPrice = () => {
    if (!simSelectedDish) return;
    addToast(`Price change of +${priceBumpPct}% submitted to Pricing Approvals!`, 'success');
    navigate('/pricing');
  };

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Grid className="w-5 h-5 text-[#d4af37]" />
            Kasavana & Smith Menu Engineering Matrix & Simulator
          </h1>
          <p className="text-xs text-[#99907c] font-mono">BCG dish profitability vs popularity matrix with live what-if pricing optimization</p>
        </div>

        <button
          onClick={loadMatrix}
          className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Quadrants Summary Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stars */}
        <div
          onClick={() => {
            setSelectedQuadrant(selectedQuadrant === 'STAR' ? 'ALL' : 'STAR');
            addToast(`Filter: ${selectedQuadrant === 'STAR' ? 'All Dishes' : 'Stars'}`, 'info');
          }}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedQuadrant === 'STAR' ? 'bg-[#005236]/40 border-[#4edea3] ring-2 ring-[#4edea3]' : 'bg-[#1c1b1b] border-[#2a2a2a] hover:border-[#4edea3]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#4edea3] flex items-center gap-1.5">
              <Star className="w-4 h-4" /> STARS (High Vol / High Margin)
            </span>
            <span className="text-lg font-extrabold text-white font-mono">{data?.summary?.stars_count || 4}</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Prime focal placement</p>
        </div>

        {/* Plowhorses */}
        <div
          onClick={() => {
            setSelectedQuadrant(selectedQuadrant === 'PLOWHORSE' ? 'ALL' : 'PLOWHORSE');
            addToast(`Filter: ${selectedQuadrant === 'PLOWHORSE' ? 'All Dishes' : 'Plowhorses'}`, 'info');
          }}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedQuadrant === 'PLOWHORSE' ? 'bg-[#554300]/40 border-[#d4af37] ring-2 ring-[#d4af37]' : 'bg-[#1c1b1b] border-[#2a2a2a] hover:border-[#d4af37]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#d4af37] flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> PLOWHORSES (High Vol / Low Margin)
            </span>
            <span className="text-lg font-extrabold text-white font-mono">{data?.summary?.plowhorses_count || 3}</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Opportunity for 5-8% price bump</p>
        </div>

        {/* Puzzles */}
        <div
          onClick={() => {
            setSelectedQuadrant(selectedQuadrant === 'PUZZLE' ? 'ALL' : 'PUZZLE');
            addToast(`Filter: ${selectedQuadrant === 'PUZZLE' ? 'All Dishes' : 'Puzzles'}`, 'info');
          }}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedQuadrant === 'PUZZLE' ? 'bg-blue-900/40 border-blue-400 ring-2 ring-blue-400' : 'bg-[#1c1b1b] border-[#2a2a2a] hover:border-blue-400/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-blue-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> PUZZLES (Low Vol / High Margin)
            </span>
            <span className="text-lg font-extrabold text-white font-mono">{data?.summary?.puzzles_count || 3}</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Promote & train staff to upsell</p>
        </div>

        {/* Dogs */}
        <div
          onClick={() => {
            setSelectedQuadrant(selectedQuadrant === 'DOG' ? 'ALL' : 'DOG');
            addToast(`Filter: ${selectedQuadrant === 'DOG' ? 'All Dishes' : 'Dogs'}`, 'info');
          }}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedQuadrant === 'DOG' ? 'bg-rose-900/40 border-rose-400 ring-2 ring-rose-400' : 'bg-[#1c1b1b] border-[#2a2a2a] hover:border-rose-400/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4" /> DOGS (Low Vol / Low Margin)
            </span>
            <span className="text-lg font-extrabold text-white font-mono">{data?.summary?.dogs_count || 7}</span>
          </div>
          <p className="text-[10px] text-[#99907c] font-mono mt-1">Replace with seasonal creation</p>
        </div>
      </div>

      {/* Interactive What-If Margin Optimizer Simulator Bar */}
      <div className="bg-gradient-to-r from-[#1c1b1b] via-[#20201f] to-[#1c1b1b] border border-[#d4af37]/40 rounded-2xl p-5 shadow-gold space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#d4af37]" />
            <h2 className="font-bold text-sm text-white">Interactive "What-If" Margin Simulator</h2>
          </div>

          {/* Dish Selector for Simulator */}
          <select
            value={simSelectedDish?.id || ''}
            onChange={(e) => {
              const d = data?.matrix?.find(m => m.id === Number(e.target.value));
              setSimSelectedDish(d);
            }}
            className="bg-[#131313] border border-[#353535] text-white text-xs p-2 rounded-xl font-mono focus:border-[#d4af37] focus:outline-none"
          >
            {data?.matrix?.map(d => (
              <option key={d.id} value={d.id}>{d.name} (${d.price.toFixed(2)})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Slider */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#99907c]">Simulated Price Increase:</span>
              <span className="text-[#d4af37] font-bold">+{priceBumpPct}% (${newPrice.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={priceBumpPct}
              onChange={(e) => setPriceBumpPct(Number(e.target.value))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />
          </div>

          {/* New Margin */}
          <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] text-center font-mono">
            <span className="text-[9px] text-[#99907c] block">NEW CONTRIBUTION MARGIN</span>
            <span className="text-base font-extrabold text-[#4edea3]">{newMarginPct.toFixed(1)}%</span>
            <span className="text-[10px] text-[#99907c] block">Was: {origMarginPct.toFixed(1)}%</span>
          </div>

          {/* Projected Gain */}
          <div className="bg-[#131313] p-3 rounded-xl border border-[#2a2a2a] text-center font-mono flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-[#99907c] block">EST. MONTHLY PROFIT GAIN</span>
              <span className="text-base font-extrabold text-[#d4af37]">+${monthlyProfitGain.toFixed(2)}</span>
            </div>
            <button
              onClick={handleApplySimulatedPrice}
              className="mt-2 py-1.5 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-[10px] rounded-lg uppercase tracking-wider font-mono cursor-pointer"
            >
              Submit Price Update
            </button>
          </div>
        </div>
      </div>

      {/* Dishes Catalog Grid with Tactics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map(dish => {
          const cfg = getQuadrantColor(dish.classification);

          return (
            <div
              key={dish.id}
              className={`bg-[#1c1b1b] border-2 ${cfg.border} rounded-2xl p-4 shadow-card flex flex-col justify-between space-y-3 hover:scale-[1.01] transition-transform`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${cfg.badge}`}>
                      {dish.classification}
                    </span>
                    <h3 className="font-bold text-sm text-white mt-2">{dish.name}</h3>
                    <span className="text-[10px] text-[#99907c] font-mono">{dish.category} • {dish.station} Station</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-extrabold text-white block">${dish.price.toFixed(2)}</span>
                    <span className="text-[10px] text-[#4edea3]">+{dish.margin_pct}% Margin</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 bg-[#131313] p-2.5 rounded-xl text-center text-xs font-mono border border-[#2a2a2a]">
                  <div>
                    <span className="text-[9px] text-[#99907c] block">SOLD</span>
                    <span className="font-bold text-white">{dish.sold} qty</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#99907c] block">COGS</span>
                    <span className="font-bold text-[#ff949c]">${dish.cost_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#99907c] block">TOTAL PROFIT</span>
                    <span className="font-bold text-[#4edea3]">${dish.profit.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2a2a2a] flex items-center justify-between text-[11px] font-sans text-[#d0c5af]">
                <div className="flex items-start gap-1.5 flex-1 pr-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{dish.recommendation}</span>
                </div>

                <button
                  onClick={() => {
                    setSimSelectedDish(dish);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                    addToast(`Loaded ${dish.name} into What-If Simulator`, 'info');
                  }}
                  className="px-2.5 py-1 bg-[#20201f] hover:bg-[#d4af37] text-white hover:text-black rounded text-[10px] font-mono font-bold shrink-0 transition-colors"
                >
                  Simulate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
