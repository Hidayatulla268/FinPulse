import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  sanitizeText,
  sanitizeCsvCell,
  safeJsonParse,
  clampFinancialNumber,
  validateAndSanitizeTransaction,
  validateAndSanitizeUserProfile,
  maskAccountNumber,
  maskVpa,
} from '../src/lib/security.ts';

test('Security Module - XSS Defense & HTML Escaping', () => {
  const dangerousScript = '<script>alert("xss")</script>Hello';
  const escaped = escapeHtml(dangerousScript);
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('&lt;script&gt;'), true);

  const sanitized = sanitizeText(dangerousScript);
  assert.equal(sanitized.includes('<script>'), false);
  assert.equal(sanitized.includes('alert("xss")'), false);
  assert.equal(sanitized, 'Hello');

  const javascriptProto = 'javascript:evil()';
  assert.equal(sanitizeText(javascriptProto), 'evil()');
});

test('Security Module - CSV Formula Injection (CWE-1236) Defense', () => {
  // Dangerous spreadsheet formula triggers
  assert.equal(sanitizeCsvCell('=1+1'), "'=1+1");
  assert.equal(sanitizeCsvCell('+SUM(A1:A10)'), "'+SUM(A1:A10)");
  assert.equal(sanitizeCsvCell('-5*5'), "'-5*5");
  assert.equal(sanitizeCsvCell('@cmd|"/C calc"!A0'), "'@cmd|\"/C calc\"!A0");
  assert.equal(sanitizeCsvCell('\tmalicious'), "'\tmalicious");

  // Safe normal inputs
  assert.equal(sanitizeCsvCell('Swiggy Order'), 'Swiggy Order');
  assert.equal(sanitizeCsvCell('1500'), '1500');
  assert.equal(sanitizeCsvCell(undefined), '');
});

test('Security Module - Safe JSON Parsing & Corruption Recovery', () => {
  const fallback = { fallback: true };
  assert.deepEqual(safeJsonParse('{ corrupt json: ', fallback), fallback);
  assert.deepEqual(safeJsonParse('', fallback), fallback);
  assert.deepEqual(safeJsonParse(null, fallback), fallback);
  assert.deepEqual(safeJsonParse('{"valid": 123}', fallback), { valid: 123 });
});

test('Security Module - Financial Number Clamping & Bounds Protection', () => {
  assert.equal(clampFinancialNumber(NaN, 0, 100, 10), 10);
  assert.equal(clampFinancialNumber(Infinity, 0, 100, 10), 10);
  assert.equal(clampFinancialNumber(-50, 0, 100, 0), 0);
  assert.equal(clampFinancialNumber(150, 0, 100, 0), 100);
  assert.equal(clampFinancialNumber(45.5, 0, 100, 0), 45.5);
  assert.equal(clampFinancialNumber('2500', 0, 10000, 0), 2500);
});

test('Security Module - Transaction Schema Validation & Sanitization', () => {
  // Malicious/invalid input
  assert.equal(validateAndSanitizeTransaction(null), null);
  assert.equal(validateAndSanitizeTransaction({ amount: -10 }), null);
  assert.equal(validateAndSanitizeTransaction({ amount: 0 }), null);

  // Valid transaction input
  const valid = validateAndSanitizeTransaction({
    amount: 350.75,
    description: '<script>evil()</script>Zepto Milk',
    category: 'groceries',
    date: '2026-10-23',
    isImpulse: true,
  });

  assert.ok(valid);
  assert.equal(valid.amount, 350.75);
  assert.equal(valid.title, 'Zepto Milk');
  assert.equal(valid.category, 'groceries');
  assert.equal(valid.isImpulse, true);
});

test('Security Module - Privacy Masking for Account Numbers & VPAs', () => {
  assert.equal(maskAccountNumber('50100492817281'), '•••• 7281');
  assert.equal(maskAccountNumber('9281'), '•••• 9281');

  assert.equal(maskVpa('rahul.verma@okaxis'), 'ra***@okaxis');
  assert.equal(maskVpa('zepto@icici'), 'ze***@icici');
  assert.equal(maskVpa('ab@paytm'), 'ab***@paytm');
});
