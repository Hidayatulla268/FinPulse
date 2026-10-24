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

  // Progress Bar styling based on status with Sky Blue & Marigold
  const getPaceColor = () => {
    if (todayPacePercent > 100) return 'from-[#ff9900] via-orange-500 to-red-600';
    if (todayPacePercent > 80) return 'from-sky-400 via-[#ff9900] to-orange-500';
    if (todayPacePercent > 50) return 'from-sky-500 via-sky-400 to-[#ff9900]';
    return 'from-sky-400 to-sky-500';
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 transition-all duration-300 glow-sky-subtle">
      {/* Background radial glow in Sky Blue and Marigold */}
      <div
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isOverspentToday
            ? 'bg-[#ff9900]/25'
            : todayPacePercent > 75
            ? 'bg-[#ff9900]/15'
            : 'bg-sky-500/15'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl bg-sky-600/15 pointer-events-none" />

      {/* Overspent Relatable Banner in Marigold & Red */}
      {isOverspentToday && (
        <div className="mb-6 p-4 rounded-2xl glass-panel-marigold glass-specular border border-[#ff9900]/50 shadow-xl shadow-[#ff9900]/10 animate-subtle-pulse flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#ff9900]/20 border border-[#ff9900]/40 text-[#ff9900] shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#ff9900]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#ff9900]">
                Daily Budget Exceeded
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight italic">
                “{OVERSPENT_RELATABLE_HERO}”
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5">
                You’ve burned {formatINR(Math.abs(todayRemaining))} past today’s allowance limit.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNightlyReport}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff9900] to-orange-500 hover:brightness-110 text-black font-extrabold text-xs transition shadow-lg shadow-[#ff9900]/25 whitespace-nowrap cursor-pointer"
          >
            Preview 9 PM Report
          </button>
        </div>
      )}

      {/* Top Meta Header: Formula & Live Pacing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-sky-500/15">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 glass-pill px-2.5 py-0.5 rounded-lg border-sky-500/35">
              Real-Time Daily Allowance
            </span>
            <span className="text-xs text-sky-200/60">
              Formula: {profile.calcMethod === 'net_discretionary' ? 'Net Pool' : 'Salary'} / 30
            </span>
          </div>
          <h2 className="text-sm text-gray-300 mt-1.5">
            Monthly Salary:{' '}
            <button
              onClick={onOpenSettings}
              className="font-bold text-white underline decoration-dotted decoration-sky-400/60 hover:text-sky-300 transition"
              title="Click to edit income and fixed commitments"
            >
              {formatINR(profile.monthlySalary)}
            </button>
            <span className="text-gray-600 mx-2">→</span>
            Daily Limit:{' '}
            <span className="font-extrabold text-[#ff9900]">{formatINR(dailyAllowance)}/day</span>
          </h2>
        </div>

        {/* Hourly Burn Rate Meter in Glass Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass-pill self-start sm:self-auto border-sky-500/30">
          <Clock className="w-4 h-4 text-sky-400 shrink-0 animate-pulse" />
          <div className="text-right">
            <div className="text-[10px] uppercase text-sky-200/50 tracking-wide font-medium">Pace Left</div>
            <div className="text-xs font-bold text-sky-300 font-mono">
              {todayRemaining > 0 ? `${formatINR(hourlyBudgetRemaining)} / hour` : '₹0 / hr (Exceeded)'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Section */}
      <div className="py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Huge Remaining Running Counter in Marigold & Sky Blue */}
        <div className="lg:col-span-7">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-sky-200/80">Remaining Today</span>
            {todayRemaining >= 0 ? (
              <span className="inline-flex items-center gap-1 text-sky-400 text-[11px] font-bold glass-pill px-2 py-0.5 rounded-full border border-sky-500/30">
                <ShieldCheck className="w-3 h-3 text-sky-400" /> Safe Zone
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#ff9900] text-[11px] font-bold glass-pill px-2 py-0.5 rounded-full border border-[#ff9900]/40">
                <Flame className="w-3 h-3 text-[#ff9900]" /> Overspent
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <div
              className={`text-5xl sm:text-6xl font-black tracking-tight font-mono transition-colors duration-300 ${
                isOverspentToday
                  ? 'text-red-400'
                  : todayPacePercent > 80
                  ? 'text-[#ff9900]'
                  : 'text-[#ff9900]'
              }`}
            >
              {todayRemaining >= 0 ? formatINR(todayRemaining) : `-${formatINR(Math.abs(todayRemaining))}`}
            </div>
            <span className="text-sm sm:text-base text-gray-400 font-normal">
              left of <span className="text-sky-300 font-semibold">{formatINR(dailyAllowance)}</span>
            </span>
          </div>

          <p className="text-xs text-sky-200/70 mt-2">
            {todayRemaining >= 0
              ? `You’ve spent ${formatINR(todaySpent)} today (${todayPacePercent}% of daily budget). Keep it under limit till 11:59 PM to save ${formatINR(todayRemaining)}!`
              : `Total spent today: ${formatINR(todaySpent)}. You’re over by ${formatINR(Math.abs(todayRemaining))}.`}
          </p>

          {/* Progress Bar in Sky Blue to Marigold Gradient */}
          <div className="mt-5">
            <div className="flex justify-between items-center text-xs mb-1.5 text-gray-400">
              <span className="text-gray-300">Today&apos;s Burn: <strong className="text-sky-400">{formatINR(todaySpent)}</strong></span>
              <span className="font-mono font-bold text-[#ff9900]">{todayPacePercent}%</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-sky-500/25 backdrop-blur-sm">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getPaceColor()} transition-all duration-500 shadow-sm`}
                style={{ width: `${Math.min(100, todayPacePercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Mini Cards in Sky Blue & Marigold */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          {/* Today Spent Card */}
          <div className="p-4 rounded-2xl glass-panel glass-specular hover:scale-[1.02] transition">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-medium text-sky-200">Spent Today</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {formatINR(todaySpent)}
            </div>
            <div className="text-[11px] text-sky-200/50 mt-0.5">
              Across {transactions.filter((t) => t.date === todayStr).length} transactions
            </div>
          </div>

          {/* Impulse Spend Card */}
          <div className="p-4 rounded-2xl glass-panel-marigold glass-specular hover:scale-[1.02] transition">
            <div className="flex items-center justify-between text-gray-400 text-xs">
              <span className="font-medium text-amber-200">Impulse Buys</span>
              <Flame className="w-3.5 h-3.5 text-[#ff9900]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#ff9900] mt-1">
              {formatINR(impulseSpentToday)}
            </div>
            <div className="text-[11px] text-amber-200/60 mt-0.5">
              {impulseSpentToday > 0 ? 'Late night / cravings' : 'Zero impulse buys 🎉'}
            </div>
          </div>

          {/* Monthly Savings Goal Card with Glass specular */}
          <div className="col-span-2 p-4 rounded-2xl glass-panel-elevated glass-specular flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
                <span>{profile.savingsGoal.title}</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                <span className="text-[#ff9900]">{formatINR(profile.savingsGoal.currentSaved)}</span> / {formatINR(profile.savingsGoal.targetAmount)}
              </div>
              <div className="text-[11px] text-sky-200/50 mt-0.5">
                Unspent daily allowance auto-credited nightly
              </div>
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition cursor-pointer shrink-0"
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
