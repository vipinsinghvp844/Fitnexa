'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPlatformPlans,
  getCurrentPlatformSubscription,
  subscribeToPlatformPlan,
  validatePlatformCoupon,
  type PlatformCouponPreview,
  type PlatformPlan,
  type PlatformSubscription,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';

type PaymentOption = 'stripe' | 'razorpay' | 'gpay' | 'upi';

type ApiData<T> = { data?: T };

type SubscribeResponse = {
  payment_required: boolean;
  provider?: 'stripe' | 'razorpay';
  checkout_url?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  key?: string;
  name?: string;
  description?: string;
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error: {
    description: string;
  };
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void) => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const paymentOptions: Array<{
  id: PaymentOption;
  title: string;
  subtitle: string;
  badge: string;
  tone: string;
}> = [
  {
    id: 'stripe',
    title: 'Stripe Card',
    subtitle: 'International cards and secure card checkout.',
    badge: 'Card',
    tone: 'from-indigo-600 to-violet-600',
  },
  {
    id: 'razorpay',
    title: 'Razorpay',
    subtitle: 'Cards, wallets, netbanking and UPI in one checkout.',
    badge: 'All modes',
    tone: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'gpay',
    title: 'Google Pay',
    subtitle: 'Open Razorpay with Google Pay available under UPI.',
    badge: 'GPay',
    tone: 'from-emerald-600 to-teal-600',
  },
  {
    id: 'upi',
    title: 'UPI Apps',
    subtitle: 'Pay with any UPI app using intent, collect, or QR.',
    badge: 'UPI',
    tone: 'from-slate-800 to-slate-600',
  },
];

function getRazorpayDisplayConfig(option: PaymentOption) {
  if (option !== 'gpay' && option !== 'upi') {
    return undefined;
  }

  return {
    display: {
      blocks: {
        upiOnly: {
          name: option === 'gpay' ? 'Google Pay and UPI' : 'UPI Payment',
          instruments: [
            {
              method: 'upi',
            },
          ],
        },
      },
      sequence: ['block.upiOnly'],
      preferences: {
        show_default_blocks: option === 'gpay',
      },
    },
  };
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlatformPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<PlatformSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingTo, setSubscribingTo] = useState<number | null>(null);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('stripe');
  const [couponCodes, setCouponCodes] = useState<Record<number, string>>({});
  const [couponPreviews, setCouponPreviews] = useState<Record<number, PlatformCouponPreview>>({});
  const [couponErrors, setCouponErrors] = useState<Record<number, string>>({});
  const [validatingCoupon, setValidatingCoupon] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (searchParams.get('payment_success') === 'stripe') {
      setIsVerifying(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isVerifying) {
      return;
    }

    setError(null);

    // Poll to check if subscription is active, as webhook might be delayed
    const interval = setInterval(async () => {
      try {
        const subRes = await getCurrentPlatformSubscription() as ApiData<PlatformSubscription | null>;
        const subscription = subRes.data || null;
        if (subscription && subscription.is_active) {
          clearInterval(interval);
          router.push('/gym/dashboard');
        }
      } catch {
        // Keep polling even if there's an error
      }
    }, 2500);

    // Stop polling after 30 seconds to avoid infinite loops
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsVerifying(false);
      setError("Verification timed out. Please refresh the page or contact support.");
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVerifying, router, setError]);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes] = await Promise.all([
          getPlatformPlans(),
          getCurrentPlatformSubscription(),
        ]);
        setPlans(((plansRes as ApiData<PlatformPlan[]>).data) || []);
        setCurrentSub(((subRes as ApiData<PlatformSubscription | null>).data) || null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleApplyCoupon = async (planId: number) => {
    const code = (couponCodes[planId] || '').trim();
    if (!code) {
      setCouponErrors((prev) => ({ ...prev, [planId]: 'Enter a coupon code.' }));
      return;
    }

    setValidatingCoupon(planId);
    setCouponErrors((prev) => ({ ...prev, [planId]: '' }));

    try {
      const preview = await validatePlatformCoupon(planId, code);
      setCouponPreviews((prev) => ({ ...prev, [planId]: preview }));
    } catch (err) {
      setCouponPreviews((prev) => {
        const next = { ...prev };
        delete next[planId];
        return next;
      });
      setCouponErrors((prev) => ({ ...prev, [planId]: getErrorMessage(err, 'Invalid coupon') }));
    } finally {
      setValidatingCoupon(null);
    }
  };

  const handleSubscribe = async (planId: number) => {
    setSubscribingTo(planId);
    setError(null);
    try {
      const provider = paymentOption === 'stripe' ? 'stripe' : 'razorpay';
      const res = await subscribeToPlatformPlan(planId, provider, couponPreviews[planId]?.coupon?.code || null);
      const data = res as SubscribeResponse;
      
      if (!data.payment_required) {
        // Free tier or full discount
        router.push('/gym/dashboard');
        return;
      }

      if (data.provider === 'stripe' && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.provider === 'razorpay' && data.order_id) {
        const resLoaded = await loadRazorpayScript();
        if (!resLoaded) {
          setError('Failed to load Razorpay SDK. Please check your connection.');
          setSubscribingTo(null);
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: data.currency,
          name: data.name || 'Gym SaaS',
          description: data.description,
          order_id: data.order_id,
          handler: function (response: RazorpaySuccessResponse) {
            const params = new URLSearchParams({
              payment_success: 'razorpay',
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            router.push(`/gym/subscription/success?${params.toString()}`);
          },
          prefill: {
            name: 'Gym Owner',
          },
          theme: {
            color: paymentOption === 'gpay' || paymentOption === 'upi' ? '#059669' : '#2563eb',
          },
          ...getRazorpayDisplayConfig(paymentOption),
        };

        if (!window.Razorpay) {
          setError('Razorpay SDK is unavailable. Please reload and try again.');
          setSubscribingTo(null);
          return;
        }

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response: RazorpayFailureResponse) {
          setError('Payment failed: ' + response.error.description);
          setSubscribingTo(null);
        });
        paymentObject.open();
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSubscribingTo(null);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            Payment successful! Verifying your subscription...
          </p>
          <p className="text-xs text-slate-400">Please do not close or refresh this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const isExpired = currentSub && !currentSub.is_active;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header / Status Banner */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[color:var(--app-text)] tracking-tight sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-[color:var(--app-muted)]">
            Upgrade your gym&apos;s capabilities with our premium SaaS features.
          </p>

          {isExpired && (
            <div className="mt-8 rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-6 border border-rose-200 dark:border-rose-500/20">
              <div className="flex items-center justify-center gap-3 text-rose-700 dark:text-rose-400">
                <DashboardIcon name="alert-circle" className="h-6 w-6" />
                <h3 className="text-lg font-bold">Subscription Expired</h3>
              </div>
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                Your previous plan ({currentSub.plan}) ended on {currentSub.end_date}. Please select a new plan to restore access to your dashboard.
              </p>
            </div>
          )}

          {currentSub?.is_active && (
            <div className="mt-8 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-6 border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-400">
                <DashboardIcon name="check-circle" className="h-6 w-6" />
                <h3 className="text-lg font-bold">Active Subscription: {currentSub.plan}</h3>
              </div>
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
                Valid until {currentSub.end_date}. You can switch to a different plan below.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Payment Provider Selector */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                Payment Method
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-[color:var(--app-text)]">
                Choose how you want to pay
              </h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm text-[color:var(--app-muted)] sm:block">
              UPI and Google Pay are processed securely through Razorpay.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paymentOptions.map((option) => {
              const selected = paymentOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPaymentOption(option.id)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all ${
                    selected
                      ? 'border-transparent bg-[color:var(--app-surface)] ring-2 ring-indigo-500 shadow-lg'
                      : 'border-[color:var(--app-border)] bg-[color:var(--app-surface)] hover:-translate-y-0.5 hover:border-indigo-300'
                  }`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.tone}`} />
                  <span className="flex items-center justify-between gap-3">
                    <span className={`rounded-full bg-gradient-to-r ${option.tone} px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white`}>
                      {option.badge}
                    </span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-[color:var(--app-border)] text-transparent'
                    }`}>
                      <DashboardIcon name="check" className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <span className="mt-4 block text-sm font-extrabold text-[color:var(--app-text)]">
                    {option.title}
                  </span>
                  <span className="mt-1 block min-h-[40px] text-xs leading-5 text-[color:var(--app-muted)]">
                    {option.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col rounded-3xl border-2 bg-[color:var(--app-surface)] p-8 shadow-xl transition-transform hover:-translate-y-1 ${plan.name.toLowerCase().includes('pro') ? 'border-indigo-600' : 'border-[color:var(--app-border)]'}`}>
              {(() => {
                const preview = couponPreviews[plan.id];
                const displayPrice = preview ? preview.final_amount : plan.final_price;

                return (
                  <>
              {plan.name.toLowerCase().includes('pro') && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="mb-6 text-center">
                <h3 className="text-xl font-extrabold text-[color:var(--app-text)]">{plan.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--app-muted)] min-h-[40px]">{plan.description}</p>
              </div>

              <div className="mb-6 flex items-baseline justify-center gap-x-2">
                <span className="text-5xl font-extrabold tracking-tight text-[color:var(--app-text)]">
                  ${displayPrice}
                </span>
                <span className="text-sm font-semibold text-[color:var(--app-muted)]">/{plan.duration} mo</span>
              </div>

              {preview && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{preview.coupon?.code}</span>
                    <span>- ${preview.coupon_discount.toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs">Checkout amount updated before payment gateway handoff.</p>
                </div>
              )}
              
              {plan.discount > 0 && (
                <div className="mb-6 text-center">
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    Save ${plan.discount}
                  </span>
                </div>
              )}

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[color:var(--app-text)]">
                    <DashboardIcon name="check" className="h-5 w-5 shrink-0 text-indigo-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-[color:var(--app-text)] font-semibold">
                  <DashboardIcon name="users" className="h-5 w-5 shrink-0 text-indigo-500" />
                  <span>{plan.max_members ? `Up to ${plan.max_members} Members` : 'Unlimited Members'}</span>
                </li>
              </ul>

              <div className="mb-5 space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--app-muted)]">
                  Coupon code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCodes[plan.id] || ''}
                    onChange={(event) => {
                      setCouponCodes((prev) => ({ ...prev, [plan.id]: event.target.value.toUpperCase() }));
                      setCouponErrors((prev) => ({ ...prev, [plan.id]: '' }));
                    }}
                    placeholder="SAVE20"
                    className="min-w-0 flex-1 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-4 py-3 text-sm font-semibold uppercase text-[color:var(--app-text)] outline-none transition placeholder:text-[color:var(--app-muted)] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(plan.id)}
                    disabled={validatingCoupon === plan.id}
                    className="rounded-2xl border border-indigo-200 px-4 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
                  >
                    {validatingCoupon === plan.id ? 'Checking' : 'Apply'}
                  </button>
                </div>
                {couponErrors[plan.id] ? <p className="text-xs font-medium text-rose-600">{couponErrors[plan.id]}</p> : null}
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribingTo !== null}
                className={`w-full rounded-2xl py-3.5 text-sm font-bold shadow-md transition-all ${
                  plan.name.toLowerCase().includes('pro') 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30'
                } disabled:opacity-50`}
              >
                {subscribingTo === plan.id ? 'Processing...' : (currentSub?.plan === plan.name ? 'Current Plan' : `Pay with ${paymentOptions.find((option) => option.id === paymentOption)?.title}`)}
              </button>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
