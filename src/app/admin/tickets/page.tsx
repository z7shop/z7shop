'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useLocale } from '@/hooks/useLocale';
import type { Ticket, TicketMessage } from '@/types';
import toast from 'react-hot-toast';
import { HiOutlineChatAlt2, HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlinePaperAirplane, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';

export default function AdminTicketsPage() {
  const { locale } = useLocale();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketDetail, setTicketDetail] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const ArrowIcon = locale === 'fa' ? HiOutlineChevronLeft : HiOutlineChevronRight;

  useEffect(() => { fetchTickets(); }, []);

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

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSending(true);
    const res = await fetch(`/api/tickets/${selectedTicket}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage }),
    });
    if (res.ok) {
      setNewMessage('');
      toast.success(locale === 'fa' ? 'پاسخ ارسال شد' : 'Reply sent');
      await openTicket(selectedTicket);
      fetchTickets();
    }
    setSending(false);
  };

  const closeTicket = async (id: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' }),
    });
    toast.success(locale === 'fa' ? 'تیکت بسته شد' : 'Ticket closed');
    fetchTickets();
    if (selectedTicket === id) {
      setSelectedTicket(null);
      setTicketDetail(null);
    }
  };

  const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
    open: { label: locale === 'fa' ? 'باز' : 'Open', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: HiOutlineExclamationCircle },
    answered: { label: locale === 'fa' ? 'پاسخ داده شده' : 'Answered', cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: HiOutlineCheckCircle },
    closed: { label: locale === 'fa' ? 'بسته شده' : 'Closed', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: HiOutlineClock },
  };

  const departmentLabel: Record<string, string> = {
    support: locale === 'fa' ? 'پشتیبانی' : 'Support',
    sales: locale === 'fa' ? 'فروش' : 'Sales',
    technical: locale === 'fa' ? 'فنی' : 'Technical',
    financial: locale === 'fa' ? 'مالی' : 'Financial',
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{locale === 'fa' ? 'مدیریت تیکت‌ها' : 'Manage Tickets'}</h1>
            <p className="text-sm text-gray-500 mt-1">{locale === 'fa' ? `${tickets.length} تیکت` : `${tickets.length} tickets`}</p>
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'answered', 'closed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === f ? 'border-gold text-gold bg-gold/10' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {f === 'all' ? (locale === 'fa' ? 'همه' : 'All') : statusConfig[f]?.label}
              </button>
            ))}
          </div>
        </div>

        {selectedTicket && ticketDetail ? (
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700/40">
              <div className="flex items-center gap-3">
                <button onClick={() => { setSelectedTicket(null); setTicketDetail(null); }} className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors">
                  <ArrowIcon className="w-5 h-5 rotate-180" />
                </button>
                <div>
                  <h2 className="font-bold">{ticketDetail.subject}</h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{(ticketDetail as any).user_name || ''}</span>
                    <span>·</span>
                    <span>{departmentLabel[ticketDetail.department]}</span>
                    <span>·</span>
                    <span>{new Date(ticketDetail.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(() => { const s = statusConfig[ticketDetail.status]; return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${s.cls}`}>
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

            <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${msg.is_admin ? 'bg-gold/10 border border-gold/20 rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs font-bold ${msg.is_admin ? 'text-gold' : ''}`}>
                        {msg.is_admin ? (locale === 'fa' ? 'ادمین' : 'Admin') : (msg.user_name || '')}
                      </span>
                      <span className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {ticketDetail.status !== 'closed' && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700/40">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply()}
                    placeholder={locale === 'fa' ? 'پاسخ خود را بنویسید...' : 'Type your reply...'}
                    className="input-field flex-1"
                    aria-label={locale === 'fa' ? 'پاسخ تیکت' : 'Ticket reply'}
                  />
                  <button onClick={sendReply} disabled={sending || !newMessage.trim()} className="btn-gold px-5 disabled:opacity-50">
                    <HiOutlinePaperAirplane className="w-5 h-5 rtl:-scale-x-100" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700/40 text-gray-500 text-xs">
                  <th className="text-start p-4 font-medium">{locale === 'fa' ? 'کاربر' : 'User'}</th>
                  <th className="text-start p-4 font-medium">{locale === 'fa' ? 'موضوع' : 'Subject'}</th>
                  <th className="text-start p-4 font-medium hidden md:table-cell">{locale === 'fa' ? 'بخش' : 'Dept'}</th>
                  <th className="text-start p-4 font-medium">{locale === 'fa' ? 'وضعیت' : 'Status'}</th>
                  <th className="text-start p-4 font-medium hidden md:table-cell">{locale === 'fa' ? 'تاریخ' : 'Date'}</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-gray-500">
                    <HiOutlineChatAlt2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    {locale === 'fa' ? 'تیکتی وجود ندارد' : 'No tickets'}
                  </td></tr>
                ) : filtered.map(ticket => {
                  const s = statusConfig[ticket.status] || statusConfig.open;
                  return (
                    <tr key={ticket.id} onClick={() => openTicket(ticket.id)} className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer transition-colors">
                      <td className="p-4 font-medium">{(ticket as any).user_name || '—'}</td>
                      <td className="p-4 truncate max-w-[200px]">{ticket.subject}</td>
                      <td className="p-4 hidden md:table-cell text-gray-500">{departmentLabel[ticket.department]}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${s.cls}`}>
                          <s.icon className="w-3 h-3" />{s.label}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</td>
                      <td className="p-4">
                        <span className="text-xs text-gray-500">{ticket.message_count} {locale === 'fa' ? 'پیام' : 'msg'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
