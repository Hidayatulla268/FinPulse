import { BankAccount, IndianBankName, Transaction } from '@/types/finance';

/**
 * Generates rich, authentic Indian historical bank statement transactions
 * for an auto-scanned bank account (past 60-90 days).
 */
export function generatePastBankTransactions(
  bankOrId: BankAccount | string,
  initialBalanceOrBankName?: number | string,
  countOrBalance?: number
): Transaction[] {
  let bank: BankAccount;
  let initialBalance = 75000;
  let count = 26;

  if (typeof bankOrId === 'object' && bankOrId !== null) {
    bank = bankOrId;
    if (typeof initialBalanceOrBankName === 'number') {
      initialBalance = initialBalanceOrBankName;
    } else if (typeof bankOrId.balance === 'number') {
      initialBalance = bankOrId.balance;
    }
    if (typeof countOrBalance === 'number') {
      count = countOrBalance;
    }
  } else {
    const bankId = String(bankOrId);
    let bankName: IndianBankName = 'HDFC Bank';
    if (typeof initialBalanceOrBankName === 'string') {
      const matchName = initialBalanceOrBankName.toLowerCase();
      if (matchName.includes('icici')) bankName = 'ICICI Bank';
      else if (matchName.includes('sbi') || matchName.includes('state bank')) bankName = 'State Bank of India';
      else if (matchName.includes('axis')) bankName = 'Axis Bank';
      else if (matchName.includes('kotak')) bankName = 'Kotak Mahindra Bank';
      else bankName = 'HDFC Bank';

      if (typeof countOrBalance === 'number') {
        initialBalance = countOrBalance;
      }
    } else if (typeof initialBalanceOrBankName === 'number') {
      initialBalance = initialBalanceOrBankName;
      if (typeof countOrBalance === 'number') {
        count = countOrBalance;
      }
    }
    bank = {
      id: bankId,
      bankName,
      accountNumberMasked: '•••• 4821',
      accountType: 'Savings',
      ifscCode: 'HDFC0001234',
      balance: initialBalance,
      upiId: 'user@okaxis',
      isConnected: true,
      isPrimary: false,
      colorTheme: 'sky',
      lastSyncedAt: 'Just now',
    };
  }

  const result: Transaction[] = [];

  // Real Indian merchants & scenarios
  const historicalBlueprints = [
    {
      title: 'Monthly Salary Credit',
      merchant: 'TechCorp India Pvt Ltd',
      amount: 100000,
      category: 'utilities' as const,
      paymentMode: 'NetBanking' as const,
      txnType: 'credit' as const,
      transferredTo: 'Salary Inward Credit',
      vpa: 'techcorp.payroll@hdfcbank',
      isImpulse: false,
      daysAgo: 24,
      time: '09:15',
    },
    {
      title: 'HSR Layout Flat Rent',
      merchant: 'Landlord Rent Transfer',
      amount: 28000,
      category: 'utilities' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Ramesh Reddy (Landlord)',
      vpa: 'ramesh.reddy@icici',
      isImpulse: false,
      daysAgo: 23,
      time: '11:30',
    },
    {
      title: 'Nifty 50 Index Fund SIP',
      merchant: 'Zerodha Broking Ltd',
      amount: 15000,
      category: 'utilities' as const,
      paymentMode: 'NetBanking' as const,
      txnType: 'debit' as const,
      transferredTo: 'Zerodha Mutual Fund SIP',
      vpa: 'zerodha@hdfcbank',
      isImpulse: false,
      daysAgo: 22,
      time: '10:00',
    },
    {
      title: 'Blinkit Monthly Grocery Stockup',
      merchant: 'Blinkit',
      amount: 2450,
      category: 'groceries' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Blinkit Retail Pvt Ltd',
      vpa: 'blinkit@icici',
      isImpulse: false,
      daysAgo: 21,
      time: '18:45',
    },
    {
      title: 'Airtel Broadband & Fiber Bill',
      merchant: 'Airtel Bill / Recharge',
      amount: 1179,
      category: 'utilities' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Bharti Airtel Broadband',
      vpa: 'airteltelecom@paytm',
      isImpulse: false,
      daysAgo: 19,
      time: '14:20',
    },
    {
      title: 'Swiggy Gourmet Dinner & Biryani',
      merchant: 'Swiggy',
      amount: 680,
      category: 'food' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Swiggy Bundl Technologies',
      vpa: 'swiggy@axisbank',
      isImpulse: true,
      daysAgo: 18,
      time: '21:10',
    },
    {
      title: 'Adrak Chai & Samosa Tapri',
      merchant: 'Local Chai Tapri',
      amount: 40,
      category: 'random_upi' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Ramesh Tea Stall',
      vpa: 'rameshtea@okhdfcbank',
      isImpulse: false,
      daysAgo: 17,
      time: '17:35',
    },
    {
      title: 'Late Night Zepto Ice Cream & Snacks',
      merchant: 'Zepto',
      amount: 420,
      category: 'groceries' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Kiranakart Technologies (Zepto)',
      vpa: 'zepto@icici',
      isImpulse: true,
      daysAgo: 16,
      time: '23:40',
    },
    {
      title: 'Amazon Great Indian Sale Order',
      merchant: 'Amazon India',
      amount: 3499,
      category: 'shopping' as const,
      paymentMode: 'Credit Card' as const,
      txnType: 'debit' as const,
      transferredTo: 'Amazon Pay India',
      vpa: 'amazonpay@okaxis',
      isImpulse: true,
      daysAgo: 15,
      time: '16:05',
    },
    {
      title: 'Uber Premier to Kempegowda Airport',
      merchant: 'Uber',
      amount: 1150,
      category: 'commute' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Uber India Systems',
      vpa: 'uber.india@hdfcbank',
      isImpulse: false,
      daysAgo: 14,
      time: '06:30',
    },
    {
      title: 'Quarterly Bank Interest Credit',
      merchant: bank.bankName,
      amount: 540,
      category: 'utilities' as const,
      paymentMode: 'NetBanking' as const,
      txnType: 'credit' as const,
      transferredTo: `${bank.bankName} Savings Interest`,
      vpa: 'interest.payout@rbi',
      isImpulse: false,
      daysAgo: 13,
      time: '00:05',
    },
    {
      title: 'Cult.fit Gym & Fitness Pass',
      merchant: 'Health & Pharmacy',
      amount: 1999,
      category: 'health' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Curefit Healthcare Pvt Ltd',
      vpa: 'cultfit@hdfcbank',
      isImpulse: false,
      daysAgo: 12,
      time: '08:00',
    },
    {
      title: 'Indian Oil Petrol Station',
      merchant: 'Travel & Commute',
      amount: 2100,
      category: 'commute' as const,
      paymentMode: 'Debit Card' as const,
      txnType: 'debit' as const,
      transferredTo: 'Indian Oil Retail Outlet',
      vpa: 'iocl.pos@sbi',
      isImpulse: false,
      daysAgo: 11,
      time: '19:15',
    },
    {
      title: 'Netflix Premium 4K UHD Subscription',
      merchant: 'Netflix',
      amount: 649,
      category: 'subscriptions' as const,
      paymentMode: 'Credit Card' as const,
      txnType: 'debit' as const,
      transferredTo: 'Netflix Entertainment India',
      vpa: 'netflix.recurring@citi',
      isImpulse: false,
      daysAgo: 10,
      time: '03:12',
    },
    {
      title: 'Weekend Brewery & Craft Beer',
      merchant: 'Weekend & Outings',
      amount: 2850,
      category: 'entertainment' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Toit Brewpub Indiranagar',
      vpa: 'toit@icici',
      isImpulse: false,
      daysAgo: 9,
      time: '22:15',
    },
    {
      title: 'Zomato Food Delivery - Biryani Feast',
      merchant: 'Zomato',
      amount: 540,
      category: 'food' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Zomato Food Delivery',
      vpa: 'zomato@icici',
      isImpulse: true,
      daysAgo: 8,
      time: '13:45',
    },
    {
      title: 'Apollo 247 Quick Meds Delivery',
      merchant: 'Health & Pharmacy',
      amount: 380,
      category: 'health' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Apollo Pharmacy Online',
      vpa: 'apollopharmacy@axisbank',
      isImpulse: false,
      daysAgo: 7,
      time: '10:30',
    },
    {
      title: 'Zepto Instant Snack Munchies',
      merchant: 'Zepto',
      amount: 320,
      category: 'groceries' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Kiranakart Technologies (Zepto)',
      vpa: 'zepto@icici',
      isImpulse: true,
      daysAgo: 6,
      time: '16:50',
    },
    {
      title: 'Rapido Bike Taxi to Metro Station',
      merchant: 'Travel & Commute',
      amount: 45,
      category: 'commute' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Roppen Transportation (Rapido)',
      vpa: 'rapido@icici',
      isImpulse: false,
      daysAgo: 5,
      time: '09:20',
    },
    {
      title: 'Spotify Premium Family Plan',
      merchant: 'Spotify',
      amount: 179,
      category: 'subscriptions' as const,
      paymentMode: 'Credit Card' as const,
      txnType: 'debit' as const,
      transferredTo: 'Spotify India Pvt Ltd',
      vpa: 'spotify.recurring@hsbc',
      isImpulse: false,
      daysAgo: 4,
      time: '04:00',
    },
    {
      title: 'UPI Split from Rahul for Goa Tickets',
      merchant: 'Rahul Verma',
      amount: 3500,
      category: 'utilities' as const,
      paymentMode: 'UPI' as const,
      txnType: 'credit' as const,
      transferredTo: 'Received from Rahul Verma',
      vpa: 'rahul.verma@oksbi',
      isImpulse: false,
      daysAgo: 3,
      time: '19:40',
    },
    {
      title: 'Namma Yatri Auto Ride',
      merchant: 'Travel & Commute',
      amount: 110,
      category: 'commute' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Auto Driver Direct UPI',
      vpa: 'manjunath@ybl',
      isImpulse: false,
      daysAgo: 2,
      time: '12:15',
    },
    {
      title: 'Starbucks Cinnamon Cold Foam Brew',
      merchant: 'Starbucks Coffee',
      amount: 410,
      category: 'food' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Tata Starbucks Pvt Ltd',
      vpa: 'starbucks@hdfcbank',
      isImpulse: true,
      daysAgo: 2,
      time: '15:20',
    },
    {
      title: 'Blinkit Instant Fresh Fruits & Curd',
      merchant: 'Blinkit',
      amount: 395,
      category: 'groceries' as const,
      paymentMode: 'UPI' as const,
      txnType: 'debit' as const,
      transferredTo: 'Blinkit Commerce Pvt Ltd',
      vpa: 'blinkit@icici',
      isImpulse: false,
      daysAgo: 1,
      time: '08:45',
    },
  ];

  // Sort blueprints by daysAgo ascending (most recent first: daysAgo 1, 2, ...)
  const blueprintsToUse = historicalBlueprints
    .slice(0, count)
    .sort((a, b) => a.daysAgo - b.daysAgo);

  // Generate ISO dates relative to today
  const now = new Date();
  let currentLedgerBalance = initialBalance;

  blueprintsToUse.forEach((bp, idx) => {
    const txnDate = new Date();
    txnDate.setDate(now.getDate() - bp.daysAgo);
    const dateStr = txnDate.toISOString().split('T')[0];

    // Current transaction's balanceAfter matches ledger balance at this point in time
    const balanceAfter = Math.round(currentLedgerBalance * 100) / 100;

    // Work backwards to find balance before this transaction:
    // If it was a debit, prior balance was higher; if credit, prior balance was lower
    if (bp.txnType === 'debit') {
      currentLedgerBalance += bp.amount;
    } else {
      currentLedgerBalance = Math.max(1000, currentLedgerBalance - bp.amount);
    }

    const utr = `4${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    result.push({
      id: `past_txn_${bank.id}_${idx}_${Date.now()}`,
      title: bp.title,
      merchant: bp.merchant,
      amount: bp.amount,
      category: bp.category,
      date: dateStr,
      time: bp.time,
      paymentMode: bp.paymentMode,
      upiApp: bp.paymentMode === 'UPI' ? 'GPay' : undefined,
      txnType: bp.txnType,
      bankAccountId: bank.id,
      bankName: bank.bankName,
      accountMasked: bank.accountNumberMasked,
      balanceAfter: balanceAfter,
      utrNumber: utr,
      transferredTo: bp.transferredTo,
      vpa: bp.vpa,
      transferType: bp.txnType === 'credit' ? 'Inward Transfer' : 'Merchant UPI Debit',
      isImpulse: bp.isImpulse,
      notes: `Imported via ${bank.bankName} Auto-Scan • Statement Ref: ${utr}`,
      source: 'bank_sync',
    });
  });

  // Sort descending by date & time (most recent first)
  return result.sort((a, b) => {
    const dtA = new Date(`${a.date}T${a.time}`).getTime();
    const dtB = new Date(`${b.date}T${b.time}`).getTime();
    return dtB - dtA;
  });
}
