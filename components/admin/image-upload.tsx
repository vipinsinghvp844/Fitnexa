'use client';

import { useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { request } from '@/lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = pathname?.startsWith('/super-admin')
      ? '/api/super-admin/settings/upload-media'
      : '/api/gym/settings/upload-media';

    try {
      // NOTE: request automatically attaches auth tokens and builds the full URL
      // It also doesn't set Content-Type to application/json if body is FormData
      const response = await request(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response && response.url) {
        onChange(response.url);
      }
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-[color:var(--app-text)]">{label}</label>}
      
      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)]">
          {value ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <Icons.Image className="h-8 w-8 text-[color:var(--app-muted)]" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Icons.Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg bg-[color:var(--app-surface-raised)] border border-[color:var(--app-border)] px-4 py-2 text-sm font-medium text-[color:var(--app-text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              <Icons.UploadCloud className="h-4 w-4" />
              {value ? 'Change Image' : 'Upload Image'}
            </button>
            {value && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => onChange('')}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition disabled:opacity-50"
              >
                <Icons.Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-[color:var(--app-muted)]">
            Recommended: JPG, PNG or SVG. Max size: 5MB.
          </p>
          {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
