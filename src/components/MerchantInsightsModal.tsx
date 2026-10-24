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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284C7]">
              <Zap className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Merchant Insights & Impulse Radar</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                  Zepto / Blinkit Tax
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detecting recurring financial leaks and instant gratification traps
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

        {/* Quick Commerce Highlight Banner */}
        <div className="mt-5 p-5 rounded-2xl bg-cyan-50/80 border border-cyan-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-cyan-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-cyan-600" />
              <span>The 10-Minute Delivery Tax</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1">
              {formatINR(quickCommerceTotal)} spent on Zepto & Blinkit
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Approx <span className="font-bold font-mono text-[#0284C7]">{formatINR(totalSurgeLeak)}</span> was purely
              surge pricing, handling charges, and delivery fees!
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Impulsive Stores</div>
            <div className="text-xl font-bold font-mono text-[#0284C7]">
              {impulseMerchantCount} merchants
            </div>
          </div>
        </div>

        {/* Merchant Breakdown Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Top Recurring Merchants
          </h3>

          <div className="space-y-2">
            {merchantList.map((m) => (
              <div
                key={m.merchant}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition hover:border-cyan-300"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      m.isQuickCommerce
                        ? 'bg-cyan-50 text-[#0284C7] border-cyan-200'
                        : m.impulseCount > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {m.merchant.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{m.merchant}</span>
                      {m.isQuickCommerce && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7] font-medium">
                          Quick Commerce
                        </span>
                      )}
                      {m.impulseCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-amber-600" /> {m.impulseCount} impulse
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{m.orderCount} order{m.orderCount > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Avg order {formatINR(m.avgOrderValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right self-end sm:self-auto">
                  <div className="text-sm font-bold font-mono text-slate-900">
                    {formatINR(m.totalSpent)}
                  </div>
                  {m.estimatedSurgeFee > 0 && (
                    <div className="text-[10px] text-cyan-700 font-mono font-medium">
                      ~{formatINR(m.estimatedSurgeFee)} in fees
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Nudges */}
        <div className="mt-6 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2.5">
            <Lightbulb className="w-4 h-4 text-[#0284C7]" />
            <span>Behavioral Nudges for Young Professionals</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-900">📦 The Weekly Batch Trick:</span> Ordering once a week
              on DMart or BigBasket saves ~₹400/mo in surge fees over 10-minute delivery apps.
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-[#0284C7]">🌙 10 PM Curfew:</span> 70% of impulse buys happen after
              10 PM. Put food delivery apps into a deep folder to introduce friction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
