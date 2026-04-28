import { History as HistoryIcon, Download, Search, FileText } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useState, useMemo } from 'react';

export default function History() {
  const { transactions } = useFinance();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [dateRange, setDateRange] = useState('All Range');
  
  // Extract unique categories
  const categories = ['All', ...new Set(transactions.map(t => t.category))];

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase());
      const matchesCat = filterCat === 'All' || tx.category === filterCat;
      
      let matchesDate = true;
      if (dateRange !== 'All Range') {
        const txDate = new Date(tx.date);
        const now = new Date();
        const diffTime = Math.abs(now - txDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateRange === 'Last 7 Days') matchesDate = diffDays <= 7;
        if (dateRange === 'Last 30 Days') matchesDate = diffDays <= 30;
      }
      return matchesSearch && matchesCat && matchesDate;
    });
  }, [transactions, search, filterCat, dateRange]);

  return (
    <div className="max-w-7xl mx-auto animation-fade-in h-[calc(100vh-6rem)] flex flex-col gap-8 pb-8 px-2">
      <div className="flex justify-between items-end flex-shrink-0 mb-4">
        <div>
          <p className="text-orange-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
            <FileText size={14} /> Indexed Database
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
            Ledger History
          </h2>
        </div>
        <button className="btn-secondary shadow-lg shadow-black/5 hover:shadow-black/10 border border-gray-200 dark:border-white/10 font-bold tracking-tight px-6 py-3 rounded-2xl transform transition-transform hover:-translate-y-1">
          <Download size={18} strokeWidth={2.5} /><span>EXPORT CSV</span>
        </button>
      </div>

      <div className="card-premium flex flex-col flex-1 min-h-0 overflow-hidden border border-[var(--border-color)] shadow-xl">
        {/* Filters and Controls */}
        <div className="p-5 border-b border-[var(--border-color)] flex flex-wrap items-center gap-4 bg-[var(--surface-soft)] backdrop-blur-md z-20">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" size={18} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search ledger..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--search-bg)] border-2 border-[var(--border-color)] rounded-xl py-2.5 pl-12 pr-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm font-bold tracking-tight text-[var(--text-color)] transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="bg-[var(--search-bg)] border-2 border-[var(--border-color)] rounded-xl py-2.5 px-5 focus:ring-4 focus:ring-orange-500/20 outline-none text-sm font-bold text-[var(--text-color)] transition-all cursor-pointer shadow-sm"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} Filter</option>
              ))}
            </select>

            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-[var(--search-bg)] border-2 border-[var(--border-color)] rounded-xl py-2.5 px-5 focus:ring-4 focus:ring-orange-500/20 outline-none text-sm font-bold text-[var(--text-color)] transition-all cursor-pointer shadow-sm"
            >
              <option>All Range</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative bg-[var(--card-bg)]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="sticky top-0 bg-[var(--surface-soft)] backdrop-blur-md shadow-sm z-10 border-b border-[var(--border-color)]">
              <tr className="text-[var(--muted-text)] text-xs font-black tracking-widest uppercase">
                <th className="px-8 py-5">Transaction Node</th>
                <th className="px-6 py-5">Classification</th>
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">State</th>
                <th className="px-8 py-5 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5 overflow-y-auto">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex justify-center mb-4 opacity-50"><HistoryIcon size={48} className="text-gray-300 dark:text-gray-700" strokeWidth={1} /></div>
                    <p className="font-bold text-gray-500 tracking-tight text-lg">No matching ledger records.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-default">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:text-orange-500 transition-colors shadow-sm">
                          <span className="font-black text-sm">{tx.title.substring(0,2).toUpperCase()}</span>
                        </div>
                        <span className="text-[var(--text-color)] font-black tracking-tight">{tx.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-bold tracking-tight text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/5 shadow-sm">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
                      {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 inline-flex px-2 py-1 rounded-md border border-emerald-500/20 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>SETTLED
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-right font-black tracking-tighter text-lg ${tx.amount > 0 ? 'text-emerald-500' : 'text-[var(--text-color)]'}`}>
                      {tx.amount > 0 ? '+' : ''}Rs {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
