'use client';
import { useState } from 'react';

export function SettingField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[color:var(--app-text)]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[color:var(--app-muted)]">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm text-[color:var(--app-text)] outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50 ${className}`}
    />
  );
}

export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-2.5 text-sm text-[color:var(--app-text)] outline-none transition focus:border-indigo-500 ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm text-[color:var(--app-text)] outline-none transition focus:border-indigo-500 resize-none ${className}`}
    />
  );
}

export function SecretInput({ value, onChange, placeholder, disabled }: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 pr-10 text-sm text-[color:var(--app-text)] outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--app-muted)] hover:text-[color:var(--app-text)] transition"
      >
        {show ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
        )}
      </button>
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string;
}) {
  return (
    <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl border border-[color:var(--app-border)] hover:bg-slate-50 dark:hover:bg-slate-900/30 transition">
      <div className="relative mt-0.5">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </div>
      <div>
        <div className="text-sm font-semibold text-[color:var(--app-text)]">{label}</div>
        {hint && <div className="text-xs text-[color:var(--app-muted)] mt-0.5">{hint}</div>}
      </div>
    </label>
  );
}

export function SectionCard({ title, description, icon, children }: {
  title: string; description?: string; icon: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[color:var(--app-border)] bg-slate-50/50 dark:bg-slate-900/20">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-bold text-sm text-[color:var(--app-text)]">{title}</div>
          {description && <div className="text-xs text-[color:var(--app-muted)]">{description}</div>}
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

export function SaveBar({ saving, onSave, dirty }: { saving: boolean; onSave: () => void; dirty?: boolean }) {
  return (
    <div className="flex justify-end pt-4">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 transition"
      >
        {saving ? (
          <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" /> Saving...</>
        ) : (
          <>{dirty && <span className="h-2 w-2 rounded-full bg-amber-300" />} Save Changes</>
        )}
      </button>
    </div>
  );
}
