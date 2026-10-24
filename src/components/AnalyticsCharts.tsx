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
          amt > dailyAllowance ? 'rgba(245, 158, 11, 0.85)' : 'rgba(6, 182, 212, 0.85)'
        ),
        borderColor: last7DaysSpent.map((amt) =>
          amt > dailyAllowance ? '#d97706' : '#0891b2'
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
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#0284c7',
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
        grid: { color: 'rgba(226, 232, 240, 0.8)' },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.8)' },
        ticks: {
          color: '#64748b',
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
          borderColor: '#ffffff',
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
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        titleColor: '#0f172a',
        bodyColor: '#0284c7',
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
      { label: 'Morning Chai & Travel (6 AM - 12 PM)', amount: morning, pct: Math.round((morning / total) * 100), color: 'bg-cyan-500' },
      { label: 'Afternoon Lunch & Coffee (12 PM - 5 PM)', amount: afternoon, pct: Math.round((afternoon / total) * 100), color: 'bg-teal-500' },
      { label: 'Evening Dinner & Grocery (5 PM - 10:30 PM)', amount: evening, pct: Math.round((evening / total) * 100), color: 'bg-sky-500' },
      { label: 'Midnight Cravings & Delivery (10:30 PM - 5 AM)', amount: lateNight, pct: Math.round((lateNight / total) * 100), color: 'bg-amber-500', isCravings: true },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* 7-Day Allowance Pacing Chart */}
      <div className="lg:col-span-7 rounded-3xl glass-panel-elevated glass-specular p-6 border border-slate-200 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-[#0284C7] shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Daily Allowance Burn (Past 7 Days)</h3>
                <p className="text-xs text-slate-500">
                  Target limit: <span className="text-cyan-700 font-bold">{formatINR(dailyAllowance)}/day</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Under Budget
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Overspent
              </span>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Quick Context Callout */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Benchmark: Salary divided by 30 days</span>
          <span className="text-[#0284C7] font-semibold font-mono">
            Cyan bars rollover unspent funds to savings
          </span>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      <div className="lg:col-span-5 rounded-3xl glass-panel-elevated glass-specular p-6 border border-slate-200 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 shadow-xs">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Spend by Category</h3>
                <p className="text-xs text-slate-500">Auto-tagged via UPI & Statements</p>
              </div>
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="relative h-44 mt-4 flex items-center justify-center">
            {topCategoryList.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-xs text-slate-400">No transactions recorded yet</p>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400">Top Spend</span>
              <span className="text-base font-bold text-[#0F172A]">
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
                  <span className="text-slate-700 font-medium truncate">{c.meta.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 font-mono">{c.percentage}%</span>
                  <span className="text-[#0F172A] font-bold font-mono">{formatINR(c.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width: Time of Day Impulsive Spending Strip */}
      <div className="lg:col-span-12 rounded-3xl glass-panel glass-specular p-6 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-[#0F172A]">
              Hourly Burn Windows: When Does Your Salary Leak?
            </h4>
          </div>
          <span className="text-xs text-amber-700 font-bold">
            Midnight orders trigger automatic impulse flags
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeBuckets.map((bucket, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition hover:scale-[1.01] ${
                bucket.isCravings
                  ? 'bg-amber-50 border-amber-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700 text-[11px] truncate font-semibold">{bucket.label}</span>
                {bucket.isCravings && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                    Impulse Zone
                  </span>
                )}
              </div>
              <div className="text-lg font-bold font-mono text-[#0F172A] mt-1">
                {formatINR(bucket.amount)}
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${bucket.color}`}
                  style={{ width: `${bucket.pct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 text-right">{bucket.pct}% of total</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
