'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { register } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    gym_name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      
      // Auto-login logic (register endpoint now returns tokens)
      if (response.access_token) {
        dispatch(
          setCredentials({
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
          })
        );
        router.push(response.redirect_to || '/gym/dashboard');
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <DashboardIcon name="spark" className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[color:var(--app-text)]">
              Full SaaS
            </h2>
          </div>
          
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-[color:var(--app-text)]">
            Register your gym
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--app-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium leading-6 text-[color:var(--app-text)]">
                  Gym Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.gym_name}
                    onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                    placeholder="E.g. Iron Forge Fitness"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[color:var(--app-text)]">
                  Your Full Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[color:var(--app-text)]">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[color:var(--app-text)]">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-[color:var(--app-text)]">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className="block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full object-cover bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 flex flex-col justify-center px-12">
          <h2 className="text-4xl font-extrabold text-white max-w-lg mb-6 leading-tight">
            Scale your fitness business with zero friction.
          </h2>
          <p className="text-indigo-200 max-w-lg text-lg">
            Manage members, trainers, billing, and scheduling—all in one place.
            Get your gym up and running on the platform in less than 2 minutes.
          </p>
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-indigo-900 bg-indigo-500/30 flex items-center justify-center">
                  <DashboardIcon name="building" className="h-4 w-4 text-white" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-indigo-200">
              Join 500+ other active gyms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
