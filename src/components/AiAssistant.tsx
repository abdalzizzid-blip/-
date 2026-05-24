import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User, AlertCircle, X, MessageSquare, Minimize2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { useLanguage } from '../context/LanguageContext';

export default function AiAssistant() {
  const { lang, t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isRtl = lang === 'ar';

  useEffect(() => {
    // Generate initial message based on user default language or admin overrides
    const storedWelcome = localStorage.getItem(`ai_assistant_welcome_${lang}`);
    const welcomeText = storedWelcome || (isRtl
      ? 'مرحباً بك! أنا مساعدك الشخصي الذكي في كورا فليكس المدعوم بالذكاء الاصطناعي من Google Gemini. 🤖🍿\n\nبإمكاني مساعدتك في:\n• تقديم ترشيحات أفلام ومسلسلات رائعة تناسب مزاجك الحالي.\n• سرد تفاصيل طاقم العمل وممثلي العروض.\n• إرشادك حول كيفية تفعيل مفتاح TMDB الشخصي لبث غير محدود!\n\nماذا تحب أن نشاهد ليلة اليوم؟'
      : 'Hello! I am your personal KoraFlix assistant powered by Google Gemini AI. 🤖🍿\n\nI can help you:\n• Suggest amazing movies and series based on your mood.\n• List details and cast members of your chosen shows.\n• Guide you on configuring your personal TMDB key for unlimited streaming!\n\nWhat are we looking to stream tonight?');

    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageText,
          history: messages.slice(-4)
        })
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: data.text || (isRtl 
          ? 'لقد بحثت في جداول المحتوى الفني ولكن لم أتمكن من صياغة إجابة مناسبة. فضلاً أعد توجيه السؤال بطريقة أخرى!'
          : 'I checked our screening schedules but couldn\'t compose a detailed answer. Please prompt me again!'),
        timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: isRtl
          ? 'عذراً! واجهت صعوبة في الاتصال بخوادم ذكاء Gemini الاصطناعية المعالجة للبث. يرجى إعادة توجيه رسالتك.'
          : 'Sorry! I encountered a connection issue reaching the Gemini intelligence nodes. Please try prompting me once more.',
        timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const clearText = isRtl
      ? 'مرحباً بك مجدداً! كيف يمكنني مساعدتك لتبسيط سهرة البث والسينما اليوم؟ راسلني بأي سؤال أو نوع مفضل.'
      : 'Welcome back! Let\'s curate your evening screening session. Prompt me with any questions or preferred genres.';

    setMessages([
      {
        id: 'welcome-clear',
        sender: 'assistant',
        text: clearText,
        timestamp: new Date().toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} z-50 p-4 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-xl shadow-rose-600/30 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 select-none`}
        title={isRtl ? 'تحدث مع المساعد الذكي' : 'Chat with Movie Assistant'}
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'left-6' : 'right-6'} w-85 sm:w-96 h-[480px] z-50 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-black ring-1 ring-slate-800`} dir={dir}>
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-950 p-4 border-b border-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-rose-600 flex items-center justify-center text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
            <h4 className="text-xs font-black text-white">{localStorage.getItem('ai_assistant_title') || (isRtl ? 'مساعد كورا كوفليكس' : 'KoraFlix AI Copilot')}</h4>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{isRtl ? 'الذكاء: ' : 'Model: '}{localStorage.getItem('ai_assistant_model') || 'Gemini 2.5 Flash'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-850 cursor-pointer"
            title={isRtl ? 'مسح المحادثة' : 'Clear Chat history'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-850 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isRtl ? 'text-right' : 'text-left'} ${
                isUser 
                  ? (isRtl ? 'mr-auto flex-row' : 'ml-auto flex-row-reverse') 
                  : (isRtl ? 'ml-auto flex-row-reverse' : 'mr-auto')
              }`}
            >
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs shrink-0 select-none ${
                isUser ? 'bg-rose-600 text-white' : 'bg-slate-950 text-rose-500'
              }`}>
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className="space-y-0.5 max-w-full">
                <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                  isUser 
                    ? `bg-rose-600 text-white font-bold ${isRtl ? 'rounded-tl-none' : 'rounded-tr-none'}` 
                    : `bg-slate-950 text-slate-300 rounded-none border border-slate-850 font-medium ${isRtl ? 'rounded-tr-none' : 'rounded-tl-none'}`
                }`}>
                  {msg.text}
                </div>
                <span className={`text-[8px] text-slate-650 block text-slate-500 px-1 ${isRtl ? 'text-left' : 'text-right'}`}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className={`flex gap-2.5 max-w-[85%] ${isRtl ? 'ml-auto flex-row-reverse text-right' : 'mr-auto text-left'}`}>
            <div className="h-7 w-7 rounded-lg bg-slate-950 text-rose-500 flex items-center justify-center text-xs shrink-0 select-none">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-slate-950 text-slate-500 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-slate-850 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce delay-100"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Draft Inputs footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputMsg);
        }}
        className="p-3 bg-slate-950 border-t border-slate-850 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={isRtl ? 'اسأل المساعد الذكي عن اقتراحات وأفلام...' : 'Ask for recommendations or movie facts...'}
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 focus:outline-none focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white"
        />
        <button
          type="submit"
          className="p-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
