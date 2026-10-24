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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Glows */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            report.isOverspent ? 'bg-[#ff9900]/25' : 'bg-sky-500/25'
          }`}
        />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl bg-[#ff9900]/15 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl border glass-specular ${
                report.isOverspent
                  ? 'glass-panel-marigold text-[#ff9900] glow-marigold-subtle'
                  : 'glass-panel text-sky-400 glow-sky-subtle'
              }`}
            >
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">9 PM Daily Financial Report</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900]">
                  Automated Nudge
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Scheduled delivery at 9:00 PM IST daily to curb impulse night spending
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-pill text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-sky-200/70 font-medium">Viewing Report For:</span>
          <input
            type="date"
            value={activeDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl glass-input text-sky-300 font-mono focus:outline-none"
          />
        </div>

        {/* Primary Verdict Hero Card (Exact requested format) */}
        <div
          className={`mt-4 p-5 rounded-2xl transition-all glass-specular ${
            report.isOverspent
              ? 'glass-panel-marigold border-[#ff9900]/40 glow-marigold'
              : 'glass-panel-elevated border-sky-400/40 glow-sky'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            {report.isOverspent ? (
              <span className="text-[#ff9900] flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4" /> Overspent Today — Marigold Alert
              </span>
            ) : (
              <span className="text-sky-400 flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4" /> Under Budget — Discipline Achieved!
              </span>
            )}
          </div>

          {/* Core Exact Sentence */}
          <p className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
            {report.isOverspent ? (
              <>
                Your daily budget was{' '}
                <span className="text-sky-200 font-mono">{formatINR(report.dailyBudget)}</span>. You spent{' '}
                <span className="text-[#ff9900] font-mono">{formatINR(report.totalSpent)}</span>.{' '}
                <span className="text-[#ff9900] underline decoration-[#ff9900] font-black drop-shadow-[0_0_8px_rgba(255,153,0,0.5)]">
                  Overspent by {formatINR(report.difference)}.
                </span>
              </>
            ) : (
              <>
                Your daily budget was{' '}
                <span className="text-sky-200 font-mono">{formatINR(report.dailyBudget)}</span>. You spent{' '}
                <span className="text-sky-300 font-mono">{formatINR(report.totalSpent)}</span>.{' '}
                <span className="text-sky-400 font-black drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                  Saved {formatINR(Math.abs(report.difference))}!
                </span>
              </>
            )}
          </p>

          {/* Relatable Humor / Roast */}
          <div className="mt-3 pt-3 border-t border-sky-500/15 flex items-center gap-2">
            <span className="text-xs italic text-sky-100/90">
              “{report.roastMessage}”
            </span>
          </div>
        </div>

        {/* Top 3 Spending Merchants */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-300/80 mb-2.5 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[#ff9900]" />
            <span>Top 3 Spending Merchants</span>
          </div>

          {report.topMerchants.length > 0 ? (
            <div className="space-y-2">
              {report.topMerchants.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl glass-panel glass-specular flex items-center justify-between text-xs hover:border-sky-400/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full glass-panel flex items-center justify-center font-mono font-bold text-[10px] text-sky-300 border border-sky-400/30">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{m.merchant}</span>
                    <span className="text-sky-200/50">({m.count} txn{m.count > 1 ? 's' : ''})</span>
                  </div>
                  <div className="font-mono font-bold text-[#ff9900] text-sm">
                    {formatINR(m.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-2xl glass-panel text-xs text-sky-200/60">
              No merchant transactions logged for this date.
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-sky-300/80 mb-2.5">
            Category Breakdown
          </div>

          {report.categoryBreakdown.length > 0 ? (
            <div className="space-y-2">
              {report.categoryBreakdown.map((c) => (
                <div key={c.category} className="p-2.5 rounded-xl glass-panel flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-sky-100 capitalize font-medium">{c.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sky-300/70 font-mono">{c.percentage}%</span>
                    <span className="font-mono font-semibold text-white">{formatINR(c.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-sky-200/50">Zero category expenses logged.</div>
          )}
        </div>

        {/* Actions & Sharing Channels */}
        <div className="mt-6 pt-5 border-t border-sky-500/15 space-y-3">
          <div className="text-[11px] font-semibold text-sky-300/80 uppercase tracking-wider">
            Share & Alert Channels
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp Button in Marigold */}
            <button
              onClick={handleShareWhatsApp}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg glow-marigold-subtle transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-black text-amber-500" />
              <span>Send WhatsApp Summary</span>
            </button>

            {/* Email Dispatch Simulation in Sky Blue */}
            <button
              onClick={handleSendEmailSimulation}
              className="w-full py-2.5 px-3 rounded-xl glass-panel text-sky-300 hover:text-white border border-sky-500/30 hover:border-sky-400 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              <span>{emailSent ? 'Email Dispatched! ✓' : 'Send Email Digest'}</span>
            </button>
          </div>

          {/* Copy Report text */}
          <button
            onClick={handleCopy}
            className="w-full py-2 px-3 rounded-xl glass-pill text-sky-200/70 hover:text-sky-300 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied WhatsApp Formatted Report!' : 'Copy Formatted Report Text'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
