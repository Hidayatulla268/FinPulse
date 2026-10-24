'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Zap,
  Globe,
  Coins,
  ArrowRight,
  Send,
  Bot,
  User,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  PieChart,
  Lightbulb,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { AIChatMessage } from '@/types/finance';
import { generateAIChatResponse } from '@/lib/finpulseAI';

function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
}

interface FinpulseAICopilotProps {
  onOpenPassbook?: () => void;
  onOpenSubscriptions?: () => void;
  onOpenSettings?: () => void;
}

export const FinpulseAICopilot: React.FC<FinpulseAICopilotProps> = ({
  onOpenPassbook,
  onOpenSubscriptions,
  onOpenSettings,
}) => {
  const {
    profile,
    transactions,
    bankAccounts,
    dailyAllowance,
    todaySpent,
    aiAudit,
    updateProfile,
    playAudioChime,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'playbook' | 'macro' | 'chat'>('playbook');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: `Hello ${profile.name ? profile.name.split(' ')[0] : 'there'}! I am your **Finpulse Built-in Financial & Macro AI Copilot**.\n\n` +
        `I’ve analyzed your **₹${formatINR(profile.monthlySalary).replace('₹', '')}** salary, your **₹${formatINR(dailyAllowance).replace('₹', '')}/day** daily allowance, and your scanned bank transactions across **${bankAccounts.length} connected accounts**.\n\n` +
        `Tap any suggested prompt below or type your question to get tailored savings strategies grounded in real-world Indian macro data!`,
      timestamp: 'Just now',
      keyStats: [
        { label: 'Health Score', value: `${aiAudit.healthScore}/100` },
        { label: 'Runway', value: `${aiAudit.runwayMonths} Mo` },
        { label: 'Savings Potential', value: `+${formatINR(aiAudit.potentialMonthlySavingsINR)}/mo` },
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [expandedMacroIndex, setExpandedMacroIndex] = useState<number | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping, activeTab]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsAiTyping(true);
    playAudioChime('ding');

    // Built-in AI generation with realistic natural typing delay
    setTimeout(() => {
      const aiReply = generateAIChatResponse(text, {
        profile,
        transactions,
        bankAccounts,
        audit: aiAudit,
        dailyAllowance,
        todaySpent,
      });

      setMessages((prev) => [...prev, aiReply]);
      setIsAiTyping(false);
      playAudioChime('success');
    }, 450);
  };

  const handleApplyBudgetSuggestion = (val: number) => {
    updateProfile({ customDailyAllowance: val });
    playAudioChime('success');
  };

  const quickPrompts = [
    'How can I save ₹10,000 this month?',
    'What is my biggest money leak?',
    'How does inflation affect my daily allowance?',
    'Explain the 50-30-20 rule for my salary',
    'Am I ready for an emergency fund?',
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel-elevated glass-specular border border-slate-200 shadow-xl p-6 sm:p-8">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-sky-500/8 blur-[90px] pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7] text-xs font-bold mb-2">
            <BrainCircuit className="w-4 h-4 text-[#0284C7] animate-pulse" />
            <span>Built-in Financial & Macro Intelligence (100% Offline & Private)</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
            <span>Finpulse AI Financial Copilot</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white">
              NEURAL V2
            </span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Diagnoses live bank transactions, plugs quick-commerce micro-leaks, and grounds daily allowances in real-world Indian economic benchmarks.
          </p>
        </div>

        {/* Health Score Pill */}
        <div className="p-3.5 rounded-2xl glass-panel glass-specular border border-slate-200 flex items-center gap-4 shrink-0 shadow-sm">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0284C7] transition-all duration-1000 ease-out"
                strokeDasharray={`${aiAudit.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-black text-xs text-[#0F172A]">{aiAudit.healthScore}</span>
          </div>

          <div>
            <div className="text-[11px] uppercase font-bold tracking-wider text-[#0284C7]">Financial Health</div>
            <div className="text-xs font-extrabold text-[#0F172A]">{aiAudit.verdict}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Runway: <strong className="text-cyan-700">{aiAudit.runwayMonths} Mo</strong> • Unlock:{' '}
              <strong className="text-teal-700">+{formatINR(aiAudit.potentialMonthlySavingsINR)}/mo</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative z-10 flex items-center gap-2 mt-5">
        <button
          onClick={() => setActiveTab('playbook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'playbook'
              ? 'bg-cyan-50 text-[#0284C7] border border-cyan-300 shadow-xs'
              : 'glass-pill text-slate-600 hover:text-[#0F172A]'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Actionable Savings Playbook ({aiAudit.suggestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('macro')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'macro'
              ? 'bg-cyan-50 text-[#0284C7] border border-cyan-300 shadow-xs'
              : 'glass-pill text-slate-600 hover:text-[#0F172A]'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>India & World Macro Context ({aiAudit.macroSignals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-cyan-50 text-[#0284C7] border border-cyan-300 shadow-xs'
              : 'glass-pill text-slate-600 hover:text-[#0F172A]'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>AI Financial Advisor (Q&A)</span>
        </button>
      </div>

      {/* TAB 1: SAVINGS PLAYBOOK */}
      {activeTab === 'playbook' && (
        <div className="relative z-10 mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAudit.suggestions.map((sug) => (
              <div
                key={sug.id}
                className="p-5 rounded-2xl glass-panel glass-specular border border-slate-200 hover:border-cyan-300 transition flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                      {sug.tag}
                    </span>

                    <span className="text-xs font-mono font-bold text-teal-700 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-cyan-600" />
                      +{formatINR(sug.impactINR)}/{sug.impactPeriod === 'annual' ? 'yr' : 'mo'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0284C7] transition">{sug.title}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-1">{sug.headline}</p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-[#0F172A] block mb-1">Recommended Action:</strong>
                    {sug.action}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-start gap-1.5 italic">
                    <Globe className="w-3 h-3 text-[#0284C7] shrink-0 mt-0.5" />
                    <span>{sug.worldContext}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                    Priority: <span className="text-[#0284C7]">{sug.priority}</span>
                  </span>

                  <button
                    onClick={() => {
                      if (sug.id === 'sug_emergency' && onOpenPassbook) onOpenPassbook();
                      else if (sug.id === 'sug_weekend' && onOpenSettings) onOpenSettings();
                      else if (sug.id === 'sug_qcommerce' && onOpenPassbook) onOpenPassbook();
                      else {
                        setActiveTab('chat');
                        handleSendMessage(`Tell me more about: ${sug.title}`);
                      }
                    }}
                    className="text-xs text-[#0284C7] hover:text-cyan-700 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Execute with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MACRO SIGNALS */}
      {activeTab === 'macro' && (
        <div className="relative z-10 mt-6 space-y-3">
          <div className="text-xs text-slate-600 max-w-2xl mb-4">
            How real-world Indian and global macro-economic signals impact your monthly salary, daily allowances, and liquid wealth:
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiAudit.macroSignals.map((signal, idx) => {
              const isExpanded = expandedMacroIndex === idx;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl glass-panel glass-specular border border-slate-200 hover:border-cyan-300 transition shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-[#0284C7]">
                        {signal.badge}
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A] mt-2">{signal.title}</h4>
                      <div className="text-xs font-mono font-extrabold text-cyan-700 mt-0.5">{signal.value}</div>
                    </div>

                    <button
                      onClick={() => setExpandedMacroIndex(isExpanded ? null : idx)}
                      className="p-1 rounded-lg glass-pill text-slate-500 hover:text-[#0F172A] transition cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{signal.implication}</p>

                  {isExpanded && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 animate-in fade-in duration-200">
                      <strong className="text-[#0F172A] block mb-0.5">Finpulse Strategic Guidance:</strong>
                      {signal.recommendation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE AI CHAT */}
      {activeTab === 'chat' && (
        <div className="relative z-10 mt-6 flex flex-col h-[460px] rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Chat Message Stream */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div key={m.id} className={`flex gap-3 ${isAi ? 'items-start' : 'items-start justify-end'}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl btn-primary-mint flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isAi
                      ? 'bg-slate-50 border border-slate-200 text-[#0F172A] shadow-xs'
                      : 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white ml-auto shadow-sm'
                  }`}>
                    {/* Render message body */}
                    <div className="whitespace-pre-line space-y-2">
                      {m.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>

                    {/* Key Stats Pill Bar */}
                    {m.keyStats && m.keyStats.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                        {m.keyStats.map((st, sIdx) => (
                          <div key={sIdx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono shadow-xs">
                            <span className="text-slate-500">{st.label}: </span>
                            <span className="text-cyan-700 font-bold">{st.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Recommendation */}
                    {m.actionRecommendation && (
                      <div className="mt-3 pt-2">
                        {m.actionRecommendation.type === 'adjust_budget' && m.actionRecommendation.value && (
                          <button
                            onClick={() => handleApplyBudgetSuggestion(m.actionRecommendation!.value!)}
                            className="px-3.5 py-1.5 rounded-xl btn-primary-mint text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>{m.actionRecommendation.label} (Set ₹{m.actionRecommendation.value}/day)</span>
                          </button>
                        )}

                        {m.actionRecommendation.type === 'open_passbook' && onOpenPassbook && (
                          <button
                            onClick={onOpenPassbook}
                            className="px-3.5 py-1.5 rounded-xl btn-secondary-ice text-xs hover:brightness-105 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Open Bank Passbook Ledger</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {m.actionRecommendation.type === 'open_subscriptions' && onOpenSubscriptions && (
                          <button
                            onClick={onOpenSubscriptions}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs hover:bg-amber-100 transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Audit Active Subscriptions</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-slate-400 text-right">{m.timestamp}</div>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-[#0284C7] font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl btn-primary-mint flex items-center justify-center text-white shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#0284C7] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  <span>Finpulse Neural Engine computing financial advice...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Suggested:</span>
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap glass-pill text-slate-700 hover:text-[#0284C7] transition shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Query Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about savings, emergency funds, quick-commerce leaks, inflation..."
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none border-slate-300"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isAiTyping}
              className="px-4 py-2.5 rounded-xl btn-primary-mint text-white font-extrabold text-xs shadow-md hover:brightness-110 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
