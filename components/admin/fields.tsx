import { ReactNode } from 'react';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[color:var(--app-text)]">{label}</span>
      {hint ? <span className="mt-1 block text-xs text-[color:var(--app-muted)]">{hint}</span> : null}
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-500">{error}</p> : null}
    </label>
  );
}

const baseInputClassName =
  'w-full rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm text-[color:var(--app-text)] outline-none transition placeholder:text-[color:var(--app-muted)] focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInputClassName} ${props.className ?? ''}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${baseInputClassName} ${props.className ?? ''}`} />;
}

export function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${baseInputClassName} min-h-[120px] ${props.className ?? ''}`} />;
}

export function Input({
  label,
  error,
  ...props
}: { label: string; error?: string[] | string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorMsg = Array.isArray(error) ? error[0] : error;
  return (
    <Field label={label} error={errorMsg}>
      <TextInput {...props} />
    </Field>
  );
}

export function Select({
  label,
  error,
  options,
  ...props
}: {
  label: string;
  error?: string[] | string;
  options: { label: string; value: string | number }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const errorMsg = Array.isArray(error) ? error[0] : error;
  return (
    <Field label={label} error={errorMsg}>
      <SelectInput {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectInput>
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block h-6 w-10 rounded-full transition ${checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
        <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm font-medium text-[color:var(--app-text)]">{label}</span>
    </label>
  );
}
