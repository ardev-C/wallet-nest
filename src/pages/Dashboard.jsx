import SummaryCards from '../components/SummaryCards';
import ChartSection from '../components/ChartSection';
import { ArrowRight, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { metrics, transactions, goals } = useFinance();
  const { user } = useAuth();
  const trendData = Object.entries(metrics.categoryTotals).map(([name, spend]) => ({ name, spend }));
  
  // Highest priority goal
  const topGoal = goals[0];
  const goalPercent = topGoal ? Math.min(Math.round((topGoal.saved / topGoal.target) * 100), 100) : 0;

  return (
    <div className="max-w-7xl mx-auto animation-fade-in space-y-10 pb-12">
      {/* Premium Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative px-2">
        <div className="z-10">
          <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs mb-3">Financial Overview</p>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight mb-3">
            Welcome back, {user?.name || 'Student'}.
          </h1>
          <p className="text-gray-500 text-lg max-w-xl font-medium tracking-tight">
            You're currently trending smoothly. You have <span className="text-[var(--text-color)] font-bold">Rs {metrics.remaining.toLocaleString()}</span> left for this month.
          </p>
        </div>
        <Link to="/expenses" className="btn-primary shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transform hover:-translate-y-1 transition-all rounded-2xl px-6 py-3 border border-emerald-400">
          <span className="font-bold tracking-tight">+ Log Expense</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed - 8 Cols */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* AI Insight Module */}
          <div className="relative overflow-hidden rounded-3xl p-8 shadow-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white group border border-indigo-100 dark:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12 group-hover:rotate-12 transition-transform duration-700 text-indigo-500 dark:text-indigo-300">
              <Sparkles size={160} />
            </div>
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-emerald-400 dark:bg-emerald-500 blur-[100px] opacity-30 dark:opacity-20 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm dark:shadow-inner">
                  <Sparkles size={20} className="text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xs tracking-[0.15em] text-emerald-600 dark:text-emerald-400 uppercase">AI Mentor Insight</h3>
              </div>
              <h2 className="text-2xl md:text-3xl font-medium leading-tight tracking-tight mb-7 max-w-2xl text-slate-800 dark:text-white">
                {metrics.spentPercent >= 80 
                  ? "You're burning through your budget rapidly. Lock in a daily cap immediately to survive the month!"
                  : "Excellent pacing this week. If you maintain this sweep rate, you'll comfortably hit your savings target."}
              </h2>
              <Link to="/insights" className="px-6 py-3 bg-white dark:bg-white text-[var(--text-color)] dark:text-slate-900 border border-[var(--border-color)] font-bold tracking-tight rounded-xl text-sm transition-all hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-400 shadow-lg shadow-black/10 dark:shadow-black/20 hover:shadow-emerald-500/30">
                View full breakdown
              </Link>
            </div>
          </div>

          {/* Dynamic Chart block */}
          <div className="card-premium p-1 flex-1 border border-[var(--border-color)]">
            <ChartSection title="Spending Velocity" data={trendData.length ? trendData : undefined} />
          </div>
        </div>

        {/* Right Sidebar Feed - 4 Cols */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Goal Progress Widget */}
          {topGoal && (
            <div className="card-premium p-7 relative overflow-hidden group border border-[var(--border-color)]">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500 blur-[80px] opacity-[0.15] rounded-full group-hover:scale-[2] transition-transform duration-1000"></div>
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm border border-emerald-500/10 dark:border-emerald-500/20">
                    <Target size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--text-color)] tracking-tight">Priority Goal</h3>
                </div>
                <span className="text-2xl font-black text-emerald-500 tracking-tighter">{goalPercent}%</span>
              </div>
              
              <div className="relative z-10 block">
                <h4 className="font-bold text-[var(--text-color)] text-xl tracking-tight truncate mb-2">{topGoal.title}</h4>
                <div className="flex justify-between text-xs font-bold tracking-tight text-gray-400 dark:text-gray-500 uppercase mb-3">
                  <span>Rs {topGoal.saved.toLocaleString()} built</span>
                  <span>Rs {topGoal.target.toLocaleString()} target</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modern Transaction List */}
          <div className="card-premium p-7 flex-1 flex flex-col border border-[var(--border-color)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-[var(--text-color)] tracking-tight">Recent Activity</h3>
              <Link to="/history" className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors group">
                <ArrowRight size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-emerald-500" strokeWidth={2.5} />
              </Link>
            </div>
            
            <div className="space-y-6 flex-1 relative">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center group cursor-pointer transition-transform hover:translate-x-1">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 group-hover:border-emerald-500/30 group-hover:shadow-sm transition-all">
                      <span className="text-sm font-black text-gray-400 dark:text-gray-500 group-hover:text-emerald-500 transition-colors">
                        {tx.title.substring(0,2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-color)] text-sm tracking-tight mb-0.5">{tx.title}</h4>
                      <span className="text-xs font-bold tracking-tight text-gray-400 dark:text-gray-500">{tx.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block font-black text-sm tracking-tight mb-0.5 ${tx.amount > 0 ? 'text-emerald-500' : 'text-[var(--text-color)]'}`}>
                      {tx.amount > 0 ? '+' : ''}Rs {Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="h-full flex items-center justify-center text-sm font-bold tracking-tight text-gray-400">
                  No activity yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
