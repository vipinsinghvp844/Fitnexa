'use client';

import Link from 'next/link';
import { useState } from 'react';
import { forgotPassword } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setToken('');

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message || 'Password reset request sent.');
      if (response.reset_token) {
        setToken(response.reset_token);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-semibold text-zinc-900">Forgot Password</h1>
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
          {message ? <p className="text-sm text-zinc-600">{message}</p> : null}
          <button
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Send reset token'}
          </button>
        </form>
        {token ? (
          <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <p className="font-medium">Reset Token</p>
            <p className="break-all">{token}</p>
          </div>
        ) : null}
        <div className="mt-6 text-center text-sm text-zinc-600">
          <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
