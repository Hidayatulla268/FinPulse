'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Coins,
  Flame,
  HelpCircle,
  IndianRupee,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { OVERSPENT_RELATABLE_HERO } from '@/lib/relatableQuotes';

interface DailyAllowanceCardProps {
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
  onOpenNightlyReport: () => void;
}

export const DailyAllowanceCard: React.FC<DailyAllowanceCardProps> = ({
  onOpenQuickAdd,
  onOpenSettings,
  onOpenNightlyReport,
}) => {
  const {
    profile,
    transactions,
    dailyAllowance,
    todayStr,
    todaySpent,
    todayRemaining,
    todayPacePercent,
    hourlyBudgetRemaining,
    isOverspentToday,
    impulseSpentToday,
  } = useFinance();

  // Progress Bar styling based on status with Mint Cyan & Ice Blue
  const getPaceColor = () => {
    if (todayPacePercent > 100) return 'from-amber-500 via-orange-500 to-red-500';
    if (todayPacePercent > 80) return 'from-cyan-500 via-teal-400 to-amber-500';
    if (todayPacePercent > 50) return 'from-cyan-500 to-teal-400';
    return 'from-cyan-500 to-teal-400';
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 transition-all duration-300 border border-slate-200 shadow-xl">
      {/* Background radial glow */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isOverspentToday
            ? 'bg-amber-500/10'
            : todayPacePercent > 75
            ? 'bg-cyan-500/10'
            : 'bg-teal-500/10'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-cyan-600/8 pointer-events-none" />

      {/* Overspent Relatable Banner in Soft Amber */}
      {isOverspentToday && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 animate-subtle-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Daily Budget Exceeded
              </p>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight italic">
                “{OVERSPENT_RELATABLE_HERO}”
              </h3>
              <p className="text-xs text-amber-800/80 mt-0.5">
                You’ve burned {formatINR(Math.abs(todayRemaining))} past today’s allowance limit.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNightlyReport}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition shadow-sm whitespace-nowrap cursor-pointer"
          >
            Preview 9 PM Report
          </button>
        </div>
      )}

      {/* Top Meta Header: Formula & Live Pacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-lg">
              Real-Time Daily Allowance
            </span>
            <span className="text-xs text-slate-500">
              Formula: {profile.calcMethod === 'net_discretionary' ? 'Net Pool' : 'Salary'} / 30
            </span>
          </div>
          <h2 className="text-sm text-slate-600 mt-1.5">
            Monthly Salary:{' '}
            <button
              onClick={onOpenSettings}
              className="font-bold text-[#0F172A] underline decoration-dotted decoration-cyan-400 hover:text-[#0284C7] transition cursor-pointer"
              title="Click to edit income and fixed commitments"
            >
              {formatINR(profile.monthlySalary)}
            </button>
            <span className="text-slate-400 mx-2">→</span>
            Daily Limit:{' '}
            <span className="font-extrabold text-cyan-700">{formatINR(dailyAllowance)}/day</span>
          </h2>
        </div>

        {/* Hourly Burn Rate Meter in Glass Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-pill self-start sm:self-auto border-slate-200">
          <Clock className="w-4 h-4 text-[#0284C7] shrink-0 animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-500 tracking-wide font-medium">Pace Left</div>
            <div className="text-xs font-bold text-[#0284C7] font-mono">
              {todayRemaining > 0 ? `${formatINR(hourlyBudgetRemaining)} / hour` : '₹0 / hr (Exceeded)'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Section */}
      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Huge Remaining Running Counter in Mint Cyan & Ice Blue */}
        <div className="lg:col-span-7">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span>Remaining Today</span>
            {todayRemaining >= 0 ? (
              <span className="inline-flex items-center gap-1 text-teal-700 text-[11px] font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-teal-600" /> Safe Zone
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 text-[11px] font-bold bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 text-amber-600" /> Overspent
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <div
              className={`text-4xl sm:text-6xl font-black tracking-tight font-mono transition-colors duration-300 ${
                isOverspentToday
                  ? 'text-red-600'
                  : todayPacePercent > 80
                  ? 'text-amber-600'
                  : 'text-cyan-700'
              }`}
            >
              {todayRemaining >= 0 ? formatINR(todayRemaining) : `-${formatINR(Math.abs(todayRemaining))}`}
            </div>
            <span className="text-sm sm:text-base text-slate-500 font-normal">
              left of <span className="text-[#0284C7] font-semibold">{formatINR(dailyAllowance)}</span>
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-2">
            {todayRemaining >= 0
              ? `You’ve spent ${formatINR(todaySpent)} today (${todayPacePercent}% of daily budget). Keep it under limit till 11:59 PM to save ${formatINR(todayRemaining)}!`
              : `Total spent today: ${formatINR(todaySpent)}. You’re over by ${formatINR(Math.abs(todayRemaining))}.`}
          </p>

          {/* Progress Bar in Mint Cyan to Teal Gradient */}
          <div className="mt-5">
            <div className="flex justify-between items-center text-xs mb-1.5 text-slate-500">
              <span>Today&apos;s Burn: <strong className="text-[#0F172A] font-bold">{formatINR(todaySpent)}</strong></span>
              <span className="font-mono font-bold text-cyan-700">{todayPacePercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getPaceColor()} transition-all duration-500 shadow-xs`}
                style={{ width: `${Math.min(100, todayPacePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Mini Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Today Spent Card */}
          <div className="p-4 rounded-2xl glass-panel glass-specular hover:scale-[1.02] transition border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-slate-700">Spent Today</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#0F172A] mt-1">
              {formatINR(todaySpent)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {transactions.filter((t) => t.date === todayStr).length} transactions
            </div>
          </div>

          {/* Impulse Spend Card */}
          <div className="p-4 rounded-2xl glass-panel glass-specular hover:scale-[1.02] transition border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-medium text-amber-700">Impulse Buys</span>
              <Flame className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-600 mt-1">
              {formatINR(impulseSpentToday)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {impulseSpentToday > 0 ? 'Late night / cravings' : 'Zero impulse buys 🎉'}
            </div>
          </div>

          {/* Monthly Savings Goal Card with Glass specular */}
          <div className="col-span-2 p-4 rounded-2xl glass-panel-elevated glass-specular flex items-center justify-between gap-4 border border-slate-200">
            <div>
              <div className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>{profile.savingsGoal.title}</span>
              </div>
              <div className="text-sm font-bold text-[#0F172A] mt-0.5">
                <span className="text-cyan-700">{formatINR(profile.savingsGoal.currentSaved)}</span> / {formatINR(profile.savingsGoal.targetAmount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Unspent daily allowance auto-credited nightly
              </div>
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2 rounded-xl btn-primary-mint text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Quick</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
