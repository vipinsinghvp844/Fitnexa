'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../lib/api';
import { setCredentials, setError } from '../../store/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await login({ email, password });

      dispatch(
        setCredentials({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user,
        })
      );

      router.push(response.redirect_to || '/');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch(setError(message));
      setMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-3xl font-semibold text-zinc-900">Login</h1>
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
            <span className="text-sm text-zinc-600">Password</span>
            <input
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 focus:border-indigo-500 focus:outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
          <button
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-zinc-600">
          <Link className="font-medium text-indigo-600 hover:text-indigo-700" href="/forgot-password">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
