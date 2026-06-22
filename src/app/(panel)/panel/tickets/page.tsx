'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PanelLayout from '@/components/layout/PanelLayout';
import { useLocale } from '@/hooks/useLocale';
import type { Ticket, TicketMessage } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineChatAlt2, HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlinePaperAirplane, HiOutlineX, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [ticketDetail, setTicketDetail] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: '', department: 'support', priority: 'normal', message: '' });

  const ArrowIcon = locale === 'fa' ? HiOutlineChevronLeft : HiOutlineChevronRight;

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch('/api/tickets');
    if (res.ok) setTickets(await res.json());
    setLoading(false);
  };

  const openTicket = async (id: string) => {
    setSelectedTicket(id);
    const res = await fetch(`/api/tickets/${id}`);
    if (res.ok) {
      const data = await res.json();
      setTicketDetail(data.ticket);
      setMessages(data.messages);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    const res = await fetch(`/api/tickets/${selectedTicket}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage }),
    });
    if (res.ok) {
      setNewMessage('');
      await openTicket(selectedTicket);
      fetchTickets();
    }
    setSending(false);
  };

  const createTicket = async () => {
    if (!form.subject || !form.message) {
      toast.error(locale === 'fa' ? 'موضوع و پیام الزامی است' : 'Subject and message are required');
      return;
    }
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success(locale === 'fa' ? 'تیکت با موفقیت ارسال شد' : 'Ticket submitted successfully');
      setShowNew(false);
      setForm({ subject: '', department: 'support', priority: 'normal', message: '' });
      fetchTickets();
      openTicket(data.id);
    }
  };

  const closeTicket = async (id: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    fetchTickets();
    if (selectedTicket === id) {
      setSelectedTicket(null);
      setTicketDetail(null);
    }
  };

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    open: {
      label: locale === 'fa' ? 'باز' : 'Open',
      class: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: HiOutlineExclamationCircle,
    },
    answered: {
      label: locale === 'fa' ? 'پاسخ داده شده' : 'Answered',
      class: 'bg-green-500/10 text-green-400 border-green-500/20',
      icon: HiOutlineCheckCircle,
    },
    closed: {
      label: locale === 'fa' ? 'بسته شده' : 'Closed',
      class: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      icon: HiOutlineClock,
    },
  };

  const priorityLabel: Record<string, string> = {
    low: locale === 'fa' ? 'کم' : 'Low',
    normal: locale === 'fa' ? 'معمولی' : 'Normal',
    high: locale === 'fa' ? 'فوری' : 'High',
  };

  const departmentLabel: Record<string, string> = {
    support: locale === 'fa' ? 'پشتیبانی' : 'Support',
    sales: locale === 'fa' ? 'فروش' : 'Sales',
    technical: locale === 'fa' ? 'فنی' : 'Technical',
    financial: locale === 'fa' ? 'مالی' : 'Financial',
  };

  if (status === 'loading' || loading) {
    return (
      <PanelLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{locale === 'fa' ? 'تیکت‌های پشتیبانی' : 'Support Tickets'}</h1>
            <p className="text-sm text-gray-500 mt-1">{locale === 'fa' ? 'سوالات و درخواست‌های خود را مطرح کنید' : 'Ask your questions and submit requests'}</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-gold">
            <HiOutlinePlus className="w-5 h-5" />
            {locale === 'fa' ? 'تیکت جدید' : 'New Ticket'}
          </button>
        </div>

        {/* Ticket Detail View */}
        {selectedTicket && ticketDetail ? (
          <div className="card p-0 overflow-hidden">
            {/* Ticket Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedTicket(null); setTicketDetail(null); }} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors">
                  <ArrowIcon className="w-5 h-5 rotate-180" />
                </button>
                <div>
                  <h2 className="font-bold">{ticketDetail.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{departmentLabel[ticketDetail.department]}</span>
                    <span>·</span>
                    <span>{priorityLabel[ticketDetail.priority]}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => { const s = statusConfig[ticketDetail.status]; return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${s.class}`}>
                    <s.icon className="w-3.5 h-3.5" />{s.label}
                  </span>
                ); })()}
                {ticketDetail.status !== 'closed' && (
                  <button onClick={() => closeTicket(ticketDetail.id)} className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                    {locale === 'fa' ? 'بستن تیکت' : 'Close'}
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                    msg.is_admin
                      ? 'bg-gold/10 border border-gold/20 rounded-tl-sm'
                      : 'bg-gray-100 dark:bg-gray-800 rounded-tr-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold ${msg.is_admin ? 'text-gold' : ''}`}>
                        {msg.is_admin ? (locale === 'fa' ? 'پشتیبانی' : 'Support') : (msg.user_name || '')}
                      </span>
                      <span className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            {ticketDetail.status !== 'closed' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700/40">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder={locale === 'fa' ? 'پیام خود را بنویسید...' : 'Type your message...'}
                    className="input-field flex-1"
                  />
                  <button onClick={sendMessage} disabled={sending || !newMessage.trim()} className="btn-gold px-5 disabled:opacity-50">
                    <HiOutlinePaperAirplane className="w-5 h-5 rtl:-scale-x-100" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Ticket List */
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <div className="card p-12 text-center">
                <HiOutlineChatAlt2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">{locale === 'fa' ? 'هنوز تیکتی ارسال نشده است' : 'No tickets yet'}</p>
                <button onClick={() => setShowNew(true)} className="btn-gold mt-4">
                  <HiOutlinePlus className="w-5 h-5" />
                  {locale === 'fa' ? 'اولین تیکت خود را ارسال کنید' : 'Submit your first ticket'}
                </button>
              </div>
            ) : (
              tickets.map((ticket) => {
                const s = statusConfig[ticket.status] || statusConfig.open;
                return (
                  <button key={ticket.id} onClick={() => openTicket(ticket.id)} className="card w-full text-start p-5 hover:border-gold/30 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold truncate group-hover:text-gold transition-colors">{ticket.subject}</h3>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${s.class}`}>
                            <s.icon className="w-3 h-3" />{s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{departmentLabel[ticket.department]}</span>
                          <span>·</span>
                          <span>{new Date(ticket.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                          <span>·</span>
                          <span>{ticket.message_count} {locale === 'fa' ? 'پیام' : 'messages'}</span>
                        </div>
                      </div>
                      <ArrowIcon className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors flex-shrink-0" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* New Ticket Modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700/50 animate-fade-in">
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700/40">
                <h2 className="text-lg font-bold">{locale === 'fa' ? 'تیکت جدید' : 'New Ticket'}</h2>
                <button onClick={() => setShowNew(false)} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{locale === 'fa' ? 'موضوع' : 'Subject'}</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder={locale === 'fa' ? 'موضوع تیکت...' : 'Ticket subject...'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{locale === 'fa' ? 'بخش' : 'Department'}</label>
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field">
                      <option value="support">{locale === 'fa' ? 'پشتیبانی' : 'Support'}</option>
                      <option value="sales">{locale === 'fa' ? 'فروش' : 'Sales'}</option>
                      <option value="technical">{locale === 'fa' ? 'فنی' : 'Technical'}</option>
                      <option value="financial">{locale === 'fa' ? 'مالی' : 'Financial'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{locale === 'fa' ? 'اولویت' : 'Priority'}</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="input-field">
                      <option value="low">{locale === 'fa' ? 'کم' : 'Low'}</option>
                      <option value="normal">{locale === 'fa' ? 'معمولی' : 'Normal'}</option>
                      <option value="high">{locale === 'fa' ? 'فوری' : 'High'}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{locale === 'fa' ? 'پیام' : 'Message'}</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="input-field resize-none" placeholder={locale === 'fa' ? 'پیام خود را بنویسید...' : 'Write your message...'} />
                </div>
              </div>
              <div className="p-5 border-t border-gray-200 dark:border-gray-700/40 flex justify-end gap-3">
                <button onClick={() => setShowNew(false)} className="btn-ghost">{locale === 'fa' ? 'انصراف' : 'Cancel'}</button>
                <button onClick={createTicket} className="btn-gold">
                  <HiOutlinePaperAirplane className="w-5 h-5 rtl:-scale-x-100" />
                  {locale === 'fa' ? 'ارسال تیکت' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
