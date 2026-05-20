'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { confirmRazorpayPlatformSubscription, confirmStripePlatformSubscription, getCurrentPlatformSubscription } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

type SubscriptionResponse = {
  data?: {
    is_active?: boolean;
  } | null;
};

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verifying your subscription...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    async function redirectWhenActive() {
      const subRes = await getCurrentPlatformSubscription() as SubscriptionResponse;
      const subscription = subRes.data || null;

      if (subscription?.is_active) {
        window.location.href = '/gym/dashboard';
        return true;
      }

      return false;
    }

    async function verify() {
      setError(null);
      setMessage('Verifying your subscription...');

      try {
        const sessionId = searchParams.get('session_id');

        if (sessionId) {
          await confirmStripePlatformSubscription(sessionId);
          if (!cancelled) {
            setMessage('Subscription activated. Redirecting...');
          }
          await redirectWhenActive();
          return;
        }

        const paymentId = searchParams.get('payment_id');
        const orderId = searchParams.get('order_id');
        const signature = searchParams.get('signature');

        if (paymentId && orderId && signature) {
          await confirmRazorpayPlatformSubscription({
            payment_id: paymentId,
            order_id: orderId,
            signature,
          });
          if (!cancelled) {
            setMessage('Subscription activated. Redirecting...');
          }
          await redirectWhenActive();
          return;
        }

        if (await redirectWhenActive()) {
          return;
        }

        setMessage('Payment received. Waiting for confirmation...');
        interval = setInterval(async () => {
          try {
            await redirectWhenActive();
          } catch {
            // Keep waiting while webhook delivery catches up.
          }
        }, 2500);

        timeout = setTimeout(() => {
          if (!cancelled) {
            if (interval) clearInterval(interval);
            setError('Payment is successful, but subscription activation is still pending. Please refresh in a moment or contact support.');
          }
        }, 30000);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setMessage('We could not activate your subscription automatically.');
        }
      }
    }

    verify();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-[color:var(--app-surface)] p-8 rounded-3xl shadow-xl border border-[color:var(--app-border)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
          <DashboardIcon name="check" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-[color:var(--app-text)]">Payment Successful!</h1>
        <p className="text-[color:var(--app-muted)]">
          {message}
        </p>

        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}
        
        <div className="pt-4 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
        </div>
      </div>
    </div>
  );
}
