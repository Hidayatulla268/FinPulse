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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl bg-sky-500/20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl bg-[#ff9900]/15 pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass-panel glass-specular text-sky-400 glow-sky-subtle">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Auto Bank Statement Sync</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full glass-pill border border-sky-400/40 text-sky-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Automatically update payments from bank statements without typing manually
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

        {/* Tabs */}
        <div className="mt-4 flex items-center p-1 rounded-2xl glass-panel border border-sky-500/20">
          <button
            onClick={() => setActiveTab('live_sync')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'live_sync'
                ? 'glass-panel-elevated glass-specular text-sky-300 font-bold glow-sky-subtle'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Account Aggregator (Live)</span>
          </button>
          <button
            onClick={() => setActiveTab('sms_reader')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'sms_reader'
                ? 'glass-panel-marigold glass-specular text-[#ff9900] font-bold glow-marigold-subtle'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Bank SMS Auto-Reader</span>
          </button>
          <button
            onClick={() => setActiveTab('transfer_inspector')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'transfer_inspector'
                ? 'glass-panel-elevated glass-specular text-sky-400 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Transfer Detector</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mt-4 p-3 rounded-2xl glass-panel-elevated glass-specular border-sky-400/50 text-sky-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* TAB 1: LIVE ACCOUNT AGGREGATOR SYNC */}
        {activeTab === 'live_sync' && (
          <div className="mt-5 space-y-4">
            {/* Connected Bank Card */}
            <div className="p-5 rounded-2xl glass-panel-elevated glass-specular flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl glass-panel-marigold glass-specular flex items-center justify-center text-[#ff9900] font-bold text-sm shadow-md">
                  🏦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{connectedBank}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full glass-pill text-sky-300 font-bold border border-sky-400/40">
                      RBI AA Linked
                    </span>
                  </div>
                  <div className="text-xs text-sky-200/60 mt-0.5 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>Last Synced: {lastBankSyncTime}</span>
                    <span>•</span>
                    <span className="text-[#ff9900] font-medium">Auto-detecting UPI & NEFT</span>
                  </div>
                </div>
              </div>

              {/* Action Button in Sky Blue to Marigold */}
              <button
                onClick={handleManualBankPoll}
                disabled={isAutoSyncing}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-lg glow-sky-subtle flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                <span>{isAutoSyncing ? 'Fetching Bank Debits...' : 'Fetch New Bank Debits'}</span>
              </button>
            </div>

            {/* Auto-Sync Toggle & Frequency */}
            <div className="p-4 rounded-2xl glass-panel glass-specular flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-semibold text-white">Live Background Bank Polling</div>
                  <div className="text-[11px] text-sky-200/60">
                    Auto-pulls statement updates without needing manual entry
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-mono text-sky-400">
                  {autoSyncIntervalActive ? 'Active' : 'Paused'}
                </span>
                <input
                  type="checkbox"
                  checked={autoSyncIntervalActive}
                  onChange={(e) => setAutoSyncIntervalActive(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Last Synced Items Preview */}
            {lastFetchedItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-300/80 flex items-center justify-between">
                  <span>Recently Detected Transfers from Bank:</span>
                  <span className="text-[#ff9900] font-mono">Deducted from ₹{dailyAllowance}/day limit</span>
                </div>

                <div className="space-y-2">
                  {lastFetchedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl glass-panel glass-specular flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl glass-panel-marigold glass-specular text-[#ff9900] font-bold flex items-center justify-center">
                          {item.merchant.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{item.title}</span>
                            {item.vpa && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill font-mono text-sky-300 border border-sky-500/30">
                                VPA: {item.vpa}
                              </span>
                            )}
                            {item.isImpulse && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full glass-panel-marigold text-[#ff9900] font-semibold flex items-center gap-1">
                                <Flame className="w-2.5 h-2.5" /> Impulse
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            {item.notes}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-[#ff9900] text-sm">
                          -{formatINR(item.amount)}
                        </div>
                        <div className="text-[10px] text-gray-500">{item.time}</div>
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
              <div className="text-xs font-semibold text-sky-300/80 mb-2">
                ⚡ Try pasting a bank debit SMS (or click a sample):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_BANK_SMS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSmsInput(sample.sms)}
                    className="px-3 py-1 rounded-xl text-xs glass-pill border border-white/10 hover:border-sky-400 text-gray-300 hover:text-sky-300 transition cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSmsSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sky-300/80 mb-1.5">
                  Paste Bank SMS or UPI Notification Text
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste any bank SMS here e.g. 'Rs 420.00 debited from a/c **4921 to VPA zepto@icici on 22-OCT-26...'"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  className="w-full p-3 rounded-2xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-xs shadow-lg glow-sky-subtle flex items-center justify-center gap-2 transition cursor-pointer"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-300/80 mb-1.5">
                Test Bank Narration String
              </label>
              <input
                type="text"
                value={testNarration}
                onChange={(e) => setTestNarration(e.target.value)}
                placeholder="e.g. UPI/DR/529381923/ZEPTO/zepto@icici"
                className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-mono text-white focus:outline-none"
              />
            </div>

            {/* Destination Breakdown Card */}
            <div className="p-5 rounded-2xl glass-panel-elevated glass-specular space-y-3">
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
                <span>Where Money Was Transferred:</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl glass-panel">
                  <div className="text-[10px] text-gray-400 uppercase">Recipient / Destination</div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {detectedInspection.recipientName}
                  </div>
                </div>

                <div className="p-3 rounded-xl glass-panel">
                  <div className="text-[10px] text-gray-400 uppercase">UPI VPA Handle</div>
                  <div className="font-mono font-semibold text-sky-400 mt-0.5">
                    {detectedInspection.upiVpa || 'None (Bank Transfer)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl glass-panel">
                  <div className="text-[10px] text-gray-400 uppercase">Transfer Type</div>
                  <div className="font-semibold text-[#ff9900] mt-0.5">
                    {detectedInspection.transferType.replace('_', ' ')}
                  </div>
                </div>

                <div className="p-3 rounded-xl glass-panel">
                  <div className="text-[10px] text-gray-400 uppercase">Transfer Channel</div>
                  <div className="font-semibold text-sky-300 mt-0.5">
                    {detectedInspection.transferChannel} {detectedInspection.upiApp ? `(${detectedInspection.upiApp})` : ''}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl glass-panel text-xs text-gray-300 flex items-center justify-between">
                <span>Auto-Assigned Category: <strong className="text-white capitalize">{detectedInspection.transferCategory}</strong></span>
                {detectedInspection.isImpulseSuspect && (
                  <span className="text-[11px] text-[#ff9900] font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3 text-[#ff9900]" /> Impulse Trigger
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
