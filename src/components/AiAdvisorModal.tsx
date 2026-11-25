import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAdvisorModal: React.FC<AiModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Namaste ${currentUser?.name || 'Associate'}! I am your **AI MLM Growth Coach & Legal Compliance Advisor** for *Watch Video, Dream in Hand*. \n\nI can help you calculate your dual-leg BV requirements, strategize your next Tour qualification (Goa, Dubai, Thailand), guide your downline placement, or clarify Indian Direct Selling Rules 2021. What would you like to plan today?`,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const quickPrompts = [
    'How do I qualify for Dubai Tour from my current rank?',
    'Explain dual-leg binary matching & weaker leg volume rules',
    'What are the mandatory KYC & 5% TDS rules in India?',
    'How does the Accidental Death Safeguard Scheme work?',
  ];

  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim()) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: queryText }];
    setMessages(newMsgs);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          prompt: queryText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.advice) {
        setMessages([...newMsgs, { role: 'assistant', content: data.advice }]);
      } else {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            content:
              'To achieve your next rank, focus on balancing your Group 1 (Weaker leg) and Group 2 (Stronger leg) Business Volume through daily video task engagement and direct product repurchase.',
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content:
            'Focus on your weaker leg volume to maximize binary matching commissions at 10% rate and unlock fixed tour promotions.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 flex flex-col h-[620px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">AI MLM Growth & Legal Coach</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                  Gemini Powered
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Targeting: {currentUser.currentRankName} • {currentUser.group1Bv.toLocaleString('en-IN')} (G1) / {currentUser.group2Bv.toLocaleString('en-IN')} (G2) BV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Message Thread Viewport */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-750 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-indigo-400 p-2 text-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing dual-leg matrix and formulating advice...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <p className="text-[10px] font-bold uppercase text-slate-400">Suggested Inquiries:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[10px] font-medium transition text-left truncate max-w-full"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center space-x-2 pt-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputQuery)}
            placeholder="Ask AI Coach about rank goals, BV calculation, or team growth..."
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage(inputQuery)}
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
