'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Flame,
  Lightbulb,
  ShoppingBag,
  Sparkles,
  TrendingDown,
  X,
  Zap,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { ExpenseCategory } from '@/types/finance';

interface MerchantInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantInsightsModal: React.FC<MerchantInsightsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions } = useFinance();

  const { merchantList, quickCommerceTotal, totalSurgeLeak, impulseMerchantCount } =
    useMemo(() => {
      const map: Record<
        string,
        {
          category: ExpenseCategory;
          totalSpent: number;
          orderCount: number;
          impulseCount: number;
          isQuickCommerce: boolean;
        }
      > = {};

      for (const t of transactions) {
        if (!map[t.merchant]) {
          const isQC =
            t.merchant.toLowerCase().includes('zepto') ||
            t.merchant.toLowerCase().includes('blinkit') ||
            t.merchant.toLowerCase().includes('instamart');

          map[t.merchant] = {
            category: t.category,
            totalSpent: 0,
            orderCount: 0,
            impulseCount: 0,
            isQuickCommerce: isQC,
          };
        }

        map[t.merchant].totalSpent += t.amount;
        map[t.merchant].orderCount += 1;
        if (t.isImpulse) {
          map[t.merchant].impulseCount += 1;
        }
      }

      const list = Object.entries(map)
        .map(([merchant, data]) => ({
          merchant,
          ...data,
          avgOrderValue: Math.round(data.totalSpent / data.orderCount),
          estimatedSurgeFee: data.isQuickCommerce ? data.orderCount * 39 : 0,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent);

      const qcTotal = list
        .filter((m) => m.isQuickCommerce)
        .reduce((sum, m) => sum + m.totalSpent, 0);

      const surgeLeak = list
        .filter((m) => m.isQuickCommerce)
        .reduce((sum, m) => sum + m.estimatedSurgeFee, 0);

      const impulseCount = list.filter((m) => m.impulseCount > 0).length;

      return {
        merchantList: list,
        quickCommerceTotal: qcTotal,
        totalSurgeLeak: surgeLeak,
        impulseMerchantCount: impulseCount,
      };
    }, [transactions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glows */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl bg-[#ff9900]/20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl bg-sky-500/15 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass-panel-marigold glass-specular text-[#ff9900] glow-marigold-subtle">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Merchant Insights & Impulse Radar</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900]">
                  Zepto / Blinkit Tax
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Detecting recurring financial leaks and instant gratification traps
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

        {/* Quick Commerce Highlight Banner */}
        <div className="mt-5 p-5 rounded-2xl glass-panel-marigold glass-specular glow-marigold flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#ff9900] flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-[#ff9900]" />
              <span>The 10-Minute Delivery Tax</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 drop-shadow-[0_0_8px_rgba(255,153,0,0.4)]">
              {formatINR(quickCommerceTotal)} spent on Zepto & Blinkit
            </div>
            <p className="text-xs text-amber-200/80 mt-1">
              Approx <span className="font-bold font-mono text-[#ff9900]">{formatINR(totalSurgeLeak)}</span> was purely
              surge pricing, handling charges, and delivery fees!
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-sky-500/20 sm:pl-4">
            <div className="text-[10px] text-sky-300/80 uppercase">Impulsive Stores</div>
            <div className="text-xl font-bold font-mono text-[#ff9900]">
              {impulseMerchantCount} merchants
            </div>
          </div>
        </div>

        {/* Merchant Breakdown Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300/80 mb-3">
            Top Recurring Merchants
          </h3>

          <div className="space-y-2">
            {merchantList.map((m) => (
              <div
                key={m.merchant}
                className="p-3.5 rounded-2xl glass-panel glass-specular flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition hover:border-sky-400/40"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border glass-specular ${
                      m.isQuickCommerce
                        ? 'glass-panel-marigold text-[#ff9900] border-[#ff9900]/40'
                        : m.impulseCount > 0
                        ? 'glass-panel-marigold text-[#ff9900] border-[#ff9900]/30'
                        : 'glass-panel text-sky-300 border-sky-500/30'
                    }`}
                  >
                    {m.merchant.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{m.merchant}</span>
                      {m.isQuickCommerce && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900] font-medium">
                          Quick Commerce
                        </span>
                      )}
                      {m.impulseCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900] font-medium flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-[#ff9900]" /> {m.impulseCount} impulse
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-sky-200/50 flex items-center gap-2 mt-0.5">
                      <span>{m.orderCount} order{m.orderCount > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Avg order {formatINR(m.avgOrderValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <div className="text-sm font-bold font-mono text-white">
                    {formatINR(m.totalSpent)}
                  </div>
                  {m.estimatedSurgeFee > 0 && (
                    <div className="text-[10px] text-[#ff9900]/90 font-mono">
                      ~{formatINR(m.estimatedSurgeFee)} in fees
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Nudges */}
        <div className="mt-6 pt-5 border-t border-sky-500/15">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300 mb-2.5">
            <Lightbulb className="w-4 h-4 text-[#ff9900]" />
            <span>Behavioral Nudges for Young Professionals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-sky-100/90">
            <div className="p-3.5 rounded-2xl glass-panel glass-specular">
              <span className="font-semibold text-[#ff9900]">📦 The Weekly Batch Trick:</span> Ordering once a week
              on DMart or BigBasket saves ~₹400/mo in surge fees over 10-minute delivery apps.
            </div>
            <div className="p-3.5 rounded-2xl glass-panel glass-specular">
              <span className="font-semibold text-sky-400">🌙 10 PM Curfew:</span> 70% of impulse buys happen after
              10 PM. Put food delivery apps into a deep folder to introduce friction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
