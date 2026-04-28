import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, MessageCircle, Target, PieChart, Plus } from 'lucide-react';

const mobileNavItems = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Reports', path: '/reports', icon: PieChart },
  { name: 'Add', path: '/expenses', icon: Plus, isPrimary: true },
  { name: 'Insights', path: '/insights', icon: BrainCircuit },
  { name: 'Mentor', path: '/mentor', icon: MessageCircle },
  { name: 'Goals', path: '/goals', icon: Target },
];

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-6 left-3 right-3 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 z-50 px-2 flex justify-between items-center gap-0.5 rounded-3xl shadow-2xl safe-area-pb">
      {mobileNavItems.map((item) => {
        if (item.isPrimary) {
          return (
            <NavLink key={item.name} to={item.path} className="relative z-10 -mt-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-500/40 flex items-center justify-center text-white border-[6px] border-[var(--bg-color)] transition-transform active:scale-95">
                <item.icon size={24} strokeWidth={3} />
              </div>
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-0 flex-1 max-w-[3.25rem] py-1 transition-all duration-300 ${
                isActive ? 'text-emerald-500 scale-105' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            <item.icon size={18} strokeWidth={2.5} className="mb-0.5 shrink-0" />
            <span className="text-[7px] font-black tracking-tighter uppercase text-center leading-tight line-clamp-2">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
