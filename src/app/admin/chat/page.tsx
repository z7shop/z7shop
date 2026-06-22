'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX, HiOutlinePaperAirplane, HiOutlineChatAlt2, HiOutlinePhotograph } from 'react-icons/hi';

interface ChatSession {
  id: string;
  user_name: string;
  user_email: string;
  status: 'waiting' | 'active';
  last_message: string;
  updated_at: string;
}

interface ChatMsg {
  id: string;
  sender: string;
  message: string;
  image?: string;
  created_at: string;
}

export default function AdminChatPage() {
  const { locale } = useLocale();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [userTyping, setUserTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSessions = async () => {
    const res = await fetch('/api/admin/chat');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    }
  };

  const fetchMessages = async (sid: string) => {
    const res = await fetch(`/api/chat?session_id=${sid}`);
    if (res.ok) {
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: any) => ({ ...m, image: m.image || undefined })));
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  };

  const fetchTypingStatus = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/chat/typing?session_id=${sid}`);
      if (res.ok) {
        const data = await res.json();
        setUserTyping(!!data.user_typing);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    fetchMessages(activeSession);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchMessages(activeSession);
      fetchTypingStatus(activeSession);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeSession, fetchTypingStatus]);

  useEffect(() => {
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); };
  }, []);

  const sendTypingStatus = useCallback((typing: boolean) => {
    if (!activeSession) return;
    fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: activeSession, is_typing: typing, role: 'admin' }),
    }).catch(() => {});
  }, [activeSession]);

  const handleInputChange = (val: string) => {
    setInput(val);
    if (activeSession) {
      sendTypingStatus(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 2000);
    }
  };

  const acceptChat = async (sid: string) => {
    await fetch('/api/admin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'accept', session_id: sid }),
    });
    toast.success(locale === 'fa' ? 'چت قبول شد' : 'Chat accepted');
    setActiveSession(sid);
    fetchSessions();
  };

  const closeChat = async (sid: string) => {
    await fetch('/api/admin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', session_id: sid }),
    });
    toast.success(locale === 'fa' ? 'چت بسته شد' : 'Chat closed');
    setActiveSession(null);
    setMessages([]);
    fetchSessions();
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession) return;
    sendTypingStatus(false);
    await fetch('/api/admin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_message', session_id: activeSession, message: input.trim() }),
    });
    setInput('');
    fetchMessages(activeSession);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSession) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(locale === 'fa' ? 'حداکثر حجم تصویر ۲ مگابایت' : 'Max image size is 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await fetch('/api/upload/chat-image', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.url) {
        await fetch('/api/admin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_message', session_id: activeSession, message: '', image: uploadData.url }),
        });
        fetchMessages(activeSession);
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const waitingCount = sessions.filter(s => s.status === 'waiting').length;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{locale === 'fa' ? 'چت آنلاین' : 'Live Chat'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Sessions List */}
        <div className="card overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <h2 className="font-bold text-sm">{locale === 'fa' ? 'گفتگوها' : 'Conversations'}</h2>
            {waitingCount > 0 && (
              <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                {waitingCount} {locale === 'fa' ? 'در انتظار' : 'waiting'}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <HiOutlineChatAlt2 className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                {locale === 'fa' ? 'گفتگویی وجود ندارد' : 'No conversations'}
              </div>
            ) : sessions.map(s => (
              <div
                key={s.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${activeSession === s.id ? 'bg-gold/5 border-s-2 border-s-gold' : ''}`}
                onClick={() => { if (s.status === 'active') { setActiveSession(s.id); } }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{s.user_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.status === 'waiting' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                    {s.status === 'waiting' ? (locale === 'fa' ? 'در انتظار' : 'Waiting') : (locale === 'fa' ? 'فعال' : 'Active')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.last_message || s.user_email}</p>
                {s.status === 'waiting' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); acceptChat(s.id); }}
                    className="mt-2 w-full btn-gold text-xs py-1.5"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                    {locale === 'fa' ? 'قبول کردن' : 'Accept'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col">
          {!activeSession ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <HiOutlineChatAlt2 className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                <p className="text-sm">{locale === 'fa' ? 'یک گفتگو انتخاب کنید' : 'Select a conversation'}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="font-bold text-sm">{sessions.find(s => s.id === activeSession)?.user_name}</p>
                  <p className="text-xs text-gray-500">{sessions.find(s => s.id === activeSession)?.user_email}</p>
                </div>
                <button onClick={() => closeChat(activeSession)} className="btn-danger text-xs py-1.5 px-3">
                  <HiOutlineX className="w-3.5 h-3.5" />
                  {locale === 'fa' ? 'بستن چت' : 'Close'}
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {msg.sender === 'system' ? (
                      <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{msg.message}</span>
                    ) : (
                      <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'admin'
                          ? 'bg-gold text-white rounded-br-md'
                          : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
                      }`}>
                        {msg.image && (
                          <img src={msg.image} alt="" className="max-w-full rounded-lg mb-1.5 max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.image, '_blank')} />
                        )}
                        {msg.message && <span>{msg.message}</span>}
                      </div>
                    )}
                  </div>
                ))}
                {userTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 px-3.5 py-2.5 rounded-2xl rounded-bl-md">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={locale === 'fa' ? 'پیام بنویسید...' : 'Type a message...'}
                    className="input-field text-sm"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn-secondary px-3 disabled:opacity-30"
                    title={locale === 'fa' ? 'ارسال تصویر' : 'Send Image'}
                  >
                    <HiOutlinePhotograph className="w-4 h-4" />
                  </button>
                  <button onClick={sendMessage} disabled={!input.trim()} className="btn-gold px-4 disabled:opacity-30">
                    <HiOutlinePaperAirplane className="w-4 h-4 rotate-[320deg] rtl:rotate-[220deg]" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
