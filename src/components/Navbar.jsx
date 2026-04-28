import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Search, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-20 px-4 md:px-10 bg-[var(--bg-color)]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center w-1/3">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wallet size={16} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-emerald-400 dark:to-teal-300 pt-0.5">
            WalletNest<span className="text-emerald-500">.</span>
          </h1>
        </div>
        
        {/* Desktop Search */}
        <div className="relative w-full max-w-sm hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" size={18} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full bg-[var(--search-bg)] border border-[var(--border-color)] rounded-2xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-[var(--text-color)] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-300"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="flex items-center space-x-2.5 border-l border-[var(--border-color)] pl-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'Student')}&backgroundColor=10b981`}
            alt="User profile"
            className="w-9 h-9 rounded-full border border-emerald-500 p-0.5 object-cover bg-emerald-100"
          />
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-[var(--text-color)]">{user?.name ?? 'Student'}</p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-emerald-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
