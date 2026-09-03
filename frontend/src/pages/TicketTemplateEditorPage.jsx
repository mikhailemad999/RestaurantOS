import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, Sliders, Type, FileText, CheckCircle, 
  RotateCcw, Eye, ShieldCheck, Layers, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';

export default function TicketTemplateEditorPage() {
  const [bilingualMode, setBilingualMode] = useState(true);
  const [fontSize, setFontSize] = useState(12);
  const [paperWidth, setPaperWidth] = useState('80mm');
  const [headerTitle, setHeaderTitle] = useState("L'ÉTOILE HAUTE CUISINE");
  const [footerText, setFooterText] = useState("Thank you for dining with L'Étoile. Culinary Precision Guaranteed.");
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');

  useEffect(() => {
    api.getPrinters().then(res => {
      if (res && res.length > 0) {
        setPrinters(res);
        setSelectedPrinterId(res[0].id);
      }
    }).catch(e => console.warn('Could not load printers', e));
  }, []);

  const handleTestPrint = async () => {
    setIsPrinting(true);
    setPrintSuccess(false);
    try {
      const targetId = selectedPrinterId || printers[0]?.id || 1;
      await api.testPrintPrinter(targetId);
      setTimeout(() => {
        setIsPrinting(false);
        setPrintSuccess(true);
      }, 800);
    } catch (err) {
      alert('Test print sequence failed: ' + (err.message || err));
      setIsPrinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] p-4 lg:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8 border-b border-[#2a2a2a]">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to="/settings/printers/monitor"
              className="p-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] rounded-lg border border-[#353535] text-[#99907c] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl lg:text-4xl font-bold tracking-tight text-white">
              Ticket Layout & Template Editor
            </h1>
          </div>
          <p className="text-sm text-[#99907c] font-mono mt-1">
            Configure thermal print outputs for multilingual kitchen & cashier environments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/settings/printers/monitor"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#f2ca50]" />
            Fleet Monitor
          </Link>
          <Link
            to="/settings/printers/routing"
            className="bg-[#20201f] hover:bg-[#2a2a2a] border border-[#353535] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#4edea3]" />
            Routing Rules
          </Link>
        </div>
      </div>

      {/* Main Grid: Controls + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f2ca50]" />

            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#f2ca50]" />
              Thermal Formatting Parameters
            </h2>

            {/* Bilingual Mode Toggle */}
            <div className="flex items-center justify-between pb-5 border-b border-[#2a2a2a]">
              <div>
                <span className="text-sm font-bold text-white block">Bilingual Mode</span>
                <span className="text-xs text-[#99907c]">Print single ticket with English & Arabic</span>
              </div>
              <button
                onClick={() => setBilingualMode(!bilingualMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  bilingualMode ? 'bg-[#f2ca50]' : 'bg-[#2a2a2a]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#131313] absolute top-1 transition-transform ${
                    bilingualMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Paper Width Selector */}
            <div className="py-5 border-b border-[#2a2a2a]">
              <label className="text-xs font-mono uppercase text-[#99907c] block mb-2">
                Paper Width
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    paperWidth === '80mm'
                      ? 'bg-[#f2ca50] text-[#131313] border-[#f2ca50]'
                      : 'bg-[#131313] text-[#99907c] border-[#353535] hover:text-white'
                  }`}
                >
                  80mm (Standard POS)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    paperWidth === '58mm'
                      ? 'bg-[#f2ca50] text-[#131313] border-[#f2ca50]'
                      : 'bg-[#131313] text-[#99907c] border-[#353535] hover:text-white'
                  }`}
                >
                  58mm (Compact Mobile)
                </button>
              </div>
            </div>

            {/* Base Font Size Slider */}
            <div className="py-5 border-b border-[#2a2a2a]">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono uppercase text-[#99907c]">
                  Base Font Scale
                </label>
                <span className="text-xs font-mono font-bold text-[#f2ca50]">{fontSize}pt</span>
              </div>
              <input
                type="range"
                min="9"
                max="16"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#f2ca50]"
              />
            </div>

            {/* Header Title */}
            <div className="py-5 border-b border-[#2a2a2a]">
              <label className="text-xs font-mono uppercase text-[#99907c] block mb-2">
                Header Restaurant Title
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
              />
            </div>

            {/* Footer Text */}
            <div className="py-5">
              <label className="text-xs font-mono uppercase text-[#99907c] block mb-2">
                Footer Inscription
              </label>
              <textarea
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                rows="2"
                className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono resize-none"
              />
            </div>

            {/* Printer Device Selector */}
            <div className="pt-2">
              <label className="text-xs font-mono uppercase text-[#99907c] block mb-2">
                Target Thermal Printer
              </label>
              <select
                value={selectedPrinterId}
                onChange={(e) => setSelectedPrinterId(e.target.value)}
                className="w-full bg-[#131313] border border-[#353535] rounded-xl p-2.5 text-xs text-white font-mono"
              >
                {printers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.printer_type} • {p.ip_address}:{p.port})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Print Action Buttons */}
            <div className="space-y-2 mt-4">
              <button
                onClick={handleTestPrint}
                disabled={isPrinting}
                className="w-full h-12 bg-[#f2ca50] hover:bg-[#ffe088] text-[#131313] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPrinting ? (
                  <RotateCcw className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                {isPrinting ? 'Sending ESC/POS Commands...' : 'Execute Test Print Sequence'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2.5 bg-[#20201f] hover:bg-[#2a2a2a] text-white text-xs font-bold rounded-xl border border-[#353535] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#f2ca50]" />
                <span>Print via Browser (Physical / PDF)</span>
              </button>
            </div>

            {printSuccess && (
              <div className="mt-3 p-3 bg-[#00a572]/20 border border-[#00a572]/40 rounded-xl text-xs text-[#4edea3] font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>Ticket successfully transmitted to thermal buffer!</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Thermal Receipt Preview */}
        <div className="lg:col-span-7 flex justify-center items-start">
          <div className="relative w-full max-w-md">
            {/* Ambient thermal glow */}
            <div className="absolute inset-0 bg-[#f2ca50]/5 blur-2xl rounded-full pointer-events-none" />

            {/* Realistic Thermal Paper Container */}
            <div 
              className={`bg-white text-black font-mono shadow-2xl rounded-sm p-6 relative mx-auto border-t-8 border-[#131313] transition-all duration-300 ${
                paperWidth === '58mm' ? 'max-w-[280px]' : 'max-w-[360px]'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {/* Paper Jagged Tear Edge Top */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-repeat-x bg-[radial-gradient(circle,_transparent_3px,_white_4px)] -mt-2 pointer-events-none" />

              {/* Receipt Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-neutral-400 space-y-1">
                <div className="font-black text-sm tracking-wider uppercase">
                  {headerTitle}
                </div>
                <div className="text-[10px] text-neutral-600">
                  GRILL & OVEN LINE TICKET
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* Ticket Meta */}
              <div className="py-2 border-b border-dashed border-neutral-300 text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>ORDER #10520</span>
                  <span>TABLE 12</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>SERVER: David Chen</span>
                  <span>GUESTS: 4</span>
                </div>
              </div>

              {/* Items Section */}
              <div className="py-3 border-b-2 border-dashed border-neutral-400 space-y-3">
                <div>
                  <div className="flex justify-between font-bold">
                    <span>1 x Wagyu Ribeye 12oz</span>
                    <span>$115.00</span>
                  </div>
                  <div className="text-[10px] text-neutral-600 pl-3">
                    • Medium Rare<br />
                    • + Shaved Black Truffle<br />
                    • Sauce on Side
                  </div>
                  {bilingualMode && (
                    <div className="text-right text-[10px] text-neutral-700 font-arabic pt-1" dir="rtl">
                      ١ × ستيك ريب آي واغيو (استواء متوسط) + كمأة سوداء
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between font-bold">
                    <span>2 x Stone Oven Truffle Pizza</span>
                    <span>$56.00</span>
                  </div>
                  <div className="text-[10px] text-neutral-600 pl-3">
                    • Extra Burrata Cheese<br />
                    • Crispy Crust
                  </div>
                  {bilingualMode && (
                    <div className="text-right text-[10px] text-neutral-700 font-arabic pt-1" dir="rtl">
                      ٢ × بيتزا الكمأة بالفرن الحجري + جبن بوراتا إضافي
                    </div>
                  )}
                </div>
              </div>

              {/* Special Note */}
              <div className="py-2 border-b border-dashed border-neutral-300 text-[10px]">
                <span className="font-bold">CHEF NOTE: </span>
                <span>VIP Table — Prioritize plating together.</span>
                {bilingualMode && (
                  <div className="text-right text-neutral-700 font-arabic pt-0.5" dir="rtl">
                    طاولة كبار الزوار — تقديم الطلبات في نفس اللحظة
                  </div>
                )}
              </div>

              {/* Barcode Simulation */}
              <div className="py-3 text-center">
                <div className="h-8 bg-neutral-900 mx-auto w-48 flex items-center justify-center text-white text-[9px] tracking-widest font-mono">
                  ||||| | |||| || ||||| | |||
                </div>
                <div className="text-[9px] text-neutral-500 mt-1">ORD-10520-PRINT</div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 border-t border-dashed border-neutral-300 text-[10px] text-neutral-600">
                {footerText}
              </div>

              {/* Paper Jagged Tear Edge Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-repeat-x bg-[radial-gradient(circle,_transparent_3px,_white_4px)] -mb-2 rotate-180 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
