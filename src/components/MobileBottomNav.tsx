'use client';

import React from 'react';
import {
  Bell,
  BrainCircuit,
  Building2,
  Home,
  Plus,
  Settings,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void;
  onOpenBankPassbook: () => void;
  onOpenAiAdvisor: () => void;
  onOpenNightlyReport: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenQuickAdd,
  onOpenBankPassbook,
  onOpenAiAdvisor,
  onOpenNightlyReport,
  onOpenSettings,
}) => {
  const { isOverspentToday, totalLiquidBalance } = useFinance();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
      {/* Liquid Glass Bottom Dock */}
      <div className="relative bg-white/90 backdrop-blur-2xl border-t border-slate-200/90 px-3 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {/* Home / Top */}
          <button
            onClick={scrollToTop}
            className="flex flex-col items-center justify-center w-14 py-1 text-slate-600 active:scale-90 transition cursor-pointer"
          >
            <Home className="w-5 h-5 text-slate-700" />
            <span className="text-[10px] font-semibold mt-1 text-slate-600">Home</span>
          </button>

          {/* Passbook */}
          <button
            onClick={onOpenBankPassbook}
            className="flex flex-col items-center justify-center w-14 py-1 text-slate-600 active:scale-90 transition cursor-pointer relative"
          >
            <Building2 className="w-5 h-5 text-[#0284C7]" />
            <span className="text-[10px] font-semibold mt-1 text-[#0284C7]">Passbook</span>
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </button>

          {/* Center Floating Liquid Action Button (+ Log Spend) */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={onOpenQuickAdd}
              aria-label="Quick Log Expense"
              className="w-14 h-14 rounded-full btn-primary-mint text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 ring-4 ring-white active:scale-90 transition transform cursor-pointer"
            >
              <Plus className="w-7 h-7 stroke-[3]" />
            </button>
            <span className="text-[10px] font-bold text-cyan-800 mt-1">Log Spend</span>
          </div>

          {/* Built-in AI Copilot */}
          <button
            onClick={onOpenAiAdvisor}
            className="flex flex-col items-center justify-center w-14 py-1 text-slate-600 active:scale-90 transition cursor-pointer"
          >
            <BrainCircuit className="w-5 h-5 text-teal-600" />
            <span className="text-[10px] font-semibold mt-1 text-teal-700">Fin AI</span>
          </button>

          {/* 9 PM Report */}
          <button
            onClick={onOpenNightlyReport}
            className="flex flex-col items-center justify-center w-14 py-1 text-slate-600 active:scale-90 transition cursor-pointer relative"
          >
            <Bell className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-semibold mt-1 text-slate-600">9 PM</span>
            {isOverspentToday && (
              <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
