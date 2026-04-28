import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth();

  // While Supabase is restoring a session on page reload, show a
  // loading spinner instead of flashing the login page.
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] gap-4">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <p className="text-sm font-bold tracking-widest uppercase text-gray-400">
          Restoring session…
        </p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
