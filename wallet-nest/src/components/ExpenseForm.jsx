import { useMemo, useState } from 'react';
import { Plus, Coffee, ShoppingBag, Utensils, Book, Smile, Meh, Frown, Tag, X, Plane, Receipt, BookOpen, Box, Check } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';

const iconMap = {
  Utensils, Plane, ShoppingBag, Receipt, BookOpen, Box, Tag, Coffee, Book
};

const moods = [
  { name: 'Happy', icon: Smile, color: 'text-emerald-500' },
  { name: 'Neutral', icon: Meh, color: 'text-blue-500' },
  { name: 'Regret', icon: Frown, color: 'text-orange-500' }
];

export default function ExpenseForm({ onSubmit }) {
  const { categories, addCategory, removeCategory } = useFinance();
  const [activeCategory, setActiveCategory] = useState('');
  const [activeMood, setActiveMood] = useState(moods[1].name);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [form, setForm] = useState({
    amount: '',
    note: '',
    date: new Date().toISOString().slice(0, 10),
  });

  const categoryNames = useMemo(() => new Set(categories.map((c) => c.name)), [categories]);
  const effectiveCategory =
    activeCategory && categoryNames.has(activeCategory)
      ? activeCategory
      : (categories[0]?.name ?? '');

  const submit = async (event) => {
    event.preventDefault();
    if (!form.amount) return;
    
    const inserted = await onSubmit({
      ...form,
      category: effectiveCategory,
      mood: activeMood,
      id: Date.now()
    });

    if (inserted) {
      setForm((prev) => ({ ...prev, amount: '', note: '' }));
    }
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName);
    setActiveCategory(newCatName.trim());
    setNewCatName('');
    setShowAddCat(false);
  };

  return (
    <div className="card-premium p-8 border border-[var(--border-color)] shadow-xl relative overflow-hidden group">
      <div className="absolute -right-24 -top-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000 z-0"></div>
      
      <div className="relative z-10 w-full mb-8">
        <label className="text-xs font-black tracking-widest text-emerald-500 dark:text-emerald-400 uppercase mb-3 block text-center">Capital Drain Amount</label>
        <div className="relative max-w-sm mx-auto">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 dark:text-gray-600">Rs</span>
          <input
            type="number"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="0.00"
            className="w-full bg-white dark:bg-slate-900 shadow-inner border-2 border-gray-100 dark:border-slate-800 focus:border-emerald-500 rounded-[24px] py-5 pl-16 pr-6 outline-none text-4xl text-center font-black tracking-tighter text-[var(--text-color)] transition-all placeholder-gray-200 dark:placeholder-gray-700 font-mono"
            autoFocus
          />
        </div>
      </div>

      <form className="space-y-8 relative z-10" onSubmit={submit}>
        {/* Category Picker */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <label className="text-xs font-black tracking-widest text-gray-400 uppercase">Routing Classification</label>
            <button 
              type="button" 
              onClick={() => setShowAddCat(!showAddCat)} 
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-[10px] font-black tracking-widest uppercase transition-colors flex items-center gap-1 shadow-sm border border-black/5 dark:border-white/5"
            >
              <Plus size={12} strokeWidth={3} /> NEW TAG
            </button>
          </div>
          
          {showAddCat && (
            <div className="mb-5 flex overflow-hidden border-2 border-emerald-500/30 rounded-2xl focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all bg-white dark:bg-slate-900 shadow-sm pl-2">
              <input 
                type="text" 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Custom route name..." 
                className="flex-1 px-4 py-3 bg-transparent text-sm font-bold tracking-tight outline-none text-[var(--text-color)]"
              />
              <button onClick={handleAddCategory} type="button" className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 font-black tracking-widest uppercase text-xs transition-colors shadow-md">
                Deploy
              </button>
            </div>
          )}

          <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide snap-x relative z-20">
            {categories.map((cat) => {
              const Icon = iconMap[cat.iconType] || Tag;
              const isActive = effectiveCategory === cat.name;
              return (
                <div key={cat.id} className="relative group snap-start shrink-0">
                  {!cat.isDefault && (
                     <button 
                       type="button" 
                       onClick={(e) => { e.stopPropagation(); removeCategory(cat.id); }}
                       className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                     >
                       <X size={10} strokeWidth={3} />
                     </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center py-2 px-3 rounded-xl min-w-max transition-all border-2 relative group-hover:z-10 ${
                      isActive 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md z-10 scale-105' 
                        : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center rounded-lg mr-2 shrink-0 ${cat.color} ${isActive ? 'shadow-sm shadow-emerald-500/20' : 'grayscale-[50%] opacity-80'}`}>
                      <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                    </div>
                    <span className={`text-[11px] tracking-widest uppercase truncate ${isActive ? 'font-black text-[var(--text-color)]' : 'font-bold text-gray-500'}`}>
                      {cat.name}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
             <label className="text-xs font-black tracking-widest text-gray-400 uppercase mb-3 block">Purchase Mood</label>
             <div className="flex border-2 border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-1 gap-1 shadow-inner">
               {moods.map(m => {
                 const isActive = activeMood === m.name;
                 return (
                   <button
                     key={m.name}
                     type="button"
                     onClick={() => setActiveMood(m.name)}
                     className={`flex-1 py-3 rounded-xl flex justify-center items-center transition-all ${
                       isActive ? 'bg-white dark:bg-slate-800 shadow-sm border border-black/5 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5 scale-[1.02]' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-60 hover:opacity-100'
                     }`}
                     title={m.name}
                   >
                     <m.icon size={22} className={isActive ? m.color : 'text-[var(--text-color)]'} strokeWidth={isActive ? 2.5 : 2} />
                   </button>
                 )
               })}
             </div>
          </div>
          <div>
            <label className="text-xs font-black tracking-widest text-gray-400 uppercase mb-3 block">Timestamp</label>
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl py-3.5 px-5 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-[var(--text-color)] font-bold text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black tracking-widest text-gray-400 uppercase mb-3 block">Memo Protocol</label>
          <input
            type="text"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Attach context (optional)..."
            className="w-full bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-800 rounded-2xl py-4 px-5 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-[var(--text-color)] font-bold transition-all shadow-sm"
          />
        </div>

        <button className="w-full h-16 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black tracking-widest uppercase text-sm rounded-[20px] hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
          <Check size={20} strokeWidth={3} /> COMMIT TRANSACTION
        </button>
      </form>
    </div>
  );
}
