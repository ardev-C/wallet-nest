import { useState, useEffect } from 'react';
import ExpenseForm from '../components/ExpenseForm';
import { useFinance } from '../hooks/useFinance';
import { PlusCircle, Info, Zap } from 'lucide-react';

export default function AddExpenses() {
  const { transactions, addExpense, metrics } = useFinance();
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (expense) => {
    const inserted = await addExpense(expense);
    if (inserted) {
      setShowToast(true);
    }
    return inserted;
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="max-w-7xl mx-auto animation-fade-in flex flex-col xl:flex-row gap-10 pb-12 px-2">
      {/* Toast Notification */}
      <div className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out flex items-center justify-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 ${
        showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <Zap size={16} strokeWidth={3} />
        </div>
        <p className="font-extrabold text-[var(--text-color)] dark:text-white tracking-widest uppercase text-xs">Ledger Updated</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        <div className="mb-6">
          <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
            <PlusCircle size={14} /> Capital Outflow
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
            Log Expense
          </h2>
          <p className="text-gray-500 mt-3 font-medium text-lg max-w-xl">
            Input new transactions into your tracking ledger. The AI will categorize and route them into history.
          </p>
        </div>

        <ExpenseForm onSubmit={handleSubmit} />
      </div>

      {/* Sidebar Info & Feed */}
      <div className="w-full xl:w-96 space-y-8">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-700"></div>
          <div className="relative z-10">
            <Info className="mb-6 text-emerald-200" size={32} strokeWidth={2.5} />
            <h3 className="font-black text-2xl mb-3 tracking-tight">Active Burn Rate</h3>
            <p className="text-emerald-100 text-sm font-medium mb-6 leading-relaxed">
              You have exhausted <span className="font-black text-white">{metrics.spentPercent}%</span> of your localized monthly capital.
            </p>
            <div className="w-full bg-black/20 rounded-full h-3 mb-2 overflow-hidden shadow-inner border border-white/10">
               <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(metrics.spentPercent, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="card-premium p-6 border border-[var(--border-color)]">
          <h3 className="font-black text-lg text-[var(--text-color)] tracking-tight mb-6 flex items-center justify-between">
            Live Feed <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2.5 py-1 rounded-md uppercase tracking-widest ml-4 border border-emerald-500/20 shadow-sm animate-pulse">Syncing</span>
          </h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-white/5 group">
                <div className="overflow-hidden">
                  <p className="font-extrabold text-[var(--text-color)] tracking-tight text-sm truncate">{tx.title}</p>
                  <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">{tx.category}</p>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-black tracking-tight text-sm ${tx.amount > 0 ? 'text-emerald-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {tx.amount > 0 ? '+' : ''}Rs {Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm font-bold text-gray-400 tracking-widest uppercase text-center py-8 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl">No Records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
