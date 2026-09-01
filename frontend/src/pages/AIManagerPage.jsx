import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Sparkles, Send, Bot, User, CheckCircle2, AlertTriangle, 
  TrendingUp, Shield, RefreshCw, ArrowUpRight, DollarSign
} from 'lucide-react';

export default function AIManagerPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: "Welcome to the **RestaurantOS AI Management Assistant**. I am connected directly to your MySQL database, live POS terminal, kitchen KDS, and inventory ledgers. How may I assist your restaurant operations today?",
      metrics: null,
      recommendation: null
    }
  ]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const recs = await api.getRecommendations();
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load AI recommendations:', err);
    }
  };

  const handleSend = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const userMsg = { sender: 'USER', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.queryAIAssistant(q);
      const aiMsg = {
        sender: 'AI',
        text: res.answer,
        metrics: res.supporting_metrics,
        recommendation: res.recommended_action,
        confidence: res.confidence
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'AI',
        text: `Error processing query: ${err.message}`,
        metrics: null
      }]);
    } finally {
      setLoading(false);
    }
  };

  const promptSuggestions = [
    "Why did food cost increase this week?",
    "What were gross sales yesterday and pacing today?",
    "Which products are most profitable (Stars)?",
    "Which ingredients are at risk of running out?",
    "Are there any kitchen delay bottlenecks?"
  ];

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#d4af37]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-gold">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#8c7322] text-black font-extrabold flex items-center justify-center shadow-gold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              AI Restaurant Management Assistant & Reasoning Engine
            </h1>
            <p className="text-xs text-[#99907c] font-mono">Real-time structured business metrics analysis with verified citations</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#131313] px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
          <span className="text-[#d0c5af]">Verified Data Grounding Active</span>
        </div>
      </div>

      {/* Main 2-Column Split: Chat vs Recommendations Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* Left 2 Cols: Interactive Chat View */}
        <div className="lg:col-span-2 bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card flex flex-col justify-between h-[600px]">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'AI' && (
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-black font-bold flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl p-4 rounded-2xl text-xs space-y-2.5 ${
                    m.sender === 'USER'
                      ? 'bg-[#d4af37] text-black font-bold font-sans rounded-br-none shadow-gold'
                      : 'bg-[#131313] border border-[#2a2a2a] text-[#e5e2e1] rounded-bl-none shadow-card'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-sans">{m.text}</p>

                  {m.metrics && (
                    <div className="p-2.5 bg-[#1c1b1b] border border-[#353535] rounded-xl space-y-1 font-mono text-[11px]">
                      <span className="text-[10px] text-[#99907c] uppercase font-bold block">Verified Business Grounding:</span>
                      <div className="text-[#4edea3]">
                        {JSON.stringify(m.metrics)}
                      </div>
                    </div>
                  )}

                  {m.recommendation && (
                    <div className="p-2.5 bg-[#005236]/30 border border-[#4edea3]/40 rounded-xl space-y-1 text-[#4edea3] text-[11px] font-sans">
                      <span className="font-bold block">Recommended Next Action:</span>
                      <span>{m.recommendation}</span>
                    </div>
                  )}
                </div>

                {m.sender === 'USER' && (
                  <div className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-white font-bold flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37]">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>AI is querying live MySQL data...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="pt-3 border-t border-[#2a2a2a] space-y-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-2.5 py-1 bg-[#131313] hover:bg-[#20201f] border border-[#353535] hover:border-[#d4af37] text-[#d0c5af] hover:text-white rounded-lg text-[11px] whitespace-nowrap transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI Manager about food cost, sales pacing, menu engineering..."
                className="flex-1 bg-[#131313] border border-[#353535] text-white text-xs p-3 rounded-xl focus:border-[#d4af37] focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !query.trim()}
                className="p-3 bg-[#d4af37] hover:bg-[#f2ca50] disabled:opacity-40 text-black font-bold rounded-xl shadow-gold cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Autonomous AI Recommendations */}
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl p-5 shadow-card space-y-4 overflow-y-auto h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              AI Recommendations
            </h2>
            <span className="text-[10px] font-mono text-[#4edea3]">● Live Sync</span>
          </div>

          <div className="space-y-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-3.5 bg-[#131313] border border-[#2a2a2a] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold bg-[#554300] text-[#d4af37] px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <span className="text-[10px] text-[#4edea3] font-mono font-bold">{rec.confidence}% Confidence</span>
                </div>

                <h3 className="font-bold text-xs text-white">{rec.title}</h3>
                <p className="text-[11px] text-[#d0c5af] font-sans">{rec.recommendation}</p>

                <div className="p-2 bg-[#20201f] rounded-lg text-[10px] font-mono text-[#99907c] space-y-0.5">
                  <span className="text-[#4edea3] font-bold block">Impact: {rec.expected_impact}</span>
                  <p className="text-[10px] text-[#d0c5af]">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
