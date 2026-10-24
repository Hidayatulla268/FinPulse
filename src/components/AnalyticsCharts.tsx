'use client';

import React, { useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  Calendar,
  Flame,
  PieChart as PieIcon,
  TrendingDown,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { CATEGORIES, ExpenseCategory } from '@/types/finance';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsCharts: React.FC = () => {
  const { transactions, dailyAllowance, todayStr } = useFinance();

  // 1. Prepare 7-Day Bar Chart data
  const { last7DaysLabels, last7DaysSpent, last7DaysLimits } = useMemo(() => {
    const labels: string[] = [];
    const spent: number[] = [];
    const limits: number[] = [];

    const baseDate = todayStr ? new Date(`${todayStr}T12:00:00`) : new Date('2026-10-22T12:00:00');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Format label e.g. "Thu 22"
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Yest.' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      labels.push(dayName);

      const dayTotal = transactions
        .filter((t) => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      spent.push(dayTotal);
      limits.push(dailyAllowance);
    }

    return { last7DaysLabels: labels, last7DaysSpent: spent, last7DaysLimits: limits };
  }, [transactions, dailyAllowance]);

  const barChartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Spent (₹)',
        data: last7DaysSpent,
        backgroundColor: last7DaysSpent.map((amt) =>
          amt > dailyAllowance ? 'rgba(255, 153, 0, 0.85)' : 'rgba(56, 189, 248, 0.8)'
        ),
        borderColor: last7DaysSpent.map((amt) =>
          amt > dailyAllowance ? '#ff9900' : '#38bdf8'
        ),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#000000',
        borderColor: 'rgba(56, 189, 248, 0.4)',
        borderWidth: 1,
        titleColor: '#38bdf8',
        bodyColor: '#ff9900',
        callbacks: {
          label: (context: { raw: unknown }) => {
            const val = Number(context.raw);
            const status = val > dailyAllowance ? `(Over by ${formatINR(val - dailyAllowance)})` : `(Saved ${formatINR(dailyAllowance - val)})`;
            return `Spent: ${formatINR(val)} ${status}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 },
          callback: (value: string | number) => `₹${value}`,
        },
      },
    },
  };

  // 2. Prepare Category Doughnut Data
  const { doughnutData, topCategoryList } = useMemo(() => {
    const categoryTotals: Record<ExpenseCategory, number> = {
      food: 0,
      groceries: 0,
      shopping: 0,
      commute: 0,
      utilities: 0,
      subscriptions: 0,
      random_upi: 0,
      health: 0,
      entertainment: 0,
    };

    let totalAll = 0;
    for (const t of transactions) {
      if (categoryTotals[t.category] !== undefined) {
        categoryTotals[t.category] += t.amount;
        totalAll += t.amount;
      }
    }

    const sortedCategories = Object.entries(categoryTotals)
      .map(([cat, total]) => ({
        category: cat as ExpenseCategory,
        total,
        meta: CATEGORIES[cat as ExpenseCategory],
        percentage: totalAll > 0 ? Math.round((total / totalAll) * 100) : 0,
      }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    const chartConfig = {
      labels: sortedCategories.map((c) => c.meta.label),
      datasets: [
        {
          data: sortedCategories.map((c) => c.total),
          backgroundColor: sortedCategories.map((c) => c.meta.color),
          borderColor: '#090d16',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };

    return { doughnutData: chartConfig, topCategoryList: sortedCategories };
  }, [transactions]);

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: { raw: unknown; label: string }) => {
            return ` ${context.label}: ${formatINR(Number(context.raw))}`;
          },
        },
      },
    },
    cutout: '68%',
  };

  // 3. Time-of-day spend analysis (Late night cravings check)
  const timeBuckets = useMemo(() => {
    let morning = 0; // 6:00 - 12:00
    let afternoon = 0; // 12:00 - 17:00
    let evening = 0; // 17:00 - 22:30
    let lateNight = 0; // 22:30 - 05:59

    for (const t of transactions) {
      const hour = parseInt(t.time.split(':')[0], 10) || 12;
      const min = parseInt(t.time.split(':')[1], 10) || 0;
      const totalMin = hour * 60 + min;

      if (totalMin >= 6 * 60 && totalMin < 12 * 60) {
        morning += t.amount;
      } else if (totalMin >= 12 * 60 && totalMin < 17 * 60) {
        afternoon += t.amount;
      } else if (totalMin >= 17 * 60 && totalMin < 22 * 60 + 30) {
        evening += t.amount;
      } else {
        lateNight += t.amount;
      }
    }

    const total = morning + afternoon + evening + lateNight || 1;
    return [
      { label: 'Morning Chai & Travel (6 AM - 12 PM)', amount: morning, pct: Math.round((morning / total) * 100), color: 'bg-sky-400' },
      { label: 'Afternoon Lunch & Coffee (12 PM - 5 PM)', amount: afternoon, pct: Math.round((afternoon / total) * 100), color: 'bg-sky-500' },
      { label: 'Evening Dinner & Grocery (5 PM - 10:30 PM)', amount: evening, pct: Math.round((evening / total) * 100), color: 'bg-[#ff9900]' },
      { label: 'Midnight Cravings & Delivery (10:30 PM - 5 AM)', amount: lateNight, pct: Math.round((lateNight / total) * 100), color: 'bg-orange-500', isCravings: true },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 7-Day Allowance Pacing Chart */}
      <div className="lg:col-span-7 rounded-3xl glass-panel-elevated glass-specular p-6 border border-sky-500/25 glow-sky-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-inner">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Daily Allowance Burn (Past 7 Days)</h3>
                <p className="text-xs text-sky-200/60">
                  Target limit: <span className="text-[#ff9900] font-semibold">{formatINR(dailyAllowance)}/day</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-200/80">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> Under Budget
              </span>
              <span className="flex items-center gap-1.5 text-amber-200/80">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#ff9900]" /> Overspent
              </span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Quick Context Callout */}
        <div className="mt-4 pt-3 border-t border-sky-500/15 flex items-center justify-between text-xs text-sky-200/60">
          <span>Benchmark: Salary divided by 30 days</span>
          <span className="text-sky-300 font-mono">
            Sky blue bars rollover unspent funds to savings
          </span>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      <div className="lg:col-span-5 rounded-3xl glass-panel-elevated glass-specular p-6 border border-sky-500/25 glow-sky-subtle flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-sky-500/15">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ff9900]/15 border border-[#ff9900]/30 text-[#ff9900] shadow-inner">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Spend by Category</h3>
                <p className="text-xs text-sky-200/60">Auto-tagged via UPI & Statements</p>
              </div>
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="relative h-44 mt-4 flex items-center justify-center">
            {topCategoryList.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-xs text-gray-500">No transactions recorded yet</p>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-sky-200/60">Top Spend</span>
              <span className="text-base font-bold text-white">
                {topCategoryList[0]?.meta.label.split('&')[0] || '₹0'}
              </span>
            </div>
          </div>

          {/* Top 4 Categories List */}
          <div className="mt-4 space-y-2">
            {topCategoryList.slice(0, 4).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: c.meta.color }} />
                  <span className="text-sky-100/90 truncate">{c.meta.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sky-200/60 font-mono">{c.percentage}%</span>
                  <span className="text-white font-semibold font-mono">{formatINR(c.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width: Time of Day Impulsive Spending Strip */}
      <div className="lg:col-span-12 rounded-3xl glass-panel glass-specular p-6 border border-sky-500/25 glow-sky-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#ff9900]" />
            <h4 className="text-sm font-bold text-white">
              Hourly Burn Windows: When Does Your Salary Leak?
            </h4>
          </div>
          <span className="text-xs text-[#ff9900] font-bold">
            Midnight orders trigger automatic impulse flags
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeBuckets.map((bucket, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition hover:scale-[1.02] ${
                bucket.isCravings
                  ? 'glass-panel-marigold glass-specular border-[#ff9900]/45 glow-marigold-subtle'
                  : 'glass-panel glass-specular border-sky-500/25 hover:border-sky-500/40'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-200 text-[11px] truncate font-medium">{bucket.label}</span>
                {bucket.isCravings && (
                  <span className="text-[10px] font-bold text-[#ff9900] glass-pill border border-[#ff9900]/40 px-1.5 py-0.5 rounded">
                    Impulse Zone
                  </span>
                )}
              </div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                {formatINR(bucket.amount)}
              </div>
              <div className="w-full h-1.5 bg-black/50 border border-white/10 rounded-full overflow-hidden mt-2 backdrop-blur-sm">
                <div
                  className={`h-full rounded-full ${bucket.color}`}
                  style={{ width: `${bucket.pct}%` }}
                />
              </div>
              <div className="text-[10px] text-sky-200/50 mt-1 text-right">{bucket.pct}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
