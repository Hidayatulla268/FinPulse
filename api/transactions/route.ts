import { NextResponse } from 'next/server';
import { identifyMerchantAndCategory } from '@/lib/categorizer';
import { INITIAL_TRANSACTIONS } from '@/lib/mockData';
import { Transaction } from '@/types/finance';

// In-memory backend store for server-side persistence demonstration
let inMemoryTransactions: Transaction[] = [...INITIAL_TRANSACTIONS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const category = searchParams.get('category');

  let filtered = [...inMemoryTransactions];

  if (date) {
    filtered = filtered.filter((t) => t.date === date);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    transactions: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const rawMerchant = body.merchant || body.title || 'UPI Merchant';
    const { merchant, category } = identifyMerchantAndCategory(rawMerchant);

    const newTxn: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title || merchant,
      merchant: body.merchant || merchant,
      amount: Math.max(1, Number(body.amount) || 0),
      category: body.category || category,
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      paymentMode: body.paymentMode || 'UPI',
      upiApp: body.upiApp || 'GPay',
      isImpulse: Boolean(body.isImpulse),
      notes: body.notes || '',
      source: body.source || 'manual',
    };

    inMemoryTransactions = [newTxn, ...inMemoryTransactions];

    return NextResponse.json({
      success: true,
      transaction: newTxn,
      message: 'Expense recorded successfully',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request payload' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Transaction ID is required' }, { status: 400 });
  }

  inMemoryTransactions = inMemoryTransactions.filter((t) => t.id !== id);

  return NextResponse.json({
    success: true,
    message: 'Transaction deleted',
  });
}
