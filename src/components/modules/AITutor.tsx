import React, { useState, useRef, useEffect } from 'react';
import { FunctionCoefficients } from '../../types/math';
import { MathView, MathText } from '../math-ui/MathView';
import { Bot, Send, User, Sparkles, RefreshCw, MessageSquare, BookOpen, Lightbulb, HelpCircle, CheckCircle } from 'lucide-react';

interface AITutorProps {
  coefficients: FunctionCoefficients;
}

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  timestamp: string;
}

export const AITutor: React.FC<AITutorProps> = ({ coefficients }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Xin chào bạn! Tôi là **Trợ Giảng Toán 12 Rational Lab** 🤖.

Hiện tại chúng ta đang cùng khảo sát hàm số phân thức:
$$y = \\frac{${coefficients.a}x^2 + ${coefficients.b}x + ${coefficients.c}}{${coefficients.p}x + ${coefficients.q}}$$

Tôi sẵn sàng hỗ trợ bạn hiểu rõ bản chất của **đạo hàm, cực trị, tiệm cận đứng, tiệm cận xiên** và **tâm đối xứng**. Hãy bấm các câu hỏi nhanh bên dưới hoặc gõ thắc mắc của bạn nhé!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, actionType?: string) => {
    if (!text.trim() && !actionType) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          actionType,
          functionData: coefficients,
        }),
      });

      const data = await response.json();
      const tutorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: data.text || 'Có lỗi nhỏ khi phân tích. Bạn hãy thử lại câu hỏi nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('AI Tutor request failed:', err);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'tutor',
        text: 'Hiện tại kết nối máy chủ đang bận. Bạn hãy xem mục "12 Bước Khảo Sát" để đọc phân tích chi tiết chuẩn SGK nhé!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 16. The 5 specific quick actions requested by the user:
  const quickActions = [
    { label: 'Giải thích dễ hơn', prompt: 'Hãy giải thích cách tìm tiệm cận và cực trị một cách thật dễ hiểu, trực quan như cho học sinh lớp 12', actionType: 'explain_simpler' },
    { label: 'Cho ví dụ', prompt: 'Cho tôi một ví dụ cụ thể về bài toán tìm tâm đối xứng và cực trị thường gặp trong đề thi tốt nghiệp THPT', actionType: 'give_example' },
    { label: 'Tại sao?', prompt: 'Tại sao giao điểm của tiệm cận đứng và tiệm cận xiên lại luôn là tâm đối xứng của đồ thị hàm số này?', actionType: 'why_symmetry' },
    { label: 'Kiểm tra tôi', prompt: 'Hãy ra một câu hỏi ngắn kiểm tra sự hiểu biết của tôi về hàm số hiện tại', actionType: 'test_me' },
    { label: 'Tạo bài tương tự', prompt: 'Hãy tạo cho tôi một hàm phân thức tương tự có 2 cực trị đẹp để tôi tự luyện tập', actionType: 'similar_problem' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px] transition-colors">
      {/* 16. Header: 🤖 AI MATH TUTOR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>🤖 AI MATH TUTOR</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Trực tuyến
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trợ giảng Toán 12 chuyên sâu giải tích và hình học giải tích
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: Date.now().toString(),
                sender: 'tutor',
                text: `Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ gì về hàm số $y = \\frac{${coefficients.a}x^2 + ${coefficients.b}x + ${coefficients.c}}{${coefficients.p}x + ${coefficients.q}}$?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          title="Làm mới cuộc trò chuyện"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/30 no-scrollbar">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[88%] sm:max-w-[80%] ${
                isTutor ? 'self-start' : 'self-end ml-auto flex-row-reverse'
              } animate-fadeIn`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs ${
                  isTutor
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-200 dark:bg-slate-700'
                }`}
              >
                {isTutor ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isTutor
                      ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                      : 'bg-blue-600 text-white rounded-tr-xs font-medium'
                  }`}
                >
                  {isTutor ? <MathText text={msg.text} /> : msg.text}
                </div>
                <div
                  className={`text-[10px] text-slate-400 dark:text-slate-500 px-1 ${
                    isTutor ? 'text-left' : 'text-right'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 items-center text-xs text-slate-400 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              <span>Gia sư AI đang tính toán và soạn câu trả lời...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 16. Quick Actions: [Giải thích dễ hơn], [Cho ví dụ], [Tại sao?], [Kiểm tra tôi], [Tạo bài tương tự] */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickActions.map((qa, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(qa.prompt, qa.actionType)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
            <span>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* Input Field and Send Button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hỏi gia sư AI về cực trị, tiệm cận, bảng biến thiên..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
