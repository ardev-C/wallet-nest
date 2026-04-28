import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'Mon', spend: 300 },
  { name: 'Tue', spend: 460 },
  { name: 'Wed', spend: 240 },
  { name: 'Thu', spend: 500 },
  { name: 'Fri', spend: 350 },
  { name: 'Sat', spend: 270 },
  { name: 'Sun', spend: 200 },
];

export default function ChartSection({ title = 'Spending Overview', data = defaultData }) {
  return (
    <div className="card-premium p-6 mt-6 flex flex-col h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-[var(--text-color)]">{title}</h3>
        <select className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg text-sm px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-[var(--text-color)]">
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="flex-1 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--card-bg)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: 'var(--text-color)' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Area type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" animationDuration={1500} animationEasing="ease-in-out" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
