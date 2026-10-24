import { NextResponse } from 'next/server';
import { parseBankStatementCsv } from '@/lib/csvParser';
import { clampFinancialNumber } from '@/lib/security';

const MAX_CSV_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawCsvText = formData.get('csvText') as string | null;
    const dailyAllowance = clampFinancialNumber(formData.get('dailyAllowance'), 100, 1_000_000, 3333);

    let content = '';

    if (file) {
      if (file.size > MAX_CSV_BYTES) {
        return NextResponse.json(
          { success: false, error: 'File size exceeds maximum allowed limit (5 MB)' },
          { status: 413 }
        );
      }
      content = await file.text();
    } else if (rawCsvText) {
      if (rawCsvText.length > MAX_CSV_BYTES) {
        return NextResponse.json(
          { success: false, error: 'CSV content exceeds maximum allowed limit (5 MB)' },
          { status: 413 }
        );
      }
      content = rawCsvText;
    } else {
      return NextResponse.json(
        { success: false, error: 'Please provide either a CSV file or csvText string' },
        { status: 400 }
      );
    }

    const result = parseBankStatementCsv(content, dailyAllowance);

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server failed to parse CSV' },
      { status: 500 }
    );
  }
}
