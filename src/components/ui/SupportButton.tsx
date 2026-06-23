'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineChatAlt2, HiOutlineX, HiOutlinePaperAirplane, HiOutlineUser, HiOutlinePhotograph, HiOutlineClock } from 'react-icons/hi';

const FAQ = [
  { q: 'چطور سفارش بدم؟', q_en: 'How to order?', a: 'محصول مورد نظر رو انتخاب کنید، سایز و رنگ رو مشخص کنید و دکمه افزودن به سبد رو بزنید. بعد از تکمیل سبد خرید، مراحل پرداخت رو طی کنید.', a_en: 'Select your product, choose size and color, click Add to Cart. Then complete checkout.' },
  { q: 'هزینه ارسال چقدره؟', q_en: 'Shipping costs?', a: 'ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان. ارسال عادی ۲۵,۰۰۰ تومان و ارسال سریع ۴۵,۰۰۰ تومان.', a_en: 'Free over 500K. Standard: 25,000T. Express: 45,000T.' },
  { q: 'چطور مرجوع کنم؟', q_en: 'How to return?', a: 'تا ۷ روز پس از دریافت، به شرط عدم استفاده و داشتن برچسب. از بخش تیکت‌ها درخواست بدید.', a_en: 'Within 7 days, unused with tags. Submit via Support Tickets.' },
  { q: 'کد تخفیف چطور؟', q_en: 'How to use coupon?', a: 'در صفحه سبد خرید، کد رو وارد کنید و اعمال رو بزنید.', a_en: 'Enter code in cart page and click Apply.' },
  { q: 'سفارشم کجاست؟', q_en: 'Where is my order?', a: 'از پنل کاربری > سفارش‌ها وضعیت رو پیگیری کنید.', a_en: 'Check Dashboard > Orders for status.' },
  { q: 'روش‌های پرداخت؟', q_en: 'Payment methods?', a: 'پرداخت آنلاین از طریق درگاه بانکی. تمام کارت‌های شتاب پشتیبانی میشن.', a_en: 'Online via bank gateway. All Shetab cards supported.' },
];

interface ChatMsg {
  id: string;
  sender: 'user' | 'bot' | 'admin' | 'system';
  message: string;
  image?: string;
}

interface HistorySession {
  id: string;
  created_at: string;
  updated_at: string;
  messages: { id: string; sender: string; message: string; image?: string; created_at: string }[];
}

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<'bot' | 'waiting' | 'active'>('bot');
  const [showFaq, setShowFaq] = useState(true);
  const [adminTyping, setAdminTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { locale } = useLocale();
  const { data: session } = useSession();
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const addBotMsg = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', message: text }]);
    scrollBottom();
  };

  const handleOpen = () => {
    setOpen(true);
    if (messages.length === 0) {
      addBotMsg(locale === 'fa' ? 'سلام! چطور می‌تونم کمکتون کنم؟ یکی از سوالات زیر رو انتخاب کنید یا سوالتون رو بنویسید.' : 'Hi! How can I help? Select a question below or type your own.');
    }
  };

  const handleFaq = (index: number) => {
    const faq = FAQ[index];
    const q = locale === 'fa' ? faq.q : faq.q_en;
    const a = locale === 'fa' ? faq.a : faq.a_en;
    setMessages(prev => [
      ...prev,
      { id: `q-${Date.now()}`, sender: 'user', message: q },
      { id: `a-${Date.now()}`, sender: 'bot', message: a },
    ]);
    scrollBottom();
  };

  const requestAdmin = async () => {
    if (!session) return;

    let sid = sessionId;
    if (!sid) {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_session' }),
      });
      const data = await res.json();
      sid = data.session_id;
      setSessionId(sid);
    }

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_admin', session_id: sid }),
    });

    setChatStatus('waiting');
    setShowFaq(false);
    addBotMsg(locale === 'fa' ? 'در حال ارتباط با پشتیبان... لطفاً منتظر بمانید.' : 'Connecting to support... Please wait.');
    startPolling(sid!);
  };

  const startPolling = (sid: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const [chatRes, typingRes] = await Promise.all([
          fetch(`/api/chat?session_id=${sid}`),
          fetch(`/api/chat/typing?session_id=${sid}`),
        ]);
        const data = await chatRes.json();
        const typingData = await typingRes.json();

        setAdminTyping(!!typingData.admin_typing);

        if (data.session) {
          if (data.session.status === 'active') {
            setChatStatus('active');
          }
          if (data.session.status === 'closed') {
            setChatStatus('bot');
            if (pollRef.current) clearInterval(pollRef.current);
            addBotMsg(locale === 'fa' ? 'چت پایان یافت. ممنون از صبر شما!' : 'Chat ended. Thank you!');
          }
          if (data.messages) {
            setMessages(prev => {
              const botMsgs = prev.filter(m => m.sender === 'bot');
              const serverMsgs: ChatMsg[] = data.messages.map((m: any) => ({
                id: m.id,
                sender: m.sender,
                message: m.message,
                image: m.image || undefined,
              }));
              return [...botMsgs, ...serverMsgs];
            });
            scrollBottom();
          }
        }
      } catch {}
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!sessionId) return;
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, is_typing: typing, role: 'user' }),
    }).catch(() => {});
  }, [sessionId]);

  const handleInputChange = (val: string) => {
    setInput(val);
    if (sessionId && chatStatus === 'active') {
      sendTypingStatus(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 2000);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addBotMsg(locale === 'fa' ? 'حداکثر حجم تصویر ۲ مگابایت است' : 'Maximum image size is 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await fetch('/api/upload/chat-image', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.url && sessionId) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_message', session_id: sessionId, message: '', image: uploadData.url }),
        });
        setMessages(prev => [...prev, { id: `img-${Date.now()}`, sender: 'user', message: '', image: uploadData.url }]);
        scrollBottom();
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    sendTypingStatus(false);

    if (chatStatus === 'bot' && !sessionId) {
      setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', message: text }]);
      scrollBottom();
      setTimeout(() => {
        addBotMsg(locale === 'fa'
          ? 'متأسفانه پاسخ خودکاری برای سوال شما ندارم. می‌تونید با پشتیبان ارتباط برقرار کنید.'
          : "I don't have an automatic answer. You can connect to support.");
        setShowFaq(false);
      }, 500);
      return;
    }

    if (sessionId && (chatStatus === 'active' || chatStatus === 'waiting')) {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', session_id: sessionId, message: text }),
      });
      setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', message: text }]);
      scrollBottom();
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/chat/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch {}
  };

  const toggleHistory = () => {
    if (!showHistory) fetchHistory();
    setShowHistory(!showHistory);
    setExpandedHistory(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  return (
    <div className="fixed bottom-6 start-4 md:start-6 z-40">
      {open && (
        <div className="absolute bottom-16 start-0 mb-2 w-[310px] md:w-[350px] animate-fade-in">
          <div className="bg-[#111115] rounded-2xl shadow-2xl border border-white/[0.08] overflow-hidden flex flex-col" style={{ height: 460 }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-gold/20 to-gold/5 px-4 py-3 flex items-center justify-between border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center">
                  <HiOutlineChatAlt2 className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{locale === 'fa' ? 'پشتیبانی آنلاین' : 'Live Support'}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${chatStatus === 'active' ? 'bg-green-400' : chatStatus === 'waiting' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
                    <span className="text-[10px] text-gray-400">
                      {chatStatus === 'active' ? (locale === 'fa' ? 'متصل به پشتیبان' : 'Connected') :
                       chatStatus === 'waiting' ? (locale === 'fa' ? 'در انتظار پشتیبان...' : 'Waiting...') :
                       (locale === 'fa' ? 'ربات پاسخگو' : 'Auto-reply')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {session && (
                  <button onClick={toggleHistory} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showHistory ? 'bg-gold/20 text-gold' : 'hover:bg-white/10 text-gray-400'}`} title={locale === 'fa' ? 'تاریخچه' : 'History'}>
                    <HiOutlineClock className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showHistory ? (
              /* Chat History View */
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {history.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <HiOutlineClock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    {locale === 'fa' ? 'تاریخچه‌ای وجود ندارد' : 'No history found'}
                  </div>
                ) : history.map(h => (
                  <div key={h.id} className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <button
                      onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                    >
                      <span className="text-xs text-gray-400">{formatDate(h.updated_at)}</span>
                      <span className="text-[10px] text-gray-500">{h.messages.length} {locale === 'fa' ? 'پیام' : 'msgs'}</span>
                    </button>
                    {expandedHistory === h.id && (
                      <div className="px-3 pb-3 space-y-2 border-t border-white/[0.04]">
                        {h.messages.map(m => (
                          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : m.sender === 'system' ? 'justify-center' : 'justify-start'} mt-2`}>
                            {m.sender === 'system' ? (
                              <span className="text-[10px] text-gray-600 bg-white/[0.03] px-2 py-0.5 rounded-full">{m.message}</span>
                            ) : (
                              <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-xs ${
                                m.sender === 'user' ? 'bg-gold/80 text-white rounded-br-sm' :
                                m.sender === 'admin' ? 'bg-blue-500/10 text-blue-200 rounded-bl-sm' :
                                'bg-white/[0.05] text-gray-400 rounded-bl-sm'
                              }`}>
                                {m.image && <Image src={m.image} alt="" width={200} height={96} className="max-w-full rounded-lg mb-1 max-h-24 object-cover" />}
                                {m.message && <span>{m.message}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender === 'system' ? (
                        <div className="text-center w-full">
                          <span className="text-[10px] text-gray-500 bg-white/[0.04] px-3 py-1 rounded-full">{msg.message}</span>
                        </div>
                      ) : (
                        <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-gold text-white rounded-br-md'
                            : msg.sender === 'admin'
                            ? 'bg-blue-500/10 text-blue-100 border border-blue-500/20 rounded-bl-md'
                            : 'bg-white/[0.06] text-gray-300 rounded-bl-md'
                        }`}>
                          {msg.sender === 'admin' && (
                            <p className="text-[10px] text-blue-400 font-medium mb-1">{locale === 'fa' ? 'پشتیبان' : 'Support'}</p>
                          )}
                          {msg.image && (
                            <Image src={msg.image} alt="" width={250} height={160} className="max-w-full rounded-lg mb-1.5 max-h-40 object-cover cursor-pointer" onClick={() => window.open(msg.image, '_blank')} />
                          )}
                          {msg.message && <span>{msg.message}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                  {adminTyping && (
                    <div className="flex justify-start">
                      <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-2xl rounded-bl-md">
                        <p className="text-[10px] text-blue-400 font-medium mb-1">{locale === 'fa' ? 'پشتیبان' : 'Support'}</p>
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* FAQ Buttons */}
                {showFaq && chatStatus === 'bot' && (
                  <div className="px-3 pb-2 border-t border-white/[0.06] pt-2 flex-shrink-0">
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {FAQ.map((faq, i) => (
                        <button key={i} onClick={() => handleFaq(i)} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors">
                          {locale === 'fa' ? faq.q : faq.q_en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connect to Admin */}
                {!showFaq && chatStatus === 'bot' && session && (
                  <div className="px-3 pb-2 border-t border-white/[0.06] pt-2 flex-shrink-0">
                    <button onClick={requestAdmin} className="w-full btn-gold text-sm py-2.5">
                      <HiOutlineUser className="w-4 h-4" />
                      {locale === 'fa' ? 'ارتباط با پشتیبان' : 'Connect to Support'}
                    </button>
                  </div>
                )}

                {!session && chatStatus === 'bot' && !showFaq && (
                  <div className="px-3 pb-2 border-t border-white/[0.06] pt-2 flex-shrink-0">
                    <Link href="/login" onClick={() => setOpen(false)} className="w-full btn-gold text-sm py-2.5 block text-center">
                      {locale === 'fa' ? 'ابتدا وارد شوید' : 'Login first'}
                    </Link>
                  </div>
                )}

                {/* Input */}
                <div className="px-3 pb-3 pt-1 flex-shrink-0">
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => handleInputChange(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder={chatStatus === 'waiting' ? (locale === 'fa' ? 'در انتظار پشتیبان...' : 'Waiting...') : (locale === 'fa' ? 'پیام بنویسید...' : 'Type a message...')}
                      disabled={chatStatus === 'waiting'}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold/30 disabled:opacity-50 transition-colors"
                    />
                    {sessionId && chatStatus === 'active' && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 disabled:opacity-30 transition-all flex-shrink-0"
                        title={locale === 'fa' ? 'ارسال تصویر' : 'Send Image'}
                      >
                        <HiOutlinePhotograph className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || chatStatus === 'waiting'}
                      className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-white hover:bg-gold-dark disabled:opacity-30 transition-all active:scale-95 flex-shrink-0"
                    >
                      <HiOutlinePaperAirplane className="w-4 h-4 rotate-[320deg] rtl:rotate-[220deg]" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Float Button */}
      <button
        onClick={() => open ? setOpen(false) : handleOpen()}
        aria-label={locale === 'fa' ? 'پشتیبانی' : 'Support'}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-gray-800' : 'bg-gradient-to-r from-gold to-gold-light hover:shadow-gold/40 pulse-gold'
        }`}
      >
        {open ? <HiOutlineX className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <HiOutlineChatAlt2 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        {chatStatus === 'waiting' && !open && (
          <span className="absolute -top-0.5 -end-0.5 w-3 h-3 bg-yellow-400 rounded-full animate-pulse border-2 border-[#0c0c0f]" />
        )}
      </button>
    </div>
  );
}
