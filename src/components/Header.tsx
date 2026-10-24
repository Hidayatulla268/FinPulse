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
        ? 'border-sky-500/35 bg-black/85 backdrop-blur-3xl shadow-[0_15px_35px_-10px_rgba(0,0,0,0.95),0_0_20px_rgba(56,189,248,0.12)]'
        : 'border-sky-500/25 glass-panel-elevated glass-specular shadow-2xl backdrop-blur-2xl'
    }`}>
      {/* Dynamic Specular Scroll Progress Bar along header top edge */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-black/40 overflow-hidden z-50">
        <div
          className="h-full bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] shadow-[0_0_12px_rgba(56,189,248,0.9)] transition-all duration-75"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Brand with Sky Blue and Marigold */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-sky-400/40 shadow-lg glow-sky-subtle">
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
                  <h1 className="text-xl font-extrabold bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] bg-clip-text text-transparent tracking-tight">
                    Finpulse
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full glass-pill border border-sky-500/35 text-sky-400">
                    Live Banking
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5" suppressHydrationWarning>
                  <span className="text-gray-300 font-medium" suppressHydrationWarning>Daily Limit: <strong className="text-[#ff9900]" suppressHydrationWarning>{formatINR(dailyAllowance)}</strong>/day</span>
                  <span className="text-gray-700">•</span>
                  <span className="hidden md:inline text-sky-400 font-mono text-[11px]" suppressHydrationWarning>
                    Salary {formatINR(profile.monthlySalary)}/mo
                  </span>
                </p>
              </div>
            </div>

            {/* Mobile IST Clock */}
            <div className="sm:hidden text-right">
              <span className="text-xs font-mono text-sky-400 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-[#ff9900] animate-pulse" />
                {timeStr || 'IST'}
              </span>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
            {/* Desktop IST Time Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs font-mono text-gray-300">
              <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>{timeStr || 'IST'}</span>
            </div>

            {/* Bank Passbook & Account Vault Button */}
            <button
              onClick={onOpenBankPassbook}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel-elevated glass-specular border border-sky-400/40 text-sky-300 text-xs font-semibold transition cursor-pointer shadow-sm glow-sky-subtle hover:scale-105"
              title="View bank ledger, all stored transactions, and real-time bank stream"
            >
              <div className="w-2 h-2 rounded-full bg-[#ff9900] animate-ping" />
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-white hidden sm:inline">{activeAccount ? activeAccount.bankName : 'Passbook'}</span>
              <span className="text-[#ff9900] font-mono text-[11px] font-bold">
                {formatINR(totalLiquidBalance)}
              </span>
            </button>

            {/* Built-in AI Advisor */}
            {onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-panel-elevated glass-specular border border-sky-400/50 text-sky-300 text-xs font-bold transition cursor-pointer shadow-sm glow-sky hover:scale-105"
                title="Built-in AI Financial & World Copilot"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-[#ff9900] animate-pulse" />
                <span className="hidden md:inline">Finpulse AI</span>
                <span className="md:hidden">AI</span>
              </button>
            )}

            {/* Bank Auto-Sync modal */}
            <button
              onClick={onOpenAutoBankSync}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill border-sky-500/30 text-sky-300 text-xs font-medium transition cursor-pointer hover:border-sky-400"
              title="Automatically poll bank accounts & parse transactional SMS"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Auto-Sync</span>
            </button>

            {/* Quick commerce & Impulsive insights */}
            <button
              onClick={onOpenMerchantInsights}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill border-[#ff9900]/30 text-[#ff9900] text-xs font-medium transition cursor-pointer hover:border-[#ff9900]"
              title="Zepto, Blinkit & Impulsive spend insights"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Zepto Leak</span>
            </button>

            {/* Subscriptions */}
            <button
              onClick={onOpenSubscriptions}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-sky-300 text-xs font-medium transition cursor-pointer"
              title="Track recurring OTT subscriptions"
            >
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Subs</span>
            </button>

            {/* CSV Statement Upload */}
            <button
              onClick={onOpenCsvUpload}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-pill text-gray-300 text-xs font-medium transition cursor-pointer"
              title="Import HDFC, ICICI, SBI or GPay CSV Statement"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">CSV</span>
            </button>

            {/* 9 PM Report */}
            <button
              onClick={onOpenNightlyReport}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isLive9PmTime || isOverspentToday
                  ? 'glass-panel-marigold glass-specular border-[#ff9900]/60 text-[#ff9900] glow-marigold-subtle'
                  : 'glass-pill border-sky-500/30 text-sky-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#ff9900]" />
              <span className="hidden sm:inline">9 PM Report</span>
              <span className="sm:hidden">9 PM</span>
              {isOverspentToday && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff9900] animate-ping" />
              )}
            </button>

            {/* Quick Add Button with Marigold to Sky Gradient */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-lg glow-sky-subtle transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Spend</span>
            </button>

            {/* Settings & Salary */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-xl glass-pill text-gray-300 hover:text-white transition cursor-pointer"
              title="Salary & Daily Budget Calculator Settings"
            >
              <Settings className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
