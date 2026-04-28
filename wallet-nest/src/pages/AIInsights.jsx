import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ChatMentorBox from '../components/ChatMentorBox';
import {
  Sparkles,
  TrendingDown,
  BookOpen,
  Search,
  Activity,
  AlertTriangle,
  Lightbulb,
  PiggyBank,
  Target,
  ShieldAlert,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../hooks/useFinance';
import { useAuth } from '../hooks/useAuth';

const isExpense = (tx) => tx.amount < 0;

function daysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function categoryAdvice(category) {
  const key = (category || '').toLowerCase();
  if (key.includes('food') || key.includes('coffee') || key.includes('dining'))
    return 'Try meal prep 2–3 days a week or a weekly “eating out” cap to trim this without feeling restricted.';
  if (key.includes('shop') || key.includes('retail'))
    return 'Use a 24-hour rule for non-essential purchases and unsubscribe from promo emails to reduce impulse buys.';
  if (key.includes('travel') || key.includes('transport') || key.includes('uber'))
    return 'Batch errands, use student transit passes where available, and compare ride-share vs public transport for recurring trips.';
  if (key.includes('bill') || key.includes('subscri'))
    return 'Audit recurring charges yearly; cancel duplicates and negotiate student plans where possible.';
  if (key.includes('study') || key.includes('academic') || key.includes('book'))
    return 'Split textbook costs with classmates, buy used, or use library reserves before buying new each semester.';
  return 'Track this category weekly—small recurring spends here often add up faster than one-off purchases.';
}

function buildAnalysis(transactions, monthlyBudget, goals, metrics) {
  const expenseTx = transactions.filter(isExpense);
  const now = new Date();
  const dayOfMonth = now.getDate();
  const dim = daysInCurrentMonth();
  const idealSpendSoFar = (monthlyBudget / dim) * dayOfMonth;
  const paceRatio = idealSpendSoFar > 0 ? metrics.expenses / idealSpendSoFar : 0;

  const categoryEntries = Object.entries(metrics.categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = categoryEntries[0];
  const topShare =
    metrics.expenses > 0 && topCategory ? topCategory[1] / metrics.expenses : 0;

  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - 7);
  const recentSpend = expenseTx
    .filter((tx) => new Date(tx.date) >= recentCutoff)
    .reduce((s, tx) => s + Math.abs(tx.amount), 0);

  const alerts = [];
  if (metrics.expenses <= 0 && expenseTx.length === 0) {
    alerts.push({
      id: 'no-data',
      severity: 'info',
      title: 'Not enough expense data yet',
      detail: 'Log a few expenses so we can spot patterns and tailor alerts for you.',
    });
  }
  if (metrics.spentPercent >= 90) {
    alerts.push({
      id: 'budget-critical',
      severity: 'critical',
      title: 'Budget nearly exhausted',
      detail: `You've used about ${metrics.spentPercent}% of your monthly budget. Pause non-essential spending until your next refill or income.`,
    });
  } else if (metrics.spentPercent >= 75) {
    alerts.push({
      id: 'budget-warning',
      severity: 'warning',
      title: 'High budget usage',
      detail: `Around ${metrics.spentPercent}% of your budget is gone. Prioritize needs only for the rest of the month.`,
    });
  }

  if (metrics.predictedMonthEnd < 0 && metrics.expenses > 0) {
    alerts.push({
      id: 'projected-over',
      severity: 'critical',
      title: 'Projected overspend this month',
      detail: `At your current pace you may finish about Rs ${Math.abs(metrics.predictedMonthEnd).toLocaleString()} over budget. Cut discretionary spend or raise the budget if it was set too low.`,
    });
  }

  if (paceRatio >= 1.15 && metrics.expenses > 0 && idealSpendSoFar > 0) {
    alerts.push({
      id: 'pace',
      severity: 'warning',
      title: 'Spending faster than your plan',
      detail: `You've spent more than a straight-line budget would allow by today (~${Math.round(paceRatio * 100)}% of “on-track” spend). Slow down or adjust the plan.`,
    });
  }

  if (topShare >= 0.45 && topCategory) {
    alerts.push({
      id: 'concentration',
      severity: 'info',
      title: 'Spending concentrated in one category',
      detail: `${topCategory[0]} is about ${Math.round(topShare * 100)}% of your spending. Diversifying or capping that category reduces risk if something unexpected hits.`,
    });
  }

  if (recentSpend > metrics.expenses * 0.55 && metrics.expenses > 0 && expenseTx.length >= 3) {
    alerts.push({
      id: 'recent-spike',
      severity: 'info',
      title: 'Most spending happened in the last 7 days',
      detail: `Roughly Rs ${recentSpend.toLocaleString()} in the past week. Check for one-off events vs a new habit forming.`,
    });
  }

  const recommendations = [];

  if (topCategory && metrics.expenses > 0) {
    recommendations.push({
      id: 'top-cat',
      title: `Focus on ${topCategory[0]}`,
      body: `Your largest outflow is ${topCategory[0]} (Rs ${topCategory[1].toLocaleString()}). ${categoryAdvice(topCategory[0])}`,
    });
  }

  if (metrics.income > 0 && metrics.balance < 0) {
    recommendations.push({
      id: 'income-gap',
      title: 'Spending exceeds recorded income',
      body: `Expenses are higher than income logged this period by Rs ${Math.abs(metrics.balance).toLocaleString()}. Either add income sources to the log or reduce spend until cash flow is positive.`,
    });
  } else if (metrics.remaining < monthlyBudget * 0.15 && metrics.remaining >= 0 && monthlyBudget > 0) {
    recommendations.push({
      id: 'buffer',
      title: 'Thin margin until month end',
      body: `Only about Rs ${metrics.remaining.toLocaleString()} left vs budget. Treat that as a hard ceiling and move optional purchases to next month.`,
    });
  }

  if (paceRatio < 0.85 && metrics.expenses > 0 && idealSpendSoFar > 0) {
    recommendations.push({
      id: 'good-pace',
      title: 'You are under your linear pace',
      body: 'Nice pacing—if you keep this rhythm you may finish the month with buffer. Consider moving a small fixed amount to savings or a goal.',
    });
  }

  categoryEntries.slice(0, 3).forEach(([name], idx) => {
    if (idx === 0) return;
    recommendations.push({
      id: `cat-${name}`,
      title: `Also watch ${name}`,
      body: categoryAdvice(name),
    });
  });

  const savings = [];
  const dailyHeadroom = Math.max(0, metrics.remaining / Math.max(1, dim - dayOfMonth + 1));

  if (metrics.remaining > 0 && monthlyBudget > 0) {
    const suggestWeekly = Math.round(Math.min(metrics.remaining * 0.15, dailyHeadroom * 7));
    if (suggestWeekly >= 50) {
      savings.push({
        id: 'auto-weekly',
        title: 'Automate a small weekly transfer',
        body: `Based on remaining budget, try setting aside Rs ${suggestWeekly.toLocaleString()} per week into a separate savings pocket or goal until month end.`,
      });
    }
  }

  goals.forEach((goal) => {
    const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
    if (pct < 100 && goal.target > goal.saved) {
      const gap = goal.target - goal.saved;
      const weeksLeft = Math.max(1, dim - dayOfMonth);
      const weekly = Math.ceil(gap / weeksLeft);
      if (weekly > 0 && weekly < gap) {
        savings.push({
          id: `goal-${goal.id}`,
          title: `Accelerate “${goal.title}”`,
          body: `You need Rs ${gap.toLocaleString()} more to hit the target. About Rs ${weekly.toLocaleString()} per week for the rest of the month would close the gap on schedule.`,
        });
      }
    }
  });

  if (metrics.expenses > 0 && topCategory) {
    const trim = Math.round(topCategory[1] * 0.1);
    if (trim >= 100) {
      savings.push({
        id: 'trim-top',
        title: 'Savings from your top category',
        body: `Cutting just 10% from ${topCategory[0]} (≈ Rs ${trim.toLocaleString()}/month) frees cash for emergencies or goals without a huge lifestyle change.`,
      });
    }
  }

  if (savings.length === 0 && metrics.remaining > 200) {
    savings.push({
      id: 'default-save',
      title: 'Build a mini emergency buffer',
      body: `You still show Rs ${metrics.remaining.toLocaleString()} under budget. Even Rs 500–1000 locked away weekly builds habit before you increase discretionary spend.`,
    });
  }

  return {
    categoryEntries,
    topCategory,
    paceRatio,
    idealSpendSoFar,
    dayOfMonth,
    dim,
    recentSpend,
    alerts,
    recommendations,
    savings,
  };
}

function severityStyles(severity) {
  if (severity === 'critical')
    return {
      border: 'border-red-200 dark:border-red-900/50',
      bg: 'bg-red-50 dark:bg-red-950/30',
      icon: 'text-red-600 dark:text-red-400',
      Icon: ShieldAlert,
    };
  if (severity === 'warning')
    return {
      border: 'border-amber-200 dark:border-amber-900/50',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'text-amber-600 dark:text-amber-400',
      Icon: AlertTriangle,
    };
  return {
    border: 'border-sky-200 dark:border-sky-900/50',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    icon: 'text-sky-600 dark:text-sky-400',
    Icon: Activity,
  };
}

export default function AIInsights() {
  const { metrics, transactions, goals, monthlyBudget } = useFinance();
  const { user } = useAuth();

  const analysis = useMemo(
    () => buildAnalysis(transactions, monthlyBudget, goals, metrics),
    [transactions, monthlyBudget, goals, metrics],
  );

  const displayName = (user?.name || 'there').split(' ')[0];
  const burnRate = metrics.spentPercent;
  const survivalStatus =
    burnRate > 85 ? 'Needs attention' : burnRate > 60 ? 'Moderate' : 'On track';
  const topCategories = analysis.categoryEntries;

  const personalizedIntro = useMemo(() => {
    if (metrics.expenses <= 0) {
      return `${displayName}, once you log expenses, this page will highlight risks, habits, and concrete savings moves tailored to your data.`;
    }
    if (analysis.topCategory) {
      return `${displayName}, your spending is led by ${analysis.topCategory[0]}—we’ve ranked alerts and ideas below so you can act in minutes, not hours.`;
    }
    return `${displayName}, here is a snapshot of your money patterns and the highest-impact moves for the rest of this month.`;
  }, [displayName, metrics.expenses, analysis.topCategory]);

  const recommendationsWithGreeting = useMemo(() => {
    const extra =
      metrics.expenses > 0
        ? [
            {
              id: 'greeting-pace',
              title: 'Your month at a glance',
              body: `By day ${analysis.dayOfMonth} of ${analysis.dim}, you’ve spent Rs ${metrics.expenses.toLocaleString()} against a Rs ${monthlyBudget.toLocaleString()} budget—${metrics.spentPercent}% utilized.`,
            },
          ]
        : [];
    return [...extra, ...analysis.recommendations].slice(0, 8);
  }, [analysis, metrics.expenses, metrics.spentPercent, monthlyBudget]);

  return (
    <div className="max-w-6xl mx-auto animation-fade-in flex flex-col gap-6 pb-8">
      <div className="flex-shrink-0">
        <h2 className="text-3xl font-bold text-[var(--text-color)] flex items-center tracking-tight">
          <Sparkles className="mr-3 text-emerald-500" size={28} />
          AI Mentor Insights
        </h2>
        <p className="text-gray-500 mt-1 max-w-2xl">{personalizedIntro}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-blue-500" size={20} />
            <h3 className="font-semibold text-[var(--text-color)] tracking-tight">Where money goes</h3>
          </div>
          <div className="space-y-3">
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-500">No expense categories yet—add expenses to see a breakdown.</p>
            ) : (
              topCategories.slice(0, 4).map(([title, amount]) => (
                <div key={title} className="flex justify-between text-sm gap-2">
                  <span className="text-gray-500 dark:text-gray-400 truncate">{title}</span>
                  <span className="font-medium text-[var(--text-color)] shrink-0">
                    Rs {amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-purple-500" size={20} />
            <h3 className="font-semibold text-[var(--text-color)] tracking-tight">Budget pace</h3>
          </div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Used vs budget</span>
            <span className="font-bold text-[var(--text-color)]">{burnRate}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                burnRate > 85 ? 'bg-red-500' : burnRate > 60 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(burnRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Status: <span className="font-semibold text-[var(--text-color)]">{survivalStatus}</span>
          </p>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <Calendar size={12} />
            Day {analysis.dayOfMonth} of {analysis.dim} — ideal spend so far ≈ Rs{' '}
            {Math.round(analysis.idealSpendSoFar).toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-6 shadow-md text-white transform hover:-translate-y-1 transition-transform duration-300">
          <TrendingDown className="mb-4 opacity-80" size={24} />
          <h3 className="font-bold text-lg mb-2">Overspending radar</h3>
          <p className="text-red-100 text-sm leading-relaxed">
            {analysis.topCategory && metrics.expenses > 0 ? (
              <>
                Largest category: <strong>{analysis.topCategory[0]}</strong> (Rs{' '}
                {analysis.topCategory[1].toLocaleString()}).{' '}
                {burnRate >= 75
                  ? 'You are in the danger zone for budget burn—cap this category first.'
                  : 'Keep an eye here; it is your biggest lever if spend creeps up.'}
              </>
            ) : (
              'Log expenses to get category-level overspending alerts and tailored caps.'
            )}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-md text-white transform hover:-translate-y-1 transition-transform duration-300">
          <BookOpen className="mb-4 opacity-80" size={24} />
          <h3 className="font-bold text-lg mb-2">Month-end outlook</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            Predicted budget position:{' '}
            <strong>Rs {metrics.predictedMonthEnd.toLocaleString()}</strong>
            {metrics.predictedMonthEnd < 0
              ? ' — tighten discretionary spend or revisit your budget.'
              : metrics.predictedMonthEnd < monthlyBudget * 0.2
                ? ' — tight but workable if you hold steady.'
                : ' — room to steer extra cash toward a goal.'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      <section>
        <h3 className="font-semibold text-lg text-[var(--text-color)] mb-3 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          Alerts &amp; flags
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.alerts.map((alert) => {
            const s = severityStyles(alert.severity);
            const Icon = s.Icon;
            return (
              <div
                key={alert.id}
                className={`rounded-2xl border p-4 ${s.border} ${s.bg} flex gap-3`}
              >
                <Icon className={`shrink-0 mt-0.5 ${s.icon}`} size={22} />
                <div>
                  <p className="font-semibold text-[var(--text-color)] text-sm">{alert.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    {alert.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <section className="card-premium p-6">
          <h3 className="font-semibold text-lg text-[var(--text-color)] mb-4 flex items-center gap-2">
            <Lightbulb className="text-emerald-500" size={20} />
            Personalized recommendations
          </h3>
          <ul className="space-y-4">
            {recommendationsWithGreeting.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm border-b border-[var(--border-color)] last:border-0 pb-4 last:pb-0">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-[var(--text-color)]">{item.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
            {recommendationsWithGreeting.length === 0 && (
              <p className="text-sm text-gray-500">Recommendations will appear as your spending profile grows.</p>
            )}
          </ul>
        </section>

        {/* Savings opportunities */}
        <section className="card-premium p-6">
          <h3 className="font-semibold text-lg text-[var(--text-color)] mb-4 flex items-center gap-2">
            <PiggyBank className="text-violet-500" size={20} />
            Savings opportunities
          </h3>
          <ul className="space-y-4">
            {analysis.savings.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm border-b border-[var(--border-color)] last:border-0 pb-4 last:pb-0">
                <Target className="text-violet-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-medium text-[var(--text-color)]">{item.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-2">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
          <h3 className="font-semibold text-xl text-[var(--text-color)]">
            Chat with your Financial Mentor
          </h3>
          <Link
            to="/mentor"
            className="btn-primary text-sm py-2.5 px-5 w-fit shrink-0 shadow-emerald-500/20"
          >
            Open full AI Mentor chat
          </Link>
        </div>
        <div className="h-[400px]">
          <ChatMentorBox />
        </div>
      </div>
    </div>
  );
}
