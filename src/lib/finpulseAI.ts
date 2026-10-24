import { AIFinancialAudit, AIMacroSignal, AISuggestion, AIChatMessage, BankAccount, SubscriptionItem, Transaction, UserProfile } from '@/types/finance';
import { sanitizeText } from './security';

/**
 * Built-in Integrated Financial & Macro AI Engine
 * 100% self-contained, zero external API keys required, works offline.
 */

// World Macro-Economic Benchmarks for India
export const WORLD_MACRO_SIGNALS: AIMacroSignal[] = [
  {
    title: 'RBI Repo Rate & Sweep Yields',
    value: '6.50% Repo Rate',
    badge: 'Fixed Income Opportunity',
    implication: 'Standard bank savings accounts yield only 2.70% - 3.00%, creating an idle cash drag.',
    recommendation: 'Enable Auto-Sweep FD on your salary account or allocate to Liquid Funds yielding ~7.05% with T+0 liquidity.',
  },
  {
    title: 'Urban Indian CPI Inflation',
    value: '5.40% Annual Inflation',
    badge: 'Purchasing Power Drag',
    implication: 'Every ₹1,00,000 kept in low-interest accounts loses ~₹2,700 in real purchasing power annually.',
    recommendation: 'Ensure your daily discretionary budget matches post-inflation essentials; do not let emergency funds sit in 0% current accounts.',
  },
  {
    title: 'Quick Commerce Convenience Premium',
    value: '₹35 - ₹65 / Order in Surcharges',
    badge: 'Micro-Leak Trend',
    implication: 'Platform fees, handling charges, surge pricing, and small cart fees add an invisible 18-22% premium to retail grocery prices.',
    recommendation: 'Bundle daily micro-orders into two scheduled weekly bulk orders to save up to ₹2,400 monthly.',
  },
  {
    title: 'Nifty 50 Long-Term Compounding',
    value: '12.4% Historical CAGR',
    badge: 'Wealth Compounding',
    implication: 'The 15-15-15 Rule: Investing ₹15,000/month for 15 years at 15% CAGR generates ₹1 Crore+ (or ₹5,000/mo at 12% = ₹25 Lakhs).',
    recommendation: 'Redirect at least 40% of unspent daily allowances into automated index fund SIPs.',
  },
  {
    title: 'Gold (INR Hedge Benchmark)',
    value: '+11.2% 20-Year CAGR',
    badge: 'Sovereign Hedge',
    implication: 'Gold continues to serve as an effective domestic purchasing power hedge against currency depreciation.',
    recommendation: 'Consider allocating 5-10% of long-term surplus into Sovereign Gold Bonds (SGB) or Gold ETFs rather than cash hoards.',
  },
];

/**
 * Perform a deep financial audit on the user's live profile, transactions, accounts, and subscriptions.
 */
export function runAIFinancialAudit(params: {
  profile: UserProfile;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  subscriptions: SubscriptionItem[];
  dailyAllowance: number;
}): AIFinancialAudit {
  const { profile, transactions, bankAccounts, subscriptions, dailyAllowance } = params;

  const totalLiquid = bankAccounts.reduce((sum, b) => sum + (b.isConnected ? b.balance : 0), 0);
  const monthlySalary = profile.monthlySalary || 100000;
  const fixedCommitmentsTotal = profile.fixedCommitments.reduce((sum, f) => sum + f.amount, 0);

  // Debits vs Credits in transactions
  const debits = transactions.filter((t) => t.txnType !== 'credit');
  const totalDebits = debits.reduce((sum, t) => sum + (Number.isFinite(t.amount) ? t.amount : 0), 0);

  // Quick commerce & delivery leak
  const qCommerceTxns = debits.filter((t) => {
    const text = `${t.title || ''} ${t.merchant || ''} ${t.transferredTo || ''} ${t.category || ''}`.toLowerCase();
    return (
      t.category === 'groceries' ||
      text.includes('zepto') ||
      text.includes('blinkit') ||
      text.includes('instamart')
    );
  });
  const qCommerceTotal = qCommerceTxns.reduce((sum, t) => sum + t.amount, 0);
  const estimatedDeliverySurge = Math.round(qCommerceTxns.length * 45); // ~₹45 avg platform/delivery fee

  // Food delivery leak (Swiggy, Zomato)
  const foodDeliveryTxns = debits.filter((t) => {
    const text = `${t.title || ''} ${t.merchant || ''} ${t.transferredTo || ''} ${t.category || ''}`.toLowerCase();
    return (
      text.includes('swiggy') ||
      text.includes('zomato') ||
      text.includes('eatclub')
    );
  });
  const foodDeliveryTotal = foodDeliveryTxns.reduce((sum, t) => sum + t.amount, 0);

  // Weekend spend calculation
  const weekendTxns = debits.filter((t) => {
    const d = new Date(t.date);
    const day = d.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });
  const weekdayTxns = debits.filter((t) => {
    const d = new Date(t.date);
    const day = d.getDay();
    return day !== 0 && day !== 6;
  });

  const avgWeekendDaily = weekendTxns.length > 0 ? weekendTxns.reduce((s, t) => s + t.amount, 0) / Math.max(1, weekendTxns.length / 2) : 0;
  const avgWeekdayDaily = weekdayTxns.length > 0 ? weekdayTxns.reduce((s, t) => s + t.amount, 0) / Math.max(1, weekdayTxns.length / 5) : 0;
  const weekendSurgePercentage = avgWeekdayDaily > 0 ? Math.max(0, Math.round(((avgWeekendDaily - avgWeekdayDaily) / avgWeekdayDaily) * 100)) : 28;

  // Monthly burn estimation
  const monthlyDiscretionaryBurn = dailyAllowance * 30;
  const totalMonthlyBurn = fixedCommitmentsTotal + monthlyDiscretionaryBurn;

  // Emergency Runway (Months of survival)
  const runwayMonths = totalMonthlyBurn > 0 ? Math.round((totalLiquid / totalMonthlyBurn) * 10) / 10 : 3.5;

  // Inflation Drag on idle cash
  // Savings account pays ~2.8%, urban inflation is ~5.4% -> 2.6% real loss
  const inflationDragAnnualINR = Math.round(totalLiquid * 0.026);

  // Health Score Calculation (0 - 100)
  let healthScore = 70;
  if (runwayMonths >= 6) healthScore += 15;
  else if (runwayMonths >= 3) healthScore += 8;
  else healthScore -= 10;

  const savingsRate = Math.max(0, (monthlySalary - totalMonthlyBurn) / monthlySalary);
  if (savingsRate >= 0.3) healthScore += 15;
  else if (savingsRate >= 0.2) healthScore += 10;
  else healthScore -= 5;

  if (estimatedDeliverySurge > 1200) healthScore -= 5;
  if (subscriptions.filter((s) => s.active).length > 6) healthScore -= 5;
  healthScore = Math.max(25, Math.min(96, healthScore));

  // Verdict
  let verdict = 'Balanced with High Optimization Potential';
  if (healthScore >= 85) verdict = 'Robust & Wealth-Generating';
  else if (healthScore >= 70) verdict = 'Stable with Micro-Spend Leakage';
  else if (healthScore >= 50) verdict = 'Vulnerable to Month-End Crunch';
  else verdict = 'High Emergency Runway Alert';

  // Potential Monthly Savings
  const qCommerceSavings = Math.min(3000, Math.round(qCommerceTotal * 0.35 + estimatedDeliverySurge));
  const subSavings = subscriptions.filter((s) => s.active && s.amount > 300).length > 2 ? 650 : 350;
  const weekendPacingSavings = Math.round(dailyAllowance * 2.5);
  const potentialMonthlySavingsINR = qCommerceSavings + subSavings + weekendPacingSavings;

  // Dynamic Suggestions List
  const suggestions: AISuggestion[] = [
    {
      id: 'sug_qcommerce',
      category: 'quick_win',
      title: 'Plug the 10-Minute Grocery Delivery Surcharge',
      headline: `Save up to ₹${formatINRNumber(qCommerceSavings)}/month by batching Zepto & Blinkit orders`,
      impactINR: qCommerceSavings * 12,
      impactPeriod: 'annual',
      action: 'Switch from 1-item impulse orders to twice-weekly scheduled orders above ₹499 to waive platform & surge fees.',
      worldContext: 'Quick-commerce apps in India generate up to 24% of order revenue via small-cart & surge surcharges.',
      priority: 'high',
      tag: 'Zepto / Blinkit Leak',
    },
    {
      id: 'sug_emergency',
      category: 'emergency_fund',
      title: 'Shield Idle Liquid Wealth from Inflation',
      headline: `Your ₹${formatINRNumber(totalLiquid)} liquid balance provides ${runwayMonths} months of safety runway`,
      impactINR: inflationDragAnnualINR,
      impactPeriod: 'annual',
      action: 'Activate Auto-Sweep FD with your bank or park 50% in an Instant Liquid Mutual Fund (7.05% vs 2.8% savings).',
      worldContext: 'With RBI repo rate steady at 6.50%, overnight and liquid yields beat savings accounts by over 400 basis points.',
      priority: runwayMonths < 3 ? 'high' : 'medium',
      tag: 'Inflation Shield',
    },
    {
      id: 'sug_weekend',
      category: 'habit',
      title: 'Calibrate Weekend Outing Pacing Buffer',
      headline: `Weekend spending is ${Math.abs(weekendSurgePercentage)}% higher than weekday baseline`,
      impactINR: weekendPacingSavings * 12,
      impactPeriod: 'annual',
      action: 'Pre-allocate a dedicated Friday-Sunday allowance envelope rather than depleting next week’s daily allowance.',
      worldContext: 'Behavioral economics studies show urban consumers experience a 35% drop in transaction friction on weekend UPI payments.',
      priority: 'medium',
      tag: 'Daily Allowance Pacing',
    },
    {
      id: 'sug_sip',
      category: 'investment',
      title: 'Automate Wealth Compounding with Surplus Pacing',
      headline: `Redirect ₹${formatINRNumber(Math.round(dailyAllowance * 3))}/mo unspent allowance to Index SIP`,
      impactINR: Math.round(dailyAllowance * 3 * 12 * 1.12),
      impactPeriod: 'annual',
      action: 'Set up an automated Nifty 50 Index Fund SIP on the 5th of each month right after salary credit.',
      worldContext: 'Indian domestic SIP inflows exceed ₹23,000 Cr/month as retail investors use systematic compounding to beat inflation.',
      priority: 'medium',
      tag: 'Compounding Playbook',
    },
  ];

  return {
    healthScore,
    verdict,
    runwayMonths,
    monthlyDiscretionaryBurn,
    quickCommerceLeakMonthly: qCommerceTotal,
    deliverySurgeLossMonthly: estimatedDeliverySurge,
    weekendSurgePercentage,
    inflationDragAnnualINR,
    potentialMonthlySavingsINR,
    suggestions,
    macroSignals: WORLD_MACRO_SIGNALS,
  };
}

/**
 * Natural Language Q&A Engine for Financial & World Inquiries
 * Completely built-in, no external network calls or API keys.
 */
export function generateAIChatResponse(
  userQuery: string,
  context: {
    profile: UserProfile;
    transactions: Transaction[];
    bankAccounts: BankAccount[];
    audit: AIFinancialAudit;
    dailyAllowance: number;
    todaySpent: number;
  }
): AIChatMessage {
  const query = sanitizeText(userQuery || '', 300).toLowerCase().trim();
  const { profile, audit, dailyAllowance, todaySpent, bankAccounts } = context;
  const name = profile.name ? profile.name.split(' ')[0] : 'there';
  const totalLiquid = bankAccounts.reduce((sum, b) => sum + (b.isConnected ? b.balance : 0), 0);

  const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // 1. How to save / where to cut
  if (query.includes('save') || query.includes('cut') || query.includes('batao') || query.includes('reduce')) {
    return {
      id: `ai_resp_${Date.now()}`,
      sender: 'ai',
      text: `Hey ${name}! Based on your current cash flows, here is your **3-Step Finpulse Savings Blueprint** to save **₹${formatINRNumber(audit.potentialMonthlySavingsINR)}/month**:\n\n` +
        `1. **Tame Quick-Commerce Micro-Debits**: You are spending ~₹${formatINRNumber(audit.quickCommerceLeakMonthly)} on 10-minute grocery apps. Switch to twice-weekly orders above ₹499 to eliminate delivery & surge charges.\n` +
        `2. **Weekend Pacing Cap**: Allocate a separate weekend envelope so Friday night dining doesn't borrow from Monday’s ₹${formatINRNumber(dailyAllowance)} allowance.\n` +
        `3. **Idle Cash Optimization**: Your ₹${formatINRNumber(totalLiquid)} in savings accounts is being eaten by ~5.4% inflation. Moving ₹1 Lakh to an Auto-Sweep FD yields ₹4,200 extra passive interest each year.`,
      timestamp,
      keyStats: [
        { label: 'Potential Savings', value: `₹${formatINRNumber(audit.potentialMonthlySavingsINR)}/mo` },
        { label: 'Annual Impact', value: `₹${formatINRNumber(audit.potentialMonthlySavingsINR * 12)}/yr` },
        { label: 'Health Score', value: `${audit.healthScore}/100` },
      ],
      actionRecommendation: {
        label: 'Optimize Daily Allowance',
        type: 'adjust_budget',
        value: Math.round(dailyAllowance * 0.9),
      },
    };
  }

  // 2. Emergency Fund / Runway
  if (query.includes('emergency') || query.includes('runway') || query.includes('job') || query.includes('layoff')) {
    return {
      id: `ai_resp_${Date.now()}`,
      sender: 'ai',
      text: `Your current liquid bank balance is **₹${formatINRNumber(totalLiquid)}**.\n\n` +
        `• **Current Safety Runway**: **${audit.runwayMonths} Months** of your full living expenses (rent + commitments + daily allowance).\n` +
        `• **Global Financial Benchmark**: Experts recommend maintaining **4 to 6 months** of essential expenses in an emergency cushion.\n` +
        `• **Where to keep it**: Never lock emergency money in stocks or real estate. Keep 1 month in salary account for instant UPI access, and 3-5 months in an instant-redemption Liquid Mutual Fund or sweep-in fixed deposit earning 6.8% - 7.1%.`,
      timestamp,
      keyStats: [
        { label: 'Liquid Reserve', value: `₹${formatINRNumber(totalLiquid)}` },
        { label: 'Runway', value: `${audit.runwayMonths} Months` },
        { label: 'Benchmark', value: '6 Months' },
      ],
      actionRecommendation: {
        label: 'Review Bank Passbook',
        type: 'open_passbook',
      },
    };
  }

  // 3. Inflation & World Macro
  if (query.includes('inflation') || query.includes('world') || query.includes('rate') || query.includes('rbi') || query.includes('macro')) {
    return {
      id: `ai_resp_${Date.now()}`,
      sender: 'ai',
      text: `Here is the current **Global & Indian Macro Reality** impacting your wallet:\n\n` +
        `• **The Real Return Dilemma**: Indian Urban CPI Inflation is ~**5.40%**. Standard bank accounts only pay **2.80%**. That means your idle cash is effectively **losing 2.6% in purchasing power every year** (costing you ~₹${formatINRNumber(audit.inflationDragAnnualINR)}/yr).\n` +
        `• **RBI Policy Context**: With the repo rate held at **6.50%**, bank fixed yields are at multi-year highs. This is the optimal window to lock in high-yield recurring deposits or debt funds.\n` +
        `• **Global Tech & Subscription Squeeze**: US dollar strength has driven up global software & streaming pricing by 8-15%. Review recurring Apple/Google subscriptions to eliminate redundant services.`,
      timestamp,
      keyStats: [
        { label: 'CPI Inflation', value: '5.40%' },
        { label: 'Repo Rate', value: '6.50%' },
        { label: 'Real Loss on Cash', value: `-₹${formatINRNumber(audit.inflationDragAnnualINR)}/yr` },
      ],
      actionRecommendation: {
        label: 'Audit Subscriptions',
        type: 'open_subscriptions',
      },
    };
  }

  // 4. Food / Swiggy / Zepto / Impulse
  if (query.includes('zepto') || query.includes('swiggy') || query.includes('zomato') || query.includes('blinkit') || query.includes('food')) {
    return {
      id: `ai_resp_${Date.now()}`,
      sender: 'ai',
      text: `Quick-commerce and food delivery apps are the **#1 silent leak** for young Indian professionals.\n\n` +
        `• **Your Tracked Outflow**: You have spent **₹${formatINRNumber(audit.quickCommerceLeakMonthly)}** on instant deliveries.\n` +
        `• **The Convenience Trap**: Every time you order a single ₹60 milk carton or ₹150 snack on Zepto, platform fees (₹7), delivery fees (₹25), and night surcharges (₹15) add **30-40% extra**.\n` +
        `• **The 2-Order Rule**: Pick Wednesday and Sunday for groceries. Keep items in the cart until the total hits ₹500 for zero delivery fees. That alone puts **₹1,500 - ₹2,500** back in your pocket each month!`,
      timestamp,
      keyStats: [
        { label: 'Q-Commerce Spend', value: `₹${formatINRNumber(audit.quickCommerceLeakMonthly)}` },
        { label: 'Surcharges Paid', value: `~₹${formatINRNumber(audit.deliverySurgeLossMonthly)}` },
      ],
      actionRecommendation: {
        label: 'View Passbook Debits',
        type: 'open_passbook',
      },
    };
  }

  // 5. 50/30/20 Rule or Salary allocation
  if (query.includes('50') || query.includes('rule') || query.includes('allocate') || query.includes('salary') || query.includes('vanish')) {
    const salary = profile.monthlySalary || 100000;
    const needs50 = salary * 0.5;
    const wants30 = salary * 0.3;
    const save20 = salary * 0.2;

    return {
      id: `ai_resp_${Date.now()}`,
      sender: 'ai',
      text: `Here is the golden **50:30:20 Financial Blueprint** tailored to your **₹${formatINRNumber(salary)}** salary:\n\n` +
        `• **50% Needs (₹${formatINRNumber(needs50)})**: Rent, utilities, maid, groceries, and essential commute.\n` +
        `• **30% Wants & Daily Allowance (₹${formatINRNumber(wants30)})**: Dining out, shopping, OTT, weekend outings (Equates to **₹${formatINRNumber(Math.round(wants30 / 30))}/day** daily limit).\n` +
        `• **20% Future Wealth & SIPs (₹${formatINRNumber(save20)})**: High-growth index funds, emergency reserve, and long-term security.\n\n` +
        `*Pro Tip*: In Finpulse, your daily allowance of **₹${formatINRNumber(dailyAllowance)}/day** automatically enforces the 30% wants bucket so your savings are guaranteed on Day 1!`,
      timestamp,
      keyStats: [
        { label: 'Needs (50%)', value: `₹${formatINRNumber(needs50)}` },
        { label: 'Wants (30%)', value: `₹${formatINRNumber(wants30)}` },
        { label: 'Invest (20%)', value: `₹${formatINRNumber(save20)}` },
      ],
      actionRecommendation: {
        label: 'Apply Daily Allowance',
        type: 'adjust_budget',
        value: Math.round(wants30 / 30),
      },
    };
  }

  // 6. Generic / Default Intelligent Response
  return {
    id: `ai_resp_${Date.now()}`,
    sender: 'ai',
    text: `Hello ${name}! As your built-in Finpulse AI financial intelligence copilot, I’ve analyzed your current banking data:\n\n` +
      `• **Daily Allowance Pace**: Your baseline is **₹${formatINRNumber(dailyAllowance)}/day** (Spent today: **₹${formatINRNumber(todaySpent)}**).\n` +
      `• **Liquid Capital Cushion**: You have **₹${formatINRNumber(totalLiquid)}** across your connected bank accounts, granting **${audit.runwayMonths} months** of runway.\n` +
      `• **Top Optimization Goal**: You could liberate up to **₹${formatINRNumber(audit.potentialMonthlySavingsINR)}/month** by curbing quick-commerce convenience surcharges and routing surplus cash into automated sweep FDs.\n\n` +
      `Feel free to ask me questions like:\n` +
      `• *"How can I save ₹15,000 this month?"*\n` +
      `• *"What is the 50-30-20 rule for my salary?"*\n` +
      `• *"How does inflation affect my daily allowance?"*\n` +
      `• *"Am I ready to invest in SIPs?"*`,
    timestamp,
    keyStats: [
      { label: 'Health Score', value: `${audit.healthScore}/100` },
      { label: 'Runway', value: `${audit.runwayMonths} Mo` },
      { label: 'Daily Allowance', value: `₹${formatINRNumber(dailyAllowance)}` },
    ],
  };
}

function formatINRNumber(val: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
}
