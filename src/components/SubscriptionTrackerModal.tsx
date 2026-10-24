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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glows */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl bg-sky-500/20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl bg-[#ff9900]/15 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass-panel glass-specular text-sky-400 glow-sky-subtle">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Subscription Tracker & Auto-Leak</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900]">
                  Auto-Detected
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Monthly recurring debits that quietly eat away at your daily budget
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

        {/* Daily Impact Banner */}
        <div className="mt-5 p-5 rounded-2xl glass-panel-marigold glass-specular glow-marigold-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#ff9900] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#ff9900]" />
              <span>Quiet Salary Drain</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 drop-shadow-[0_0_8px_rgba(255,153,0,0.4)]">
              {formatINR(totalMonthlySpend)}/month
            </div>
            <p className="text-xs text-sky-200/70 mt-1">
              <span className="font-bold text-[#ff9900] font-mono">{formatINR(dailySubsImpact)}/day</span> of your daily
              allowance is spent before you even get out of bed! ({pctOfDailyAllowance}% of daily limit)
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-300 hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg glow-sky-subtle shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="mt-4 p-4 rounded-2xl glass-panel glass-specular space-y-3"
          >
            <h4 className="text-xs font-bold text-sky-200">Track Another Subscription</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Name (e.g. Times Prime)"
                value={newMerchant}
                onChange={(e) => setNewMerchant(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="number"
                required
                placeholder="Monthly Amount (₹)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="glass-input rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="Entertainment" className="bg-black text-white">Entertainment</option>
                <option value="Music" className="bg-black text-white">Music</option>
                <option value="Fitness" className="bg-black text-white">Fitness</option>
                <option value="Cloud" className="bg-black text-white">Cloud Storage</option>
                <option value="Productivity" className="bg-black text-white">Productivity / AI</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs text-sky-200/60 hover:text-white glass-pill"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl glass-panel-marigold glass-specular text-[#ff9900] font-bold text-xs hover:brightness-110"
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
                  ? 'glass-panel glass-specular hover:border-sky-400/50'
                  : 'glass-panel opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border glass-specular ${
                    sub.active
                      ? 'glass-panel text-sky-300 border-sky-500/30'
                      : 'bg-gray-900 text-gray-500 border-white/5'
                  }`}
                >
                  {sub.merchant.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{sub.merchant}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full glass-pill text-sky-200 font-medium">
                      {sub.category}
                    </span>
                  </div>
                  <div className="text-xs text-sky-200/50 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-[#ff9900]" />
                    <span>{sub.nextBillingDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-white">
                    {formatINR(sub.amount)}
                    <span className="text-[10px] text-sky-200/50 font-normal"> /mo</span>
                  </div>
                  <div className="text-[10px] text-[#ff9900] font-mono">
                    ~{formatINR(Math.round(sub.amount / 30))}/day
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Direct cancellation link */}
                  <a
                    href={sub.directCancelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl glass-pill text-sky-200/70 hover:text-[#ff9900] transition text-xs flex items-center gap-1.5"
                    title="Direct Link to Cancel / Manage Membership"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cancel</span>
                  </a>

                  {/* Toggle Active Switch */}
                  <button
                    onClick={() => toggleSubscription(sub.id)}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      sub.active
                        ? 'glass-panel-marigold text-[#ff9900]'
                        : 'glass-pill text-gray-500'
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
