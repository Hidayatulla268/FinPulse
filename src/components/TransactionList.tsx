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
    <div className="w-full rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 border border-sky-500/25 glow-sky-subtle">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">Bank Transaction Activity</h3>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full glass-pill border border-sky-500/35 text-sky-400">
              {filteredTransactions.length} txns • {formatINR(totalFilteredAmount)}
            </span>
          </div>
          <p className="text-xs text-sky-200/60 mt-0.5">
            Auto-categorized bank statement debits & credits with live daily allowance deduction
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-2xl glass-pill self-start sm:self-auto border-sky-500/25">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'today'
                ? 'bg-sky-500 text-black shadow-md glow-sky-subtle font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('impulse')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
              activeTab === 'impulse'
                ? 'bg-[#ff9900] text-black shadow-md glow-marigold-subtle font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Impulse</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white/20 text-white shadow-md font-extrabold'
                : 'text-gray-400 hover:text-white'
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
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400/60" />
          <input
            type="text"
            placeholder="Search Swiggy, Zepto, Chai, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-sky-200/40 focus:outline-none transition"
          />
        </div>

        {/* Category Pill Filter */}
        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1.5 rounded-xl text-xs whitespace-nowrap border transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-500/25 border-sky-400/60 text-sky-300 font-bold shadow-sm'
                : 'glass-pill text-gray-400 hover:text-white'
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
                  ? 'bg-sky-500/25 border-sky-400/60 text-sky-300 font-bold shadow-sm'
                  : 'glass-pill text-gray-400 hover:text-white'
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
                className="group p-3.5 rounded-2xl glass-panel glass-specular hover:border-sky-400/50 hover:scale-[1.01] transition-all duration-200 flex items-center justify-between gap-3 shadow-lg"
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
                      <span className="text-sm font-semibold text-white truncate">
                        {t.title}
                      </span>
                      {t.isImpulse && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#ff9900]/15 border border-[#ff9900]/40 text-[#ff9900] font-bold flex items-center gap-0.5 shrink-0">
                          <Flame className="w-2.5 h-2.5" /> Impulse
                        </span>
                      )}
                      {t.bankName && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black border border-gray-800 text-gray-400 font-mono">
                          {t.bankName} {t.accountMasked || ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="text-gray-300 font-medium">{t.merchant}</span>
                      <span>•</span>
                      <span className="font-mono text-sky-400">{t.time}</span>
                      <span>•</span>
                      <span className="text-[11px] text-gray-500">{t.date}</span>
                      {t.upiApp && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-black border border-gray-800 text-gray-300 font-mono">
                          {t.upiApp}
                        </span>
                      )}
                      {t.transferredTo && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 font-medium">
                          Transferred to: {t.transferredTo} {t.vpa ? `(${t.vpa})` : ''}
                        </span>
                      )}
                      {t.utrNumber && (
                        <span className="text-[10px] text-gray-500 font-mono">
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
                        isCredit ? 'text-sky-400' : 'text-[#ff9900]'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatINR(t.amount)}
                    </div>
                    {t.balanceAfter !== undefined && (
                      <div className="text-[10px] text-gray-500 font-mono">
                        Bal: {formatINR(t.balanceAfter)}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 capitalize">
                      {meta.label.split('&')[0]}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-80 group-hover:opacity-100 cursor-pointer"
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
          <div className="py-12 px-4 text-center rounded-2xl bg-black border border-sky-500/20">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400 mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No transactions found</h4>
            <p className="text-xs text-gray-400 mt-1 italic max-w-sm mx-auto">
              “{OVERSPENT_RELATABLE_HERO}”
            </p>
            <button
              onClick={onOpenQuickAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
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
