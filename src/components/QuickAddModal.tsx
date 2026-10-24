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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-lg rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative overflow-hidden text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl bg-sky-500/20 pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl bg-[#ff9900]/15 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass-panel glass-specular flex items-center justify-center text-sky-400 border border-sky-500/30">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Today&apos;s Expense</h2>
              <p className="text-xs text-sky-200/60">Deducts instantly from your daily allowance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-pill text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Indian Presets */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-300/80 mb-2">
            ⚡ Quick 1-Tap Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_CHIPS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-3 py-1.5 rounded-xl text-xs glass-pill border border-white/10 hover:border-sky-400/50 text-gray-300 hover:text-sky-300 transition cursor-pointer"
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
            <label className="block text-xs font-medium text-sky-300/80 mb-1.5">
              Amount Spent (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#ff9900]">
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
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl glass-input text-2xl font-black font-mono text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Merchant / Description with Auto-Detection */}
          <div>
            <label className="block text-xs font-medium text-sky-300/80 mb-1.5">
              Merchant / Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy, Zepto, Chai Tapri, Auto, Starbucks"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-sky-300/80 mb-1.5">
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
                      ? 'glass-panel-elevated glass-specular border-sky-400/60 text-sky-300'
                      : 'glass-panel text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span className="text-[10px] text-gray-500">{cat.hindiLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode & UPI App */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sky-300/80 mb-1.5">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
              >
                <option value="UPI" className="bg-black text-white">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit Card" className="bg-black text-white">Credit Card</option>
                <option value="Debit Card" className="bg-black text-white">Debit Card</option>
                <option value="NetBanking" className="bg-black text-white">NetBanking</option>
                <option value="Cash" className="bg-black text-white">Cash</option>
              </select>
            </div>

            {paymentMode === 'UPI' && (
              <div>
                <label className="block text-xs font-medium text-sky-300/80 mb-1.5">
                  UPI App
                </label>
                <select
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value as UpiApp)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                >
                  <option value="GPay" className="bg-black text-white">Google Pay (GPay)</option>
                  <option value="PhonePe" className="bg-black text-white">PhonePe</option>
                  <option value="Paytm" className="bg-black text-white">Paytm</option>
                  <option value="CRED" className="bg-black text-white">CRED UPI</option>
                  <option value="BHIM" className="bg-black text-white">BHIM UPI</option>
                  <option value="Other" className="bg-black text-white">Other Bank UPI</option>
                </select>
              </div>
            )}
          </div>

          {/* Impulsive Buy Toggle */}
          <div className="p-3 rounded-2xl glass-panel-marigold glass-specular flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ff9900]" />
              <div>
                <div className="text-xs font-bold text-[#ff9900]">
                  Impulse Buy / Guilty Pleasure?
                </div>
                <div className="text-[10px] text-gray-400">
                  Helps flag impulsive late night cravings and Zepto/Swiggy traps
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isImpulse}
              onChange={(e) => setIsImpulse(e.target.checked)}
              className="w-5 h-5 rounded text-[#ff9900] focus:ring-[#ff9900] bg-black/60 border-[#ff9900]/40 cursor-pointer"
            />
          </div>

          {/* Optional Note */}
          <div>
            <input
              type="text"
              placeholder="Optional note (e.g. split with Rahul)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-sm shadow-xl glow-sky-subtle transition transform active:scale-[0.99] cursor-pointer"
            >
              Add Expense & Deduct from Allowance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
