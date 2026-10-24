import test from 'node:test';
import assert from 'node:assert/strict';
import {
  runAIFinancialAudit,
  WORLD_MACRO_SIGNALS,
  generateAIChatResponse,
} from '../src/lib/finpulseAI.ts';
import { DEFAULT_PROFILE } from '../src/lib/mockData.ts';

test('Finpulse AI Engine - Financial Audit Computations', () => {
  const mockBankAccounts = [
    {
      id: 'b1',
      bankName: 'HDFC Bank',
      accountNumberMasked: '•••• 1234',
      accountType: 'savings',
      balance: 150000,
      isConnected: true,
      lastSyncedAt: 'Just now',
    },
  ];

  const mockTransactions = [
    {
      id: 't1',
      date: '2026-10-20',
      time: '18:30',
      title: 'Zepto 10-Min Groceries',
      merchant: 'Zepto',
      amount: 450,
      category: 'groceries',
      paymentMode: 'UPI',
      isImpulse: true,
      source: 'manual',
    },
    {
      id: 't2',
      date: '2026-10-21',
      time: '20:15',
      title: 'Swiggy Dinner',
      merchant: 'Swiggy',
      amount: 720,
      category: 'food',
      paymentMode: 'UPI',
      isImpulse: false,
      source: 'manual',
    },
    {
      id: 't3',
      date: '2026-10-23',
      time: '09:00',
      title: 'Rent to Landlord',
      merchant: 'Landlord',
      amount: 25000,
      category: 'utilities',
      paymentMode: 'NetBanking',
      isImpulse: false,
      source: 'manual',
    },
  ];

  const audit = runAIFinancialAudit({
    profile: DEFAULT_PROFILE,
    transactions: mockTransactions,
    bankAccounts: mockBankAccounts,
    subscriptions: [],
    dailyAllowance: 3333,
  });

  // Verify health score boundary
  assert.ok(audit.healthScore >= 0 && audit.healthScore <= 100);
  assert.equal(typeof audit.verdict, 'string');
  assert.ok(audit.verdict.length > 0);

  // Verify runway calculation
  assert.ok(audit.runwayMonths > 0);
  assert.equal(typeof audit.runwayMonths, 'number');

  // Verify inflation drag computation
  // Liquid: 150000 * 0.026 = 3900
  assert.equal(audit.inflationDragAnnualINR, Math.round(150000 * 0.026));

  // Verify quick commerce leak detection
  assert.ok(audit.quickCommerceLeakMonthly >= 450);
  assert.ok(audit.deliverySurgeLossMonthly >= 45);

  // Verify suggestions generated
  assert.ok(Array.isArray(audit.suggestions));
  assert.ok(audit.suggestions.length >= 3);
});

test('Finpulse AI Engine - World Macro Signals Integrity', () => {
  assert.ok(Array.isArray(WORLD_MACRO_SIGNALS));
  assert.ok(WORLD_MACRO_SIGNALS.length >= 4);

  const repoSignal = WORLD_MACRO_SIGNALS.find((s) => s.title.includes('Repo Rate'));
  assert.ok(repoSignal);
  assert.equal(repoSignal.value.includes('6.50%'), true);

  const inflationSignal = WORLD_MACRO_SIGNALS.find((s) => s.title.includes('Inflation'));
  assert.ok(inflationSignal);
  assert.equal(inflationSignal.value.includes('5.40%'), true);
});

test('Finpulse AI Engine - Natural Language Q&A Generation (Zero External APIs)', () => {
  const mockContext = {
    profile: DEFAULT_PROFILE,
    transactions: [],
    bankAccounts: [
      {
        id: 'b1',
        bankName: 'HDFC',
        accountNumberMasked: '•• 1111',
        accountType: 'savings',
        balance: 200000,
        isConnected: true,
        lastSyncedAt: 'now',
      },
    ],
    audit: runAIFinancialAudit({
      profile: DEFAULT_PROFILE,
      transactions: [],
      bankAccounts: [
        {
          id: 'b1',
          bankName: 'HDFC',
          accountNumberMasked: '•• 1111',
          accountType: 'savings',
          balance: 200000,
          isConnected: true,
          lastSyncedAt: 'now',
        },
      ],
      subscriptions: [],
      dailyAllowance: 3333,
    }),
    dailyAllowance: 3333,
    todaySpent: 1200,
  };

  // Test question: How to save?
  const saveResp = generateAIChatResponse('How can I save ₹10,000 this month?', mockContext);
  assert.ok(saveResp);
  assert.equal(saveResp.sender, 'ai');
  assert.ok(saveResp.text.includes('Savings Blueprint'));
  assert.ok(saveResp.keyStats && saveResp.keyStats.length >= 2);

  // Test question: Emergency runway
  const runwayResp = generateAIChatResponse('What is my emergency fund runway?', mockContext);
  assert.ok(runwayResp);
  assert.ok(runwayResp.text.includes('Runway'));
  assert.equal(runwayResp.actionRecommendation?.type, 'open_passbook');

  // Test question: Inflation & Macro
  const macroResp = generateAIChatResponse('Tell me about inflation and RBI rates', mockContext);
  assert.ok(macroResp);
  assert.ok(macroResp.text.includes('5.40%'));
  assert.ok(macroResp.text.includes('6.50%'));

  // Test question: 50-30-20 rule
  const ruleResp = generateAIChatResponse('Explain the 50:30:20 rule for my salary', mockContext);
  assert.ok(ruleResp);
  assert.ok(ruleResp.text.includes('50% Needs'));
  assert.ok(ruleResp.text.includes('30% Wants'));
  assert.ok(ruleResp.text.includes('20% Future Wealth'));
});
