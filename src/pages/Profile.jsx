import { useMemo, useState } from 'react';
import { Mail, User, Wallet, Target, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFinance } from '../hooks/useFinance';

export default function Profile() {
  const { user, updateProfile, authLoading } = useAuth();
  const { monthlyBudget, goals, metrics } = useFinance();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [message, setMessage] = useState('');

  const suggestions = useMemo(() => {
    const seed = encodeURIComponent(user?.name || 'WalletNest');
    return [
      `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=10b981`,
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=b6e3f4`,
      `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${seed}&backgroundColor=ffd5dc`,
      `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=c0aede`,
      `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=ffdfbf`,
      `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=d1d4f9`,
    ];
  }, [user?.name]);

  const handleSave = async (event) => {
    event.preventDefault();
    const result = await updateProfile({ name, avatar });
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage('Profile updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-color)] mb-2 tracking-tight">My Profile</h2>
        <p className="text-[var(--muted-text)]">View your account details and financial snapshot.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-premium p-6 flex flex-col gap-4">
          <h3 className="font-semibold text-lg text-[var(--text-color)]">Account Information</h3>
          <div className="flex items-center gap-4">
            <img src={avatar || suggestions[0]} alt="Current avatar" className="w-20 h-20 rounded-full border-2 border-emerald-500 p-0.5 bg-emerald-100" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <User size={18} className="text-emerald-500" />
                <span className="text-[var(--text-color)] font-medium">{user?.name || 'Student User'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail size={18} className="text-emerald-500" />
                <span className="text-[var(--text-color)] font-medium">{user?.email || 'Not available'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Username"
              className="w-full bg-[var(--search-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 outline-none text-[var(--text-color)]"
            />
            <input
              type="url"
              value={avatar}
              onChange={(event) => setAvatar(event.target.value)}
              placeholder="Avatar URL (optional)"
              className="w-full bg-[var(--search-bg)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 outline-none text-[var(--text-color)]"
            />
            <button className="btn-primary w-full" disabled={authLoading}>
              {authLoading ? 'Saving...' : 'Save Profile'}
            </button>
            {message && <p className="text-xs text-emerald-500">{message}</p>}
          </form>
        </div>

        <div className="card-premium p-6 flex flex-col gap-5">
          <h3 className="font-semibold text-lg text-[var(--text-color)]">Quick Financial Snapshot</h3>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Wallet size={16} className="text-emerald-500" /> Monthly Budget</span>
            <span className="font-semibold">Rs {monthlyBudget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><Target size={16} className="text-emerald-500" /> Active Goals</span>
            <span className="font-semibold">{goals.length}</span>
          </div>
            <div className="flex items-center justify-between text-sm">
              <span>This Month Spending</span>
              <span className="font-semibold">Rs {metrics.expenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium p-6 mt-6">
        <h3 className="font-semibold text-lg text-[var(--text-color)] mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-500" />
          Suggested Avatars
        </h3>
        <p className="text-sm text-[var(--muted-text)] mb-4">Pick any suggested avatar for your profile.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {suggestions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setAvatar(option)}
              className={`rounded-full p-0.5 border-2 transition ${avatar === option ? 'border-emerald-500' : 'border-transparent hover:border-emerald-300'}`}
            >
              <img src={option} alt="Avatar suggestion" className="w-14 h-14 rounded-full bg-emerald-50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
