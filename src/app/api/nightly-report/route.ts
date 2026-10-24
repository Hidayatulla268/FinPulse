import { NextResponse } from 'next/server';
import { generateNightlyReport } from '@/lib/relatableQuotes';
import { Transaction } from '@/types/finance';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactions: Transaction[] = body.transactions || [];
    const dailyBudget: number = Number(body.dailyBudget) || 3333;
    const targetDate: string = body.date || new Date().toISOString().split('T')[0];
    const channel: 'whatsapp' | 'email' | 'browser' = body.channel || 'whatsapp';
    const recipient: string = body.recipient || '';

    const report = generateNightlyReport(transactions, dailyBudget, targetDate);

    // Simulate WhatsApp / Email dispatch
    const simulatedDispatch = {
      channel,
      recipient: recipient || (channel === 'whatsapp' ? '+91 98765 43210' : 'user@example.com'),
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      payloadPreview: report.whatsappFormattedText,
    };

    return NextResponse.json({
      success: true,
      report,
      dispatch: simulatedDispatch,
      message: `Nightly 9 PM Report generated successfully for ${report.reportDate}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to generate nightly report' },
      { status: 500 }
    );
  }
}
