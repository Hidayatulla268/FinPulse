'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Flame,
  MessageSquare,
  QrCode,
  Radio,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  Wifi,
  X,
  Zap,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { analyzeTransferDestination } from '@/lib/bankStatementIntelligence';
import { formatINR } from '@/lib/categorizer';
import { Transaction } from '@/types/finance';

interface AutoBankSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_BANK_SMS = [
  {
    label: 'HDFC Swiggy UPI',
    sms: 'Dear HDFC Bank User, Rs. 480.00 debited from A/c **4921 on 22-OCT-26 to VPA swiggy@icici (UPI Ref 529381923). Bal: Rs. 47,250.00',
  },
  {
    label: 'SBI Zepto Cravings',
    sms: 'Sent Rs. 385.00 from SBI A/c 3812 to ZEPTO QUICK via UPI. Ref 928371982. Avl Bal Rs 18,200',
  },
  {
    label: 'ICICI Chai Tapri',
    sms: 'ICICI Bank: Acct XX102 debited for Rs 40.00 on 22-Oct-26 to RAMESH CHAI TAPRI (UPI: ramesh@okaxis). Info: Tea and bun maska',
  },
  {
    label: 'Axis House Rent NEFT',
    sms: 'Axis Bank: INR 25,000.00 transferred via NEFT to ANITA SHARMA (A/c 00129210) on 22-Oct-26. Ref N129381. Desc: Rent for October',
  },
];

export const AutoBankSyncModal: React.FC<AutoBankSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    connectedBank,
    lastBankSyncTime,
    isAutoSyncing,
    triggerBankSync,
    parseAndAddBankSms,
    dailyAllowance,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'live_sync' | 'sms_reader' | 'transfer_inspector'>('live_sync');
  const [smsInput, setSmsInput] = useState<string>('');
  const [testNarration, setTestNarration] = useState<string>('UPI/DR/58291029102/ZEPTO QUICK/zepto@icici/ICICI Bank');
  const [autoSyncIntervalActive, setAutoSyncIntervalActive] = useState<boolean>(true);
  const [lastFetchedItems, setLastFetchedItems] = useState<Transaction[]>([]);
  const [successToast, setSuccessToast] = useState<string>('');

  if (!isOpen) return null;

  const handleManualBankPoll = async () => {
    const items = await triggerBankSync();
    setLastFetchedItems(items);
    setSuccessToast(`Auto-fetched ${items.length} new bank debits!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const result = parseAndAddBankSms(smsInput);
    if (result) {
      setLastFetchedItems([result]);
      setSuccessToast(`Auto-detected payment of ${formatINR(result.amount)} transferred to ${result.transferredTo || result.merchant}!`);
      setSmsInput('');
      setTimeout(() => setSuccessToast(''), 4000);
    } else {
      alert('Could not detect a valid debit amount or recipient from this SMS. Please check format.');
    }
  };

  const detectedInspection = analyzeTransferDestination(testNarration, 450);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl glass-panel-elevated p-5 sm:p-8 shadow-2xl relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284C7]">
              <Building2 className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Auto Bank Statement Sync</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-ping" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically update payments from bank statements without typing manually
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

        {/* Tabs */}
        <div className="mt-4 flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('live_sync')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'live_sync'
                ? 'bg-white text-[#0284C7] font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Account Aggregator (Live)</span>
          </button>
          <button
            onClick={() => setActiveTab('sms_reader')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sms_reader'
                ? 'bg-white text-[#0284C7] font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Bank SMS Auto-Reader</span>
          </button>
          <button
            onClick={() => setActiveTab('transfer_inspector')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'transfer_inspector'
                ? 'bg-white text-[#0284C7] font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Transfer Detector</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mt-4 p-3 rounded-2xl bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* TAB 1: LIVE ACCOUNT AGGREGATOR SYNC */}
        {activeTab === 'live_sync' && (
          <div className="mt-5 space-y-4">
            {/* Connected Bank Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0284C7] font-bold text-sm shadow-sm">
                  🏦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{connectedBank}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                      RBI AA Linked
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-[#0284C7]" />
                    <span>Last Synced: {lastBankSyncTime}</span>
                    <span>•</span>
                    <span className="text-cyan-700 font-medium">Auto-detecting UPI & NEFT</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Mint Cyan CTA */}
              <button
                onClick={handleManualBankPoll}
                disabled={isAutoSyncing}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl btn-primary-mint text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                <span>{isAutoSyncing ? 'Fetching Bank Debits...' : 'Fetch New Bank Debits'}</span>
              </button>
            </div>

            {/* Auto-Sync Toggle & Frequency */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-[#0284C7]" />
                <div>
                  <div className="font-semibold text-slate-900">Live Background Bank Polling</div>
                  <div className="text-[11px] text-slate-500">
                    Auto-pulls statement updates without needing manual entry
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-mono font-semibold text-[#0284C7]">
                  {autoSyncIntervalActive ? 'Active' : 'Paused'}
                </span>
                <input
                  type="checkbox"
                  checked={autoSyncIntervalActive}
                  onChange={(e) => setAutoSyncIntervalActive(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Last Synced Items Preview */}
            {lastFetchedItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Recently Detected Transfers from Bank:</span>
                  <span className="text-cyan-700 font-mono">Deducted from ₹{dailyAllowance}/day limit</span>
                </div>

                <div className="space-y-2">
                  {lastFetchedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-[#0284C7] font-bold flex items-center justify-center">
                          {item.merchant.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.title}</span>
                            {item.vpa && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 font-mono text-[#0284C7]">
                                VPA: {item.vpa}
                              </span>
                            )}
                            {item.isImpulse && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5 text-amber-600" /> Impulse
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.notes}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-600 text-sm">
                          -{formatINR(item.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANK SMS AUTO-READER */}
        {activeTab === 'sms_reader' && (
          <div className="mt-5 space-y-4">
            {/* Quick 1-Click Samples */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                ⚡ Try pasting a bank debit SMS (or click a sample):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_BANK_SMS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSmsInput(sample.sms)}
                    className="px-3 py-1 rounded-xl text-xs bg-slate-100 border border-slate-200 hover:border-cyan-300 text-slate-600 hover:text-[#0284C7] transition cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSmsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Paste Bank SMS or UPI Notification Text
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste any bank SMS here e.g. 'Rs 420.00 debited from a/c **4921 to VPA zepto@icici on 22-OCT-26...'"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl btn-primary-mint text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Auto-Extract Transfer & Deduct from Allowance</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TRANSFER DESTINATION DETECTOR */}
        {activeTab === 'transfer_inspector' && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Test Bank Narration String
              </label>
              <input
                type="text"
                value={testNarration}
                onChange={(e) => setTestNarration(e.target.value)}
                placeholder="e.g. UPI/DR/529381923/ZEPTO/zepto@icici"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Destination Breakdown Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Where Money Was Transferred:</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase">Recipient / Destination</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {detectedInspection.recipientName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase">UPI VPA Handle</div>
                  <div className="font-mono font-semibold text-[#0284C7] mt-0.5">
                    {detectedInspection.upiVpa || 'None (Bank Transfer)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase">Transfer Type</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {detectedInspection.transferType.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-400 uppercase">Transfer Channel</div>
                  <div className="font-semibold text-[#0284C7] mt-0.5">
                    {detectedInspection.transferChannel} {detectedInspection.upiApp ? `(${detectedInspection.upiApp})` : ''}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Auto-Assigned Category: <strong className="text-slate-900 capitalize font-semibold">{detectedInspection.transferCategory}</strong></span>
                {detectedInspection.isImpulseSuspect && (
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Impulse Trigger
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
