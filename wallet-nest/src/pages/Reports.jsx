import { useMemo } from 'react';
import { TrendingDown, LayoutList, CalendarDays, Activity } from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6', '#f43f5e'];

function ReportsChartTooltip({ active, payload, label, prefix = 'Rs ' }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--card-bg)] backdrop-blur border border-[var(--border-color)] p-5 rounded-2xl shadow-2xl">
        {label && <p className="text-[var(--muted-text)] font-black tracking-widest text-xs uppercase mb-3">{label}</p>}
        <div className="flex flex-col gap-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill || entry.payload?.fill }} />
              <p className="text-[var(--text-color)] font-black text-xl tracking-tight">
                {prefix}{entry.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function Reports() {
  const { transactions } = useFinance();

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.amount < 0 && t.date),
    [transactions],
  );

  const monthExpenseTransactions = useMemo(() => {
    const now = new Date();
    return expenseTransactions.filter((t) => {
      const d = new Date(t.date);
      return (
        !Number.isNaN(d.getTime())
        && d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
      );
    });
  }, [expenseTransactions]);

  // 1. Core Analytics (current month)
  const categoryData = useMemo(
    () => Object.values(
      monthExpenseTransactions.reduce((acc, tx) => {
        const key = tx.category || 'Other';
        const amount = Math.abs(Number(tx.amount) || 0);
        if (!acc[key]) {
          acc[key] = { name: key, value: 0 };
        }
        acc[key].value += amount;
        return acc;
      }, {}),
    ).sort((a, b) => b.value - a.value),
    [monthExpenseTransactions],
  );

  const topCategory = categoryData.length > 0 ? categoryData[0] : { name: 'N/A', value: 0 };
  const daysElapsed = new Date().getDate();
  const totalSpend = monthExpenseTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount) || 0), 0);
  const averageDailySpend = Math.round(totalSpend / Math.max(1, daysElapsed));

  // 2. Monthly Trend Engine (last 6 months)
  const monthlyData = useMemo(() => {
    const now = new Date();
    const labels = [];
    const monthlyMap = {};

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(key);
      monthlyMap[key] = 0;
    }

    expenseTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key] !== undefined) {
        monthlyMap[key] += Math.abs(Number(tx.amount) || 0);
      }
    });

    return labels.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const labelDate = new Date(year, month - 1, 1);
      return {
        month: labelDate.toLocaleDateString('en-US', { month: 'short' }),
        spend: monthlyMap[key],
      };
    });
  }, [expenseTransactions]);

  return (
    <div className="max-w-7xl mx-auto animation-fade-in pb-12">
      <div className="flex justify-between items-end mb-10 px-2">
        <div>
          <p className="text-purple-500 font-bold tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
            <Activity size={14} /> Analytics Engine
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-color)] tracking-tight">
            Financial Reports
          </h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-premium p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative group overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <TrendingDown className="text-emerald-500" strokeWidth={2.5} />
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">Total Monthly Spend</h3>
          </div>
          <p className="text-4xl font-black tracking-tighter text-[var(--text-color)] relative z-10">Rs {totalSpend.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent relative group overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <CalendarDays className="text-blue-500" strokeWidth={2.5} />
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">Average Daily Spend</h3>
          </div>
          <p className="text-4xl font-black tracking-tighter text-[var(--text-color)] relative z-10">Rs {averageDailySpend.toLocaleString()}</p>
        </div>

        <div className="card-premium p-6 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent relative group overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <LayoutList className="text-purple-500" strokeWidth={2.5} />
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase">Top Category</h3>
          </div>
          <p className="text-4xl font-black tracking-tighter text-[var(--text-color)] relative z-10">{topCategory.name}</p>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest relative z-10 mt-1 block">Rs {topCategory.value.toLocaleString()} Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Monthly Area Chart */}
        <div className="card-premium p-8 col-span-1 xl:col-span-2 flex flex-col h-[450px]">
          <h3 className="font-extrabold text-xl text-[var(--text-color)] tracking-tight mb-8 flex items-center gap-3">
             Monthly Spending Trend
          </h3>
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip content={ReportsChartTooltip} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSpend)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card-premium p-8 flex flex-col h-[450px]">
          <h3 className="font-extrabold text-xl text-[var(--text-color)] tracking-tight mb-6">Category Weights</h3>
          <div className="flex-1 w-full relative z-10 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1500}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={ReportsChartTooltip} />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px', color: 'var(--text-color)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 font-bold tracking-widest text-sm uppercase">No analytics available.</p>
            )}
          </div>
        </div>

        {/* Bar Chart representing Total Spend by Category */}
        <div className="card-premium p-8 flex flex-col h-[450px]">
          <h3 className="font-extrabold text-xl text-[var(--text-color)] tracking-tight mb-6">Capital Allocation Bar</h3>
          <div className="flex-1 w-full relative z-10">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={ReportsChartTooltip} />
                  <Bar dataKey="value" name="Total Spent" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={28} animationDuration={1500}>
                    {categoryData.slice(0,6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <p className="text-gray-400 h-full flex items-center justify-center font-bold tracking-widest text-sm uppercase">No analytics available.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
