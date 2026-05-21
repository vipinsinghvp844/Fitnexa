'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = opts.duration ?? 4000;
    setToasts((prev) => [...prev, { ...opts, id }]);
    const timer = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, timer);
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: 'error',   title, message, duration: 6000 }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: 'info',    title, message }), [toast]);

  // Cleanup on unmount
  useEffect(() => {
    const t = timers.current;
    return () => { t.forEach((timer) => clearTimeout(timer)); };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
};

// ─── Styles per type ──────────────────────────────────────────────────────────
const styles: Record<ToastType, { wrapper: string; icon: string; progress: string }> = {
  success: {
    wrapper: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800',
    icon:    'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
    progress:'bg-emerald-500',
  },
  error: {
    wrapper: 'bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:border-rose-800',
    icon:    'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40',
    progress:'bg-rose-500',
  },
  warning: {
    wrapper: 'bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-800',
    icon:    'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
    progress:'bg-amber-500',
  },
  info: {
    wrapper: 'bg-sky-50 border-sky-200 dark:bg-sky-950/60 dark:border-sky-800',
    icon:    'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/40',
    progress:'bg-sky-500',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const duration = t.duration ?? (t.type === 'error' ? 6000 : 4000);

  // Slide-in on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const s = styles[t.type];

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-2xl border p-4 shadow-xl transition-all duration-300
        ${s.wrapper}
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Icon */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${s.icon}`}>
        {icons[t.type]}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[color:var(--app-text)]">{t.title}</p>
        {t.message && (
          <p className="mt-0.5 text-xs text-[color:var(--app-muted)] leading-relaxed">{t.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded-lg p-1 text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] hover:bg-black/5 dark:hover:bg-white/10 transition"
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
        </svg>
      </button>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-[3px] ${s.progress} rounded-b-2xl animate-toast-progress`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}

// ─── Toaster (render this once in layout) ────────────────────────────────────
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 sm:bottom-6 sm:right-6"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
