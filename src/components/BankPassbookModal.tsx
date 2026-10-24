'use client';

import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  Coins,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  History,
  IndianRupee,
  Lightbulb,
  Plus,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { IndianBankName } from '@/types/finance';

interface BankPassbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BankPassbookModal: React.FC<BankPassbookModalProps> = ({ isOpen, onClose }) => {
  const {
    bankAccounts,
    activeBankAccountId,
    activeAccount,
    totalLiquidBalance,
    transactions,
    isRealtimeListening,
    toggleRealtimeListening,
    triggerLiveAccountDebit,
    triggerLiveAccountCredit,
    switchActiveBankAccount,
    connectBankAccount,
    disconnectBankAccount,
    aiAudit,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'passbook' | 'accounts' | 'connect' | 'ai_audit'>('passbook');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '30d' | '90d' | 'qcommerce'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Auto-Scan progress and phase state
  const [scanPhase, setScanPhase] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedNotification, setScannedNotification] = useState<{
    count: number;
    bankName: string;
    balance: number;
  } | null>(null);

  // New Bank Connect Form State
  const [selectedBankName, setSelectedBankName] = useState<IndianBankName>('HDFC Bank');
  const [accountType, setAccountType] = useState<'Salary' | 'Savings' | 'Current'>('Savings');
  const [phoneInput, setPhoneInput] = useState<string>('9876543210');
  const [otpInput, setOtpInput] = useState<string>('482910');
  const [accountNumberInput, setAccountNumberInput] = useState<string>('501004829102');
  const [initialBalanceInput, setInitialBalanceInput] = useState<string>('75000');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  // Filter transactions for passbook
  const filteredTxns = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      // Filter by active account if set
      if (activeBankAccountId && t.bankAccountId && t.bankAccountId !== activeBankAccountId) {
        return false;
      }
      // Filter by Debit vs Credit
      if (filterType === 'debit' && t.txnType === 'credit') return false;
      if (filterType === 'credit' && t.txnType !== 'credit') return false;

      // Filter by Timeframe or Special Category
      if (timeframeFilter === '30d') {
        const txnDate = new Date(t.date);
        const diffDays = (now.getTime() - txnDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return false;
      } else if (timeframeFilter === '90d') {
        const txnDate = new Date(t.date);
        const diffDays = (now.getTime() - txnDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 90) return false;
      } else if (timeframeFilter === 'qcommerce') {
        const isQc =
          t.category === 'groceries' ||
          t.merchant.toLowerCase().includes('zepto') ||
          t.merchant.toLowerCase().includes('blinkit') ||
          t.merchant.toLowerCase().includes('swiggy') ||
          t.merchant.toLowerCase().includes('zomato');
        if (!isQc) return false;
      }

      // Filter by search query (UTR, merchant, title, notes, VPA)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMerchant = t.merchant.toLowerCase().includes(q);
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesUtr = (t.utrNumber || '').toLowerCase().includes(q);
        const matchesVpa = (t.vpa || '').toLowerCase().includes(q);
        const matchesTo = (t.transferredTo || '').toLowerCase().includes(q);
        return matchesMerchant || matchesTitle || matchesUtr || matchesVpa || matchesTo;
      }
      return true;
    });
  }, [transactions, activeBankAccountId, filterType, timeframeFilter, searchQuery]);

  if (!isOpen) return null;

  const handleCopyUtr = (utr: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(utr);
      setCopiedUtr(utr);
      setTimeout(() => setCopiedUtr(null), 2000);
    }
  };

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLinking(true);
    setScanProgress(15);
    setScanPhase(`Connecting to ${selectedBankName} Open Banking gateway...`);

    setTimeout(() => {
      setScanProgress(45);
      setScanPhase(`Authenticating 256-bit consent & decrypting 90-day statements...`);
    }, 400);

    setTimeout(() => {
      setScanProgress(80);
      setScanPhase(`Extracting historical debits & credits. Computing running balances...`);
    }, 900);

    setTimeout(() => {
      setScanProgress(100);
      setScanPhase(`Finpulse AI auto-categorization complete!`);

      const masked = `•••• ${accountNumberInput.slice(-4) || '9102'}`;
      const { bank: newBank, scannedTxnCount } = connectBankAccount({
        bankName: selectedBankName,
        accountType,
        accountNumberMasked: masked,
        ifscCode: `${selectedBankName.substring(0, 4).toUpperCase()}0001234`,
        upiId: `${accountNumberInput.slice(-4) || 'user'}@ok${selectedBankName.toLowerCase().replace(/\s+/g, '')}`,
        isPrimary: false,
        colorTheme: bankAccounts.length % 2 === 0 ? 'sky' : 'marigold',
        initialBalance: parseFloat(initialBalanceInput) || 50000,
      });

      setIsLinking(false);
      setLinkSuccess(true);
      setScannedNotification({
        count: scannedTxnCount,
        bankName: selectedBankName,
        balance: parseFloat(initialBalanceInput) || 50000,
      });

      setTimeout(() => {
        setLinkSuccess(false);
        setActiveTab('passbook');
      }, 900);
    }, 1400);
  };

  const handleExportPassbook = () => {
    const csvContent =
      'Date,Time,Bank,Account,Type,Merchant,Transferred_To,VPA,Amount_INR,Balance_After,UTR\n' +
      filteredTxns
        .map(
          (t) =>
            `"${t.date}","${t.time}","${t.bankName || 'HDFC Bank'}","${t.accountMasked || '•••• 4921'}","${
              t.txnType || 'debit'
            }","${t.merchant}","${t.transferredTo || ''}","${t.vpa || ''}",${t.amount},${t.balanceAfter || ''},"${
              t.utrNumber || ''
            }"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bank_Passbook_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel-elevated glass-specular shadow-2xl overflow-hidden text-gray-100">
        
        {/* Top Header with Sky Blue and Marigold Brand Aura */}
        <div className="relative px-6 py-5 border-b border-sky-500/20 glass-panel flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/20 to-[#ff9900]/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-md glass-specular">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Bank Passbook & Live Account Vault
                </h2>
                <span className="glass-pill px-2.5 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/30">
                  RBI AA Framework
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Real-time bank ledger storing every transaction with recipient and UTR tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime Stream Toggle */}
            <button
              onClick={toggleRealtimeListening}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border glass-pill ${
                isRealtimeListening
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 glow-sky-subtle'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
              title="Toggle automatic bank stream listener"
            >
              <Radio className={`w-3.5 h-3.5 ${isRealtimeListening ? 'animate-pulse text-sky-400' : 'text-gray-500'}`} />
              <span>{isRealtimeListening ? 'Live Stream: ACTIVE' : 'Stream: PAUSED'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white glass-pill border border-transparent hover:border-sky-500/30 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Liquid Net Balance & Quick Account Switcher Bar */}
        <div className="px-6 py-4 glass-panel border-b border-sky-500/15 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-sky-300/70">Total Liquid Bank Balance</span>
            <div className="text-2xl font-extrabold text-[#ff9900] tracking-tight flex items-baseline gap-1.5 mt-0.5">
              <span>{formatINR(totalLiquidBalance)}</span>
              <span className="text-xs font-normal text-sky-400">across {bankAccounts.length} linked accounts</span>
            </div>
          </div>

          {/* Account selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {bankAccounts.map((acc) => {
              const isSelected = acc.id === activeBankAccountId;
              return (
                <button
                  key={acc.id}
                  onClick={() => switchActiveBankAccount(acc.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-panel-elevated glass-specular border-sky-400/60 text-sky-200 glow-sky-subtle'
                      : 'glass-panel text-gray-400 hover:text-gray-200 hover:border-sky-500/30'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-sky-400 animate-ping' : 'bg-gray-600'
                    }`}
                  />
                  <div className="text-left">
                    <div className="font-semibold text-white leading-none">{acc.bankName}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {acc.accountNumberMasked} • <span className="text-[#ff9900] font-semibold">{formatINR(acc.balance)}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setActiveTab('connect')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium glass-panel-marigold glass-specular text-[#ff9900] hover:brightness-110 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Bank</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Action Bar (Realtime Test buttons) */}
        <div className="px-6 py-2.5 glass-panel border-b border-sky-500/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="flex items-center gap-1.5 font-semibold text-sky-400">
              <Zap className="w-3.5 h-3.5 text-[#ff9900]" />
              Live Simulation:
            </span>
            <span className="text-gray-400">Read & store real-time transactions in bank ledger</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerLiveAccountDebit()}
              className="px-3.5 py-1.5 rounded-xl glass-panel-marigold glass-specular text-[#ff9900] font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer hover:brightness-110"
            >
              <TrendingDown className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>+ Simulate Debit (Zepto/Swiggy/Chai)</span>
            </button>

            <button
              onClick={() => triggerLiveAccountCredit(2500, 'Salary Bonus & UPI Split')}
              className="px-3.5 py-1.5 rounded-xl glass-panel glass-specular text-sky-300 font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer hover:brightness-110"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Simulate Inward Credit</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-sky-500/10 flex flex-wrap items-center justify-between gap-3 glass-panel">
          <div className="flex flex-wrap space-x-4 sm:space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('passbook')}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'passbook'
                  ? 'border-sky-400 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Transaction Passbook</span>
              <span className="glass-pill px-2 py-0.5 text-[10px] text-sky-300 border border-sky-500/30">
                {filteredTxns.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`py-3.5 border-b-2 transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'accounts'
                  ? 'border-sky-400 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Connected Accounts</span>
              <span className="glass-pill px-2 py-0.5 text-[10px] text-gray-400 border border-white/10">
                {bankAccounts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('connect')}
              className={`py-3.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'connect'
                  ? 'border-[#ff9900] text-[#ff9900] drop-shadow-[0_0_8px_rgba(255,153,0,0.5)]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>Connect New Account</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_audit')}
              className={`py-3.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai_audit'
                  ? 'border-sky-300 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-[#ff9900] animate-pulse" />
              <span>AI Statement Audit</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-sky-400 to-[#ff9900] text-black">
                AI
              </span>
            </button>
          </div>

          {activeTab === 'passbook' && (
            <button
              onClick={handleExportPassbook}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-sky-300/80 hover:text-sky-300 glass-pill border border-sky-500/20 hover:border-sky-500/40 transition cursor-pointer"
              title="Export Passbook CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Statement</span>
            </button>
          )}
        </div>

        {/* TAB 1: PASSBOOK LEDGER */}
        {activeTab === 'passbook' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
            {/* Auto-Scanned Success Notification Banner */}
            {scannedNotification && (
              <div className="m-4 p-4 rounded-2xl glass-panel-elevated border border-sky-400/50 glow-sky flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-[#ff9900] flex items-center justify-center text-black font-extrabold text-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      🎉 Account Auto-Scan Complete: {scannedNotification.count} Past Transactions Imported!
                    </h4>
                    <p className="text-[11px] text-gray-300">
                      Statement synchronized for <strong className="text-sky-300">{scannedNotification.bankName}</strong>. Verified running balance set to <strong className="text-[#ff9900]">{formatINR(scannedNotification.balance)}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('ai_audit')}
                    className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-[#ff9900]" />
                    <span>Run AI Audit</span>
                  </button>

                  <button
                    onClick={() => setScannedNotification(null)}
                    className="p-1 rounded-lg glass-pill text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="p-4 border-b border-sky-500/10 flex flex-wrap items-center justify-between gap-3 glass-panel">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by recipient, UTR, VPA (e.g. Zepto, Swiggy, 429188)..."
                  className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none transition"
                />
              </div>

              {/* Debit / Credit Pill */}
              <div className="flex items-center gap-1 p-1 rounded-xl glass-panel border border-sky-500/15 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    filterType === 'all'
                      ? 'glass-panel-elevated glass-specular text-sky-300 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  All Entries
                </button>
                <button
                  onClick={() => setFilterType('debit')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    filterType === 'debit'
                      ? 'glass-panel-marigold glass-specular text-[#ff9900] font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Debits
                </button>
                <button
                  onClick={() => setFilterType('credit')}
                  className={`px-3 py-1.5 rounded-lg transition font-medium cursor-pointer ${
                    filterType === 'credit'
                      ? 'glass-panel-elevated glass-specular text-sky-400 font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Credits
                </button>
              </div>

              {/* Timeframe & Quick Commerce Filter Chips */}
              <div className="w-full flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                <span className="text-[10px] uppercase font-bold text-gray-500 shrink-0">Timeline:</span>
                {[
                  { id: 'all', label: 'All Dates' },
                  { id: '30d', label: 'Past 30 Days' },
                  { id: '90d', label: 'Past 90 Days' },
                  { id: 'qcommerce', label: '⚡ Quick Commerce & Food Leaks' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setTimeframeFilter(chip.id as typeof timeframeFilter)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer shrink-0 ${
                      timeframeFilter === chip.id
                        ? 'bg-sky-500/25 border border-sky-400/40 text-sky-300 font-bold'
                        : 'glass-pill text-gray-400 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Passbook Table / List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-900/80">
              {filteredTxns.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-sm">
                  <p>No transactions match your search filter.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="mt-3 text-xs text-sky-400 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredTxns.map((txn) => {
                  const isCredit = txn.txnType === 'credit';
                  return (
                    <div
                      key={txn.id}
                      className="p-4 hover:bg-white/[0.04] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b border-white/[0.04]"
                    >
                      {/* Left: Transaction Narration & Transferred Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border glass-specular ${
                            isCredit
                              ? 'glass-panel text-sky-400'
                              : 'glass-panel-marigold text-[#ff9900]'
                          }`}
                        >
                          {isCredit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-sm">{txn.title}</span>
                            {txn.isImpulse && (
                              <span className="glass-pill px-2 py-0.5 text-[10px] font-bold text-[#ff9900] border border-[#ff9900]/40">
                                🔥 Impulse
                              </span>
                            )}
                            <span className="glass-pill px-2 py-0.5 text-[10px] font-medium text-gray-400 border border-white/10">
                              {txn.bankName || 'HDFC Bank'} {txn.accountMasked || '•••• 4921'}
                            </span>
                          </div>

                          {/* Recipient & VPA Info */}
                          <div className="text-gray-400 mt-1 flex items-center gap-2 flex-wrap text-[11px]">
                            {txn.transferredTo && (
                              <span className="text-gray-300">
                                Transferred to: <strong className="text-white font-medium">{txn.transferredTo}</strong>
                              </span>
                            )}
                            {txn.vpa && (
                              <span className="text-sky-300 font-mono glass-pill px-2 py-0.5 text-[10px] border border-sky-500/30">
                                {txn.vpa}
                              </span>
                            )}
                            {txn.transferType && (
                              <span className="text-gray-500">• {txn.transferType}</span>
                            )}
                          </div>

                          {/* Timestamp and UTR */}
                          <div className="text-gray-500 mt-1 flex items-center gap-3 text-[10px]">
                            <span>
                              {txn.date} at {txn.time}
                            </span>
                            {txn.utrNumber && (
                              <span className="flex items-center gap-1 font-mono text-gray-400">
                                Ref/UTR: {txn.utrNumber}
                                <button
                                  onClick={() => handleCopyUtr(txn.utrNumber!)}
                                  className="text-gray-500 hover:text-sky-400 transition cursor-pointer"
                                  title="Copy UTR"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {copiedUtr === txn.utrNumber && (
                                  <span className="text-sky-400 text-[10px]">Copied!</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Account Balance After Transaction */}
                      <div className="text-right sm:shrink-0 pl-12 sm:pl-0">
                        <div
                          className={`text-base font-extrabold tracking-tight ${
                            isCredit ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'text-[#ff9900] drop-shadow-[0_0_8px_rgba(255,153,0,0.4)]'
                          }`}
                        >
                          {isCredit ? '+' : '-'} {formatINR(txn.amount)}
                        </div>
                        {txn.balanceAfter !== undefined && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Bal: {formatINR(txn.balanceAfter)}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
                          {txn.paymentMode} {txn.upiApp ? `• ${txn.upiApp}` : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONNECTED ACCOUNTS */}
        {activeTab === 'accounts' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Your Connected Indian Bank Accounts</h3>
              <span className="text-xs text-sky-400 flex items-center gap-1.5 glass-pill px-3 py-1 border border-sky-500/30">
                <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted Data Read
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map((acc) => {
                const isCurrentActive = acc.id === activeBankAccountId;
                return (
                  <div
                    key={acc.id}
                    className={`p-5 rounded-2xl transition-all ${
                      isCurrentActive
                        ? 'glass-panel-elevated glass-specular border-sky-400/50 glow-sky-subtle'
                        : 'glass-panel glass-specular hover:border-sky-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl glass-panel glass-specular flex items-center justify-center text-sky-400 font-bold border border-sky-500/30">
                          {acc.bankName.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-base">{acc.bankName}</div>
                          <div className="text-xs text-gray-400">
                            {acc.accountType} A/c • {acc.accountNumberMasked}
                          </div>
                        </div>
                      </div>

                      {isCurrentActive && (
                        <span className="glass-pill px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-400/50">
                          Active Primary
                        </span>
                      )}
                    </div>

                    <div className="mt-5 p-3.5 rounded-xl glass-panel glass-specular flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-semibold text-gray-400">Available Liquid Balance</div>
                        <div className="text-xl font-extrabold text-[#ff9900] tracking-tight">
                          {formatINR(acc.balance)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400">UPI ID</div>
                        <div className="text-xs text-sky-400 font-mono">{acc.upiId}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> {acc.lastSyncedAt}
                      </span>

                      <div className="flex items-center gap-2">
                        {!isCurrentActive && (
                          <button
                            onClick={() => switchActiveBankAccount(acc.id)}
                            className="text-xs text-sky-400 hover:underline cursor-pointer"
                          >
                            Set Active
                          </button>
                        )}
                        {bankAccounts.length > 1 && (
                          <button
                            onClick={() => disconnectBankAccount(acc.id)}
                            className="p-1 text-gray-500 hover:text-red-400 transition cursor-pointer"
                            title="Disconnect Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CONNECT NEW ACCOUNT FORM */}
        {activeTab === 'connect' && (
          <div className="flex-1 p-6 overflow-y-auto bg-transparent">
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl glass-panel-marigold glass-specular text-[#ff9900] mb-2 shadow-lg">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Connect Your Indian Bank Account</h3>
                <p className="text-xs text-sky-200/60 mt-1">
                  Read live transaction debits automatically via Reserve Bank of India (RBI) Account Aggregator
                </p>
              </div>

              {linkSuccess ? (
                <div className="p-8 rounded-3xl glass-panel-elevated glass-specular text-center glow-sky">
                  <CheckCircle2 className="w-12 h-12 text-sky-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="text-lg font-bold text-white">Bank Account Linked Successfully!</h4>
                  <p className="text-xs text-sky-200/70 mt-1">
                    Live stream is active. Your daily budget will auto-deduct whenever money is transferred.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConnectSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-sky-300/80 mb-1.5">Select Your Bank</label>
                    <select
                      value={selectedBankName}
                      onChange={(e) => setSelectedBankName(e.target.value as IndianBankName)}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="HDFC Bank" className="bg-black text-white">HDFC Bank</option>
                      <option value="ICICI Bank" className="bg-black text-white">ICICI Bank</option>
                      <option value="State Bank of India" className="bg-black text-white">State Bank of India (SBI)</option>
                      <option value="Axis Bank" className="bg-black text-white">Axis Bank</option>
                      <option value="Kotak Mahindra Bank" className="bg-black text-white">Kotak Mahindra Bank</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sky-300/80 mb-1.5">Account Type</label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as 'Salary' | 'Savings' | 'Current')}
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Savings" className="bg-black text-white">Savings Account</option>
                        <option value="Salary" className="bg-black text-white">Salary Account</option>
                        <option value="Current" className="bg-black text-white">Current Account</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sky-300/80 mb-1.5">Bank Account Number</label>
                      <input
                        type="text"
                        value={accountNumberInput}
                        onChange={(e) => setAccountNumberInput(e.target.value)}
                        placeholder="e.g. 501004829102"
                        required
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-sky-300/80 mb-1.5">
                        Bank Registered Mobile (+91)
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-sky-300/80 mb-1.5">
                        Starting Balance (INR)
                      </label>
                      <input
                        type="number"
                        value={initialBalanceInput}
                        onChange={(e) => setInitialBalanceInput(e.target.value)}
                        placeholder="75000"
                        required
                        className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl glass-panel glass-specular text-xs text-sky-200/70 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Bank-Grade Privacy:</strong> Finpulse has view-only access to your
                      statement debits via regulated consent. We cannot initiate transactions or access your money.
                    </div>
                  </div>

                  {isLinking ? (
                    <div className="p-5 rounded-2xl glass-panel-elevated border border-sky-400/50 glow-sky space-y-3.5 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white">Auto-Scanning {selectedBankName}</h4>
                            <p className="text-[11px] text-sky-300">{scanPhase}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs text-[#ff9900]">{scanProgress}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-sky-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>

                      {/* Live Step Checklist */}
                      <div className="space-y-1.5 text-xs text-gray-300">
                        <div className={`flex items-center gap-2 ${scanProgress >= 25 ? 'text-sky-300' : 'text-gray-500'}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${scanProgress >= 25 ? 'text-sky-400' : 'text-gray-600'}`} />
                          <span>Authenticating 256-bit secure gateway</span>
                        </div>
                        <div className={`flex items-center gap-2 ${scanProgress >= 60 ? 'text-sky-300' : 'text-gray-500'}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${scanProgress >= 60 ? 'text-sky-400' : 'text-gray-600'}`} />
                          <span>Decrypting past 90-day UPI & statement ledger</span>
                        </div>
                        <div className={`flex items-center gap-2 ${scanProgress >= 85 ? 'text-sky-300' : 'text-gray-500'}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${scanProgress >= 85 ? 'text-sky-400' : 'text-gray-600'}`} />
                          <span>Categorizing historical debits & computing running balances</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Authorize & Auto-Scan Account</span>
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AI STATEMENT AUDIT */}
        {activeTab === 'ai_audit' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-transparent">
            {/* Top AI Health Verdict Card */}
            <div className="p-6 rounded-2xl glass-panel-elevated glass-specular border border-sky-400/40 glow-sky flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-300 to-[#ff9900] flex items-center justify-center text-black font-black text-xl shadow-lg shrink-0">
                  <BrainCircuit className="w-8 h-8 text-black" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-[11px] font-bold">
                    <span>Finpulse Neural Engine</span>
                    <span>•</span>
                    <span>Account Statement Audit</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {activeAccount?.bankName} Statement Health: <span className="text-[#ff9900]">{aiAudit.healthScore}/100</span>
                  </h3>
                  <p className="text-xs text-gray-300">{aiAudit.verdict}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-black/50 border border-sky-500/20 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Safety Runway</div>
                  <div className="text-sm font-extrabold text-[#ff9900]">{aiAudit.runwayMonths} Months</div>
                </div>
                <div className="px-4 py-2 rounded-xl bg-black/50 border border-sky-500/20 text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Annual Cash Drag</div>
                  <div className="text-sm font-extrabold text-red-400">-{formatINR(aiAudit.inflationDragAnnualINR)}</div>
                </div>
              </div>
            </div>

            {/* AI Diagnosis Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-sky-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300 mb-1">
                  <Zap className="w-4 h-4 text-[#ff9900]" />
                  <span>Q-Commerce Leak</span>
                </div>
                <div className="text-xl font-extrabold text-white">{formatINR(aiAudit.quickCommerceLeakMonthly)}</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Includes ~₹{aiAudit.deliverySurgeLossMonthly} lost in delivery, handling, and platform surcharges.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-sky-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300 mb-1">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Inflation Purchasing Drag</span>
                </div>
                <div className="text-xl font-extrabold text-red-400">5.40% Urban CPI</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Savings yield is only 2.8%. Real purchasing loss is 2.6% on uninvested account balance.
                </p>
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-sky-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ff9900] mb-1">
                  <Coins className="w-4 h-4 text-[#ff9900]" />
                  <span>Unlocked Monthly Surplus</span>
                </div>
                <div className="text-xl font-extrabold text-[#ff9900]">+{formatINR(aiAudit.potentialMonthlySavingsINR)}/mo</div>
                <p className="text-[11px] text-gray-400 mt-1">
                  By batching micro-orders and setting an automated sweep-in deposit.
                </p>
              </div>
            </div>

            {/* Top AI Actionable Recommendations */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-sky-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#ff9900]" />
                <span>AI Actionable Playbook for this Account</span>
              </h4>

              <div className="space-y-3">
                {aiAudit.suggestions.map((sug) => (
                  <div key={sug.id} className="p-4 rounded-xl glass-panel border border-sky-500/20 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300">
                          {sug.tag}
                        </span>
                        <span className="text-xs font-bold text-white">{sug.title}</span>
                      </div>
                      <p className="text-xs text-gray-300">{sug.action}</p>
                      <div className="text-[11px] text-gray-500 mt-1 italic flex items-center gap-1">
                        <Globe className="w-3 h-3 text-sky-400" />
                        <span>{sug.worldContext}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#ff9900]">
                        +{formatINR(sug.impactINR)}/{sug.impactPeriod === 'annual' ? 'yr' : 'mo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 glass-panel border-t border-sky-500/15 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Active Account: <strong className="text-white">{activeAccount?.bankName} ({activeAccount?.accountNumberMasked})</strong>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl glass-pill text-gray-300 hover:text-white transition cursor-pointer"
          >
            Close Passbook
          </button>
        </div>
      </div>
    </div>
  );
};
