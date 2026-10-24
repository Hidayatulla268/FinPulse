import { NextResponse } from 'next/server';
import {
  analyzeTransferDestination,
  generateLiveBankFeed,
  parseBankSms,
} from '@/lib/bankStatementIntelligence';

let syncCounter = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bank = searchParams.get('bank') || 'HDFC Bank';

  syncCounter += 1;
  const newTransactions = generateLiveBankFeed(syncCounter);

  return NextResponse.json({
    success: true,
    bank,
    syncedAt: new Date().toISOString(),
    newTransactionsCount: newTransactions.length,
    transactions: newTransactions,
    message: `Successfully auto-synced with ${bank} (Account Aggregator Live Channel)`,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mode 1: Bank SMS string
    if (body.smsText) {
      const parsedTxn = parseBankSms(body.smsText);
      if (!parsedTxn) {
        return NextResponse.json(
          { success: false, error: 'Could not extract valid debit transaction from this SMS message' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'sms',
        transaction: parsedTxn,
        message: `Parsed payment to ${parsedTxn.transferredTo || parsedTxn.merchant} (${parsedTxn.amount} INR)`,
      });
    }

    // Mode 2: Raw Narration string
    if (body.narration) {
      const destination = analyzeTransferDestination(body.narration, Number(body.amount) || 0);
      return NextResponse.json({
        success: true,
        mode: 'narration',
        destination,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide either smsText or narration in request body' },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error processing bank sync' },
      { status: 500 }
    );
  }
}
