import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeTransferDestination,
  parseBankSms,
} from '../src/lib/bankStatementIntelligence.ts';
import { generatePastBankTransactions } from '../src/lib/pastBankDataGenerator.ts';

test('Bank Intelligence - Indian UPI & Statement Narration Parser', () => {
  // Zepto Quick Commerce
  const zeptoTxn = analyzeTransferDestination('UPI/DR/52938192384/ZEPTO/zepto@icici/ICICI Bank', 249);
  assert.equal(zeptoTxn.transferType, 'QUICK_COMMERCE');
  assert.equal(zeptoTxn.recipientName.toLowerCase().includes('zepto'), true);
  assert.equal(zeptoTxn.upiVpa, 'zepto@icici');
  assert.equal(zeptoTxn.isImpulseSuspect, true);

  // Swiggy Food Delivery
  const swiggyTxn = analyzeTransferDestination('UPI/SWIGGY/swiggy@hdfcbank/928392183', 680);
  assert.equal(swiggyTxn.transferType, 'FOOD_DELIVERY');
  assert.equal(swiggyTxn.recipientName.toLowerCase().includes('swiggy'), true);
  assert.equal(swiggyTxn.upiVpa, 'swiggy@hdfcbank');

  // P2P Transfer to person
  const p2pTxn = analyzeTransferDestination('UPI-RAMESH PATEL-ramesh@okaxis-Axis Bank-529381923', 1500);
  assert.equal(p2pTxn.transferType, 'P2P_TRANSFER');
  assert.equal(p2pTxn.recipientName.includes('RAMESH PATEL'), true);
  assert.equal(p2pTxn.upiVpa, 'ramesh@okaxis');

  // Mutual Fund SIP
  const sipTxn = analyzeTransferDestination('ACH-ZERODHA BROKING-MF SIP OCT 2026', 10000);
  assert.equal(sipTxn.transferType, 'INVESTMENT_SIP');
  assert.equal(sipTxn.transferCategory, 'utilities');
  assert.equal(sipTxn.recipientName.includes('Zerodha'), true);

  // Rent Transfer
  const rentTxn = analyzeTransferDestination('IMPS-RENT FOR HSR LAYOUT FLAT-LANDLORD SURESH', 28000);
  assert.equal(rentTxn.transferType, 'RENT_TRANSFER');
  assert.equal(rentTxn.transferCategory, 'utilities');
});

test('Bank Intelligence - Bank SMS Parsing & Live Debit Extraction', () => {
  const hdfcSms = 'HDFC Bank Alert: Rs 340.00 debited from a/c **4821 on 23-OCT-26 via UPI to ZEPTO (zepto@icici). Avl Bal: Rs 1,42,510.40. Ref 52938192384.';
  const parsed = parseBankSms(hdfcSms);
  assert.ok(parsed);
  assert.equal(parsed.amount, 340);
  assert.equal(parsed.utrNumber, '52938192384');
  assert.equal(parsed.balanceAfter, 142510.4);
});

test('Bank Intelligence - Past Historical Statement Generator Mathematical Rigor', () => {
  const startingBalance = 120000;
  const history = generatePastBankTransactions('bank_icici', 'ICICI Bank', startingBalance);

  assert.ok(Array.isArray(history));
  assert.ok(history.length >= 20, 'Should generate at least 20 historical transactions');

  // First item must match the current starting balance
  assert.equal(history[0].balanceAfter, startingBalance);

  // Verify dates are ordered descending (most recent first)
  for (let i = 0; i < history.length - 1; i++) {
    const d1 = new Date(history[i].date).getTime();
    const d2 = new Date(history[i + 1].date).getTime();
    assert.ok(d1 >= d2, `Transaction date ${history[i].date} should be >= ${history[i + 1].date}`);
  }

  // Verify running balances are positive and finite
  for (const txn of history) {
    assert.ok(txn.amount > 0);
    assert.ok(typeof txn.balanceAfter === 'number' && Number.isFinite(txn.balanceAfter));
    assert.ok(txn.balanceAfter > 0);
  }
});
