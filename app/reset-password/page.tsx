'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { resetPassword } from '../../lib/api';

function ResetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tokenFromUrl = params.get('token') ?? '';
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(() => tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setMessage('Password has been reset successfully.');
      router.push('/login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-semibold text-zinc-900">Reset Password</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-zinc-600">Email</span>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-600">Reset Token</span>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-600">New Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-600">Confirm Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
          <button
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-zinc-600">
          <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
