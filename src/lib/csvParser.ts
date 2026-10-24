import { analyzeTransferDestination } from './bankStatementIntelligence';
import { sanitizeText } from './security';
import { ExpenseCategory, Transaction } from '@/types/finance';

export interface ParseResult {
  success: boolean;
  transactions: Transaction[];
  totalParsed: number;
  detectedBank: string;
  error?: string;
}

/**
 * Robust CSV parser for Indian bank statements and UPI payment exports
 */
export function parseBankStatementCsv(csvText: string, _dailyAllowance?: number): ParseResult {
  try {
    const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    if (rawLines.length < 2) {
      return {
        success: false,
        transactions: [],
        totalParsed: 0,
        detectedBank: 'Unknown',
        error: 'CSV file is empty or has only one line',
      };
    }

    // Detect format by scanning first 15 lines for header signatures
    let headerLineIndex = -1;
    let detectedBank = 'Generic Statement';

    for (let i = 0; i < Math.min(rawLines.length, 15); i++) {
      const lineLower = rawLines[i].toLowerCase();
      if (lineLower.includes('narration') && lineLower.includes('withdrawal')) {
        headerLineIndex = i;
        detectedBank = 'HDFC Bank';
        break;
      }
      if (lineLower.includes('transaction date') && lineLower.includes('withdrawal amount')) {
        headerLineIndex = i;
        detectedBank = 'ICICI Bank';
        break;
      }
      if (lineLower.includes('txndate') || (lineLower.includes('txn date') && lineLower.includes('debit'))) {
        headerLineIndex = i;
        detectedBank = 'State Bank of India (SBI)';
        break;
      }
      if (lineLower.includes('tran date') && lineLower.includes('particulars')) {
        headerLineIndex = i;
        detectedBank = 'Axis Bank';
        break;
      }
      if (lineLower.includes('order id') || lineLower.includes('upi transaction id') || lineLower.includes('transaction id')) {
        headerLineIndex = i;
        detectedBank = 'Paytm / PhonePe / GPay Export';
        break;
      }
      if (lineLower.includes('date') && (lineLower.includes('amount') || lineLower.includes('debit'))) {
        headerLineIndex = i;
        detectedBank = 'Generic CSV';
        break;
      }
    }

    if (headerLineIndex === -1) {
      headerLineIndex = 0; // fallback to line 0
    }

    const headers = parseCsvRow(rawLines[headerLineIndex]).map((h) => h.toLowerCase().trim());
    // Safe cap to 1000 lines to prevent CPU DoS
    const dataLines = rawLines.slice(headerLineIndex + 1).slice(0, 1000);

    // Identify column indices
    let dateCol = headers.findIndex((h) => h.includes('date') || h.includes('time'));
    let descCol = headers.findIndex((h) =>
      h.includes('narration') || h.includes('particulars') || h.includes('remarks') || h.includes('description') || h.includes('merchant')
    );
    const debitCol = headers.findIndex((h) =>
      h.includes('withdrawal') || h.includes('debit') || h.includes('paid out') || h.includes('expense')
    );
    const amountCol = headers.findIndex((h) => h.includes('amount'));
    const categoryCol = headers.findIndex((h) => h.includes('category'));

    if (dateCol === -1) dateCol = 0;
    if (descCol === -1) descCol = 1;

    const parsedTransactions: Transaction[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const row = parseCsvRow(dataLines[i]);
      if (row.length <= 1) continue;

      const rawDesc = sanitizeText(row[descCol] || '', 200);
      if (!rawDesc || rawDesc.toLowerCase().includes('closing balance') || rawDesc.toLowerCase().includes('opening balance')) {
        continue;
      }

      // Determine amount: check debit col first, then amount col
      let amountStr = '';
      if (debitCol !== -1 && row[debitCol]) {
        amountStr = row[debitCol];
      } else if (amountCol !== -1 && row[amountCol]) {
        amountStr = row[amountCol];
      }

      // Clean numeric amount (remove commas, currency signs, whitespace)
      const cleanAmountStr = amountStr.replace(/[^0-9.-]/g, '');
      const parsedAmount = Math.abs(parseFloat(cleanAmountStr));

      // Skip non-expenses or zero amounts
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        continue;
      }

      const rawDate = row[dateCol] || new Date().toISOString();
      const normalizedDate = normalizeDate(rawDate);

      // Auto-categorize and merchant extraction
      // Auto-detect where money was transferred with destination intelligence
      const destination = analyzeTransferDestination(rawDesc, parsedAmount);

      const txn: Transaction = {
        id: `csv_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
        title: sanitizeText(destination.recipientName || rawDesc.slice(0, 48), 100),
        merchant: sanitizeText(destination.recipientName, 100),
        transferredTo: sanitizeText(destination.recipientName, 100),
        vpa: destination.upiVpa ? sanitizeText(destination.upiVpa, 60) : undefined,
        transferType: destination.transferType,
        amount: Math.round(parsedAmount),
        category: (categoryCol !== -1 && row[categoryCol] ? (row[categoryCol].toLowerCase() as ExpenseCategory) : destination.transferCategory),
        date: normalizedDate.dateStr,
        time: normalizedDate.timeStr,
        paymentMode: destination.transferChannel,
        upiApp: destination.upiApp,
        isImpulse: destination.isImpulseSuspect,
        notes: sanitizeText(`Imported from ${detectedBank} statement • ${destination.destinationDetails}${destination.upiVpa ? ` (${destination.upiVpa})` : ''}`, 200),
        source: 'csv',
      };

      parsedTransactions.push(txn);
    }

    return {
      success: true,
      transactions: parsedTransactions,
      totalParsed: parsedTransactions.length,
      detectedBank,
    };
  } catch (err: unknown) {
    return {
      success: false,
      transactions: [],
      totalParsed: 0,
      detectedBank: 'Unknown',
      error: err instanceof Error ? err.message : 'Failed to parse CSV',
    };
  }
}

/**
 * Handle CSV quoting, commas, and edge cases
 */
function parseCsvRow(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Normalize typical Indian bank date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
 */
function normalizeDate(raw: string): { dateStr: string; timeStr: string } {
  const now = new Date();
  let timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // If time is included e.g. "22/10/2026 14:32:00"
  if (raw.includes(' ') || raw.includes('T')) {
    const parts = raw.split(/[ T]/);
    if (parts[1] && parts[1].includes(':')) {
      const t = parts[1].split(':');
      timeStr = `${t[0].padStart(2, '0')}:${(t[1] || '00').padStart(2, '0')}`;
    }
    raw = parts[0];
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    return {
      dateStr: d.toISOString().split('T')[0],
      timeStr,
    };
  }

  // Handle ISO YYYY-MM-DD
  const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    return {
      dateStr: `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`,
      timeStr,
    };
  }

  return {
    dateStr: now.toISOString().split('T')[0],
    timeStr,
  };
}

/**
 * Sample Indian bank statement templates for users to download and try immediately
 */
export const SAMPLE_CSV_TEMPLATES = {
  hdfc: `Date,Narration,Chq/Ref No,Value Dt,Withdrawal Amt,Deposit Amt,Closing Balance
22/10/2026,UPI-ZEPTO-ZEPTO@ICICI-982341234,REF49281,22/10/2026,349.00,,48250.00
22/10/2026,UPI-SWIGGY-SWIGGY@HDFC-882199021,REF49282,22/10/2026,480.00,,47770.00
22/10/2026,UPI-CHAI TAPRI-RAMESH@OKAXIS-11223,REF49283,22/10/2026,40.00,,47730.00
22/10/2026,UBER INDIA BANGALORE POS-4821,REF49284,22/10/2026,225.00,,47505.00
21/10/2026,UPI-BLINKIT COMMERCE-BLINKIT@AXIS,REF49285,21/10/2026,620.00,,46885.00
21/10/2026,AMAZON INDIA SELLER SERVICES POS,REF49286,21/10/2026,1499.00,,45386.00
20/10/2026,NETFLIX ENTERTAINMENT SERVICES,REF49287,20/10/2026,649.00,,44737.00`,

  gpay: `Transaction ID,Date,Merchant,Category,Amount,Payment Method
UPI492019,22/10/2026,Zepto Quick Grocery,Groceries,412.00,UPI (GPay)
UPI492020,22/10/2026,Zomato Food Delivery,Food,590.00,UPI (GPay)
UPI492021,22/10/2026,Namma Yatri Auto,Commute,120.00,UPI (GPay)
UPI492022,22/10/2026,Starbucks Indiranagar,Food,385.00,UPI (GPay)
UPI492023,21/10/2026,Spotify India,Subscriptions,119.00,UPI (GPay)
UPI492024,21/10/2026,Cult.fit Pass,Health,1499.00,UPI (GPay)
UPI492025,20/10/2026,Local Pan Shop,Random UPI,25.00,UPI (GPay)`,
};
