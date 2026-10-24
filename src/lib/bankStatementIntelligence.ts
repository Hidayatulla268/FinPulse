import { identifyMerchantAndCategory } from './categorizer';
import { ExpenseCategory, PaymentMode, Transaction, UpiApp } from '@/types/finance';

export type TransferType =
  | 'MERCHANT_PAYMENT'
  | 'P2P_TRANSFER'
  | 'RENT_TRANSFER'
  | 'INVESTMENT_SIP'
  | 'UTILITY_BILL'
  | 'ATM_WITHDRAWAL'
  | 'FOOD_DELIVERY'
  | 'QUICK_COMMERCE'
  | 'UNKNOWN';

export interface TransferDestination {
  recipientName: string;
  upiVpa?: string;
  transferType: TransferType;
  transferCategory: ExpenseCategory;
  transferChannel: PaymentMode;
  upiApp?: UpiApp;
  cleanedNarration: string;
  referenceId?: string;
  isRecurringOrSubscription: boolean;
  isImpulseSuspect: boolean;
  destinationDetails: string;
}

/**
 * Parses raw Indian Bank statement narrations, NEFT/IMPS strings, and UPI descriptions
 * to pinpoint exactly WHERE and to WHOM money was transferred.
 */
export function analyzeTransferDestination(rawNarration: string, amount = 0): TransferDestination {
  const narration = rawNarration.trim();
  const lower = narration.toLowerCase();

  let recipientName = 'Unknown Recipient';
  let upiVpa: string | undefined;
  let transferType: TransferType = 'MERCHANT_PAYMENT';
  let transferChannel: PaymentMode = 'UPI';
  let upiApp: UpiApp = 'Other';
  let referenceId: string | undefined;
  let isRecurring = false;
  let destinationDetails = 'Domestic Transfer';

  // 1. UPI Narration Patterns:
  // e.g. "UPI/DR/52938192384/ZEPTO/zepto@icici/ICICI Bank"
  // e.g. "UPI-RAMESH PATEL-ramesh@okaxis-Axis Bank-529381923"
  // e.g. "UPI/SWIGGY/swiggy@hdfcbank/928392183"
  const upiPattern1 = /UPI[-/](?:DR[-/])?(?:[0-9]+[-/])?([^/-]+?)[-/]([a-zA-Z0-9._]+@[a-zA-Z0-9]+)/i;
  const upiPattern2 = /([a-zA-Z0-9._]+@[a-zA-Z0-9]+)/;

  const match1 = narration.match(upiPattern1);
  const matchVpa = narration.match(upiPattern2);

  if (matchVpa) {
    upiVpa = matchVpa[1].toLowerCase();
    transferChannel = 'UPI';

    // Detect UPI App from handle
    if (upiVpa.includes('okaxis') || upiVpa.includes('okhdfcbank') || upiVpa.includes('oksbi') || upiVpa.includes('okicici')) {
      upiApp = 'GPay';
    } else if (upiVpa.includes('ybl') || upiVpa.includes('ibl') || upiVpa.includes('axl')) {
      upiApp = 'PhonePe';
    } else if (upiVpa.includes('paytm')) {
      upiApp = 'Paytm';
    } else if (upiVpa.includes('cred')) {
      upiApp = 'CRED';
    }
  }

  if (match1 && match1[1]) {
    recipientName = cleanName(match1[1]);
  } else if (upiVpa) {
    const handlePrefix = upiVpa.split('@')[0];
    recipientName = cleanName(handlePrefix.replace(/[._0-9]/g, ' '));
  }

  // 2. NEFT / IMPS Transfers (Person-to-Person or Landlord or Services)
  // e.g. "NEFT DR-HDFC000123-ANITA SHARMA-RENT FOR OCT"
  // e.g. "IMPS-523423491-VIKRAM SINGH-SETTLEMENT"
  const neftMatch = narration.match(/NEFT[- ](?:DR[- ])?(?:[A-Z0-9]+[- ])?([^/-]+)/i);
  const impsMatch = narration.match(/IMPS[- ](?:[0-9]+[- ])?([^/-]+)/i);

  if (neftMatch && neftMatch[1]) {
    recipientName = cleanName(neftMatch[1]);
    transferChannel = 'NetBanking';
    transferType = lower.includes('rent') ? 'RENT_TRANSFER' : 'P2P_TRANSFER';
  } else if (impsMatch && impsMatch[1]) {
    recipientName = cleanName(impsMatch[1]);
    transferChannel = 'NetBanking';
    transferType = 'P2P_TRANSFER';
  }

  // 3. Card POS / E-Commerce
  // e.g. "POS 4921 AMZN MKTP IN BANGALORE"
  // e.g. "E-COM SWIGGY BANGALORE"
  if (lower.startsWith('pos ') || lower.startsWith('e-com') || lower.includes('pos-')) {
    transferChannel = 'Credit Card';
    const posParts = narration.replace(/^(POS|E-COM)\s*(?:[0-9]+\s*)?/i, '').split(/[\s-]/);
    recipientName = posParts.slice(0, 3).join(' ');
  }

  // 4. ATM Cash Withdrawal
  if (lower.includes('atm') || lower.includes('nwd') || lower.includes('cash wdl')) {
    recipientName = 'ATM Cash Withdrawal';
    transferChannel = 'Cash';
    transferType = 'ATM_WITHDRAWAL';
  }

  // 5. Categorize destination
  const catResult = identifyMerchantAndCategory(narration + ' ' + recipientName);
  let transferCategory = catResult.category;

  if (lower.includes('rent') || lower.includes('landlord') || lower.includes('house')) {
    recipientName = recipientName.replace(/rent/i, '').trim() || 'Landlord / House Rent';
    transferType = 'RENT_TRANSFER';
    transferCategory = 'utilities';
    destinationDetails = 'Monthly House Rent Transfer';
    isRecurring = true;
  } else if (lower.includes('sip') || lower.includes('zerodha') || lower.includes('groww') || lower.includes('mutual fund') || lower.includes('indmoney')) {
    if (lower.includes('zerodha')) {
      recipientName = 'Zerodha Broking (MF SIP)';
    } else if (lower.includes('groww')) {
      recipientName = 'Groww Mutual Fund SIP';
    } else {
      recipientName = 'Investment (SIP / Index Fund)';
    }
    transferType = 'INVESTMENT_SIP';
    transferCategory = 'utilities';
    destinationDetails = 'Wealth Compounding SIP';
    isRecurring = true;
  } else if (catResult.isQuickCommerce) {
    transferType = 'QUICK_COMMERCE';
    recipientName = catResult.merchant;
    destinationDetails = '10-Minute Grocery Delivery';
  } else if (catResult.category === 'food') {
    transferType = 'FOOD_DELIVERY';
    recipientName = catResult.merchant;
  } else if (
    catResult.category === 'random_upi' ||
    recipientName.toLowerCase().includes('tapri') ||
    recipientName.toLowerCase().includes('paan') ||
    (transferChannel === 'UPI' && !catResult.isQuickCommerce)
  ) {
    transferType = 'P2P_TRANSFER';
    destinationDetails = 'Direct UPI Transfer / P2P';
  }

  // Impulsive check
  const isImpulseSuspect =
    transferType === 'QUICK_COMMERCE' ||
    (transferType === 'FOOD_DELIVERY' && amount > 400) ||
    lower.includes('zepto') ||
    lower.includes('blinkit') ||
    lower.includes('starbucks');

  // Reference ID extraction (e.g. 12-digit UPI ref or RRN)
  const refMatch = narration.match(/(?:REF|RRN|UTR|TXN)?[:\s-]?([0-9]{8,14})/i);
  if (refMatch) {
    referenceId = refMatch[1];
  }

  return {
    recipientName: recipientName || catResult.merchant || 'Unknown Recipient',
    upiVpa,
    transferType,
    transferCategory,
    transferChannel,
    upiApp: transferChannel === 'UPI' ? upiApp : undefined,
    cleanedNarration: recipientName,
    referenceId,
    isRecurringOrSubscription: isRecurring || lower.includes('netflix') || lower.includes('spotify'),
    isImpulseSuspect,
    destinationDetails,
  };
}

/**
 * Clean common Indian bank transaction artifacts from party names
 */
function cleanName(raw: string): string {
  return raw
    .replace(/[0-9]{5,}/g, '') // remove account/ref numbers
    .replace(/^(DR|CR|UPI|NEFT|IMPS|POS|INB|BIL|P2A|P2M|PAYMENT TO|TRANSFER TO|VPA)\s*/i, '')
    .replace(/\s*(LTD|LIMITED|PVT|PRIVATE|CORP|SERVICES|INDIA|IN)\b/gi, '')
    .replace(/[-_@.]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Parse Indian Bank SMS strings automatically!
 * Examples:
 * - "Dear HDFC Bank User, Rs. 450.00 debited from a/c **4921 on 22-OCT-26 to VPA swiggy@icici (UPI Ref 529381923). Bal: Rs. 48,250.00"
 * - "Sent Rs. 340.00 from SBI A/c 3812 to ZEPTO QUICK via UPI. Ref 928371982"
 * - "ICICI Bank: Rs 1,499.00 debited on 22-Oct-26 from A/c XX102 for Amazon India. Avl Bal Rs 24,000"
 */
export function parseBankSms(smsText: string): Transaction | null {
  const lower = smsText.toLowerCase();

  // Ensure it's a debit SMS
  if (!lower.includes('debit') && !lower.includes('spent') && !lower.includes('sent') && !lower.includes('paid')) {
    return null;
  }

  // Extract amount: e.g. "Rs. 450.00", "INR 1,200", "Rs 340"
  const amountMatch = smsText.match(/(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (!amountMatch) return null;

  const cleanAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
  if (isNaN(cleanAmount) || cleanAmount <= 0) return null;

  // Extract recipient / destination
  let recipientRaw = '';
  const toVpaMatch = smsText.match(/to\s+(?:VPA\s+)?([a-zA-Z0-9._]+@[a-zA-Z0-9]+)/i);
  const toMerchantMatch = smsText.match(/(?:to|for|at)\s+([A-Za-z0-9\s._-]+?)(?:\s+(?:via|on|ref|avl|bal|using|through|\.|$))/i);

  if (toVpaMatch) {
    recipientRaw = toVpaMatch[1];
  } else if (toMerchantMatch) {
    recipientRaw = toMerchantMatch[1];
  } else {
    recipientRaw = smsText;
  }

  const destination = analyzeTransferDestination(recipientRaw, cleanAmount);

  // Extract UTR/Ref number: e.g. "Ref 52938192384" or "UPI Ref 529381923"
  const refMatch = smsText.match(/(?:Ref|UTR|Txn Id|Txn)\s*(?:No\.?|Number|:)?\s*([A-Za-z0-9]+)/i);
  const utrNumber = refMatch ? refMatch[1] : undefined;

  // Extract Balance after debit: e.g. "Avl Bal: Rs 1,42,510.40"
  const balMatch = smsText.match(/(?:Avl Bal|Bal|Balance)\s*:?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  const balanceAfter = balMatch ? parseFloat(balMatch[1].replace(/,/g, '')) : undefined;

  // Date & Time
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    id: `auto_sms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: destination.recipientName,
    merchant: destination.recipientName,
    amount: Math.round(cleanAmount),
    category: destination.transferCategory,
    date: dateStr,
    time: timeStr,
    paymentMode: destination.transferChannel,
    upiApp: destination.upiApp,
    isImpulse: destination.isImpulseSuspect,
    utrNumber,
    balanceAfter,
    transferredTo: destination.recipientName,
    vpa: destination.upiVpa,
    transferType: destination.transferType,
    txnType: 'debit',
    notes: `Auto-extracted from Bank SMS • ${destination.destinationDetails}${destination.upiVpa ? ` (${destination.upiVpa})` : ''}`,
    source: 'bank_sync',
  };
}

/**
 * Realistic live bank account simulated transactions for auto-sync
 * Generates fresh live transactions transferred to realistic Indian merchants/recipients
 */
export function generateLiveBankFeed(lastCount: number, currentBalance = 142850.40): Transaction[] {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const candidates = [
    {
      narration: 'UPI/DR/58291029102/ZEPTO QUICK/zepto@icici/ICICI Bank',
      amount: 385,
      merchantHint: 'Zepto Quick Commerce',
      vpaHint: 'zepto@icici',
      type: 'Quick Commerce 10min',
    },
    {
      narration: 'UPI/DR/98234812391/SWIGGY FOOD/swiggy@hdfcbank/HDFC Bank',
      amount: 540,
      merchantHint: 'Swiggy Bundl Technologies',
      vpaHint: 'swiggy@hdfcbank',
      type: 'UPI Food Ordering',
    },
    {
      narration: 'UPI-RAMESH CHAI TAPRI-ramesh@okaxis-Axis Bank-4829102',
      amount: 30,
      merchantHint: 'Ramesh Chai Tapri',
      vpaHint: 'ramesh@okaxis',
      type: 'Local UPI Tapri',
    },
    {
      narration: 'UPI/NAMMA YATRI AUTO/nammayatri@juspay/99238123',
      amount: 145,
      merchantHint: 'Namma Yatri Driver',
      vpaHint: 'nammayatri@juspay',
      type: 'UPI Auto Ride',
    },
    {
      narration: 'POS 4821 STARBUCKS INDIRANAGAR BANGALORE',
      amount: 410,
      merchantHint: 'Starbucks Coffee',
      vpaHint: undefined,
      type: 'POS Debit Card Swipe',
    },
    {
      narration: 'UPI/BLINKIT GROCERIES/blinkit@kotak/55291029',
      amount: 490,
      merchantHint: 'Blinkit Commerce',
      vpaHint: 'blinkit@kotak',
      type: 'Quick Commerce Grocery',
    },
    {
      narration: 'NEFT DR-HDFC000123-ANITA SHARMA-RENT MAINTENANCE',
      amount: 2500,
      merchantHint: 'Anita Sharma (Landlord)',
      vpaHint: undefined,
      type: 'NEFT House Rent',
    },
  ];

  const candidate = candidates[lastCount % candidates.length];
  const destination = analyzeTransferDestination(candidate.narration, candidate.amount);
  const utrNumber = `4291${Math.floor(10000000 + Math.random() * 90000000)}`;
  const balanceAfter = Math.max(0, currentBalance - candidate.amount);

  return [
    {
      id: `live_bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: destination.recipientName || candidate.merchantHint,
      merchant: destination.recipientName || candidate.merchantHint,
      amount: candidate.amount,
      category: destination.transferCategory,
      date: dateStr,
      time: timeStr,
      paymentMode: destination.transferChannel,
      upiApp: destination.upiApp,
      txnType: 'debit',
      bankAccountId: 'bank_hdfc',
      bankName: 'HDFC Bank',
      accountMasked: '•••• 4921',
      balanceAfter: Math.round(balanceAfter * 100) / 100,
      utrNumber,
      transferredTo: candidate.merchantHint || destination.recipientName,
      vpa: candidate.vpaHint || destination.upiVpa,
      transferType: candidate.type || destination.destinationDetails,
      isImpulse: destination.isImpulseSuspect,
      notes: `Live Auto-Sync • Ref: ${utrNumber} • ${destination.destinationDetails}${candidate.vpaHint ? ` (${candidate.vpaHint})` : ''}`,
      source: 'realtime_feed',
    },
  ];
}

/**
 * Generates an authentic incoming real-time debit or credit event
 */
export function generateRealtimeBankEvent(
  bankName = 'HDFC Bank',
  accountMasked = '•••• 4921',
  currentBalance = 142850.40,
  forceType?: 'debit' | 'credit'
): {
  transaction: Transaction;
  smsAlert: string;
  newBalance: number;
} {
  const isCredit = forceType ? forceType === 'credit' : Math.random() < 0.15; // 15% chance of incoming credit/refund/salary
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const utrNumber = `4291${Math.floor(10000000 + Math.random() * 90000000)}`;

  if (isCredit) {
    const credits = [
      { sender: 'Google Pay Split Refund', amount: 350, category: 'random_upi' as ExpenseCategory, vpa: 'refund@googlepay' },
      { sender: 'Salary Bonus / TechCorp In', amount: 5000, category: 'utilities' as ExpenseCategory, vpa: 'payroll@hdfc' },
      { sender: 'Friend Rahul UPI Split', amount: 480, category: 'food' as ExpenseCategory, vpa: 'rahul@okhdfcbank' },
    ];
    const pick = credits[Math.floor(Math.random() * credits.length)];
    const newBalance = Math.round((currentBalance + pick.amount) * 100) / 100;
    const sms = `Dear Customer, A/c ${accountMasked.replace('•••• ', '**')} has been CREDITED with INR ${pick.amount}.00 on ${dateStr} via UPI from ${pick.sender} (${pick.vpa}). Avl Bal: INR ${newBalance.toLocaleString('en-IN')}. Ref: ${utrNumber}.`;

    return {
      transaction: {
        id: `rt_txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: `Received from ${pick.sender}`,
        merchant: pick.sender,
        amount: pick.amount,
        category: pick.category,
        date: dateStr,
        time: timeStr,
        paymentMode: 'UPI',
        txnType: 'credit',
        bankAccountId: 'bank_hdfc',
        bankName,
        accountMasked,
        balanceAfter: newBalance,
        utrNumber,
        transferredTo: `Received from: ${pick.sender}`,
        vpa: pick.vpa,
        transferType: 'UPI Inward Credit',
        isImpulse: false,
        notes: `Real-time credit received • Ref ${utrNumber}`,
        source: 'realtime_feed',
      },
      smsAlert: sms,
      newBalance,
    };
  } else {
    const debits = [
      { title: 'Zepto Instant Delivery', merchant: 'Zepto', amount: 320, category: 'groceries' as ExpenseCategory, vpa: 'zepto@icici', channel: 'Quick Commerce' },
      { title: 'Swiggy Biryani Order', merchant: 'Swiggy', amount: 460, category: 'food' as ExpenseCategory, vpa: 'swiggy@hdfcbank', channel: 'UPI Food' },
      { title: 'Uber Premier Office Commute', merchant: 'Uber India', amount: 240, category: 'commute' as ExpenseCategory, vpa: 'uber@icici', channel: 'Ride Hailing' },
      { title: 'Chai & Samosa Evening Tapri', merchant: 'Sharma Chai Stall', amount: 50, category: 'random_upi' as ExpenseCategory, vpa: 'sharmachai@paytm', channel: 'Tapri UPI' },
      { title: 'Blinkit 10-min Grocery', merchant: 'Blinkit', amount: 280, category: 'groceries' as ExpenseCategory, vpa: 'blinkit@kotak', channel: 'Quick Commerce' },
      { title: 'Starbucks Hazelnut Latte', merchant: 'Starbucks', amount: 395, category: 'food' as ExpenseCategory, vpa: undefined, channel: 'Card POS Swipe' },
    ];
    const pick = debits[Math.floor(Math.random() * debits.length)];
    const newBalance = Math.round(Math.max(0, currentBalance - pick.amount) * 100) / 100;
    const sms = `Sent INR ${pick.amount}.00 from ${bankName} A/c ${accountMasked.replace('•••• ', '**')} via UPI to ${pick.merchant.toUpperCase()} ${pick.vpa ? `(${pick.vpa})` : ''} on ${dateStr} ${timeStr}. Avl Bal: INR ${newBalance.toLocaleString('en-IN')}. UTR: ${utrNumber}.`;

    return {
      transaction: {
        id: `rt_txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: pick.title,
        merchant: pick.merchant,
        amount: pick.amount,
        category: pick.category,
        date: dateStr,
        time: timeStr,
        paymentMode: pick.vpa ? 'UPI' : 'Debit Card',
        txnType: 'debit',
        bankAccountId: 'bank_hdfc',
        bankName,
        accountMasked,
        balanceAfter: newBalance,
        utrNumber,
        transferredTo: pick.merchant,
        vpa: pick.vpa,
        transferType: pick.channel,
        isImpulse: pick.amount > 350,
        notes: `Auto-recorded from Live Bank Stream • Ref ${utrNumber}`,
        source: 'realtime_feed',
      },
      smsAlert: sms,
      newBalance,
    };
  }
}

