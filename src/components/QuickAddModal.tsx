'use client';

import React, { useState } from 'react';
import { Flame, Plus, X } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { identifyMerchantAndCategory } from '@/lib/categorizer';
import {
  CATEGORIES,
  ExpenseCategory,
  PaymentMode,
  UpiApp,
} from '@/types/finance';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_CHIPS = [
  { label: '₹20 Chai Tapri', merchant: 'Chai Tapri', amount: 20, category: 'random_upi' as ExpenseCategory, isImpulse: false },
  { label: '₹180 Auto / Metro', merchant: 'Namma Yatri', amount: 180, category: 'commute' as ExpenseCategory, isImpulse: false },
  { label: '₹340 Zepto Munchies', merchant: 'Zepto', amount: 340, category: 'groceries' as ExpenseCategory, isImpulse: true },
  { label: '₹480 Swiggy Meal', merchant: 'Swiggy', amount: 480, category: 'food' as ExpenseCategory, isImpulse: false },
  { label: '₹385 Starbucks Coffee', merchant: 'Starbucks', amount: 385, category: 'food' as ExpenseCategory, isImpulse: true },
  { label: '₹899 Myntra / Zara', merchant: 'Myntra', amount: 899, category: 'shopping' as ExpenseCategory, isImpulse: true },
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();

  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [upiApp, setUpiApp] = useState<UpiApp>('GPay');
  const [isImpulse, setIsImpulse] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Handle title change and auto-detect category
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (val.trim().length > 2) {
      const detected = identifyMerchantAndCategory(val);
      setCategory(detected.category);
      if (detected.isQuickCommerce) {
        setIsImpulse(true);
      }
    }
  };

  const applyPreset = (preset: typeof PRESET_CHIPS[0]) => {
    setAmount(String(preset.amount));
    setTitle(preset.merchant);
    setCategory(preset.category);
    setIsImpulse(preset.isImpulse);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    const merchantName = title.trim() || 'General Expense';

    addTransaction({
      title: merchantName,
      merchant: merchantName,
      amount: Math.round(numAmount),
      category,
      date: dateStr,
      time: timeStr,
      paymentMode,
      upiApp: paymentMode === 'UPI' ? upiApp : undefined,
      isImpulse,
      notes: notes.trim(),
      source: 'manual',
    });

    // Reset form
    setAmount('');
    setTitle('');
    setIsImpulse(false);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0284C7]">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Log Today&apos;s Expense</h2>
              <p className="text-xs text-slate-500">Deducts instantly from your daily allowance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Indian Presets */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            ⚡ Quick 1-Tap Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CHIPS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50 text-slate-600 hover:text-[#0284C7] transition cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expense Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Amount Input with ₹ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Amount Spent (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-cyan-700">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 text-2xl font-black font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Merchant / Description with Auto-Detection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Merchant / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy, Zepto, Chai Tapri, Auto, Starbucks"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition cursor-pointer flex flex-col gap-0.5 ${
                    category === cat.id
                      ? 'bg-cyan-50 border-cyan-400 text-[#0284C7] font-semibold shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className="text-[10px] text-slate-400">{cat.hindiLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode & UPI App */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {paymentMode === 'UPI' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  UPI App
                </label>
                <select
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value as UpiApp)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="GPay">Google Pay (GPay)</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="CRED">CRED UPI</option>
                  <option value="BHIM">BHIM UPI</option>
                  <option value="Other">Other Bank UPI</option>
                </select>
              </div>
            )}
          </div>

          {/* Impulsive Buy Toggle */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-xs font-bold text-amber-800">
                  Impulse Buy / Guilty Pleasure?
                </div>
                <div className="text-[10px] text-slate-500">
                  Helps flag impulsive late night cravings and Zepto/Swiggy traps
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isImpulse}
              onChange={(e) => setIsImpulse(e.target.checked)}
              className="w-5 h-5 rounded text-cyan-600 focus:ring-cyan-500 bg-white border-slate-300 cursor-pointer"
            />
          </div>

          {/* Optional Note */}
          <div>
            <input
              type="text"
              placeholder="Optional note (e.g. split with Rahul)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl btn-primary-mint text-white font-extrabold text-sm shadow-md transition transform active:scale-[0.99] cursor-pointer"
            >
              Add Expense & Deduct from Allowance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
