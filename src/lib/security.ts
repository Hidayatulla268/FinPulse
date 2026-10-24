import {
  BankAccount,
  ExpenseCategory,
  FixedCommitment,
  PaymentMode,
  SubscriptionItem,
  Transaction,
  UpiApp,
  UserProfile,
} from '../types/finance';
import { DEFAULT_PROFILE } from './mockData';

/**
 * Escapes potentially dangerous HTML characters to prevent XSS (Cross-Site Scripting)
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Cleans and sanitizes user-provided string inputs (removes script tags, javascript: protocols, control chars)
 */
export function sanitizeText(input: string, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim();
  // Strip control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Remove script/iframe/object tags
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/data:text\/html/gi, '');
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  return cleaned;
}

/**
 * Protects against CSV Formula Injection (Spreadsheet Formula Injection / CWE-1236).
 * If a cell begins with '=', '+', '-', '@', '\t', '\r', spreadsheet programs (Excel, Sheets)
 * may execute formulas. We prefix dangerous characters with a single quote (').
 */
export function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '';
  const rawStr = String(value);
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some((char) => rawStr.startsWith(char) || rawStr.trimStart().startsWith(char))) {
    return `'${rawStr}`;
  }
  return rawStr.trim();
}

/**
 * Parses JSON safely without throwing runtime crashes on corrupt or tampered inputs.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw || typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Clamps numeric values to valid financial boundaries (guards against NaN, Infinity, and negative values).
 */
export function clampFinancialNumber(
  val: unknown,
  min = 0,
  max = 100_000_000,
  fallback = 0
): number {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    const parsed = Number(val);
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return fallback;
    val = parsed;
  }
  return Math.max(min, Math.min(max, val as number));
}

const VALID_CATEGORIES: Set<ExpenseCategory> = new Set([
  'food',
  'groceries',
  'shopping',
  'commute',
  'utilities',
  'subscriptions',
  'random_upi',
  'health',
  'entertainment',
]);

const VALID_PAYMENT_MODES: Set<PaymentMode> = new Set([
  'UPI',
  'NetBanking',
  'Credit Card',
  'Debit Card',
  'Cash',
]);

const VALID_UPI_APPS: Set<UpiApp> = new Set([
  'GPay',
  'PhonePe',
  'Paytm',
  'CRED',
  'BHIM',
  'Other',
]);

const VALID_COMMITMENT_CATEGORIES = new Set<FixedCommitment['category']>([
  'rent',
  'emi',
  'sip',
  'maid',
  'utilities',
  'other',
]);

/**
 * Validates and sanitizes an incoming transaction object from user input, CSV, or external payloads.
 */
export function validateAndSanitizeTransaction(raw: unknown): Transaction | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;

  if (
    typeof obj.amount !== 'number' ||
    Number.isNaN(obj.amount) ||
    !Number.isFinite(obj.amount) ||
    obj.amount <= 0
  ) {
    return null;
  }

  const rawAmount = clampFinancialNumber(obj.amount, 0.01, 50_000_000, 0);
  if (rawAmount <= 0) return null;

  const title = sanitizeText(String(obj.title || obj.description || 'Expense'), 150) || 'Expense';
  const merchant = sanitizeText(String(obj.merchant || title), 100) || 'Merchant';
  const category: ExpenseCategory = VALID_CATEGORIES.has(obj.category as ExpenseCategory)
    ? (obj.category as ExpenseCategory)
    : 'random_upi';

  const paymentMode: PaymentMode = VALID_PAYMENT_MODES.has(obj.paymentMode as PaymentMode)
    ? (obj.paymentMode as PaymentMode)
    : 'UPI';

  let dateStr = String(obj.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr = new Date().toISOString().split('T')[0];
  }

  const timeStr = typeof obj.time === 'string' && /^\d{2}:\d{2}$/.test(obj.time)
    ? obj.time
    : '12:00';

  const id = typeof obj.id === 'string' && obj.id.trim().length > 0
    ? sanitizeText(obj.id, 64)
    : `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const upiApp: UpiApp | undefined = obj.upiApp && VALID_UPI_APPS.has(obj.upiApp as UpiApp)
    ? (obj.upiApp as UpiApp)
    : undefined;

  const txnType: 'debit' | 'credit' = obj.txnType === 'credit' || obj.isCredit === true
    ? 'credit'
    : 'debit';

  return {
    id,
    title,
    merchant,
    date: dateStr,
    time: timeStr,
    amount: Math.round(rawAmount * 100) / 100,
    category,
    paymentMode,
    txnType,
    isImpulse: Boolean(obj.isImpulse),
    bankAccountId: typeof obj.bankAccountId === 'string' ? sanitizeText(obj.bankAccountId, 40) : undefined,
    bankName: typeof obj.bankName === 'string' ? sanitizeText(obj.bankName, 60) : undefined,
    accountMasked: typeof obj.accountMasked === 'string' ? sanitizeText(obj.accountMasked, 20) : undefined,
    upiApp,
    utrNumber: typeof obj.utrNumber === 'string' ? sanitizeText(obj.utrNumber, 32) : undefined,
    transferredTo: typeof obj.transferredTo === 'string' ? sanitizeText(obj.transferredTo, 100) : (typeof obj.recipientOrSender === 'string' ? sanitizeText(obj.recipientOrSender, 100) : undefined),
    vpa: typeof obj.vpa === 'string' ? sanitizeText(obj.vpa, 64) : undefined,
    transferType: typeof obj.transferType === 'string' ? sanitizeText(obj.transferType, 40) : undefined,
    balanceAfter: typeof obj.balanceAfter === 'number' && Number.isFinite(obj.balanceAfter)
      ? Math.round(obj.balanceAfter * 100) / 100
      : undefined,
    notes: typeof obj.notes === 'string' ? sanitizeText(obj.notes, 200) : undefined,
    source: (obj.source as Transaction['source']) || 'manual',
  };
}

/**
 * Validates user profile data retrieved from LocalStorage or settings drawer.
 */
export function validateAndSanitizeUserProfile(raw: unknown): UserProfile {
  if (!raw || typeof raw !== 'object') return DEFAULT_PROFILE;
  const obj = raw as Record<string, unknown>;

  const monthlySalary = clampFinancialNumber(obj.monthlySalary, 1000, 100_000_000, DEFAULT_PROFILE.monthlySalary);
  const name = typeof obj.name === 'string' ? sanitizeText(obj.name, 60) : DEFAULT_PROFILE.name;
  const calcMethod = obj.calcMethod === 'net_discretionary' ? 'net_discretionary' : 'gross_div_30';

  const rawCommitments = Array.isArray(obj.fixedCommitments) ? obj.fixedCommitments : [];
  const fixedCommitments: FixedCommitment[] = [];
  for (const c of rawCommitments) {
    if (!c || typeof c !== 'object') continue;
    const co = c as Record<string, unknown>;
    const amount = clampFinancialNumber(co.amount, 0, 10_000_000, 0);
    if (amount <= 0) continue;
    const category: FixedCommitment['category'] = VALID_COMMITMENT_CATEGORIES.has(co.category as FixedCommitment['category'])
      ? (co.category as FixedCommitment['category'])
      : 'other';
    const item: FixedCommitment = {
      id: typeof co.id === 'string' ? sanitizeText(co.id, 50) : `fc_${Date.now()}`,
      name: sanitizeText(String(co.name || 'Commitment'), 80),
      amount,
      category,
    };
    if (typeof co.dueDate === 'number') {
      item.dueDate = clampFinancialNumber(co.dueDate, 1, 31, 1);
    }
    fixedCommitments.push(item);
  }

  const rawGoal = obj.savingsGoal && typeof obj.savingsGoal === 'object' ? (obj.savingsGoal as Record<string, unknown>) : null;
  const savingsGoal = rawGoal ? {
    title: sanitizeText(String(rawGoal.title || DEFAULT_PROFILE.savingsGoal.title), 80),
    targetAmount: clampFinancialNumber(rawGoal.targetAmount, 100, 50_000_000, DEFAULT_PROFILE.savingsGoal.targetAmount),
    currentSaved: clampFinancialNumber(rawGoal.currentSaved, 0, 50_000_000, DEFAULT_PROFILE.savingsGoal.currentSaved),
  } : DEFAULT_PROFILE.savingsGoal;

  return {
    name,
    monthlySalary,
    fixedCommitments: fixedCommitments.length > 0 ? fixedCommitments : DEFAULT_PROFILE.fixedCommitments,
    calcMethod,
    customDailyAllowance: typeof obj.customDailyAllowance === 'number' ? clampFinancialNumber(obj.customDailyAllowance, 100, 500000, 0) : undefined,
    savingsGoal,
    notificationTime: typeof obj.notificationTime === 'string' && /^\d{2}:\d{2}$/.test(obj.notificationTime) ? obj.notificationTime : DEFAULT_PROFILE.notificationTime,
    enableSound: Boolean(obj.enableSound ?? DEFAULT_PROFILE.enableSound),
    whatsappNumber: typeof obj.whatsappNumber === 'string' ? sanitizeText(obj.whatsappNumber, 25) : DEFAULT_PROFILE.whatsappNumber,
    emailAlerts: typeof obj.emailAlerts === 'string' ? sanitizeText(obj.emailAlerts, 100) : DEFAULT_PROFILE.emailAlerts,
  };
}

/**
 * Masks bank account numbers showing only the last 4 digits (e.g. "•••• 4821")
 */
export function maskAccountNumber(acc: string): string {
  const digits = String(acc || '').replace(/\D/g, '');
  if (digits.length <= 4) return `•••• ${digits}`;
  return `•••• ${digits.slice(-4)}`;
}

/**
 * Masks UPI Virtual Payment Addresses (e.g., "rahul.sharma@okaxis" -> "ra***@okaxis")
 */
export function maskVpa(vpa: string): string {
  if (!vpa || !vpa.includes('@')) return vpa;
  const [user, domain] = vpa.split('@');
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.slice(0, 2)}***@${domain}`;
}
