import { useState } from 'react';
import GoalCard from '../components/GoalCard';
import { Target, Plus, Rocket } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

export default function Goals() {
  const { goals, addGoal, removeGoal, addContribution } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  const submitGoal = async (event) => {
    event.preventDefault();
    if (!title.trim() || !target) return;
    const inserted = await addGoal({ title, target });
    if (inserted) {
      setTitle('');
      setTarget('');
      setShowForm(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animation-fade-in pb-12">
      {/* Premium Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative px-2 mb-10">
        <div className="z-10">
          <p className="text-emerald-500 font-bold tracking-[0.2em] uppercase text-xs mb-3">Portfolio Builder</p>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight mb-3 flex items-center gap-3">
            <Target className="text-emerald-500" strokeWidth={3} size={40} /> Dream Board
          </h1>
          <p className="text-gray-500 text-lg max-w-xl font-medium tracking-tight">
            Visualize your saving targets and fund them directly to hit milestones.
          </p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className={`btn-primary shadow-lg transform transition-all rounded-2xl px-6 py-3 border flex items-center gap-2 font-black tracking-widest text-xs uppercase ${showForm ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-900' : 'bg-emerald-500 border-emerald-400 hover:-translate-y-1 hover:shadow-emerald-500/40'}`}
        >
          <Plus size={16} strokeWidth={3} className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
          <span>{showForm ? 'CANCEL' : 'NEW GOAL'}</span>
        </button>
      </div>

      {showForm && (
        <div className="mb-10 animation-fade-in p-[2px] rounded-[24px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 shadow-2xl">
          <form onSubmit={submitGoal} className="px-6 py-8 md:px-10 md:py-10 rounded-[22px] bg-[var(--card-bg)] flex flex-col md:flex-row gap-5 items-center">
            
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-black tracking-widest text-gray-400 uppercase ml-2">Goal Blueprint</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. MacBook Pro, Trip to Tokyo"
                className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-[var(--text-color)] text-lg placeholder-gray-300 dark:placeholder-gray-600 shadow-inner"
              />
            </div>
            
            <div className="w-full md:w-64 space-y-2">
              <label className="text-xs font-black tracking-widest text-gray-400 uppercase ml-2">Capital Target</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">Rs</span>
                <input
                  type="number"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-[var(--text-color)] text-lg shadow-inner"
                />
              </div>
            </div>

            <button className="w-full md:w-auto h-14 px-8 mt-6 md:mt-auto bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black tracking-widest text-sm uppercase rounded-xl hover:shadow-xl hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-1">
              <Rocket size={18} strokeWidth={2.5} /> Deploy Goal
            </button>
          </form>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <div className="card-premium h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
            <Target size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">No Goals Built Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">Visualizing your targets makes you 42% more likely to hit them. Start by clicking New Goal.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map((goal, idx) => {
          // Cycle through colors based on id/idx for visual flair
          const colorList = ['emerald', 'blue', 'purple', 'orange'];
          const nodeColor = colorList[idx % colorList.length];
          
          return (
            <GoalCard 
              key={goal.id ?? idx} 
              title={goal.title} 
              current={goal.saved} 
              target={goal.target} 
              color={nodeColor}
              onDelete={() => removeGoal(goal.id)} 
              onAddContribution={(amount) => addContribution(goal.id, amount)}
            />
          )
        })}
      </div>
    </div>
  );
}
