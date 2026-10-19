'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Key,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ExternalLink,
  ShieldAlert,
  Scale,
  Building2,
  FileSearch,
  RefreshCw,
  Info,
  SlidersHorizontal,
  Bot,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { api, CaseItem, AIAdvisorResponse } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
  suggestedActions?: string[];
  warning?: string;
}

interface CaseAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseItem;
}

const GROQ_FREE_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (প্রস্তাবিত • সেরা বিশ্লেষণ)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (অতি দ্রুত • ফ্রি)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (৩২কে কনটেক্সট • ফ্রি)' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT (গুগল মডেল • ফ্রি)' },
];

export const CaseAIChatDrawer: React.FC<CaseAIChatDrawerProps> = ({
  isOpen,
  onClose,
  caseItem,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Groq API Key & Model Configuration
  const [groqKey, setGroqKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [showSettings, setShowSettings] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved Groq Key and Model from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('unbhumi_groq_api_key') || '';
      const savedModel = localStorage.getItem('unbhumi_groq_model') || 'llama-3.3-70b-versatile';
      setGroqKey(savedKey);
      setSelectedModel(savedModel);
      if (!savedKey) {
        setShowSettings(true); // Open settings initially if no key yet
      }
    }
  }, []);

  // Initialize initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialGreeting: Message = {
        id: 'init-msg',
        role: 'assistant',
        content: isBn
          ? `নমস্কার! আমি **আনভূমি এআই আইনি ও তদন্ত পরামর্শক**।\n\nকেস **${caseItem.case_number}**-এর সকল নথিপত্র, দাগ-খতিয়ান রেকর্ড এবং ওনারশিপ গ্রাফ পরীক্ষা করা হয়েছে।\n\nআপনি এই কেসের ঝুঁকি বিশ্লেষণ, প্রযোজ্য **বাংলাদেশ ভূমি আইন (ভূমি অপরাধ আইন ২০২৩, প্রজাস্বত্ব আইন, হস্তান্তর আইন)** এবং **এসি ল্যান্ড বা সাব-রেজিস্ট্রিতে পরবর্তী করণীয় পদক্ষেপ** সম্পর্কে যেকোনো প্রশ্ন করতে পারেন। নিচের প্রস্তাবিত অপশনগুলো থেকে বেছে নিন অথবা আপনার প্রশ্ন লিখুন:`
          : `Hello! I am the **UNBhumi AI Land Legal & Investigative Advisor**.\n\nAll submitted documents, plot schedules, khatian records, and ownership graph topology for Case **${caseItem.case_number}** have been synthesized.\n\nAsk me about risk explanations, applicable **Bangladesh Land Statutes (Land Crime Act 2023, SAT Act, TPA)**, or step-by-step procedures to file with the **AC Land or Sub-Registry office**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          '১. সাব-রেজিস্ট্রি অফিসে বালাম বহি ও সূচি তল্লাশি',
          '২. সহকারী কমিশনার (ভূমি) বরাবর নামজারি আপত্তি দাখিল',
          '৩. ভূমি উন্নয়ন কর রেজিস্টার-২ ও দাখিলা হালনাগাদ যাচাই',
          '৪. ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩-এর প্রতিকার'
        ]
      };
      setMessages([initialGreeting]);
    }
  }, [isOpen, caseItem, isBn, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('unbhumi_groq_api_key', groqKey.trim());
      localStorage.setItem('unbhumi_groq_model', selectedModel);
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
      setShowSettings(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: AIAdvisorResponse = await api.askCaseAIAdvisor(caseItem.case_number, {
        message: text,
        history: historyPayload,
        groq_api_key: groqKey.trim(),
        model: selectedModel,
      });

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply || (isBn ? 'পরামর্শ প্রস্তুত করতে ত্রুটি হয়েছে।' : 'Error generating response.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: res.provider,
        model: res.model,
        suggestedActions: res.suggested_actions,
        warning: res.api_warning,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: isBn
          ? `⚠️ সংযোগ ত্রুটি: এআই পরামর্শ সেবা সাময়িকভাবে অনুপলব্ধ।\n${err?.message || ''}`
          : `⚠️ Connection Error: AI advisory service temporarily unavailable.\n${err?.message || ''}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in-50 duration-200">
      {/* Backdrop click to close */}
      <div className="flex-1 cursor-pointer" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-2xl bg-[var(--bg-surface)] text-[var(--text-primary)] border-l border-[var(--border-color)] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-[var(--bg-surface-soft)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                  {isBn ? 'এআই আইনি ও তদন্ত পরামর্শক' : 'AI Land Legal Advisor'}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold">
                  GraphRAG
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                {caseItem.case_number} • {caseItem.parcel?.mouza || 'মৌজা'} (দাগ: {caseItem.parcel?.dag_number || '—'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title={isBn ? 'Groq এপিআই সেটিংস' : 'Groq API Settings'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showSettings || !groqKey
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : 'border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collapsible Groq API Configuration Card */}
        {showSettings && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-900/60 text-xs space-y-3 animate-in slide-in-from-top-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  {isBn ? 'Groq এআই মডেল কনফিগারেশন' : 'Groq AI Model Configuration'}
                </span>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                  {isBn
                    ? 'Groq ক্লাউডের ফ্রি এপিআই কী ব্যবহার করে লাইভ Llama 3.3 / 3.1 মডেলের মাধ্যমে বিস্তারিত আইনি উত্তর পান।'
                    : 'Provide your free Groq API key to power real-time high-speed legal reasoning.'}
                </p>
              </div>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline bg-white/80 dark:bg-black/30 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-800 whitespace-nowrap"
              >
                <span>ফ্রি কী নিন</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                  Groq মডেল নির্বাচন:
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-xs font-medium cursor-pointer"
                >
                  {GROQ_FREE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                  Groq API Key (gsk_...):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] font-mono text-xs"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-3 py-1.5 rounded-lg bg-[var(--brand-accent)] text-white font-bold text-xs hover:bg-[var(--brand-accent-hover)] transition-all cursor-pointer whitespace-nowrap"
                  >
                    {keySaved ? 'সংরক্ষিত!' : 'সেভ করুন'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pt-1">
              <span>স্ট্যাটাস: {groqKey ? '🟢 Groq সক্রিয়' : '🟡 স্থানীয় জ্ঞানভাণ্ডার (অফলাইন মোড)'}</span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-amber-700 dark:text-amber-400 hover:underline"
              >
                লুকান ✕
              </button>
            </div>
          </div>
        )}

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === 'user'
                    ? 'bg-[var(--brand-accent)] text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed space-y-2.5 ${
                  m.role === 'user'
                    ? 'bg-[var(--brand-accent)] text-white rounded-tr-xs shadow-xs'
                    : 'bg-[var(--bg-surface-soft)] border border-[var(--border-color)] rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Text Content */}
                <div className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
                  {m.content}
                </div>

                {/* Suggested Action Chips (if present) */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block font-sans">
                      {isBn ? 'পরবর্তী প্রস্তাবিত পদক্ষেপ (Action Checklist):' : 'Suggested Action Checklist:'}
                    </span>
                    <div className="space-y-1">
                      {m.suggestedActions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-[11px] p-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/50"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warning note if fallback triggered */}
                {m.warning && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded">
                    ⚠️ {m.warning}
                  </p>
                )}

                {/* Footer metadata */}
                <div
                  className={`flex items-center justify-between text-[10px] pt-1 font-mono ${
                    m.role === 'user' ? 'text-white/70' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  <div className="flex items-center gap-2">
                    {m.model && <span className="opacity-75">{m.model.split('/')[0]}</span>}
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <span className="text-emerald-500 font-bold">কপি হয়েছে!</span>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--brand-accent)]" />
                <span>
                  {isBn
                    ? `GraphRAG নলেজ ও ${selectedModel}-এর মাধ্যমে বিশ্লেষণ চলছে...`
                    : `Analyzing via GraphRAG & ${selectedModel}...`}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Action Chips */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-surface-soft)]/50 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
          <button
            onClick={() => handleSendMessage('এই কেসে আমার পরবর্তী করণীয় কী এবং কোন কোন অফিসে যেতে হবে?')}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors cursor-pointer text-[11px]"
          >
            📋 পরবর্তী করণীয় কী?
          </button>
          <button
            onClick={() => handleSendMessage('দ্বৈত বিক্রি রোধে ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ অনুযায়ী কী কী প্রতিকার পাওয়া যাবে?')}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors cursor-pointer text-[11px]"
          >
            ⚖️ দ্বৈত বিক্রি প্রতিরোধ
          </button>
          <button
            onClick={() => handleSendMessage('সহকারী কমিশনার (ভূমি) কার্যালয়ে নামজারি আবেদন ও বিবিধ কেসের সঠিক প্রক্রিয়া বুঝিয়ে বলুন।')}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors cursor-pointer text-[11px]"
          >
            🏛️ এসি ল্যান্ড নামজারি
          </button>
          <button
            onClick={() => handleSendMessage('সাব-রেজিস্ট্রি অফিসে ইনডেক্স-২ ও বালাম বহি তল্লাশির সঠিক নিয়ম কী?')}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--brand-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors cursor-pointer text-[11px]"
          >
            🔍 বালাম বহি তল্লাশি
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isBn
                    ? 'কেসের যেকোনো অসঙ্গতি বা আইনি করণীয় সম্পর্কে জিজ্ঞাসা করুন...'
                    : 'Ask about case anomalies, legal remedies, or next steps...'
                }
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-soft)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--brand-accent)] resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-3 rounded-xl bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] disabled:opacity-40 transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-2 font-mono">
            {isBn
              ? 'এআই পরামর্শ সিদ্ধান্ত-সমর্থনমূলক। চূড়ান্ত স্বত্ব ও প্রতিকার আদালত বা সংশ্লিষ্ট সাব-রেজিস্ট্রার/এসি ল্যান্ড কর্তৃক নির্ধারিত।'
              : 'AI advice is decision-support only. Official title is determined by the competent revenue/civil authorities.'}
          </p>
        </div>
      </div>
    </div>
  );
};
