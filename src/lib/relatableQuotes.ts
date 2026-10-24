import { formatINR } from './categorizer';
import { ExpenseCategory, NightlyReportData, Transaction } from '@/types/finance';

/**
 * Exact requested relatable quote for overspending:
 * "Working to fund my own bad decisions"
 */
export const OVERSPENT_RELATABLE_HERO = 'Working to fund my own bad decisions';

export const INDIAN_OVERSPENT_ROASTS = [
  'Working to fund my own bad decisions.',
  'Zepto delivered in 8 minutes, your financial regret will last till salary day.',
  'Your local chai tapri UPI is quietly building generational wealth for bhaiya.',
  'Swiggy was your highest tax bracket today.',
  'Zomato Gold saved you ₹25 on delivery and encouraged ₹750 of biryani.',
  'Bank account in ICU, but at least your cravings were addressed in 10 minutes.',
  'Bro, your future self is staring at you in disappointment right now.',
  'Sharma ji ka beta already invested his daily allowance into Nifty 50.',
  'You didn’t order dinner, you sponsored an executive’s quarterly bonus.',
];

export const INDIAN_UNDER_BUDGET_PRAISES = [
  'Financially responsible king/queen energy detected today! 👑',
  'You beat the Swiggy notification temptations today. Solid discipline! 🎯',
  'Sharma ji would be proud. Today’s unspent daily allowance goes straight to the Goa pot! 🏖️',
  'Your wallet breathes a sigh of relief. Zero impulse buys detected! 🛡️',
  'Compounding interest is smiling upon you tonight! 📈',
  'Chai tapri was visited, budget was respected. Peak Indian balance achieved! ☕',
];

/**
 * Generate a comprehensive 9 PM Nightly Financial Report
 */
export function generateNightlyReport(
  transactions: Transaction[],
  dailyBudget: number,
  reportDateStr?: string
): NightlyReportData {
  const targetDate = reportDateStr || new Date().toISOString().split('T')[0];

  // Filter transactions for the target date
  const dayTxns = transactions.filter((t) => t.date === targetDate);

  const totalSpent = dayTxns.reduce((sum, t) => sum + t.amount, 0);
  const difference = totalSpent - dailyBudget;
  const isOverspent = totalSpent > dailyBudget;

  // Merchant aggregation
  const merchantMap: Record<string, { amount: number; count: number }> = {};
  const categoryMap: Record<string, number> = {};
  let impulsiveSpendTotal = 0;

  for (const t of dayTxns) {
    if (!merchantMap[t.merchant]) {
      merchantMap[t.merchant] = { amount: 0, count: 0 };
    }
    merchantMap[t.merchant].amount += t.amount;
    merchantMap[t.merchant].count += 1;

    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;

    if (t.isImpulse) {
      impulsiveSpendTotal += t.amount;
    }
  }

  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, data]) => ({
      merchant,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([cat, amount]) => ({
      category: cat as ExpenseCategory,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Pick roast / praise
  const roastMessage = isOverspent
    ? OVERSPENT_RELATABLE_HERO
    : INDIAN_UNDER_BUDGET_PRAISES[Math.floor(Math.random() * INDIAN_UNDER_BUDGET_PRAISES.length)];

  const praiseMessage = isOverspent
    ? 'Tomorrow is a fresh day to reset your streak. Cook at home, skip the late-night Zepto scroll!'
    : `Amazing job! You saved ${formatINR(Math.abs(difference))} today.`;

  // WhatsApp formatted report
  // Prompt requirement: "Your daily budget was ₹3,333. You spent ₹4,200. Overspent by ₹867."
  const statusHeadline = isOverspent
    ? `🚨 *Daily Overspend Alert!*`
    : `🎉 *Daily Budget Champ!*`;

  const coreSentence = isOverspent
    ? `Your daily budget was ${formatINR(dailyBudget)}. You spent ${formatINR(totalSpent)}. Overspent by ${formatINR(difference)}.`
    : `Your daily budget was ${formatINR(dailyBudget)}. You spent ${formatINR(totalSpent)}. Saved ${formatINR(Math.abs(difference))}!`;

  const merchantLines = topMerchants.length > 0
    ? `\n*Top 3 Spending Merchants:*\n` +
      topMerchants.map((m, i) => `${i + 1}. ${m.merchant}: ${formatINR(m.amount)} (${m.count} orders)`).join('\n')
    : `\nNo major merchants visited today.`;

  const categoryLines = categoryBreakdown.length > 0
    ? `\n*Category Breakdown:*\n` +
      categoryBreakdown.map((c) => `• ${c.category}: ${formatINR(c.amount)} (${c.percentage}%)`).join('\n')
    : '';

  const roastLine = `\n_Verdict: "${roastMessage}"_`;

  const whatsappFormattedText = `${statusHeadline}\n\n${coreSentence}\n${merchantLines}\n${categoryLines}\n${roastLine}\n\n— Tracked live on *Finpulse* 🇮🇳`;

  return {
    reportDate: targetDate,
    dailyBudget,
    totalSpent,
    difference,
    isOverspent,
    topMerchants,
    categoryBreakdown,
    impulsiveSpendTotal,
    roastMessage,
    praiseMessage,
    whatsappFormattedText,
  };
}
