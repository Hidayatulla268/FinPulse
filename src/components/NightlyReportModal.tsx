'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  CheckCircle,
  Copy,
  ExternalLink,
  Flame,
  Mail,
  MessageSquare,
  Share2,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { generateNightlyReport } from '@/lib/relatableQuotes';

interface NightlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NightlyReportModal: React.FC<NightlyReportModalProps> = ({ isOpen, onClose }) => {
  const { transactions, dailyAllowance, playAudioChime, todayStr } = useFinance();
  const [copied, setCopied] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [customDate, setCustomDate] = useState<string>('');

  const activeDate = customDate || todayStr || '2026-10-22';

  const report = useMemo(() => {
    return generateNightlyReport(transactions, dailyAllowance, activeDate);
  }, [transactions, dailyAllowance, activeDate]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(report.whatsappFormattedText);
    setCopied(true);
    playAudioChime('ding');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(report.whatsappFormattedText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSendEmailSimulation = () => {
    setEmailSent(true);
    playAudioChime('success');
    setTimeout(() => setEmailSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl glass-panel-elevated p-5 sm:p-8 shadow-2xl relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border ${
                report.isOverspent
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-cyan-50 border-cyan-200 text-[#0284C7]'
              }`}
            >
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">9 PM Daily Financial Report</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                  Automated Nudge
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled delivery at 9:00 PM IST daily to curb impulse night spending
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Viewing Report For:</span>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {/* Primary Verdict Hero Card */}
        <div
          className={`mt-4 p-5 rounded-2xl transition-all border ${
            report.isOverspent
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : 'bg-cyan-50/90 border-cyan-200 text-cyan-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            {report.isOverspent ? (
              <span className="text-amber-800 flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Overspent Today — Marigold Alert
              </span>
            ) : (
              <span className="text-[#0284C7] flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-[#0284C7]" /> Under Budget — Discipline Achieved!
              </span>
            )}
          </div>

          {/* Core Sentence */}
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-snug">
            {report.isOverspent ? (
              <>
                Your daily budget was{' '}
                <span className="text-slate-700 font-mono">{formatINR(report.dailyBudget)}</span>. You spent{' '}
                <span className="text-rose-600 font-mono">{formatINR(report.totalSpent)}</span>.{' '}
                <span className="text-rose-600 underline font-black">
                  Overspent by {formatINR(report.difference)}.
                </span>
              </>
            ) : (
              <>
                Your daily budget was{' '}
                <span className="text-slate-700 font-mono">{formatINR(report.dailyBudget)}</span>. You spent{' '}
                <span className="text-[#0284C7] font-mono">{formatINR(report.totalSpent)}</span>.{' '}
                <span className="text-emerald-700 font-black">
                  Saved {formatINR(Math.abs(report.difference))}!
                </span>
              </>
            )}
          </p>

          {/* Relatable Humor / Roast */}
          <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-2">
            <span className="text-xs italic text-slate-600">
              “{report.roastMessage}”
            </span>
          </div>
        </div>

        {/* Top 3 Spending Merchants */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-cyan-600" />
            <span>Top 3 Spending Merchants</span>
          </div>

          {report.topMerchants.length > 0 ? (
            <div className="space-y-2">
              {report.topMerchants.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs hover:border-cyan-300 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-cyan-50 flex items-center justify-center font-mono font-bold text-[10px] text-[#0284C7] border border-cyan-200">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{m.merchant}</span>
                    <span className="text-slate-400">({m.count} txn{m.count > 1 ? 's' : ''})</span>
                  </div>
                  <div className="font-mono font-bold text-cyan-700 text-sm">
                    {formatINR(m.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              No merchant transactions logged for this date.
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Category Breakdown
          </div>

          {report.categoryBreakdown.length > 0 ? (
            <div className="space-y-2">
              {report.categoryBreakdown.map((c) => (
                <div key={c.category} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse" />
                    <span className="text-slate-800 capitalize font-medium">{c.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#0284C7] font-mono font-semibold">{c.percentage}%</span>
                    <span className="font-mono font-semibold text-slate-900">{formatINR(c.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400">Zero category expenses logged.</div>
          )}
        </div>

        {/* Actions & Sharing Channels */}
        <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
          <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Share & Alert Channels
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp Button in Mint Cyan */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl btn-primary-mint text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Send WhatsApp Summary</span>
            </button>

            {/* Email Dispatch Simulation in Ice Blue */}
            <button
              onClick={handleSendEmailSimulation}
              className="w-full py-2.5 px-3 rounded-xl btn-secondary-ice text-[#0284C7] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#0284C7]" />
              <span>{emailSent ? 'Email Dispatched! ✓' : 'Send Email Digest'}</span>
            </button>
          </div>

          {/* Copy Report text */}
          <button
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#0284C7] text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied WhatsApp Formatted Report!' : 'Copy Formatted Report Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
