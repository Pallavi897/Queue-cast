import React, { useRef, useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { useQueueCast } from '../context/QueueCastContext';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'How is wait time calculated?',
  'How do I check the queue before going?',
  'How does staff update the queue?',
  'How do alerts work?',
  'How do I add a canteen or menu item?',
  'How do I export reports?',
  'Is my data private?',
];

export const HelpChatbotView: React.FC = () => {
  const { settings } = useQueueCast();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hi! I am the QueueCast Assistant. Tap any suggested question below or ask me how wait times, staff updates, alerts, or reports work.',
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  const getAnswerForQuestion = (q: string): string => {
    const lower = q.toLowerCase();

    if (lower.includes('calculated') || lower.includes('formula') || lower.includes('wait time')) {
      return `Wait time is calculated live using the formula: Estimated Wait (min) = (People in Queue × Average Service Time per Person) ÷ Number of Open Counters. Right now your thresholds classify under ${settings.thresholds.lowMaxMinutes} min as Low (green), ${settings.thresholds.lowMaxMinutes}–${settings.thresholds.mediumMaxMinutes} min as Medium (amber), and above ${settings.thresholds.mediumMaxMinutes} min as High (red).`;
    }
    if (lower.includes('check') || lower.includes('before going')) {
      return 'Open the Canteens page to view every campus canteen card, its live estimated wait in minutes, crowd level badge, and a "Best time to visit" hint. Tap any canteen card to see its 9 AM–4 PM peak hours chart and today’s menu with prices.';
    }
    if (lower.includes('staff') || lower.includes('update')) {
      return 'Canteen staff use the Staff Panel, which has large mobile-friendly + and − buttons for people in queue, inputs for average service time and open counters, an Open/Closed toggle, and a quick note field. Every save updates student screens immediately and stores a timestamped record.';
    }
    if (lower.includes('alert') || lower.includes('notify')) {
      return 'On the Alerts page or any Canteen Detail page, set a rule like "Notify me when wait is under 8 minutes". Whenever a staff update or simulation tick brings the wait below your target, an in-app notification banner appears inside QueueCast. Note: Alerts are in-app only (no SMS or push notifications are sent).';
    }
    if (lower.includes('add') || lower.includes('menu') || lower.includes('canteen')) {
      return 'College Admins can add, edit, or delete canteens from the Canteens page or Admin Dashboard. Both Staff and Admins can add, edit, mark Sold Out, or remove menu items (with ₹ pricing) inside the Staff Panel under "Menu Management".';
    }
    if (lower.includes('export') || lower.includes('report') || lower.includes('csv')) {
      return 'Admins can open the Reports page, filter by date range (Today, Last 7 Days, All Time) or by canteen, and click "Export Report (CSV)" to download a real CSV spreadsheet generated directly from saved queue history.';
    }
    if (lower.includes('private') || lower.includes('privacy') || lower.includes('camera')) {
      return 'Yes. QueueCast does not use cameras, biometric sensors, or personal student location tracking. It only stores aggregate queue counts, service times, menu items, and demo profile preferences locally in your browser.';
    }
    return 'I can help with wait time calculations, checking canteens, staff updates, in-app alerts, menu management, CSV report exports, and privacy. Try clicking one of the suggested questions above for full details!';
  };

  const sendQuestion = (questionText: string) => {
    const clean = questionText.trim();
    if (!clean) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: clean,
    };
    const replyMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'assistant',
      text: getAnswerForQuestion(clean),
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInput('');
    setTimeout(() => {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#333333]">
          QueueCast Assistant
        </h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Instant answers about wait calculations, alerts, staff workflows, and campus privacy
        </p>
      </div>

      {/* Suggested Questions */}
      <div className="rounded-2xl bg-white border border-neutral-200 p-4">
        <p className="text-xs font-semibold text-neutral-500 mb-2.5">
          Suggested Questions (click to ask)
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendQuestion(q)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-[#F1F1F1] hover:bg-[#C00000]/10 hover:text-[#C00000] text-xs font-semibold text-[#333333] transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="rounded-2xl bg-white border border-neutral-200 flex flex-col overflow-hidden h-[460px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'assistant'
                    ? 'bg-[#C00000] text-white'
                    : 'bg-neutral-200 text-[#333333]'
                }`}
              >
                {msg.sender === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.sender === 'assistant'
                    ? 'bg-[#F9F9F9] border border-neutral-200 text-[#333333]'
                    : 'bg-[#C00000] text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={scrollEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-neutral-200 p-3 bg-[#F9F9F9] flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about QueueCast..."
            className="flex-1 min-w-0 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#C00000]"
          />
          <button
            type="submit"
            className="min-h-[42px] px-4 rounded-xl bg-[#C00000] text-white text-sm font-semibold hover:bg-[#A31621] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
