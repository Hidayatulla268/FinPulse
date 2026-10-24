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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-md h-full glass-panel-elevated glass-specular border-l border-sky-500/25 p-6 sm:p-7 overflow-y-auto shadow-2xl relative flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl glass-panel glass-specular text-sky-400 glow-sky-subtle">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Budget Calculator & Profile</h2>
                <p className="text-xs text-sky-200/60 mt-0.5">Configure Indian salary & daily allowance formula</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-pill text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Salary & Calculator Formula */}
          <form onSubmit={handleSalarySave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-300/80 mb-1.5">
                Monthly In-Hand Salary (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-[#ff9900]">
                  ₹
                </span>
                <input
                  type="number"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-lg font-bold font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Formula Toggle */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-300/80 mb-1.5">
                Daily Allowance Calculation Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`p-3.5 rounded-2xl cursor-pointer text-xs transition flex items-start gap-2.5 ${
                    calcMethod === 'gross_div_30'
                      ? 'glass-panel-elevated glass-specular text-white glow-sky-subtle border-sky-400/60'
                      : 'glass-panel text-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={calcMethod === 'gross_div_30'}
                    onChange={() => setCalcMethod('gross_div_30')}
                    className="mt-0.5 accent-sky-400"
                  />
                  <div>
                    <div className="font-semibold text-white">Gross Salary / 30 Days</div>
                    <div className="text-[11px] text-sky-200/60 mt-0.5">
                      Standard core formula: ₹{salaryInput} ÷ 30 ={' '}
                      <span className="text-[#ff9900] font-bold font-mono">
                        {formatINR(Math.round((parseFloat(salaryInput) || 100000) / 30))}/day
                      </span>
                    </div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-2xl cursor-pointer text-xs transition flex items-start gap-2.5 ${
                    calcMethod === 'net_discretionary'
                      ? 'glass-panel-elevated glass-specular text-white glow-sky-subtle border-sky-400/60'
                      : 'glass-panel text-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="calcMethod"
                    checked={calcMethod === 'net_discretionary'}
                    onChange={() => setCalcMethod('net_discretionary')}
                    className="mt-0.5 accent-sky-400"
                  />
                  <div>
                    <div className="font-semibold text-white">Net Discretionary Pool / 30 Days</div>
                    <div className="text-[11px] text-sky-200/60 mt-0.5">
                      (Salary minus Rent, SIP, EMIs) ÷ 30 ={' '}
                      <span className="text-[#ff9900] font-bold font-mono">
                        {formatINR(Math.round(Math.max(0, (parseFloat(salaryInput) || 100000) - totalFixed) / 30))}/day
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-lg glow-sky-subtle transition cursor-pointer"
            >
              Update Salary & Allowance
            </button>
          </form>

          {/* Fixed Monthly Commitments */}
          <div className="mt-6 pt-5 border-t border-sky-500/15">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-300/80">
                  Fixed Commitments (Rent, SIP, EMIs)
                </h3>
                <p className="text-[11px] text-sky-200/50">Total: {formatINR(totalFixed)}/month</p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {profile.fixedCommitments.map((fix) => (
                <div
                  key={fix.id}
                  className="p-2.5 rounded-xl glass-panel glass-specular flex items-center justify-between text-xs"
                >
                  <span className="text-sky-100 truncate font-medium">{fix.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#ff9900]">{formatINR(fix.amount)}</span>
                    <button
                      onClick={() => removeFixedCommitment(fix.id)}
                      className="text-gray-500 hover:text-[#ff9900] transition cursor-pointer"
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
                className="w-1/2 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                value={newCommitAmount}
                onChange={(e) => setNewCommitAmount(e.target.value)}
                className="w-1/3 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl glass-panel-marigold glass-specular text-[#ff9900] hover:brightness-110 text-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Sound toggle */}
          <div className="mt-6 pt-5 border-t border-sky-500/15 flex items-center justify-between text-xs">
            <span className="text-sky-200 flex items-center gap-2">
              {profile.enableSound ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
              <span>Web Audio Chimes & Haptic Cues</span>
            </span>
            <input
              type="checkbox"
              checked={profile.enableSound}
              onChange={(e) => updateProfile({ enableSound: e.target.checked })}
              className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-sky-500/15 space-y-2">
          <button
            onClick={() => {
              resetToDemo();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl glass-panel hover:border-sky-400 text-sky-200 text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
            <span>Load Bangalore Techie Demo (₹1L/mo)</span>
          </button>

          <button
            onClick={() => {
              clearAllData();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl glass-panel-marigold hover:brightness-110 text-[#ff9900] text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Local Data & Start Fresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
