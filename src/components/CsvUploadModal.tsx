'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/lib/categorizer';
import { parseBankStatementCsv, SAMPLE_CSV_TEMPLATES } from '@/lib/csvParser';
import { Transaction } from '@/types/finance';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose }) => {
  const { batchImportTransactions, dailyAllowance } = useFinance();
  const [csvText, setCsvText] = useState<string>('');
  const [parsedList, setParsedList] = useState<Transaction[]>([]);
  const [detectedBank, setDetectedBank] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      processCsv(content);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file from disk');
    };
    reader.readAsText(file);
  };

  const processCsv = (text: string) => {
    setIsProcessing(true);
    setErrorMsg('');

    const result = parseBankStatementCsv(text, dailyAllowance);

    if (result.success && result.transactions.length > 0) {
      setParsedList(result.transactions);
      setDetectedBank(result.detectedBank);
    } else {
      setParsedList([]);
      setErrorMsg(result.error || 'No valid expense debits found in this CSV.');
    }
    setIsProcessing(false);
  };

  const loadSample = (type: 'hdfc' | 'gpay') => {
    const sample = SAMPLE_CSV_TEMPLATES[type];
    setCsvText(sample);
    processCsv(sample);
  };

  const handleConfirmImport = () => {
    if (parsedList.length === 0) return;
    batchImportTransactions(parsedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl glass-panel-elevated p-5 sm:p-8 shadow-2xl relative text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#0284C7]">
              <FileSpreadsheet className="w-5 h-5 text-[#0284C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Import Bank Statement (CSV)</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                  Auto-Parser
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports HDFC, ICICI, SBI, Axis, Paytm & Google Pay transaction exports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Sample Statements for Demo */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Try sample Indian bank statement instantly:</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => loadSample('hdfc')}
              className="px-3 py-1 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 font-medium transition cursor-pointer hover:border-cyan-300 hover:text-[#0284C7] shadow-sm"
            >
              HDFC Bank CSV
            </button>
            <button
              onClick={() => loadSample('gpay')}
              className="px-3 py-1 rounded-xl text-xs bg-white border border-slate-200 text-slate-700 font-medium transition cursor-pointer hover:border-cyan-300 hover:text-[#0284C7] shadow-sm"
            >
              GPay / UPI CSV
            </button>
          </div>
        </div>

        {/* Drag & Drop File Upload Area */}
        <div className="mt-4">
          <label className="flex flex-col items-center justify-center p-7 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-cyan-50/20 hover:border-cyan-400 transition cursor-pointer">
            <Upload className="w-8 h-8 text-[#0284C7] mb-2" />
            <span className="text-sm font-semibold text-slate-900">Click or drag & drop bank statement CSV</span>
            <span className="text-xs text-slate-500 mt-1">
              Supports .csv files exported from your netbanking or UPI app
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Results Live Preview */}
        {parsedList.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-900">
                  Detected: <span className="text-[#0284C7]">{detectedBank}</span>
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({parsedList.length} expenses found)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                Total: {formatINR(parsedList.reduce((s, t) => s + t.amount, 0))}
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm">
              {parsedList.map((t, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400">{t.date}</span>
                    <span className="font-semibold text-slate-900 truncate">{t.merchant}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                      {t.category}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {formatINR(t.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <button
              onClick={handleConfirmImport}
              className="w-full py-3.5 rounded-2xl btn-primary-mint text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
            >
              Confirm & Import {parsedList.length} Transactions to Finpulse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
