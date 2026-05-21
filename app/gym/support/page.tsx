'use client';

import { useEffect, useState, useRef } from 'react';
import {
  SupportTicket,
  getGymTickets,
  createGymTicket,
  getGymTicket,
  replyGymTicket,
  uploadSupportAttachment,
  Attachment,
} from '@/lib/support';
import { useToast } from '@/components/admin/toast';

export default function GymSupportPage() {
  const { error: toastError } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // New ticket modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Media attachments state
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]);
  const [uploadingReplyFile, setUploadingReplyFile] = useState(false);
  const [ticketAttachments, setTicketAttachments] = useState<Attachment[]>([]);
  const [uploadingTicketFile, setUploadingTicketFile] = useState(false);

  const handleUpload = async (file: File, target: 'ticket' | 'reply') => {
    try {
      if (target === 'ticket') {
        setUploadingTicketFile(true);
      } else {
        setUploadingReplyFile(true);
      }
      const attachment = await uploadSupportAttachment('gym', file);
      if (target === 'ticket') {
        setTicketAttachments((prev) => [...prev, attachment]);
      } else {
        setReplyAttachments((prev) => [...prev, attachment]);
      }
    } catch (err: any) {
      toastError('Upload Failed', err.message || 'File upload failed');
    } finally {
      if (target === 'ticket') {
        setUploadingTicketFile(false);
      } else {
        setUploadingReplyFile(false);
      }
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.replies]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getGymTickets();
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
      const res = await getGymTicket(ticket.id);
      setSelectedTicket(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setModalSubmitting(true);
      setError('');
      const res = await createGymTicket({ subject, description, priority, attachments: ticketAttachments });
      setTickets([res.data, ...tickets]);
      setSelectedTicket(res.data);
      setModalOpen(false);
      setSubject('');
      setDescription('');
      setPriority('medium');
      setTicketAttachments([]);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyMessage.trim() && replyAttachments.length === 0)) return;

    try {
      setReplySubmitting(true);
      const res = await replyGymTicket(selectedTicket.id, replyMessage, replyAttachments);
      
      // Update replies locally
      const updatedReplies = [...(selectedTicket.replies || []), res.data];
      const updatedTicket = { 
        ...selectedTicket, 
        replies: updatedReplies,
        status: (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') ? 'open' : selectedTicket.status
      };
      
      setSelectedTicket(updatedTicket as SupportTicket);
      setReplyMessage('');
      setReplyAttachments([]);

      // Refresh list to update statuses/last updated
      const resList = await getGymTickets();
      setTickets(resList.data);
    } catch (err) {
      console.error(err);
    } finally {
      setReplySubmitting(false);
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
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[color:var(--app-text)]">Support Center</h1>
            <p className="mt-1 text-sm text-[color:var(--app-muted)]">
              Encountered any problems? Submit a ticket and communicate with our customer helpdesk.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-600 hover:shadow-sky-600/30"
          >
            Create Support Ticket
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 min-h-[600px]">
          {/* Ticket List Panel */}
          <div className={`lg:col-span-5 flex flex-col rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-4 border-b border-[color:var(--app-border)]">
              <h2 className="text-base font-semibold text-[color:var(--app-text)]">Your Tickets</h2>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] p-2 space-y-2">
              {loading ? (
                <div className="flex h-40 items-center justify-center text-sm text-[color:var(--app-muted)]">
                  Loading tickets...
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center p-4">
                  <p className="text-sm font-medium text-[color:var(--app-text)]">No support tickets yet</p>
                  <p className="text-xs text-[color:var(--app-muted)] mt-1">If you have any questions or bugs, feel free to raise one.</p>
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
                      <p className="font-semibold text-sm text-[color:var(--app-text)] truncate">{t.subject}</p>
                      {getPriorityBadge(t.priority)}
                    </div>
                    <p className="text-xs text-[color:var(--app-muted)] mt-2 line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between gap-2 mt-4">
                      <span className="text-[10px] text-[color:var(--app-muted)]">
                        Ticket #{t.id} • {new Date(t.created_at).toLocaleDateString()}
                      </span>
                      {getStatusBadge(t.status)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Ticket Conversation Detail Panel */}
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
                        Ticket #{selectedTicket.id} • Created on {new Date(selectedTicket.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                {/* Messages Roster */}
                <div className="flex-1 overflow-y-auto max-h-[450px] p-6 space-y-6">
                  {/* Gym Admin Initial Issue */}
                  <div className="flex items-start gap-3 bg-[color:var(--app-surface)] border border-[color:var(--app-border)] p-4 rounded-2xl max-w-[85%]">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white text-sm font-semibold">
                      {selectedTicket.user?.name?.charAt(0) || 'G'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[color:var(--app-text)]">
                          {selectedTicket.user?.name || 'Gym Admin'}
                        </span>
                        <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">Owner</span>
                      </div>
                      <p className="mt-2 text-sm text-[color:var(--app-text)] whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                      <AttachmentList attachments={selectedTicket.attachments} />
                    </div>
                  </div>

                  {/* Reply Thread */}
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

                {/* Reply Footer Input */}
                <div className="p-4 border-t border-[color:var(--app-border)] bg-[color:var(--app-surface)] flex flex-col gap-3">
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
                    className="flex gap-3 items-end"
                  >
                    <label className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] cursor-pointer transition">
                      <span className="text-lg">📎</span>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleUpload(e.target.files[0], 'reply');
                          }
                        }}
                        disabled={selectedTicket.status === 'closed' || uploadingReplyFile}
                        className="hidden"
                      />
                    </label>
                    <textarea
                      rows={2}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder={uploadingReplyFile ? "Uploading file..." : "Write a message response..."}
                      disabled={selectedTicket.status === 'closed' || uploadingReplyFile}
                      className="flex-1 rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:border-sky-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={replySubmitting || (!replyMessage.trim() && replyAttachments.length === 0) || selectedTicket.status === 'closed' || uploadingReplyFile}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-md shadow-sky-500/10 transition hover:bg-sky-600 disabled:opacity-50"
                    >
                      {replySubmitting ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[color:var(--app-muted)] text-xl font-bold">
                  ?
                </span>
                <h4 className="mt-4 text-base font-semibold text-[color:var(--app-text)]">No Ticket Selected</h4>
                <p className="mt-1 text-sm text-[color:var(--app-muted)] max-w-sm">
                  Select a support ticket from the list to view the replies history and communicate with the admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[color:var(--app-border)] pb-4">
              <h3 className="text-lg font-bold text-[color:var(--app-text)]">Create Support Ticket</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-500">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[color:var(--app-muted)] uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summarize the issue or question..."
                  required
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[color:var(--app-muted)] uppercase tracking-wider">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-4 py-3 text-sm text-[color:var(--app-text)] focus:border-sky-500 focus:outline-none"
                >
                  <option value="low">Low - General query</option>
                  <option value="medium">Medium - Functional bug</option>
                  <option value="high">High - Production blocker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[color:var(--app-muted)] uppercase tracking-wider">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain your problem, including any steps to reproduce or helpful details..."
                  required
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-bg)] px-4 py-3 text-sm text-[color:var(--app-text)] placeholder-[color:var(--app-muted)] focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[color:var(--app-muted)] uppercase tracking-wider">
                  Attachments (Images/Videos/Logs)
                </label>
                <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                  {ticketAttachments.map((att, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[color:var(--app-border)] px-2 py-1 text-xs text-[color:var(--app-text)]">
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <button type="button" onClick={() => setTicketAttachments((prev) => prev.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-600 font-bold ml-1">×</button>
                    </div>
                  ))}
                  <label className="inline-flex h-9 items-center justify-center rounded-xl border border-dashed border-[color:var(--app-border)] px-4 text-xs font-semibold text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] cursor-pointer transition">
                    {uploadingTicketFile ? 'Uploading...' : '+ Attach File'}
                    <input
                      type="file"
                      disabled={uploadingTicketFile}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleUpload(e.target.files[0], 'ticket');
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--app-border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--app-border)] px-5 text-sm font-semibold text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
                >
                  {modalSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
