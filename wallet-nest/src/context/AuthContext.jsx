import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthCtx';
import { supabase } from '../lib/supabaseClient';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/notionists/svg?seed=WalletNest&backgroundColor=10b981';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true until session is resolved

  // ------------------------------------------------------------------
  // Session bootstrap — runs once on mount.
  // Restores an existing Supabase session (survives page reload).
  // ------------------------------------------------------------------
  useEffect(() => {
    // Get the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setAuthLoading(false);
    });

    // Listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? mapUser(session.user) : null);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // Map Supabase user object to our app's user shape.
  // ------------------------------------------------------------------
  function mapUser(supaUser) {
    const meta = supaUser.user_metadata || {};
    return {
      id: supaUser.id,
      email: supaUser.email,
      name: meta.name || meta.full_name || supaUser.email?.split('@')[0] || 'Student',
      avatar:
        meta.avatar ||
        `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(meta.name || supaUser.email || 'Student')}&backgroundColor=10b981`,
    };
  }

  // ------------------------------------------------------------------
  // Auth actions
  // ------------------------------------------------------------------
  const signup = useCallback(async ({ name, email, password }) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=10b981`,
          },
        },
      });

      if (error) return { ok: false, message: error.message };

      // If email confirmation is disabled, session is returned immediately
      if (data.session) {
        setUser(mapUser(data.user));
      }

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message || 'Signup failed.' };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) return { ok: false, message: error.message };
      setUser(mapUser(data.user));
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message || 'Login failed.' };
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async ({ name, avatar }) => {
      if (!user) return { ok: false, message: 'No active session.' };
      const trimmedName = name.trim();
      if (!trimmedName) return { ok: false, message: 'Name cannot be empty.' };

      setAuthLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { name: trimmedName, avatar: avatar || DEFAULT_AVATAR },
        });
        if (error) return { ok: false, message: error.message };

        setUser((prev) => ({
          ...prev,
          name: trimmedName,
          avatar: avatar || DEFAULT_AVATAR,
        }));
        return { ok: true };
      } catch (err) {
        return { ok: false, message: err.message || 'Profile update failed.' };
      } finally {
        setAuthLoading(false);
      }
    },
    [user],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // ------------------------------------------------------------------
  // Provider value — same shape as the old context so all consumers
  // (Login, Signup, Profile, Navbar, ProtectedRoute) keep working.
  // ------------------------------------------------------------------
  const value = {
    user,
    token: null, // no longer used; kept for interface compat
    isAuthenticated: Boolean(user),
    authLoading,
    signup,
    login,
    updateProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
