'use client';

import React, { useMemo, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Flame,
  Plus,
  Power,
  Tv,
  X,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';

interface SubscriptionTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionTrackerModal: React.FC<SubscriptionTrackerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { subscriptions, toggleSubscription, addSubscription, dailyAllowance } = useFinance();
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newMerchant, setNewMerchant] = useState<string>('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Entertainment');

  // Compute metrics
  const activeSubs = useMemo(() => subscriptions.filter((s) => s.active), [subscriptions]);

  const totalMonthlySpend = useMemo(() => {
    return activeSubs.reduce((sum, s) => sum + s.amount, 0);
  }, [activeSubs]);

  const dailySubsImpact = useMemo(() => {
    return Math.round(totalMonthlySpend / 30);
  }, [totalMonthlySpend]);

  const pctOfDailyAllowance = useMemo(() => {
    if (dailyAllowance <= 0) return 0;
    return Math.round((dailySubsImpact / dailyAllowance) * 100);
  }, [dailySubsImpact, dailyAllowance]);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchant || !newAmount) return;

    addSubscription({
      merchant: newMerchant.trim(),
      amount: parseFloat(newAmount) || 0,
      cycle: 'monthly',
      nextBillingDate: 'In 30 days',
      category: newCategory,
      directCancelUrl: 'https://google.com/search?q=' + encodeURIComponent(`how to cancel ${newMerchant}`),
      iconName: 'Tv',
      active: true,
      detectedFromTxn: false,
    });

    setNewMerchant('');
    setNewAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl glass-panel-elevated p-5 sm:p-8 shadow-2xl relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284C7]">
              <Tv className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Subscription Tracker & Auto-Leak</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                  Auto-Detected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly recurring debits that quietly eat away at your daily budget
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

        {/* Daily Impact Banner */}
        <div className="mt-5 p-5 rounded-2xl bg-cyan-50/80 border border-cyan-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-cyan-600" />
              <span>Quiet Salary Drain</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatINR(totalMonthlySpend)}/month
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-bold text-[#0284C7] font-mono">{formatINR(dailySubsImpact)}/day</span> of your daily
              allowance is spent before you even get out of bed! ({pctOfDailyAllowance}% of daily limit)
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl btn-primary-mint text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800">Track Another Subscription</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Name (e.g. Times Prime)"
                value={newMerchant}
                onChange={(e) => setNewMerchant(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                required
                placeholder="Monthly Amount (₹)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
              >
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
                <option value="Fitness">Fitness</option>
                <option value="Cloud">Cloud Storage</option>
                <option value="Productivity">Productivity / AI</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 hover:text-slate-900 bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl btn-primary-mint text-white font-bold text-xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Subscriptions Grid */}
        <div className="mt-6 space-y-2.5">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`p-3.5 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                sub.active
                  ? 'bg-white border border-slate-200 shadow-sm hover:border-cyan-300'
                  : 'bg-slate-50 border border-slate-200 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                    sub.active
                      ? 'bg-cyan-50 text-[#0284C7] border-cyan-200'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {sub.merchant.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{sub.merchant}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                      {sub.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#0284C7]" />
                    <span>{sub.nextBillingDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {formatINR(sub.amount)}
                    <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                  </div>
                  <div className="text-[10px] text-cyan-700 font-mono font-semibold">
                    ~{formatINR(Math.round(sub.amount / 30))}/day
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Direct cancellation link */}
                  <a
                    href={sub.directCancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition text-xs flex items-center gap-1.5"
                    title="Direct Link to Cancel / Manage Membership"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </a>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => toggleSubscription(sub.id)}
                    className={`p-2 rounded-xl transition cursor-pointer border ${
                      sub.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}
                    title={sub.active ? 'Pause subscription' : 'Activate subscription'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
