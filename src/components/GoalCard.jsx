import { useState } from 'react';
import { Target, Trash2, PlusCircle, Check, Award, Flame, Sprout } from 'lucide-react';

export default function GoalCard({ title, current, target, color = 'emerald', onDelete, onAddContribution }) {
  const percent = Math.min(Math.round((current / target) * 100), 100);
  const [isAdding, setIsAdding] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  
  const colorMap = {
    emerald: 'from-emerald-400 to-emerald-600 text-emerald-500 bg-emerald-50',
    blue: 'from-blue-400 to-indigo-500 text-blue-500 bg-blue-50',
    purple: 'from-purple-400 to-pink-500 text-purple-500 bg-purple-50',
    orange: 'from-orange-400 to-red-500 text-orange-500 bg-orange-50'
  };
  
  const activeColorTheme = colorMap[color] || colorMap.emerald;
  const gradientClass = activeColorTheme.split(' ').find(c => c.startsWith('from-'));
  const toClass = activeColorTheme.split(' ').find(c => c.startsWith('to-'));
  const textClass = activeColorTheme.split(' ').find(c => c.startsWith('text-'));

  const getMilestone = () => {
    if (percent === 100) return { text: 'Goal Reached!', icon: Award, class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30' };
    if (percent >= 50) return { text: 'Halfway there!', icon: Flame, class: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30' };
    return { text: 'Just started', icon: Sprout, class: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' };
  };

  const Milestone = getMilestone();

  return (
    <div className="card-premium p-6 group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border border-[var(--border-color)]">
      {/* Background glow */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${gradientClass} ${toClass} opacity-[0.08] rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-1000`}></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex flex-col gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradientClass} ${toClass} text-white shadow-lg`}>
            {percent === 100 ? <Award size={24} /> : <Target size={24} />}
          </div>
          <h4 className="font-extrabold text-xl tracking-tight text-[var(--text-color)] leading-tight">{title}</h4>
        </div>
        <div className="flex flex-col items-end gap-2">
          {onDelete && (
             <button onClick={onDelete} type="button" className="text-gray-300 hover:text-red-500 transition-colors p-2 bg-gray-50 dark:bg-slate-800 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-500/10 shadow-sm border border-black/5 dark:border-white/5">
               <Trash2 size={16} />
             </button>
          )}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-sm ${Milestone.class}`}>
            <Milestone.icon size={12} strokeWidth={3} />
            <span className="text-[10px] font-black tracking-wider uppercase">{Milestone.text}</span>
          </div>
        </div>
      </div>

      {/* Progress Core */}
      <div className="relative z-10 space-y-5">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-4xl font-black tracking-tighter ${textClass}`}>
            Rs {current.toLocaleString()}
          </span>
          <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">/ {target.toLocaleString()}</span>
        </div>
        
        <div className="relative pt-2">
          <div className="flex justify-between text-[11px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-2">
            <span>Progress</span>
            <span className={textClass}>{percent}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-800/80 rounded-full h-4 overflow-hidden outline outline-1 outline-black/5 dark:outline-white/5 shadow-inner relative">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradientClass} ${toClass} transition-all duration-[1500ms] ease-out rounded-full`}
              style={{ width: `${percent}%` }}
            >
              {percent > 0 && percent < 100 && (
                 <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white/40 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="mt-8 relative z-10 pt-5 border-t border-gray-100 dark:border-slate-800">
        {onAddContribution && percent < 100 && (
          <div>
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)} 
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-xs font-black tracking-widest text-gray-600 dark:text-gray-300 bg-gray-50/80 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle size={16} strokeWidth={3} className={textClass} /> DROP FUNDS
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rs</span>
                  <input 
                    type="number" 
                    value={contributeAmount}
                    onChange={(e) => setContributeAmount(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && contributeAmount) {
                        const updated = await onAddContribution(contributeAmount);
                        if (updated) {
                          setIsAdding(false);
                          setContributeAmount('');
                        }
                      }
                    }}
                    placeholder="Amount"
                    className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl py-3 pl-9 pr-3 focus:ring-4 focus:ring-emerald-500/20 outline-none text-base font-black text-[var(--text-color)] shadow-inner transition-all h-12 block"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={async () => {
                    if (contributeAmount) {
                      const updated = await onAddContribution(contributeAmount);
                      if (updated) {
                        setIsAdding(false);
                        setContributeAmount('');
                      }
                      return;
                    }
                    setIsAdding(false);
                    setContributeAmount('');
                  }}
                  className={`h-12 w-12 flex-shrink-0 bg-gradient-to-br ${gradientClass} ${toClass} flex items-center justify-center text-white rounded-xl shadow-lg border border-white/20 transition-all hover:scale-105 active:scale-95`}
                >
                  <Check size={20} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        )}
        
        {percent === 100 && (
          <div className="flex items-center justify-center gap-2 py-3 text-yellow-600 dark:text-yellow-500 font-black tracking-widest uppercase text-xs bg-yellow-50 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/20 shadow-sm">
             <Award size={18} strokeWidth={2.5} /> FULLY FUNDED
          </div>
        )}
      </div>
    </div>
  );
}
