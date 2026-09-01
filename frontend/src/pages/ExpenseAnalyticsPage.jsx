import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { 
  Receipt, DollarSign, Target, Plus, RefreshCw, 
  TrendingUp, TrendingDown, CheckCircle2, PieChart, X
} from 'lucide-react';

export default function ExpenseAnalyticsPage() {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'UTILITIES',
    amount: '',
    description: '',
    branch: 1,
    expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exp, tgt] = await Promise.all([
        api.getExpenses(),
        api.getTargets()
      ]);
      setExpenses(exp);
      setTargets(tgt);
    } catch (err) {
      console.error('Failed to load expense data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    try {
      await api.createExpense({
        ...newExpense,
        amount: Number(newExpense.amount)
      });
      addToast(`Expense of $${newExpense.amount} recorded for ${newExpense.category}!`, 'success');
      setIsAddExpenseOpen(false);
      setNewExpense({
        category: 'UTILITIES',
        amount: '',
        description: '',
        branch: 1,
        expense_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err) {
      addToast(`Error adding expense: ${err.message}`, 'error');
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="min-h-full p-4 md:p-6 bg-[#131313] flex flex-col space-y-5">
      {/* Header */}
      <div className="bg-[#1c1b1b] p-4 rounded-xl border border-[#2a2a2a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#d4af37]" />
            Operating Expenses & Financial Target Variance
          </h1>
          <p className="text-xs text-[#99907c] font-mono">Fixed & variable operational expenditure, financial targets vs actuals</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="px-4 py-2 bg-[#d4af37] hover:bg-[#f2ca50] text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-gold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Operating Expense</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-[#131313] hover:bg-[#2a2a2a] border border-[#353535] rounded-lg text-[#99907c] hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Business Targets Variance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#4edea3]" />
              Monthly Revenue Target
            </span>
            <span className="text-xs font-mono font-bold text-[#4edea3]">82.0% Achieved</span>
          </div>

          <div className="flex justify-between items-baseline font-mono">
            <span className="text-2xl font-extrabold text-[#d4af37]">$98,400</span>
            <span className="text-xs text-[#99907c]">Target: $120,000.00</span>
          </div>

          <div className="w-full h-2.5 bg-[#20201f] rounded-full overflow-hidden">
            <div className="h-full bg-[#4edea3] rounded-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#d4af37]" />
              Food Cost Target (COGS)
            </span>
            <span className="text-xs font-mono font-bold text-[#4edea3]">Optimal Margin</span>
          </div>

          <div className="flex justify-between items-baseline font-mono">
            <span className="text-2xl font-extrabold text-white">28.4%</span>
            <span className="text-xs text-[#99907c]">Target: &lt; 28.0%</span>
          </div>

          <div className="w-full h-2.5 bg-[#20201f] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4edea3] to-[#d4af37] rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#ff949c]" />
              Total Operating Expenses (MTD)
            </span>
            <span className="text-xs font-mono font-bold text-[#ff949c]">Active Ledger</span>
          </div>

          <div className="flex justify-between items-baseline font-mono">
            <span className="text-2xl font-extrabold text-[#ff949c]">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#99907c]">{expenses.length} Records</span>
          </div>

          <p className="text-[10px] text-[#99907c] font-mono">Rent, Utilities, Marketing & Maintenance</p>
        </div>
      </div>

      {/* Operating Expenses Table */}
      <div className="bg-[#1c1b1b] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-card">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <h2 className="font-bold text-sm text-white">Operating Expense Records</h2>
          <span className="text-[10px] font-mono text-[#99907c]">Live Database Sync</span>
        </div>

        <div className="divide-y divide-[#2a2a2a]">
          {expenses.map(e => (
            <div key={e.id} className="p-4 flex items-center justify-between hover:bg-[#20201f] transition-colors">
              <div>
                <span className="font-mono text-xs font-bold text-[#d4af37] bg-[#554300]/40 px-2 py-0.5 rounded">
                  {e.category}
                </span>
                <h3 className="font-bold text-xs text-white mt-1 font-sans">{e.description}</h3>
                <span className="text-[10px] text-[#99907c] font-mono">{e.expense_date} • {e.branch_name || "L'Étoile Downtown"}</span>
              </div>

              <span className="text-base font-extrabold font-mono text-white">
                ${parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#1c1b1b] border border-[#d4af37] rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-lg font-bold text-white">Record Operating Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-[#99907c] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Expense Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none"
                >
                  <option value="RENT">Rent & Facilities</option>
                  <option value="UTILITIES">Utilities (Gas, Electric, Water)</option>
                  <option value="MARKETING">Marketing & Guest Acquisition</option>
                  <option value="MAINTENANCE">Kitchen Equipment Maintenance</option>
                  <option value="SUPPLIES">Packaging & Paper Goods</option>
                  <option value="OTHER">Other Miscellaneous</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 450.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#99907c] font-mono uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpense.expense_date}
                    onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                    className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded font-mono focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#99907c] font-mono uppercase block mb-1">Description / Vendor *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Commercial refrigeration repair"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full bg-[#131313] border border-[#353535] text-white p-2.5 rounded focus:border-[#d4af37] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-[#2a2a2a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 bg-[#20201f] text-white rounded font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d4af37] text-black font-bold rounded shadow-gold uppercase font-mono"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
