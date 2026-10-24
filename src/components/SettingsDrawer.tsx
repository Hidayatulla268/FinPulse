'use client';

import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { BudgetCalcMethod } from '@/types/finance';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    addFixedCommitment,
    removeFixedCommitment,
    resetToDemo,
    clearAllData,
  } = useFinance();

  const [salaryInput, setSalaryInput] = useState<string>(String(profile.monthlySalary));
  const [calcMethod, setCalcMethod] = useState<BudgetCalcMethod>(profile.calcMethod);
  const [newCommitName, setNewCommitName] = useState<string>('');
  const [newCommitAmount, setNewCommitAmount] = useState<string>('');

  const totalFixed = profile.fixedCommitments.reduce((sum, f) => sum + f.amount, 0);

  if (!isOpen) return null;

  const handleSalarySave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(salaryInput);
    if (!isNaN(parsed) && parsed > 0) {
      updateProfile({
        monthlySalary: parsed,
        calcMethod,
      });
    }
  };

  const handleAddCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitName || !newCommitAmount) return;

    addFixedCommitment({
      name: newCommitName.trim(),
      amount: parseFloat(newCommitAmount) || 0,
      category: 'other',
    });

    setNewCommitName('');
    setNewCommitAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md h-full bg-white/95 sm:bg-white/90 backdrop-blur-2xl border-l border-slate-200/90 p-5 sm:p-7 overflow-y-auto shadow-2xl relative flex flex-col justify-between text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                <Settings className="w-5 h-5 text-[#0284C7]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Budget Calculator & Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Configure Indian salary & daily allowance formula</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Salary & Calculator Formula */}
          <form onSubmit={handleSalarySave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Monthly In-Hand Salary (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-cyan-700">
                  ₹
                </span>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-lg font-bold font-mono text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Formula Toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Daily Allowance Calculation Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`p-3.5 rounded-2xl cursor-pointer text-xs transition flex items-start gap-2.5 border ${
                    calcMethod === 'gross_div_30'
                      ? 'bg-cyan-50 border-cyan-400 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={calcMethod === 'gross_div_30'}
                    onChange={() => setCalcMethod('gross_div_30')}
                    className="mt-0.5 accent-cyan-600"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">Gross Salary / 30 Days</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Standard core formula: ₹{salaryInput} ÷ 30 ={' '}
                      <span className="text-cyan-700 font-bold font-mono">
                        {formatINR(Math.round((parseFloat(salaryInput) || 100000) / 30))}/day
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-2xl cursor-pointer text-xs transition flex items-start gap-2.5 border ${
                    calcMethod === 'net_discretionary'
                      ? 'bg-cyan-50 border-cyan-400 text-slate-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={calcMethod === 'net_discretionary'}
                    onChange={() => setCalcMethod('net_discretionary')}
                    className="mt-0.5 accent-cyan-600"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">Net Discretionary Pool / 30 Days</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      (Salary minus Rent, SIP, EMIs) ÷ 30 ={' '}
                      <span className="text-cyan-700 font-bold font-mono">
                        {formatINR(Math.round(Math.max(0, (parseFloat(salaryInput) || 100000) - totalFixed) / 30))}/day
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl btn-primary-mint text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              Update Salary & Allowance
            </button>
          </form>

          {/* Fixed Monthly Commitments */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fixed Commitments (Rent, SIP, EMIs)
                </h3>
                <p className="text-[11px] text-slate-500">Total: {formatINR(totalFixed)}/month</p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {profile.fixedCommitments.map((fix) => (
                <div
                  key={fix.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-800 truncate font-medium">{fix.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-cyan-700">{formatINR(fix.amount)}</span>
                    <button
                      onClick={() => removeFixedCommitment(fix.id)}
                      className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Fixed Commitment */}
            <form onSubmit={handleAddCommitment} className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Cook)"
                value={newCommitName}
                onChange={(e) => setNewCommitName(e.target.value)}
                className="w-1/2 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newCommitAmount}
                onChange={(e) => setNewCommitAmount(e.target.value)}
                className="w-1/3 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl btn-primary-mint text-white text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Sound toggle */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-700 flex items-center gap-2">
              {profile.enableSound ? <Volume2 className="w-4 h-4 text-[#0284C7]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Web Audio Chimes & Haptic Cues</span>
            </span>
            <input
              type="checkbox"
              checked={profile.enableSound}
              onChange={(e) => updateProfile({ enableSound: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 space-y-2">
          <button
            onClick={() => {
              resetToDemo();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs flex items-center justify-center gap-2 transition cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Load Bangalore Techie Demo (₹1L/mo)</span>
          </button>

          <button
            onClick={() => {
              clearAllData();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs flex items-center justify-center gap-2 transition cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Wipe Local Data & Start Fresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
