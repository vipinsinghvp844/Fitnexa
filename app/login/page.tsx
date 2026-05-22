'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '@/components/admin/toast';
import { login } from '../../lib/api';
import { setCredentials, setError } from '../../store/authSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await login({ email, password });

      dispatch(
        setCredentials({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user,
        })
      );

      toastSuccess('Login successful!', 'Redirecting to your dashboard...');
      
      setTimeout(() => {
        router.push(response.redirect_to || '/');
      }, 1000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Login failed';
      dispatch(setError(msg));
      toastError('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-sans">
      {/* Left side - Gradient / Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-950 relative overflow-hidden items-center justify-center p-12">
        {/* Abstract shapes for premium feel */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-violet-950 opacity-90 z-0"></div>
        <div className="absolute w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[100px] opacity-30 top-[-100px] left-[-100px] z-0"></div>
        <div className="absolute w-[400px] h-[400px] bg-violet-600 rounded-full blur-[100px] opacity-20 bottom-[-50px] right-[-50px] z-0"></div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="mb-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
            <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200">
            Manage Your Fitness Empire
          </h2>
          <p className="text-indigo-200/80 text-lg leading-relaxed mb-10 font-light">
            Fitnexa provides the ultimate operating system for gyms and fitness centers. Streamline operations, boost retention, and scale your business effortlessly.
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-950 bg-indigo-300 shadow-sm"></div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-950 bg-indigo-400 shadow-sm"></div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-950 bg-indigo-500 shadow-sm"></div>
            </div>
            <p className="text-sm text-indigo-300 font-medium tracking-wide">Trusted by 1000+ facilities</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-24 relative bg-zinc-50/50">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative z-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-zinc-500 text-sm">Please enter your details to sign in.</p>
          </div>

          <div className="mb-8 rounded-2xl border border-indigo-100/60 bg-indigo-50/40 p-5">
            <p className="font-semibold text-xs uppercase tracking-wider text-indigo-500 mb-3">Demo credentials</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-white px-3.5 py-2.5 rounded-xl border border-indigo-100/50 shadow-sm">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Super Admin</span>
                <code className="text-[13px] font-bold text-indigo-700">superadmin@platform.com</code>
              </div>
              <div className="flex justify-between items-center bg-white px-3.5 py-2.5 rounded-xl border border-indigo-100/50 shadow-sm">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Gym Owner</span>
                <code className="text-[13px] font-bold text-indigo-700">admin@powerhousegym.com</code>
              </div>
              <p className="text-[13px] text-indigo-600/80 text-center mt-3 font-medium">
                Password: <code className="bg-white px-2 py-1 rounded-md text-indigo-700 border border-indigo-100 shadow-sm">password</code>
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email address</label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <Link className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-12 py-3.5 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>



            <button
              className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}

