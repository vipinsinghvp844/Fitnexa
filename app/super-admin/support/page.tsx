'use client';

import { useEffect, useState, useRef } from 'react';
import {
  SupportTicket,
  getSuperAdminTickets,
  getSuperAdminTicket,
  replySuperAdminTicket,
  updateSuperAdminTicketStatus,
  uploadSupportAttachment,
  Attachment,
} from '@/lib/support';

export default function SuperAdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Media attachments state
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [uploadingReplyFile, setUploadingReplyFile] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setUploadingReplyFile(true);
      const attachment = await uploadSupportAttachment('super-admin', file);
      setReplyAttachments((prev) => [...prev, attachment]);
    } catch (err: any) {
      alert(err.message || 'File upload failed');
    } finally {
      setUploadingReplyFile(false);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await getSuperAdminTickets(params);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: SupportTicket) => {
    try {
      setTicketLoading(true);
      const res = await getSuperAdminTicket(ticket.id);
      setSelectedTicket(res.data);
      setReplyStatus(res.data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyMessage.trim() && replyAttachments.length === 0)) return;

    try {
      setReplySubmitting(true);
      const statusToSet = replyStatus || 'in_progress';
      const res = await replySuperAdminTicket(selectedTicket.id, replyMessage, statusToSet, replyAttachments);
      
      const updatedReplies = [...(selectedTicket.replies || []), res.data];
      const updatedTicket = { 
        ...selectedTicket, 
        replies: updatedReplies,
        status: statusToSet as any
      };
      
      setSelectedTicket(updatedTicket as SupportTicket);
      setReplyMessage('');
      setReplyAttachments([]);

      // Refresh list to show updated status/details
      fetchTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDirectStatusChange = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await updateSuperAdminTicketStatus(selectedTicket.id, status);
      setSelectedTicket({ ...selectedTicket, status: status as any });
      setReplyStatus(status);
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadge = (prio: string) => {
    const styles = {
      low: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800/40',
      high: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-100 dark:border-rose-800/40',
    };
    return (
      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium border ${styles[prio as keyof typeof styles] || styles.medium}`}>
        {prio.charAt(0).toUpperCase() + prio.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/40',
      in_progress: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-100 dark:border-amber-800/40',
      resolved: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-100 dark:border-sky-800/40',
      closed: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    };
    return (
      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.open}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[color:var(--app-text)]">Platform Support Inbox</h1>
          <p className="mt-1 text-sm text-[color:var(--app-muted)]">
            Manage, reply, and resolve help tickets raised by Gym Administrators.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--app-border)] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Statuses', value: '' },
              { label: 'Open', value: 'open' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Resolved', value: 'resolved' },
              { label: 'Closed', value: 'closed' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                  statusFilter === tab.value
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/15'
                    : 'text-[color:var(--app-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-2 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[600px]">
          {/* Ticket List Panel */}
          <div className={`lg:col-span-5 flex flex-col rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-[color:var(--app-border)]">
              <h2 className="text-base font-semibold text-[color:var(--app-text)]">Admin Inbox</h2>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] p-2 space-y-2">
              {loading ? (
                <div className="flex h-40 items-center justify-center text-sm text-[color:var(--app-muted)]">
                  Loading tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center p-4">
                  <p className="text-sm font-medium text-[color:var(--app-text)]">No support tickets found</p>
                  <p className="text-xs text-[color:var(--app-muted)] mt-1">
                    No tickets match the selected filters.
                  </p>
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className={`w-full text-left p-4.5 rounded-2xl border transition ${
                      selectedTicket?.id === t.id
                        ? 'border-sky-500 bg-sky-500/5 dark:bg-sky-500/10'
                        : 'border-[color:var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 bg-[color:var(--app-surface)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[color:var(--app-text)] truncate">{t.subject}</p>
                        <p className="text-xs font-medium text-sky-600 dark:text-sky-400 mt-0.5 truncate">
                          {t.tenant?.name || 'Platform Gym'}
                        </p>
                      </div>
                      {getPriorityBadge(t.priority)}
                    </div>
                    <p className="text-xs text-[color:var(--app-muted)] mt-2 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between gap-2 mt-4">
                      <span className="text-[10px] text-[color:var(--app-muted)]">
                        Ticket #{t.id} • By {t.user?.name}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ticket Detail Panel */}
          <div className={`lg:col-span-7 flex flex-col rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] overflow-hidden ${!selectedTicket ? 'hidden lg:flex items-center justify-center p-8' : 'flex'}`}>
            {selectedTicket ? (
              <div className="flex flex-col h-full min-h-[600px]">
                {/* Detail Header */}
                <div className="p-4 border-b border-[color:var(--app-border)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-2 -ml-1 text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] lg:hidden"
                    >
                      ← Back
                    </button>
                    <div>
                      <h3 className="text-base font-bold text-[color:var(--app-text)]">
                        {selectedTicket.subject}
                      </h3>
                      <p className="text-xs text-[color:var(--app-muted)] mt-0.5">
                        Gym: <span className="font-semibold text-sky-600 dark:text-sky-400">{selectedTicket.tenant?.name}</span> • By {selectedTicket.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleDirectStatusChange(e.target.value)}
                      className="rounded-lg border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-2.5 py-1 text-xs font-semibold focus:border-sky-500 focus:outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>

                {/* Messages Roster */}
                <div className="flex-1 overflow-y-auto max-h-[450px] p-6 space-y-6">
                  {/* Initial issue by Gym Admin */}
                  <div className="flex items-start gap-3 bg-[color:var(--app-surface)] border border-[color:var(--app-border)] p-4 rounded-2xl max-w-[85%]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white text-sm font-semibold">
                      {selectedTicket.user?.name?.charAt(0) || 'G'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[color:var(--app-text)]">
                          {selectedTicket.user?.name}
                        </span>
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Gym Admin</span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--app-text)] whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                      <AttachmentList attachments={selectedTicket.attachments} />
                    </div>
                  </div>

                  {/* Replies timeline */}
                  {selectedTicket.replies?.map((r) => {
                    const isAdmin = r.user?.role === 'Super Admin';
                    return (
                      <div
                        key={r.id}
                        className={`flex items-start gap-3 max-w-[85%] ${
                          isAdmin ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-semibold ${
                            isAdmin ? 'bg-amber-500' : 'bg-sky-500'
                          }`}
                        >
                          {r.user?.name?.charAt(0) || 'U'}
                        </span>
                        <div
                          className={`p-4 rounded-2xl border ${
                            isAdmin
                              ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30'
                              : 'bg-[color:var(--app-surface)] border-[color:var(--app-border)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[color:var(--app-text)]">
                              {r.user?.name}
                            </span>
                            <span
                              className={`text-[10px] font-medium ${
                                isAdmin
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-sky-600 dark:text-sky-400'
                              }`}
                            >
                              {isAdmin ? 'Platform Support' : 'Gym Admin'}
                            </span>
                            <span className="text-[10px] text-[color:var(--app-muted)] ml-auto">
                              {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[color:var(--app-text)] whitespace-pre-wrap">
                            {r.message}
                          </p>
                          <AttachmentList attachments={r.attachments} />
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Form */}
                <div className="p-4 border-t border-[color:var(--app-border)] bg-[color:var(--app-surface)] space-y-3">
                  {replyAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {replyAttachments.map((att, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[color:var(--app-border)] px-2 py-1 text-xs text-[color:var(--app-text)]">
                          <span className="truncate max-w-[120px]">{att.name}</span>
                          <button type="button" onClick={() => setReplyAttachments((prev) => prev.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-600 font-bold ml-1">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={handleSendReply}
                    className="space-y-3"
                  >
                    <div className="flex gap-3 items-end">
                      <label className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] cursor-pointer transition">
                        <span className="text-lg">📎</span>
                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleUpload(e.target.files[0]);
                            }
                          }}
                          disabled={uploadingReplyFile}
                          className="hidden"
                        />
                      </label>
                      <textarea
                        rows={2}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder={uploadingReplyFile ? "Uploading file..." : "Write a support response to the gym administrator..."}
                        disabled={uploadingReplyFile}
                        className="flex-1 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[color:var(--app-muted)]">Set Status:</span>
                        <select
                          value={replyStatus}
                          onChange={(e) => setReplyStatus(e.target.value)}
                          className="rounded-lg border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none"
                        >
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={replySubmitting || (!replyMessage.trim() && replyAttachments.length === 0) || uploadingReplyFile}
                        className="inline-flex h-10 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-500/10 transition hover:bg-sky-600 disabled:opacity-50"
                      >
                        {replySubmitting ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[color:var(--app-muted)] text-xl font-bold">
                  !
                </span>
                <h4 className="mt-4 text-base font-semibold text-[color:var(--app-text)]">No Ticket Selected</h4>
                <p className="mt-1 text-sm text-[color:var(--app-muted)] max-w-sm">
                  Select a support ticket from the inbox on the left to see conversation history, send replies, or change its status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

function AttachmentList({ attachments }: { attachments?: Attachment[] | null }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {attachments.map((att, idx) => {
        const isImage = att.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.url);
        const isVideo = att.type?.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(att.url);
        const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${att.url.replace(/^\//, '')}`;

        if (isImage) {
          return (
            <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className="relative group block overflow-hidden rounded-xl border border-[color:var(--app-border)] bg-black/5 max-w-[200px]">
              <img src={fileUrl} alt={att.name} className="h-28 w-auto object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] text-white font-medium">
                View Image
              </div>
            </a>
          );
        }

        if (isVideo) {
          return (
            <div key={idx} className="overflow-hidden rounded-xl border border-[color:var(--app-border)] bg-black/5 max-w-[280px]">
              <video src={fileUrl} controls className="h-28 w-auto max-w-full" />
            </div>
          );
        }

        return (
          <a key={idx} href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] px-3 py-2 text-xs font-semibold text-[color:var(--app-text)] hover:bg-black/5 dark:hover:bg-white/5 transition max-w-[240px]">
            <span className="text-base">📎</span>
            <span className="truncate flex-1">{att.name}</span>
          </a>
        );
      })}
    </div>
  );
}
