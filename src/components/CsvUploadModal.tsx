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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-2xl animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel-elevated glass-specular p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glows */}
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl bg-sky-500/20 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl bg-[#ff9900]/15 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-500/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass-panel glass-specular text-sky-400 glow-sky-subtle">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Import Bank Statement (CSV)</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full glass-pill border border-[#ff9900]/30 text-[#ff9900]">
                  Auto-Parser
                </span>
              </div>
              <p className="text-xs text-sky-200/60 mt-0.5">
                Supports HDFC, ICICI, SBI, Axis, Paytm & Google Pay transaction exports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl glass-pill text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Tap Sample Statements for Demo */}
        <div className="mt-4 p-3.5 rounded-2xl glass-panel glass-specular flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-sky-200/80 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
            <span>Try sample Indian bank statement instantly:</span>
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => loadSample('hdfc')}
              className="px-3 py-1 rounded-xl text-xs glass-pill border border-sky-500/30 text-sky-300 font-medium transition cursor-pointer hover:border-sky-400"
            >
              HDFC Bank CSV
            </button>
            <button
              onClick={() => loadSample('gpay')}
              className="px-3 py-1 rounded-xl text-xs glass-pill border border-[#ff9900]/30 text-[#ff9900] font-medium transition cursor-pointer hover:border-[#ff9900]/60"
            >
              GPay / UPI CSV
            </button>
          </div>
        </div>

        {/* Drag & Drop File Upload Area */}
        <div className="mt-4">
          <label className="flex flex-col items-center justify-center p-7 border-2 border-dashed border-sky-500/30 rounded-2xl glass-panel glass-specular hover:border-sky-400/60 transition cursor-pointer">
            <Upload className="w-8 h-8 text-sky-400 mb-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="text-sm font-semibold text-white">Click or drag & drop bank statement CSV</span>
            <span className="text-xs text-sky-200/50 mt-1">
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
          <div className="mt-3 p-3 rounded-xl glass-panel-marigold glass-specular text-[#ff9900] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ff9900] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Results Live Preview */}
        {parsedList.length > 0 && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-white">
                  Detected: <span className="text-sky-300">{detectedBank}</span>
                </span>
                <span className="text-xs text-sky-200/60 font-mono">
                  ({parsedList.length} expenses found)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-[#ff9900]">
                Total: {formatINR(parsedList.reduce((s, t) => s + t.amount, 0))}
              </span>
            </div>

            <div className="max-h-52 overflow-y-auto rounded-2xl glass-panel glass-specular divide-y divide-sky-500/10">
              {parsedList.map((t, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-white/[0.03]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-sky-200/50">{t.date}</span>
                    <span className="font-semibold text-white truncate">{t.merchant}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full glass-pill border border-sky-500/20 text-sky-300">
                      {t.category}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#ff9900] shrink-0">
                    {formatINR(t.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <button
              onClick={handleConfirmImport}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-300 to-[#ff9900] hover:brightness-110 text-black font-extrabold text-sm shadow-xl glow-sky-subtle transition cursor-pointer"
            >
              Confirm & Import {parsedList.length} Transactions to Finpulse
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
