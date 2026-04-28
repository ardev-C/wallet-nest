import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, BrainCircuit, MessageCircle, Target, PieChart, History, Wallet, UserCircle2 } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Add Expenses', path: '/expenses', icon: Receipt },
  { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
  { name: 'AI Mentor', path: '/mentor', icon: MessageCircle },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Reports', path: '/reports', icon: PieChart },
  { name: 'History', path: '/history', icon: History },
  { name: 'Profile', path: '/profile', icon: UserCircle2 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 m-4 rounded-3xl border border-gray-200 dark:border-white/5 bg-[var(--card-bg)] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] flex-col hidden md:flex h-[calc(100vh-2rem)] overflow-hidden transition-colors duration-300">
      <div className="p-6 flex items-center space-x-3 mb-2 border-b border-gray-100 dark:border-slate-800/50">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.3)] text-white group cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
          <Wallet size={20} strokeWidth={2.5} className="relative z-10" />
        </div>
        <div className="flex flex-col cursor-pointer group">
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300 transition-colors group-hover:from-emerald-500 group-hover:to-teal-300">
            WalletNest<span className="text-emerald-500">.</span>
          </h1>
          <span className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 dark:text-gray-500 mt-0.5">
            Finance Engine
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}
