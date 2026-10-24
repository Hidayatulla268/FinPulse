'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_PROFILE,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_TRANSACTIONS,
} from '@/lib/mockData';
import {
  AIFinancialAudit,
  BankAccount,
  FixedCommitment,
  LiveBankingAlert,
  SubscriptionItem,
  Transaction,
  UserProfile,
} from '@/types/finance';
import { generatePastBankTransactions } from '@/lib/pastBankDataGenerator';
import { runAIFinancialAudit } from '@/lib/finpulseAI';
import {
  generateLiveBankFeed,
  generateRealtimeBankEvent,
  parseBankSms,
} from '@/lib/bankStatementIntelligence';
import {
  safeJsonParse,
  validateAndSanitizeTransaction,
  validateAndSanitizeUserProfile,
} from '@/lib/security';

interface FinanceContextType {
  profile: UserProfile;
  transactions: Transaction[];
  subscriptions: SubscriptionItem[];
  bankAccounts: BankAccount[];
  activeBankAccountId: string;
  activeAccount: BankAccount | undefined;
  totalLiquidBalance: number;
  dailyAllowance: number;
  todayStr: string;
  todaySpent: number;
  todayRemaining: number;
  todayPacePercent: number;
  hourlyBudgetRemaining: number;
  isOverspentToday: boolean;
  impulseSpentToday: number;
  isLoaded: boolean;

  // Real-Time Bank Stream State
  isBankConnected: boolean;
  connectedBank: string;
  lastBankSyncTime: string;
  isAutoSyncing: boolean;
  isRealtimeListening: boolean;
  liveBankingAlert: LiveBankingAlert | null;
  aiAudit: AIFinancialAudit;

  // Actions
  addTransaction: (txn: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  batchImportTransactions: (txns: Transaction[]) => void;
  triggerBankSync: () => Promise<Transaction[]>;
  parseAndAddBankSms: (smsText: string) => Transaction | null;
  triggerLiveAccountDebit: (custom?: Partial<Transaction>) => Transaction;
  triggerLiveAccountCredit: (amount: number, source: string) => Transaction;
  toggleRealtimeListening: () => void;
  dismissLiveBankingAlert: () => void;
  connectBankAccount: (
    bank: Omit<BankAccount, 'id' | 'balance' | 'lastSyncedAt' | 'isConnected'> & { initialBalance?: number },
    customPastTxns?: Transaction[]
  ) => { bank: BankAccount; scannedTxnCount: number };
  disconnectBankAccount: (id: string) => void;
  switchActiveBankAccount: (id: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addFixedCommitment: (commitment: Omit<FixedCommitment, 'id'>) => void;
  removeFixedCommitment: (id: string) => void;
  toggleSubscription: (id: string) => void;
  addSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  resetToDemo: () => void;
  clearAllData: () => void;
  triggerCelebration: () => void;
  playAudioChime: (type?: 'success' | 'alert' | 'ding') => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'rozbachat_profile_v1',
  TRANSACTIONS: 'rozbachat_txns_v1',
  SUBSCRIPTIONS: 'rozbachat_subs_v1',
  BANK_ACCOUNTS: 'rozbachat_banks_v1',
  ACTIVE_BANK: 'rozbachat_active_bank_v1',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [activeBankAccountId, setActiveBankAccountId] = useState<string>('bank_hdfc');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Bank Auto-Sync & Real-Time Stream State
  const [lastBankSyncTime, setLastBankSyncTime] = useState<string>('Live Stream Active');
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);
  const [syncCount, setSyncCount] = useState<number>(1);
  const [isRealtimeListening, setIsRealtimeListening] = useState<boolean>(true);
  const [liveBankingAlert, setLiveBankingAlert] = useState<LiveBankingAlert | null>(null);

  const activeAccount = useMemo(() => {
    return bankAccounts.find((b) => b.id === activeBankAccountId) || bankAccounts[0];
  }, [bankAccounts, activeBankAccountId]);

  const totalLiquidBalance = useMemo(() => {
    return bankAccounts.filter((b) => b.isConnected).reduce((sum, b) => sum + b.balance, 0);
  }, [bankAccounts]);

  const isBankConnected = useMemo(() => {
    return bankAccounts.some((b) => b.isConnected);
  }, [bankAccounts]);

  const connectedBank = useMemo(() => {
    if (!activeAccount) return 'No Bank Linked';
    return `${activeAccount.bankName} • A/c ${activeAccount.accountNumberMasked.replace('•••• ', '**')}`;
  }, [activeAccount]);

  // Load from LocalStorage on mount with schema validation and sanitization
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const storedTxns = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
      const storedBanks = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
      const storedActiveBank = localStorage.getItem(STORAGE_KEYS.ACTIVE_BANK);

      if (storedProfile) {
        const parsedProfile = safeJsonParse(storedProfile, DEFAULT_PROFILE);
        setProfile(validateAndSanitizeUserProfile(parsedProfile));
      }
      if (storedTxns) {
        const parsedTxns = safeJsonParse<unknown[]>(storedTxns, []);
        if (Array.isArray(parsedTxns)) {
          const validTxns = parsedTxns
            .map(validateAndSanitizeTransaction)
            .filter((t): t is Transaction => t !== null);
          if (validTxns.length > 0) setTransactions(validTxns);
        }
      }
      if (storedSubs) {
        const parsedSubs = safeJsonParse<SubscriptionItem[]>(storedSubs, INITIAL_SUBSCRIPTIONS);
        if (Array.isArray(parsedSubs)) setSubscriptions(parsedSubs);
      }
      if (storedBanks) {
        const parsedBanks = safeJsonParse<BankAccount[]>(storedBanks, INITIAL_BANK_ACCOUNTS);
        if (Array.isArray(parsedBanks)) setBankAccounts(parsedBanks);
      }
      if (storedActiveBank && typeof storedActiveBank === 'string') {
        setActiveBankAccountId(storedActiveBank.trim());
      }
    } catch (err) {
      console.warn('LocalStorage load error, using default state', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever state changes (debounced by 150ms to prevent main thread blocking)
  useEffect(() => {
    if (!isLoaded) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
        localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(bankAccounts));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_BANK, activeBankAccountId);
      } catch (err) {
        console.warn('LocalStorage save error', err);
      }
    }, 150);
    return () => clearTimeout(timeout);
  }, [profile, transactions, subscriptions, bankAccounts, activeBankAccountId, isLoaded]);

  // Compute Daily Allowance
  const dailyAllowance = useMemo(() => {
    if (profile.customDailyAllowance && profile.customDailyAllowance > 0) {
      return Math.round(profile.customDailyAllowance);
    }

    if (profile.calcMethod === 'net_discretionary') {
      const totalFixed = (profile.fixedCommitments || []).reduce((sum, item) => sum + item.amount, 0);
      const netDiscretionary = Math.max(0, profile.monthlySalary - totalFixed);
      return Math.round(netDiscretionary / 30);
    }

    // Default: Monthly Salary / 30 as specified in requirement 1
    return Math.round(profile.monthlySalary / 30);
  }, [profile]);

  // Defer Date evaluation to client mount for deterministic SSR prerendering
  const [todayStr, setTodayStr] = useState<string>('');
  const [currentHour, setCurrentHour] = useState<number>(12);

  useEffect(() => {
    const now = new Date();
    setTodayStr(now.toISOString().split('T')[0]);
    setCurrentHour(now.getHours());
  }, []);

  // Compute Today's Spend
  const todayTransactions = useMemo(() => {
    if (!todayStr) return transactions.slice(0, 5); // fallback initial slice during SSR
    return transactions.filter((t) => t.date === todayStr);
  }, [transactions, todayStr]);

  const todaySpent = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  const todayRemaining = useMemo(() => {
    return dailyAllowance - todaySpent;
  }, [dailyAllowance, todaySpent]);

  const todayPacePercent = useMemo(() => {
    if (dailyAllowance <= 0) return 100;
    return Math.min(200, Math.round((todaySpent / dailyAllowance) * 100));
  }, [todaySpent, dailyAllowance]);

  const isOverspentToday = todaySpent > dailyAllowance;

  const impulseSpentToday = useMemo(() => {
    return todayTransactions.filter((t) => t.isImpulse).reduce((sum, t) => sum + t.amount, 0);
  }, [todayTransactions]);

  // Hourly budget remaining indicator
  const hourlyBudgetRemaining = useMemo(() => {
    const hoursLeftInDay = Math.max(1, 24 - currentHour);
    if (todayRemaining <= 0) return 0;
    return Math.round(todayRemaining / hoursLeftInDay);
  }, [todayRemaining, currentHour]);

  // Audio Chime synthesizer using Web Audio API (Zero external audio file dependency!)
  const playAudioChime = (type: 'success' | 'alert' | 'ding' = 'ding') => {
    if (!profile.enableSound || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // Cheerful ascending chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
        });
      } else if (type === 'alert') {
        // Minor warning tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Clean crisp digital tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#0ea5e9', '#ff9900', '#f59e0b', '#ffffff'],
      });
      playAudioChime('success');
    } catch {
      // fallback
    }
  };

  // Add transaction with validation & sanitization
  const addTransaction = (txnData: Omit<Transaction, 'id'>) => {
    const candidate = {
      ...txnData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const validated = validateAndSanitizeTransaction(candidate);
    if (!validated) return;

    setTransactions((prev) => [validated, ...prev]);

    // Check if new spend pushes over budget
    const willBeSpent = todaySpent + validated.amount;
    if (willBeSpent > dailyAllowance && todaySpent <= dailyAllowance) {
      playAudioChime('alert');
    } else {
      playAudioChime('ding');
    }
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    playAudioChime('ding');
  };

  // Batch import CSV with schema validation
  const batchImportTransactions = (txns: Transaction[]) => {
    const valid = txns
      .map(validateAndSanitizeTransaction)
      .filter((t): t is Transaction => t !== null);
    if (valid.length === 0) return;
    setTransactions((prev) => [...valid, ...prev]);
    triggerCelebration();
  };

  // Automated Bank Statement / Account Aggregator Sync
  const triggerBankSync = async (): Promise<Transaction[]> => {
    setIsAutoSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const freshItems = generateLiveBankFeed(syncCount);
      setSyncCount((prev) => prev + 1);
      setTransactions((prev) => [...freshItems, ...prev]);
      const now = new Date();
      setLastBankSyncTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      playAudioChime('ding');
      return freshItems;
    } finally {
      setIsAutoSyncing(false);
    }
  };

  // Auto-Parse Bank SMS Text & update allowance
  const parseAndAddBankSms = (smsText: string): Transaction | null => {
    const txn = parseBankSms(smsText);
    if (!txn) return null;
    setTransactions((prev) => [txn, ...prev]);
    playAudioChime('success');
    return txn;
  };

  // Update profile
  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
    playAudioChime('success');
  };

  // Add fixed commitment
  const addFixedCommitment = (commitment: Omit<FixedCommitment, 'id'>) => {
    const newCommitment: FixedCommitment = {
      ...commitment,
      id: `fix_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      fixedCommitments: [...prev.fixedCommitments, newCommitment],
    }));
  };

  // Remove fixed commitment
  const removeFixedCommitment = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      fixedCommitments: prev.fixedCommitments.filter((f) => f.id !== id),
    }));
  };

  // Toggle subscription
  const toggleSubscription = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    playAudioChime('ding');
  };

  // Add subscription
  const addSubscription = (sub: Omit<SubscriptionItem, 'id'>) => {
    const newSub: SubscriptionItem = {
      ...sub,
      id: `sub_${Date.now()}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
    playAudioChime('success');
  };

  // Real-Time Bank Stream: Trigger Live Debit
  const triggerLiveAccountDebit = (custom?: Partial<Transaction>): Transaction => {
    const bank = activeAccount || bankAccounts[0];
    const event = generateRealtimeBankEvent(
      bank.bankName,
      bank.accountNumberMasked,
      bank.balance,
      'debit'
    );

    const newTxn: Transaction = {
      ...event.transaction,
      ...custom,
      bankAccountId: bank.id,
      bankName: bank.bankName,
      accountMasked: bank.accountNumberMasked,
      balanceAfter: event.newBalance,
    };

    // Update bank balance
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === bank.id ? { ...b, balance: event.newBalance, lastSyncedAt: 'Live Stream Active' } : b))
    );

    setTransactions((prev) => [newTxn, ...prev]);

    // Set Live Toast Alert
    setLiveBankingAlert({
      id: `alert_${Date.now()}`,
      bankName: bank.bankName,
      accountMasked: bank.accountNumberMasked,
      amount: newTxn.amount,
      type: 'debit',
      recipientOrSender: newTxn.transferredTo || newTxn.merchant,
      vpa: newTxn.vpa,
      balanceAfter: event.newBalance,
      utrNumber: newTxn.utrNumber || '4291880192',
      time: newTxn.time,
    });

    // Check budget threshold & play sound
    const willBeSpent = todaySpent + newTxn.amount;
    if (willBeSpent > dailyAllowance && todaySpent <= dailyAllowance) {
      playAudioChime('alert');
    } else {
      playAudioChime('ding');
    }

    const now = new Date();
    setLastBankSyncTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));

    return newTxn;
  };

  // Real-Time Bank Stream: Trigger Live Credit / Refund / Salary
  const triggerLiveAccountCredit = (amount: number, sourceName: string): Transaction => {
    const bank = activeAccount || bankAccounts[0];
    const newBal = Math.round((bank.balance + amount) * 100) / 100;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const utr = `4291${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newTxn: Transaction = {
      id: `rt_credit_${Date.now()}`,
      title: `Received from ${sourceName}`,
      merchant: sourceName,
      amount,
      category: 'utilities',
      date: dateStr,
      time: timeStr,
      paymentMode: 'UPI',
      txnType: 'credit',
      bankAccountId: bank.id,
      bankName: bank.bankName,
      accountMasked: bank.accountNumberMasked,
      balanceAfter: newBal,
      utrNumber: utr,
      transferredTo: `Received from: ${sourceName}`,
      transferType: 'UPI Inward Credit',
      isImpulse: false,
      notes: `Bank Credit Received • Ref: ${utr}`,
      source: 'realtime_feed',
    };

    setBankAccounts((prev) =>
      prev.map((b) => (b.id === bank.id ? { ...b, balance: newBal, lastSyncedAt: 'Live Stream Active' } : b))
    );

    setTransactions((prev) => [newTxn, ...prev]);

    setLiveBankingAlert({
      id: `alert_${Date.now()}`,
      bankName: bank.bankName,
      accountMasked: bank.accountNumberMasked,
      amount,
      type: 'credit',
      recipientOrSender: sourceName,
      balanceAfter: newBal,
      utrNumber: utr,
      time: timeStr,
    });

    triggerCelebration();
    return newTxn;
  };

  const toggleRealtimeListening = () => {
    setIsRealtimeListening((prev) => !prev);
    playAudioChime('ding');
  };

  const dismissLiveBankingAlert = () => {
    setLiveBankingAlert(null);
  };

  // Connect new bank account with automated scanning & past data generation
  const connectBankAccount = (
    bank: Omit<BankAccount, 'id' | 'balance' | 'lastSyncedAt' | 'isConnected'> & { initialBalance?: number },
    customPastTxns?: Transaction[]
  ): { bank: BankAccount; scannedTxnCount: number } => {
    const newBank: BankAccount = {
      ...bank,
      id: `bank_${Date.now()}`,
      balance: bank.initialBalance || 50000,
      isConnected: true,
      lastSyncedAt: 'Live Scan Complete',
    };

    // Auto-scan and generate historical past data
    const pastTxns = customPastTxns || generatePastBankTransactions(newBank, newBank.balance, 24);

    setBankAccounts((prev) => [...prev, newBank]);
    setTransactions((prev) => [...pastTxns, ...prev]);
    setActiveBankAccountId(newBank.id);
    triggerCelebration();
    playAudioChime('success');

    return { bank: newBank, scannedTxnCount: pastTxns.length };
  };

  // Built-in Integrated AI Financial Audit calculation
  const aiAudit = useMemo(() => {
    return runAIFinancialAudit({
      profile,
      transactions,
      bankAccounts,
      subscriptions,
      dailyAllowance,
    });
  }, [profile, transactions, bankAccounts, subscriptions, dailyAllowance]);

  // Disconnect bank account
  const disconnectBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
    if (activeBankAccountId === id) {
      const remaining = bankAccounts.filter((b) => b.id !== id);
      if (remaining.length > 0) setActiveBankAccountId(remaining[0].id);
    }
    playAudioChime('alert');
  };

  const switchActiveBankAccount = (id: string) => {
    setActiveBankAccountId(id);
    playAudioChime('ding');
  };

  // Reset to Bangalore demo
  const resetToDemo = () => {
    setProfile(DEFAULT_PROFILE);
    setTransactions(INITIAL_TRANSACTIONS);
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setActiveBankAccountId('bank_hdfc');
    triggerCelebration();
  };

  // Clear all data
  const clearAllData = () => {
    setProfile({
      ...DEFAULT_PROFILE,
      fixedCommitments: [],
      monthlySalary: 60000,
    });
    setTransactions([]);
    setSubscriptions([]);
    setBankAccounts([]);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
    localStorage.removeItem(STORAGE_KEYS.BANK_ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_BANK);
  };

  return (
    <FinanceContext.Provider
      value={{
        profile,
        transactions,
        subscriptions,
        bankAccounts,
        activeBankAccountId,
        activeAccount,
        totalLiquidBalance,
        dailyAllowance,
        todayStr,
        todaySpent,
        todayRemaining,
        todayPacePercent,
        hourlyBudgetRemaining,
        isOverspentToday,
        impulseSpentToday,
        isLoaded,
        isBankConnected,
        connectedBank,
        lastBankSyncTime,
        isAutoSyncing,
        isRealtimeListening,
        liveBankingAlert,
        aiAudit,
        addTransaction,
        deleteTransaction,
        batchImportTransactions,
        triggerBankSync,
        parseAndAddBankSms,
        triggerLiveAccountDebit,
        triggerLiveAccountCredit,
        toggleRealtimeListening,
        dismissLiveBankingAlert,
        connectBankAccount,
        disconnectBankAccount,
        switchActiveBankAccount,
        updateProfile,
        addFixedCommitment,
        removeFixedCommitment,
        toggleSubscription,
        addSubscription,
        resetToDemo,
        clearAllData,
        triggerCelebration,
        playAudioChime,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
