import { useState } from 'react';
import { Wallet, ArrowDownRight, Target, ShieldCheck, Edit3, Check } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const formatCurrency = (value) => `Rs ${value.toLocaleString()}`;

export default function SummaryCards() {
  const { metrics, monthlyBudget, setMonthlyBudget } = useFinance();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editBudgetValue, setEditBudgetValue] = useState(monthlyBudget);
  
  // Safe daily spend calculated organically based on days left in month
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - today.getDate());
  const safeDaily = Math.round(metrics.remaining / daysLeft);

  const cards = [
    { 
      title: 'Total Budget', 
      amount: formatCurrency(monthlyBudget), 
      subtitle: 'Monthly limit',
      icon: Wallet,
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    },
    { 
      title: 'Total Spent', 
      amount: formatCurrency(metrics.expenses), 
      subtitle: `${metrics.spentPercent}% used`,
      icon: ArrowDownRight,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
    },
    { 
      title: 'Remaining', 
      amount: formatCurrency(metrics.remaining), 
      subtitle: 'Available cash',
      icon: Target,
      gradient: 'from-emerald-400 to-emerald-600',
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
    },
    { 
      title: 'Safe Daily Spend', 
      amount: formatCurrency(Math.max(0, safeDaily)), 
      subtitle: `For next ${daysLeft} days`,
      icon: ShieldCheck,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="card-premium p-6 group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          {/* Subtle background glow effect over the card */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-[0.08] dark:opacity-10 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-700`}></div>
          
          <div className="flex justify-between items-start relative z-10 mb-4">
            <div className={`p-3 rounded-2xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm border border-[var(--border-color)]`}>
              <card.icon size={22} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-xs font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">{card.title}</p>
            
            {card.title === 'Total Budget' && isEditingBudget ? (
              <div className="flex items-center gap-2 mb-3 h-9">
                <span className="text-lg font-bold text-gray-400 dark:text-gray-500">Rs</span>
                <input 
                  type="number" 
                  value={editBudgetValue}
                  onChange={(e) => setEditBudgetValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setMonthlyBudget(Number(editBudgetValue) || 0);
                      setIsEditingBudget(false);
                    }
                  }}
                  className="w-24 bg-gray-50 dark:bg-slate-800 border border-emerald-500 rounded-lg py-1 px-2 focus:ring-2 focus:ring-emerald-500/50 outline-none text-xl font-extrabold text-[var(--text-color)] transition-all"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setMonthlyBudget(Number(editBudgetValue) || 0);
                    setIsEditingBudget(false);
                  }}
                  className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  <Check size={16} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3 group/edit h-9">
                <h3 className="text-3xl font-extrabold text-[var(--text-color)] tracking-tight">
                  {card.amount}
                </h3>
                {card.title === 'Total Budget' && (
                  <button 
                    onClick={() => {
                      setEditBudgetValue(monthlyBudget);
                      setIsEditingBudget(true);
                    }}
                    className="opacity-0 group-hover/edit:opacity-100 p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 rounded-lg transition-all"
                    title="Edit monthly budget"
                  >
                    <Edit3 size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}
            
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-tight rounded-full bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 border border-black/5 dark:border-white/5">
              {card.subtitle}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
