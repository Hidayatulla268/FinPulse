export type ExpenseCategory =
  | 'food'
  | 'groceries'
  | 'shopping'
  | 'commute'
  | 'utilities'
  | 'subscriptions'
  | 'random_upi'
  | 'health'
  | 'entertainment';

export interface CategoryMeta {
  id: ExpenseCategory;
  label: string;
  hindiLabel: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
}

export const CATEGORIES: Record<ExpenseCategory, CategoryMeta> = {
  food: {
    id: 'food',
    label: 'Food & Dining',
    hindiLabel: 'खाना-पीना',
    icon: 'Utensils',
    color: '#f97316', // orange-500
    bgLight: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    description: 'Swiggy, Zomato, Chai tapri, Cafes, Restaurants',
  },
  groceries: {
    id: 'groceries',
    label: 'Quick Commerce & Groceries',
    hindiLabel: 'राशन और क्विक डिलीवरी',
    icon: 'Zap',
    color: '#eab308', // yellow-500
    bgLight: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    description: 'Blinkit, Zepto, Instamart, BigBasket',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping & E-Commerce',
    hindiLabel: 'शॉपिंग',
    icon: 'ShoppingBag',
    color: '#a855f7', // purple-500
    bgLight: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    description: 'Amazon, Flipkart, Myntra, Ajio, Nykaa',
  },
  commute: {
    id: 'commute',
    label: 'Travel & Commute',
    hindiLabel: 'आना-जाना',
    icon: 'Car',
    color: '#06b6d4', // cyan-500
    bgLight: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    description: 'Uber, Ola, Rapido, Namma Yatri, Metro, Fuel',
  },
  subscriptions: {
    id: 'subscriptions',
    label: 'Subscriptions & OTT',
    hindiLabel: 'सब्सक्रिप्शन',
    icon: 'Tv',
    color: '#ec4899', // pink-500
    bgLight: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    description: 'Netflix, Spotify, Hotstar, YouTube, Prime',
  },
  random_upi: {
    id: 'random_upi',
    label: 'Random UPI & Tapri',
    hindiLabel: 'छोटा-मोटा UPI',
    icon: 'QrCode',
    color: '#10b981', // emerald-500
    bgLight: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    description: 'Paan shop, Chai tapri, Kirana, Friend split',
  },
  utilities: {
    id: 'utilities',
    label: 'Bills & Recharges',
    hindiLabel: 'बिल और रिचार्ज',
    icon: 'Receipt',
    color: '#3b82f6', // blue-500
    bgLight: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    description: 'Airtel, Jio, Electricity, WiFi, Gas',
  },
  health: {
    id: 'health',
    label: 'Health & Pharmacy',
    hindiLabel: 'दवाई और सेहत',
    icon: 'HeartPulse',
    color: '#ef4444', // red-500
    bgLight: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    description: 'Apollo 247, 1mg, Cult.fit, Pharmacy',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Weekend & Outings',
    hindiLabel: 'पार्टी और मस्ती',
    icon: 'Sparkles',
    color: '#8b5cf6', // violet-500
    bgLight: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    description: 'Movies, Pubs, Events, Gaming',
  },
};

export type PaymentMode = 'UPI' | 'Credit Card' | 'Debit Card' | 'NetBanking' | 'Cash';
export type UpiApp = 'GPay' | 'PhonePe' | 'Paytm' | 'CRED' | 'BHIM' | 'Other';

export type IndianBankName =
  | 'HDFC Bank'
  | 'ICICI Bank'
  | 'State Bank of India'
  | 'Axis Bank'
  | 'Kotak Mahindra Bank';

export interface BankAccount {
  id: string;
  bankName: IndianBankName;
  accountType: 'Salary' | 'Savings' | 'Current';
  accountNumberMasked: string; // e.g. "•••• 4921"
  ifscCode: string; // e.g. "HDFC0001234"
  balance: number; // Current live liquid balance
  upiId: string; // e.g. "aryan@okhdfcbank"
  isConnected: boolean;
  isPrimary: boolean;
  colorTheme: string; // e.g. "sky" | "marigold"
  lastSyncedAt: string;
}

export interface LiveBankingAlert {
  id: string;
  bankName: string;
  accountMasked: string;
  amount: number;
  type: 'debit' | 'credit';
  recipientOrSender: string;
  vpa?: string;
  balanceAfter: number;
  utrNumber: string;
  time: string;
}

export interface Transaction {
  id: string;
  title: string;
  merchant: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO string
  time: string; // HH:mm
  paymentMode: PaymentMode;
  upiApp?: UpiApp;
  txnType?: 'debit' | 'credit'; // Default debit for daily allowance
  bankAccountId?: string;
  bankName?: string;
  accountMasked?: string;
  balanceAfter?: number;
  utrNumber?: string;
  transferredTo?: string; // Recipient name/party detected from bank statement
  vpa?: string; // UPI VPA handle e.g. zepto@icici
  transferType?: string; // P2P, Merchant, Rent, Quick Commerce
  isImpulse: boolean;
  notes?: string;
  source: 'manual' | 'csv' | 'upi_scan' | 'bank_sync' | 'realtime_feed' | 'demo';
}

export interface FixedCommitment {
  id: string;
  name: string;
  amount: number;
  category: 'rent' | 'emi' | 'sip' | 'maid' | 'utilities' | 'other';
  dueDate?: number;
}

export type BudgetCalcMethod = 'gross_div_30' | 'net_discretionary';

export interface UserProfile {
  name: string;
  monthlySalary: number; // e.g. 100000
  fixedCommitments: FixedCommitment[];
  calcMethod: BudgetCalcMethod;
  customDailyAllowance?: number;
  savingsGoal: {
    title: string;
    targetAmount: number;
    currentSaved: number;
  };
  notificationTime: string; // e.g. "21:00"
  enableSound: boolean;
  whatsappNumber?: string;
  emailAlerts?: string;
}

export interface SubscriptionItem {
  id: string;
  merchant: string;
  amount: number;
  cycle: 'monthly' | 'quarterly' | 'yearly';
  nextBillingDate: string;
  category: string;
  directCancelUrl: string;
  iconName: string;
  active: boolean;
  detectedFromTxn?: boolean;
}

export interface MerchantInsight {
  merchant: string;
  category: ExpenseCategory;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  impulseCount: number;
  isQuickCommerce: boolean;
  estimatedDeliverySurgeFees: number; // delivery fees leak calculation
  lastOrderDate: string;
}

export interface NightlyReportData {
  reportDate: string;
  dailyBudget: number;
  totalSpent: number;
  difference: number; // positive = overspent, negative = saved
  isOverspent: boolean;
  topMerchants: { merchant: string; amount: number; count: number }[];
  categoryBreakdown: { category: ExpenseCategory; amount: number; percentage: number }[];
  impulsiveSpendTotal: number;
  roastMessage: string;
  praiseMessage: string;
  whatsappFormattedText: string;
}

export interface AISuggestion {
  id: string;
  category: 'quick_win' | 'emergency_fund' | 'inflation_shield' | 'investment' | 'habit';
  title: string;
  headline: string;
  impactINR: number;
  impactPeriod: 'monthly' | 'annual' | 'one_time';
  action: string;
  worldContext: string;
  priority: 'high' | 'medium' | 'low';
  tag: string;
}

export interface AIMacroSignal {
  title: string;
  value: string;
  badge: string;
  implication: string;
  recommendation: string;
}

export interface AIFinancialAudit {
  healthScore: number; // 0 to 100
  verdict: string;
  runwayMonths: number;
  monthlyDiscretionaryBurn: number;
  quickCommerceLeakMonthly: number;
  deliverySurgeLossMonthly: number;
  weekendSurgePercentage: number;
  inflationDragAnnualINR: number;
  potentialMonthlySavingsINR: number;
  suggestions: AISuggestion[];
  macroSignals: AIMacroSignal[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionRecommendation?: {
    label: string;
    type: 'adjust_budget' | 'open_passbook' | 'open_subscriptions' | 'link_bank';
    value?: number;
  };
  keyStats?: { label: string; value: string }[];
}
