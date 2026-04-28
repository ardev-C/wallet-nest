import { useEffect, useMemo, useState, useCallback } from 'react';
import { FinanceContext } from './FinanceCtx';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const defaultCategories = [
  { id: 'cat-1', name: 'Food', iconType: 'Utensils', color: 'text-orange-500 bg-orange-100 dark:bg-orange-500/20', isDefault: true },
  { id: 'cat-2', name: 'Travel', iconType: 'Plane', color: 'text-sky-500 bg-sky-100 dark:bg-sky-500/20', isDefault: true },
  { id: 'cat-3', name: 'Shopping', iconType: 'ShoppingBag', color: 'text-pink-500 bg-pink-100 dark:bg-pink-500/20', isDefault: true },
  { id: 'cat-4', name: 'Bills', iconType: 'Receipt', color: 'text-red-500 bg-red-100 dark:bg-red-500/20', isDefault: true },
  { id: 'cat-5', name: 'Study', iconType: 'BookOpen', color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20', isDefault: true },
  { id: 'cat-6', name: 'Other', iconType: 'Box', color: 'text-gray-500 bg-gray-100 dark:bg-gray-500/20', isDefault: true },
];

const isExpense = (tx) => tx.amount < 0;
const isInCurrentMonth = (dateValue) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  return (
    parsed.getFullYear() === now.getFullYear()
    && parsed.getMonth() === now.getMonth()
  );
};

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [monthlyBudget, setMonthlyBudgetLocal] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [categories, setCategoriesLocal] = useState(defaultCategories);
  const [dataLoading, setDataLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!userId) return false;

    setDataLoading(true);

    const [expRes, goalRes, settingsRes] = await Promise.all([
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),
      supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single(),
    ]);

    setTransactions(
      (expRes.data || []).map((r) => ({
        id: r.id,
        title: r.title,
        amount: Number(r.amount),
        category: r.category,
        date: r.date,
        mood: r.mood,
        note: r.note,
      })),
    );

    setGoals(
      (goalRes.data || []).map((r) => ({
        id: r.id,
        title: r.title,
        target: Number(r.target),
        saved: Number(r.saved),
      })),
    );

    if (settingsRes.data) {
      setMonthlyBudgetLocal(Number(settingsRes.data.monthly_budget));
      const storedCats = settingsRes.data.categories;
      if (Array.isArray(storedCats) && storedCats.length > 0) {
        setCategoriesLocal(storedCats);
      }
    } else {
      await supabase.from('user_settings').insert({
        user_id: userId,
        monthly_budget: 0,
        categories: defaultCategories,
      });
    }

    setDataLoading(false);
    return true;
  }, [userId]);

  // ------------------------------------------------------------------
  // Fetch all user data from Supabase on login / mount
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      // User logged out — reset to defaults
      setTransactions([]);
      setGoals([]);
      setMonthlyBudgetLocal(0);
      setCategoriesLocal(defaultCategories);
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchAll() {
      if (cancelled) return;
      await refreshData();
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [userId, refreshData]);

  // ------------------------------------------------------------------
  // Metrics (derived — zero changes from original)
  // ------------------------------------------------------------------
  const metrics = useMemo(() => {
    const monthTransactions = transactions.filter((tx) => isInCurrentMonth(tx.date));
    const monthExpenses = monthTransactions.filter(isExpense);

    const income = monthTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = monthExpenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const remaining = monthlyBudget - expenses;
    const today = new Date();
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const spendingRate = expenses / Math.max(1, dayOfMonth);
    const predictedMonthEnd = monthlyBudget - Math.round(spendingRate * daysInMonth);

    const categoryTotals = monthExpenses
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
        return acc;
      }, {});

    return {
      income,
      expenses,
      remaining,
      balance: income - expenses,
      spentPercent: Math.min(100, Math.round((expenses / Math.max(1, monthlyBudget)) * 100)),
      predictedMonthEnd,
      categoryTotals,
    };
  }, [monthlyBudget, transactions]);

  // ------------------------------------------------------------------
  // CRUD actions — write to Supabase, optimistic local updates
  // ------------------------------------------------------------------
  const addExpense = useCallback(
    async ({ title, note, amount, category, date, mood }) => {
      if (!userId) return false;

      const row = {
        user_id: userId,
        title: title || note || `${category} Expense`,
        amount: -Math.abs(Number(amount)),
        category,
        date,
        mood,
        note,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error('addExpense error:', error.message);
        return false;
      }

      if (!data) return false;

      await refreshData();
      return true;
    },
    [userId, refreshData],
  );

  const addGoal = useCallback(
    async ({ title, target }) => {
      if (!userId) return false;

      const { data, error } = await supabase
        .from('goals')
        .insert({ user_id: userId, title: title.trim(), target: Number(target), saved: 0 })
        .select()
        .single();

      if (error) {
        console.error('addGoal error:', error.message);
        return false;
      }

      setGoals((prev) => [
        ...prev,
        { id: data.id, title: data.title, target: Number(data.target), saved: Number(data.saved) },
      ]);
      return true;
    },
    [userId],
  );

  const removeGoal = useCallback(async (id) => {
    if (!id) return false;
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      console.error('removeGoal error:', error.message);
      return false;
    }
    setGoals((prev) => prev.filter((g) => g.id !== id));
    return true;
  }, []);

  const addContribution = useCallback(async (id, amount) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return false;

    const newSaved = goal.saved + Number(amount);
    const { error } = await supabase
      .from('goals')
      .update({ saved: newSaved })
      .eq('id', id);

    if (error) {
      console.error('addContribution error:', error.message);
      return false;
    }

    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, saved: newSaved } : g)),
    );
    return true;
  }, [goals]);

  const setBudget = useCallback(
    async (nextBudget) => {
      setMonthlyBudgetLocal(nextBudget);
      const { error } = await supabase
        .from('user_settings')
        .update({ monthly_budget: nextBudget })
        .eq('user_id', userId);

      if (error) console.error('setBudget error:', error.message);
    },
    [userId],
  );

  const addCategory = useCallback(
    async (name) => {
      const newCat = {
        id: `cat-${Date.now()}`,
        name: name.trim(),
        iconType: 'Tag',
        color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20',
        isDefault: false,
      };
      const updated = [...categories, newCat];
      setCategoriesLocal(updated);

      const { error } = await supabase
        .from('user_settings')
        .update({ categories: updated })
        .eq('user_id', userId);

      if (error) console.error('addCategory error:', error.message);
    },
    [categories, userId],
  );

  const removeCategory = useCallback(
    async (id) => {
      const updated = categories.filter((c) => c.id !== id);
      setCategoriesLocal(updated);

      const { error } = await supabase
        .from('user_settings')
        .update({ categories: updated })
        .eq('user_id', userId);

      if (error) console.error('removeCategory error:', error.message);
    },
    [categories, userId],
  );

  // ------------------------------------------------------------------
  // Provider value — identical shape to the original
  // ------------------------------------------------------------------
  const value = {
    monthlyBudget,
    setMonthlyBudget: setBudget,
    transactions,
    goals,
    categories,
    metrics,
    addExpense,
    addGoal,
    removeGoal,
    addContribution,
    addCategory,
    removeCategory,
    refreshData,
    dataLoading,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
