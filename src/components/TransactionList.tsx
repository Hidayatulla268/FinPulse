'use client';

import React, { useMemo, useState } from 'react';
import {
  Flame,
  Plus,
  QrCode,
  Search,
  Trash2,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { OVERSPENT_RELATABLE_HERO } from '@/lib/relatableQuotes';
import { CATEGORIES } from '@/types/finance';

interface TransactionListProps {
  onOpenQuickAdd: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onOpenQuickAdd }) => {
  const { transactions, deleteTransaction, todayStr } = useFinance();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'impulse'>('today');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Tab filter
      if (activeTab === 'today' && t.date !== todayStr) return false;
      if (activeTab === 'impulse' && !t.isImpulse) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchMerchant = t.merchant.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchMerchant && !matchNotes) return false;
      }

      return true;
    });
  }, [transactions, activeTab, selectedCategory, searchQuery, todayStr]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="w-full rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 border border-slate-200 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F172A]">Bank Transaction Activity</h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[#0284C7]">
              {filteredTransactions.length} txns • {formatINR(totalFilteredAmount)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-categorized bank statement debits & credits with live daily allowance deduction
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#0284C7] text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('impulse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'impulse'
                ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Impulse</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            All Ledger
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Swiggy, Zepto, Chai, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none transition border-slate-300"
          />
        </div>

        {/* Category Pill Filter */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap border transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-cyan-50 border-cyan-300 text-[#0284C7] font-bold shadow-xs'
                : 'glass-pill text-slate-600 hover:text-[#0F172A]'
            }`}
          >
            All Categories
          </button>
          {Object.values(CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap border transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-50 border-cyan-300 text-[#0284C7] font-bold shadow-xs'
                  : 'glass-pill text-slate-600 hover:text-[#0F172A]'
              }`}
            >
              {cat.label.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="mt-4 space-y-2.5">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => {
            const meta = CATEGORIES[t.category] || CATEGORIES.random_upi;
            const isCredit = t.txnType === 'credit';
            return (
              <div
                key={t.id}
                className="group p-3.5 rounded-2xl glass-panel glass-specular hover:border-cyan-400/50 hover:scale-[1.005] transition-all duration-200 flex items-center justify-between gap-3 shadow-sm border border-slate-200"
              >
                {/* Left: Icon & Merchant Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: meta.bgLight,
                      borderColor: meta.borderColor,
                      color: meta.color,
                    }}
                  >
                    <span className="font-bold text-xs">
                      {t.merchant.slice(0, 2).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#0F172A] truncate">
                        {t.title}
                      </span>
                      {t.isImpulse && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-50 border border-amber-300 text-amber-700 font-bold flex items-center gap-0.5 shrink-0">
                          <Flame className="w-2.5 h-2.5 text-amber-600" /> Impulse
                        </span>
                      )}
                      {t.bankName && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                          {t.bankName} {t.accountMasked || ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="text-slate-700 font-medium">{t.merchant}</span>
                      <span>•</span>
                      <span className="font-mono text-[#0284C7] font-semibold">{t.time}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">{t.date}</span>
                      {t.upiApp && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                          {t.upiApp}
                        </span>
                      )}
                      {t.transferredTo && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-50 border border-cyan-200 text-[#0284C7] font-medium">
                          Transferred to: {t.transferredTo} {t.vpa ? `(${t.vpa})` : ''}
                        </span>
                      )}
                      {t.utrNumber && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref: {t.utrNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold font-mono ${
                        isCredit ? 'text-emerald-600' : 'text-[#0F172A]'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatINR(t.amount)}
                    </div>
                    {t.balanceAfter !== undefined && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Bal: {formatINR(t.balanceAfter)}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 capitalize">
                      {meta.label.split('&')[0]}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Relatable Empty State */
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto text-[#0284C7] mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#0F172A]">No transactions found</h4>
            <p className="text-xs text-slate-500 mt-1 italic max-w-sm mx-auto">
              “{OVERSPENT_RELATABLE_HERO}”
            </p>
            <button
              onClick={onOpenQuickAdd}
              className="mt-4 px-4 py-2 rounded-xl btn-primary-mint text-white font-extrabold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Log First Expense</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
