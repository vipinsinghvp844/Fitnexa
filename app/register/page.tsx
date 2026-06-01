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

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gym_name: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      
      // Auto-login logic
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

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const inputClass = "block w-full rounded-xl border-0 bg-[color:var(--app-surface)] py-2.5 text-[color:var(--app-text)] shadow-sm ring-1 ring-inset ring-[color:var(--app-border)] placeholder:text-[color:var(--app-muted)] focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3";
  const labelClass = "block text-sm font-medium leading-6 text-[color:var(--app-text)]";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
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
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step >= s ? 'bg-indigo-600 text-white shadow-md' : 'bg-[color:var(--app-surface)] text-[color:var(--app-muted)] ring-1 ring-inset ring-[color:var(--app-border)]'}`}>
                      {s}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${step >= s ? 'text-indigo-600 dark:text-indigo-400' : 'text-[color:var(--app-muted)]'}`}>
                      {s === 1 ? 'Details' : s === 2 ? 'Location' : 'Security'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 relative h-1 w-full rounded-full bg-[color:var(--app-border)] overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-indigo-600 transition-all duration-500 ease-in-out" style={{ width: `${((step - 1) / 2) * 100}%` }} />
              </div>
            </div>

            <form onSubmit={onFormSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-[color:var(--app-text)]">Gym Account</h3>
                    <p className="text-sm text-[color:var(--app-muted)]">Tell us about your business.</p>
                  </div>
                  
                  <div>
                    <label className={labelClass}>Gym Name</label>
                    <div className="mt-1.5">
                      <input type="text" required value={formData.gym_name} onChange={(e) => setFormData({ ...formData, gym_name: e.target.value })} className={inputClass} placeholder="E.g. Iron Forge Fitness" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Your Full Name</label>
                    <div className="mt-1.5">
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="John Doe" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Email address</label>
                    <div className="mt-1.5">
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="hello@gym.com" />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="mt-1.5">
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} placeholder="+1 234 567 890" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-[color:var(--app-text)]">Location</h3>
                    <p className="text-sm text-[color:var(--app-muted)]">Where is your gym located?</p>
                  </div>

                  <div>
                    <label className={labelClass}>Gym Address</label>
                    <div className="mt-1.5">
                      <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass} placeholder="Street, area, landmark" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <div className="mt-1.5">
                        <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} placeholder="Mumbai" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <div className="mt-1.5">
                        <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className={inputClass} placeholder="Maharashtra" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Country</label>
                      <div className="mt-1.5">
                        <input type="text" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className={inputClass} placeholder="India" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Zip Code</label>
                      <div className="mt-1.5">
                        <input type="text" required value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className={inputClass} placeholder="400001" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-[color:var(--app-text)]">Security</h3>
                    <p className="text-sm text-[color:var(--app-muted)]">Set up a secure password for your account.</p>
                  </div>

                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="mt-1.5">
                      <input type="password" required minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="mt-1.5">
                      <input type="password" required minLength={8} value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4 pt-4 border-t border-[color:var(--app-border)]">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[color:var(--app-text)] ring-1 ring-inset ring-[color:var(--app-border)] hover:bg-[color:var(--app-muted)]/10 transition-colors">
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors ml-auto max-w-[140px]"
                >
                  {step === 3 ? (loading ? 'Creating...' : 'Complete') : 'Continue'}
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
