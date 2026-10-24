'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  BrainCircuit,
  Coins,
  FileSpreadsheet,
  Lock,
  Plus,
  Sparkles,
  Tv,
  WifiOff,
  Zap,
} from 'lucide-react';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { AutoBankSyncModal } from '@/components/AutoBankSyncModal';
import { BankPassbookModal } from '@/components/BankPassbookModal';
import { CsvUploadModal } from '@/components/CsvUploadModal';
import { DailyAllowanceCard } from '@/components/DailyAllowanceCard';
import { FinpulseAICopilot } from '@/components/FinpulseAICopilot';
import { Header } from '@/components/Header';
import { MerchantInsightsModal } from '@/components/MerchantInsightsModal';
import { NightlyReportModal } from '@/components/NightlyReportModal';
import { QuickAddModal } from '@/components/QuickAddModal';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { SubscriptionTrackerModal } from '@/components/SubscriptionTrackerModal';
import { TransactionList } from '@/components/TransactionList';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';

function DashboardContent() {
  const {
    dailyAllowance,
    triggerCelebration,
    liveBankingAlert,
    dismissLiveBankingAlert,
    totalLiquidBalance,
  } = useFinance();

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isNightlyReportOpen, setIsNightlyReportOpen] = useState<boolean>(false);
  const [isCsvUploadOpen, setIsCsvUploadOpen] = useState<boolean>(false);
  const [isMerchantInsightsOpen, setIsMerchantInsightsOpen] = useState<boolean>(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAutoBankSyncOpen, setIsAutoBankSyncOpen] = useState<boolean>(false);
  const [isBankPassbookOpen, setIsBankPassbookOpen] = useState<boolean>(false);

  const scrollToAiCopilot = () => {
    const el = document.getElementById('ai-copilot-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll states for dynamic optical blur effects
  const [scrollY, setScrollY] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  // High-performance scroll listener with requestAnimationFrame
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrollY(currentY);
          setIsScrolling(true);

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          if (maxScroll > 0) {
            setScrollPercent(Math.min(100, Math.max(0, (currentY / maxScroll) * 100)));
          }

          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            setIsScrolling(false);
          }, 140);

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Dynamic optical blur at the joint where the image connects at the backside of the card
  const scrollJointBlur = Math.min(18, Math.max(0, scrollY * 0.04));
  const motionBlur = isScrolling ? 3 : 0;
  const jointBlurPx = Math.round((20 + scrollJointBlur + motionBlur) * 10) / 10;

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col selection:bg-sky-400 selection:text-black relative overflow-x-hidden">
      {/* Ambient Optical Light Field (Floating glows that refract through frosted glass cards) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-sky-500/20 blur-[130px] animate-float-1" />
        <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] rounded-full bg-[#ff9900]/18 blur-[140px] animate-float-2" />
        <div className="absolute top-2/3 left-1/4 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px] animate-float-3" />
        <div className="absolute -bottom-32 right-1/4 w-[700px] h-[700px] rounded-full bg-[#f59e0b]/16 blur-[150px] animate-float-1" />
        {/* Subtle glass refraction grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-60" />
      </div>

      {/* Sticky Header with Dynamic Scroll Sheen & Specular Progress */}
      <Header
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenNightlyReport={() => setIsNightlyReportOpen(true)}
        onOpenCsvUpload={() => setIsCsvUploadOpen(true)}
        onOpenMerchantInsights={() => setIsMerchantInsightsOpen(true)}
        onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAutoBankSync={() => setIsAutoBankSyncOpen(true)}
        onOpenBankPassbook={() => setIsBankPassbookOpen(true)}
        onOpenAiAdvisor={scrollToAiCopilot}
        scrollPercent={scrollPercent}
        isScrolled={scrollY > 20}
        isScrolling={isScrolling}
      />

      {/* Real-time Floating Bank Notification Toast / Popover */}
      {liveBankingAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="p-4 rounded-2xl glass-panel-elevated glass-specular border border-sky-400/50 shadow-2xl glow-sky flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/25 to-[#ff9900]/25 border border-sky-400/40 flex items-center justify-center text-[#ff9900] shrink-0 animate-marigold-ping">
              <Bell className="w-5 h-5 text-sky-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff9900] animate-ping" />
                  {liveBankingAlert.bankName} Alert
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{liveBankingAlert.time}</span>
              </div>

              <div className="text-xs text-white font-medium mt-1">
                <span className="font-bold text-[#ff9900]">
                  {liveBankingAlert.type === 'debit' ? 'Sent' : 'Received'} {formatINR(liveBankingAlert.amount)}
                </span>{' '}
                via UPI {liveBankingAlert.type === 'debit' ? 'to' : 'from'}{' '}
                <strong className="text-white underline decoration-sky-400/50">
                  {liveBankingAlert.recipientOrSender}
                </strong>
                {liveBankingAlert.vpa ? ` (${liveBankingAlert.vpa})` : ''}
              </div>

              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                Avl Bal: {formatINR(liveBankingAlert.balanceAfter)} • Ref: {liveBankingAlert.utrNumber}
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    dismissLiveBankingAlert();
                    setIsBankPassbookOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg glass-pill text-sky-300 border border-sky-500/40 text-[11px] font-bold transition cursor-pointer"
                >
                  View Passbook
                </button>
                <button
                  onClick={dismissLiveBankingAlert}
                  className="px-2.5 py-1 rounded-lg glass-pill text-gray-400 hover:text-white text-[11px] transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 relative z-10">
        {/* Hero Showcase Banner in Frosted Glass with Specular Rim & Seamless Optical Blur */}
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated glass-specular border border-sky-500/30 shadow-2xl group glow-sky-subtle min-h-[380px] lg:min-h-[440px] flex flex-col justify-center">
          {/* Ambient Diffused Glow Orbs behind the joint for optical glass refraction */}
          <div className="absolute left-[36%] top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-sky-500/20 blur-[100px] pointer-events-none z-10" />
          <div className="absolute left-[48%] top-1/3 w-64 h-64 rounded-full bg-[#ff9900]/15 blur-[90px] pointer-events-none z-10" />

          {/* 3D Visual Art Image - Physically connects at the backside of the card that holds the text content */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <Image
              src="/hero-banner.jpg"
              alt="Finpulse Visual Art"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
          </div>

          {/* Optical Frosted Glass Blur at the Joint - Slowly reveals the image in the place of joining */}
          {/* Desktop Joint Blur: Fades from 100% frosted blur behind the text card into 0% blur on the image */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none z-10 transition-all duration-300"
            style={{
              backdropFilter: `blur(${jointBlurPx}px) saturate(190%)`,
              WebkitBackdropFilter: `blur(${jointBlurPx}px) saturate(190%)`,
              maskImage: 'linear-gradient(to right, black 0%, black 26%, rgba(0,0,0,0.85) 36%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.12) 62%, transparent 76%)',
              WebkitMaskImage: 'linear-gradient(to right, black 0%, black 26%, rgba(0,0,0,0.85) 36%, rgba(0,0,0,0.48) 48%, rgba(0,0,0,0.12) 62%, transparent 76%)',
            }}
          />

          {/* Mobile Joint Blur: Vertical frosted blur transition */}
          <div
            className="lg:hidden absolute inset-0 pointer-events-none z-10 transition-all duration-300"
            style={{
              backdropFilter: `blur(${jointBlurPx}px) saturate(190%)`,
              WebkitBackdropFilter: `blur(${jointBlurPx}px) saturate(190%)`,
              maskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.7) 52%, rgba(0,0,0,0.15) 70%, transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 35%, rgba(0,0,0,0.7) 52%, rgba(0,0,0,0.15) 70%, transparent 85%)',
            }}
          />

          {/* Soft dark translucent glass gradient behind text that dissolves at the joint to slowly reveal the image */}
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, rgba(6, 12, 24, 0.96) 0%, rgba(6, 12, 24, 0.92) 30%, rgba(6, 12, 24, 0.60) 45%, rgba(6, 12, 24, 0.15) 62%, transparent 78%)',
            }}
          />

          <div
            className="lg:hidden absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to bottom, rgba(6, 12, 24, 0.96) 0%, rgba(6, 12, 24, 0.90) 40%, rgba(6, 12, 24, 0.45) 62%, transparent 82%)',
            }}
          />

          {/* Left Narrative Content - Positioned cleanly over the glass canvas with elevated z-index */}
          <div className="relative z-20 p-6 sm:p-10 max-w-2xl lg:max-w-[58%]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>Real-Time Bank Statement Reader & Allowance Tracker</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Stop wondering where your{' '}
              <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] bg-clip-text text-transparent">
                salary vanished.
              </span>
            </h2>

            <p className="mt-3 text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Finpulse converts your monthly pay into an auto-tracking{' '}
              <strong className="text-white font-semibold" suppressHydrationWarning>daily allowance ({formatINR(dailyAllowance)}/day)</strong>.
              Connects with your bank account, reads real-time transactions, stores every debit in the ledger, and alerts you at 9 PM.
            </p>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsBankPassbookOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-lg glow-sky flex items-center gap-2 transition cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                <span suppressHydrationWarning>📖 Bank Passbook ({formatINR(totalLiquidBalance)})</span>
              </button>

              <button
                onClick={scrollToAiCopilot}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 via-sky-400/20 to-[#ff9900]/20 hover:from-sky-500/30 hover:to-[#ff9900]/30 border border-sky-400/40 text-sky-200 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-md glow-sky-subtle"
              >
                <BrainCircuit className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Finpulse AI Advisor</span>
              </button>

              <button
                onClick={() => setIsAutoBankSyncOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <span>⚡ Auto-Sync Statement</span>
              </button>

              <button
                onClick={() => setIsQuickAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-gray-900 border border-gray-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Log Spend</span>
              </button>

              <button
                onClick={() => setIsNightlyReportOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#ff9900]/15 hover:bg-[#ff9900]/25 border border-[#ff9900]/40 text-[#ff9900] font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#ff9900]" />
                <span>9 PM Report</span>
              </button>
            </div>

            {/* Key Trust Signals */}
            <div className="mt-6 pt-5 relative flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <div className="absolute top-0 left-0 right-12 h-px bg-gradient-to-r from-sky-500/30 via-sky-500/15 to-transparent" />
              <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                <Lock className="w-3.5 h-3.5 text-sky-400" /> 100% Client-Side Bank Privacy
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <WifiOff className="w-3.5 h-3.5 text-sky-400" /> Offline Capable
              </span>
              <span className="flex items-center gap-1.5 text-[#ff9900] font-medium">
                <Coins className="w-3.5 h-3.5 text-[#ff9900]" /> Indian Rupee (Lakhs & Crores)
              </span>
            </div>
          </div>
        </div>

        {/* Core Centerpiece: Live Daily Budget Calculator & Counter */}
        <section id="daily-allowance-section">
          <DailyAllowanceCard
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenNightlyReport={() => setIsNightlyReportOpen(true)}
          />
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Commerce Insight Card */}
          <div
            onClick={() => setIsMerchantInsightsOpen(true)}
            className="p-5 rounded-3xl glass-panel-marigold glass-specular hover:scale-[1.02] transition-all cursor-pointer group glow-marigold-subtle"
          >
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 w-fit mb-3 group-hover:scale-110 transition shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              Zepto & Blinkit Tax
            </h4>
            <p className="text-xs text-amber-200/60 mt-1">
              Detect repetitive 10-minute grocery runs and see how much was wasted on surge fees.
            </p>
            <div className="mt-3 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>View Impulse Radar →</span>
            </div>
          </div>

          {/* 9 PM Report Card */}
          <div
            onClick={() => setIsNightlyReportOpen(true)}
            className="p-5 rounded-3xl glass-panel glass-specular hover:scale-[1.02] transition-all cursor-pointer group glow-sky-subtle"
          >
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 w-fit mb-3 group-hover:scale-110 transition shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
              9 PM Nightly Nudge
            </h4>
            <p className="text-xs text-sky-200/60 mt-1">
              Daily summary: &ldquo;Your daily budget was {formatINR(dailyAllowance)}...&rdquo; with WhatsApp share.
            </p>
            <div className="mt-3 text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Preview 9 PM Alert →</span>
            </div>
          </div>

          {/* Subscriptions Card */}
          <div
            onClick={() => setIsSubscriptionsOpen(true)}
            className="p-5 rounded-3xl glass-panel glass-specular hover:scale-[1.02] transition-all cursor-pointer group glow-sky-subtle"
          >
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 w-fit mb-3 group-hover:scale-110 transition shadow-inner">
              <Tv className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
              Subscription Tracker
            </h4>
            <p className="text-xs text-sky-200/60 mt-1">
              Track Netflix, Spotify, Cult.fit, YouTube recurring debits with 1-click cancel links.
            </p>
            <div className="mt-3 text-xs font-semibold text-sky-400 flex items-center gap-1">
              <span>Manage Subscriptions →</span>
            </div>
          </div>

          {/* Bank Statement Parser Card */}
          <div
            onClick={() => setIsCsvUploadOpen(true)}
            className="p-5 rounded-3xl glass-panel glass-specular hover:scale-[1.02] transition-all cursor-pointer group glow-sky-subtle"
          >
            <div className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 w-fit mb-3 group-hover:scale-110 transition shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
              CSV Auto-Tracking
            </h4>
            <p className="text-xs text-sky-200/60 mt-1">
              Drag & drop bank statement CSV from HDFC, ICICI, SBI or UPI apps with auto-categorization.
            </p>
            <div className="mt-3 text-xs font-semibold text-sky-400 flex items-center gap-1">
              <span>Upload Statement →</span>
            </div>
          </div>
        </section>

        {/* Built-in Private Financial AI Advisor & Macro Engine (Zero External APIs) */}
        <section id="ai-copilot-section" className="scroll-mt-24">
          <FinpulseAICopilot
            onOpenPassbook={() => setIsBankPassbookOpen(true)}
            onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </section>

        {/* Visual Analytics & Charts */}
        <section id="analytics-section">
          <AnalyticsCharts />
        </section>

        {/* Transaction History & Quick Search */}
        <section id="transactions-section">
          <TransactionList onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-sky-500/20 glass-panel glass-specular py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-200/60">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white">Finpulse</span>
            <span>•</span>
            <span>Daily Budgeting & Real-Time Banking for India</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-sky-400 transition"
            >
              Calculator Settings
            </button>
            <button
              onClick={() => setIsNightlyReportOpen(true)}
              className="hover:text-amber-400 transition"
            >
              9 PM Report
            </button>
            <button
              onClick={triggerCelebration}
              className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
            >
              🎉 Test Confetti
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <NightlyReportModal
        isOpen={isNightlyReportOpen}
        onClose={() => setIsNightlyReportOpen(false)}
      />

      <CsvUploadModal
        isOpen={isCsvUploadOpen}
        onClose={() => setIsCsvUploadOpen(false)}
      />

      <MerchantInsightsModal
        isOpen={isMerchantInsightsOpen}
        onClose={() => setIsMerchantInsightsOpen(false)}
      />

      <SubscriptionTrackerModal
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AutoBankSyncModal
        isOpen={isAutoBankSyncOpen}
        onClose={() => setIsAutoBankSyncOpen(false)}
      />

      <BankPassbookModal
        isOpen={isBankPassbookOpen}
        onClose={() => setIsBankPassbookOpen(false)}
      />
    </div>
  );
}

export default function FinpulseDashboard() {
  return (
    <FinanceProvider>
      <DashboardContent />
    </FinanceProvider>
  );
}
