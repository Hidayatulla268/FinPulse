'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  BrainCircuit,
  Building2,
  Clock,
  FileSpreadsheet,
  Plus,
  Settings,
  TrendingDown,
  Tv,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenNightlyReport: () => void;
  onOpenCsvUpload: () => void;
  onOpenMerchantInsights: () => void;
  onOpenSubscriptions: () => void;
  onOpenSettings: () => void;
  onOpenAutoBankSync: () => void;
  onOpenBankPassbook: () => void;
  onOpenAiAdvisor?: () => void;
  scrollPercent?: number;
  isScrolled?: boolean;
  isScrolling?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenNightlyReport,
  onOpenCsvUpload,
  onOpenMerchantInsights,
  onOpenSubscriptions,
  onOpenSettings,
  onOpenAutoBankSync,
  onOpenBankPassbook,
  onOpenAiAdvisor,
  scrollPercent = 0,
  isScrolled = false,
  isScrolling = false,
}) => {
  const { profile, dailyAllowance, isOverspentToday, activeAccount, totalLiquidBalance, isRealtimeListening } = useFinance();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isLive9PmTime, setIsLive9PmTime] = useState<boolean>(false);

  // Live IST Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      };
      setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(now));

      const istHours = parseInt(
        new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(now),
        10
      );
      setIsLive9PmTime(istHours === 21);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b transition-all duration-300 ${
      isScrolled
        ? 'border-slate-200 bg-white/95 backdrop-blur-2xl shadow-sm'
        : 'border-slate-200 bg-white/90 backdrop-blur-xl shadow-xs'
    }`}>
      {/* Specular Scroll Progress Bar along header top edge */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-slate-100 overflow-hidden z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-[#0284C7] shadow-sm transition-all duration-75"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Brand with Mint Cyan and Ice Blue */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-cyan-400/40 shadow-sm">
                <Image
                  src="/logo.jpg"
                  alt="Finpulse Logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
                    Finpulse
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full glass-pill border border-slate-200 text-[#0284C7]">
                    Live Banking
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5" suppressHydrationWarning>
                  <span className="text-slate-600 font-medium" suppressHydrationWarning>Daily Limit: <strong className="text-cyan-700" suppressHydrationWarning>{formatINR(dailyAllowance)}</strong>/day</span>
                  <span className="text-slate-300">•</span>
                  <span className="hidden md:inline text-slate-500 font-mono text-[11px]" suppressHydrationWarning>
                    Salary {formatINR(profile.monthlySalary)}/mo
                  </span>
                </p>
              </div>
            </div>

            {/* Mobile IST Clock */}
            <div className="sm:hidden text-right">
              <span className="text-xs font-mono text-[#0284C7] flex items-center gap-1 justify-end font-semibold">
                <Clock className="w-3 h-3 text-cyan-600 animate-pulse" />
                {timeStr || 'IST'}
              </span>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile Fast Action: Balance Badge & Settings Cog */}
            <button
              onClick={onOpenBankPassbook}
              className="sm:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-xl btn-secondary-ice text-xs font-semibold shadow-xs"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-cyan-700 font-mono text-[11px] font-bold">
                {formatINR(totalLiquidBalance)}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className="sm:hidden p-1.5 rounded-xl glass-pill text-slate-600 hover:text-[#0284C7] transition cursor-pointer"
              title="Salary & Settings"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>

            {/* Desktop Full Navigation Suite */}
            <div className="hidden sm:flex items-center flex-wrap gap-2 justify-end">
              {/* Desktop IST Time Pill */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-mono text-slate-600">
                <Clock className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                <span>{timeStr || 'IST'}</span>
              </div>

              {/* Bank Passbook & Account Vault Button */}
              <button
                onClick={onOpenBankPassbook}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl btn-secondary-ice text-xs font-semibold transition cursor-pointer shadow-sm hover:scale-105"
                title="View bank ledger, all stored transactions, and real-time bank stream"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <Building2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span className="font-bold text-[#0F172A]">{activeAccount ? activeAccount.bankName : 'Passbook'}</span>
                <span className="text-cyan-700 font-mono text-[11px] font-bold">
                  {formatINR(totalLiquidBalance)}
                </span>
              </button>

              {/* Built-in AI Advisor */}
              {onOpenAiAdvisor && (
                <button
                  onClick={onOpenAiAdvisor}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-secondary-ice text-xs font-bold transition cursor-pointer shadow-sm hover:scale-105"
                  title="Built-in AI Financial & World Copilot"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                  <span className="hidden md:inline">Finpulse AI</span>
                  <span className="md:hidden">AI</span>
                </button>
              )}

              {/* Bank Auto-Sync modal */}
              <button
                onClick={onOpenAutoBankSync}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-slate-700 text-xs font-medium transition cursor-pointer hover:text-[#0284C7]"
                title="Automatically poll bank accounts & parse transactional SMS"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>Auto-Sync</span>
              </button>

              {/* Quick commerce & Impulsive insights */}
              <button
                onClick={onOpenMerchantInsights}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-amber-700 border-amber-200 text-xs font-medium transition cursor-pointer hover:border-amber-400"
                title="Zepto, Blinkit & Impulsive spend insights"
              >
                <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Zepto Leak</span>
              </button>

              {/* Subscriptions */}
              <button
                onClick={onOpenSubscriptions}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-slate-700 text-xs font-medium transition cursor-pointer hover:text-[#0284C7]"
                title="Track recurring OTT subscriptions"
              >
                <Tv className="w-3.5 h-3.5 text-[#0284C7]" />
                <span className="hidden md:inline">Subs</span>
              </button>

              {/* CSV Statement Upload */}
              <button
                onClick={onOpenCsvUpload}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-slate-700 text-xs font-medium transition cursor-pointer hover:text-[#0284C7]"
                title="Import HDFC, ICICI, SBI or GPay CSV Statement"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden lg:inline">CSV</span>
              </button>

              {/* 9 PM Report */}
              <button
                onClick={onOpenNightlyReport}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isLive9PmTime || isOverspentToday
                    ? 'bg-amber-50 border border-amber-300 text-amber-800 shadow-sm'
                    : 'glass-pill text-slate-700 hover:text-[#0284C7]'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                <span>9 PM Report</span>
                {isOverspentToday && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              {/* Quick Add Button with Mint Cyan Gradient (Primary CTA) */}
              <button
                onClick={onOpenQuickAdd}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-primary-mint text-white font-extrabold text-xs shadow-md transition transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Log Spend</span>
              </button>

              {/* Settings & Salary */}
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-xl glass-pill text-slate-600 hover:text-[#0284C7] transition cursor-pointer"
                title="Salary & Daily Budget Calculator Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
