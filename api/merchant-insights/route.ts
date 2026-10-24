import { NextResponse } from 'next/server';
import { MerchantInsight, Transaction } from '@/types/finance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactions: Transaction[] = body.transactions || [];

    const merchantMap: Record<string, {
      category: Transaction['category'];
      totalSpent: number;
      orderCount: number;
      impulseCount: number;
      isQuickCommerce: boolean;
      dates: string[];
    }> = {};

    for (const t of transactions) {
      if (!merchantMap[t.merchant]) {
        const isQC = t.merchant.toLowerCase().includes('zepto') ||
                     t.merchant.toLowerCase().includes('blinkit') ||
                     t.merchant.toLowerCase().includes('instamart');

        merchantMap[t.merchant] = {
          category: t.category,
          totalSpent: 0,
          orderCount: 0,
          impulseCount: 0,
          isQuickCommerce: isQC,
          dates: [],
        };
      }

      merchantMap[t.merchant].totalSpent += t.amount;
      merchantMap[t.merchant].orderCount += 1;
      if (t.isImpulse) {
        merchantMap[t.merchant].impulseCount += 1;
      }
      merchantMap[t.merchant].dates.push(t.date);
    }

    const insights: MerchantInsight[] = Object.entries(merchantMap).map(([merchant, data]) => {
      // Estimate delivery & handling fee drain for quick commerce (~ ₹35 per order)
      const estimatedDeliverySurgeFees = data.isQuickCommerce ? data.orderCount * 39 : 0;
      const sortedDates = [...data.dates].sort().reverse();

      return {
        merchant,
        category: data.category,
        totalSpent: data.totalSpent,
        orderCount: data.orderCount,
        avgOrderValue: Math.round(data.totalSpent / data.orderCount),
        impulseCount: data.impulseCount,
        isQuickCommerce: data.isQuickCommerce,
        estimatedDeliverySurgeFees,
        lastOrderDate: sortedDates[0] || '',
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    // Summary calculations
    const quickCommerceTotal = insights
      .filter((i) => i.isQuickCommerce)
      .reduce((sum, i) => sum + i.totalSpent, 0);

    const totalSurgeFeesWasted = insights
      .filter((i) => i.isQuickCommerce)
      .reduce((sum, i) => sum + i.estimatedDeliverySurgeFees, 0);

    return NextResponse.json({
      success: true,
      insights,
      summary: {
        totalUniqueMerchants: insights.length,
        quickCommerceTotal,
        totalSurgeFeesWasted,
        topImpulsiveMerchant: insights.sort((a, b) => b.impulseCount - a.impulseCount)[0]?.merchant || 'None',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to calculate insights' },
      { status: 500 }
    );
  }
}
