'use client';

import { useState, useEffect, FormEvent } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Field, TextInput, SelectInput, Toggle } from '@/components/admin/fields';
import { ImageUpload } from '@/components/admin/image-upload';
import { LoadingState } from '@/components/admin/loading-state';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import {
  getSettings,
  updateSettings,
  getPlans,
  AllPlatformSettings,
  PlatformSettings,
  PaymentSettings,
  BillingSettings,
  CouponSettings,
  TenantSettings,
  SecuritySettings,
  NotificationSettings,
  FeatureSettings,
  SystemSettings,
  PlanSummary,
} from '@/lib/super-admin';
import { getErrorMessage } from '@/lib/errors';

type SettingTab =
  | 'platform'
  | 'payment'
  | 'billing'
  | 'coupons'
  | 'tenant'
  | 'security'
  | 'notifications'
  | 'features'
  | 'system';

interface TabItem {
  key: SettingTab;
  label: string;
  description: string;
  icon: 'settings' | 'credit-card' | 'subscriptions' | 'coupons' | 'building' | 'shield' | 'bell' | 'spark' | 'alert-circle';
}

const TABS: TabItem[] = [
  { key: 'platform', label: 'Platform Info', description: 'Name, logo, support details', icon: 'settings' },
  { key: 'payment', label: 'Payment Gateways', description: 'Stripe, Razorpay, webhooks', icon: 'credit-card' },
  { key: 'billing', label: 'Billing & Grace', description: 'Currency, tax, trial, suspension', icon: 'subscriptions' },
  { key: 'coupons', label: 'Coupons Rules', description: 'Discount limits, global toggles', icon: 'coupons' },
  { key: 'tenant', label: 'Tenant Controls', description: 'Registration, default SaaS plans', icon: 'building' },
  { key: 'security', label: 'Security & Auth', description: 'Session timeout, lockout rules', icon: 'shield' },
  { key: 'notifications', label: 'Alerts & Webhooks', description: 'Notification settings', icon: 'bell' },
  { key: 'features', label: 'Feature Flags', description: 'Enable/disable platform modules', icon: 'spark' },
  { key: 'system', label: 'System & Maintenance', description: 'Maintenance and debug toggles', icon: 'alert-circle' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('platform');
  const [settings, setSettings] = useState<AllPlatformSettings | null>(null);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Show/Hide Secrets
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

  // Form states
  const [platformForm, setPlatformForm] = useState<PlatformSettings>({ name: '', logo: '', support_email: '', support_phone: '' });
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>({
    stripe_enabled: false,
    razorpay_enabled: false,
    stripe_key: '',
    stripe_secret: '',
    stripe_webhook: '',
    razorpay_key: '',
    razorpay_secret: '',
    razorpay_webhook: '',
    test_mode: true,
  });
  const [billingForm, setBillingForm] = useState<BillingSettings>({ currency: 'USD', tax_rate: 0, trial_days: 14, grace_period_days: 3, auto_suspend: true });
  const [couponForm, setCouponForm] = useState<CouponSettings>({ enable_coupons: true, max_discount_percentage: 100, max_usage_per_coupon: 1000 });
  const [tenantForm, setTenantForm] = useState<TenantSettings>({ allow_signup: true, auto_approve: true, default_plan_id: null });
  const [securityForm, setSecurityForm] = useState<SecuritySettings>({ session_timeout_minutes: 120, max_login_attempts: 5, lockout_minutes: 15, require_strong_password: true });
  const [notificationForm, setNotificationForm] = useState<NotificationSettings>({
    email_enabled: false,
    email_provider: 'gmail',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_address: '',
    smtp_from_name: '',
    smtp_encryption: 'tls',
    sendgrid_api_key: '',
    mailgun_api_key: '',
    mailgun_domain: '',
    sms_enabled: false,
    webhook_url: '',
    webhook_format: 'json',
    webhook_secret: '',
  });
  const [featureForm, setFeatureForm] = useState<FeatureSettings>({ enable_classes: true, enable_trainers: true, enable_store: true, enable_diet_plans: true });
  const [systemForm, setSystemForm] = useState<SystemSettings>({ maintenance_mode: false, debug_mode: false });

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resSettings, resPlans] = await Promise.all([
        getSettings(),
        getPlans({ per_page: 100, status: 'active' }),
      ]);
      setSettings(resSettings);
      setPlans(resPlans.data);

      // Populate forms
      setPlatformForm(resSettings.platform);
      setPaymentForm(resSettings.payment);
      setBillingForm(resSettings.billing);
      setCouponForm(resSettings.coupons);
      setTenantForm(resSettings.tenant);
      setSecurityForm(resSettings.security);
      setNotificationForm(resSettings.notifications);
      setFeatureForm(resSettings.features);
      setSystemForm(resSettings.system);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load platform settings'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) {
        loadAll();
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    let payload: Record<string, unknown> = {};
    switch (activeTab) {
      case 'platform': payload = { ...platformForm }; break;
      case 'payment': payload = { ...paymentForm }; break;
      case 'billing': payload = { ...billingForm }; break;
      case 'coupons': payload = { ...couponForm }; break;
      case 'tenant': payload = { ...tenantForm }; break;
      case 'security': payload = { ...securityForm }; break;
      case 'notifications': payload = { ...notificationForm }; break;
      case 'features': payload = { ...featureForm }; break;
      case 'system': payload = { ...systemForm }; break;
    }

    try {
      const updated = await updateSettings(activeTab, payload);
      setSuccessMessage(`${TABS.find((t) => t.key === activeTab)?.label} updated successfully.`);
      
      // Update local state caches
      if (settings) {
        setSettings({
          ...settings,
          [activeTab]: updated,
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save settings. Please verify inputs.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading platform configuration..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Platform Controller"
        title="SaaS Settings"
        description="Global parameters, billing isolation, keys, security rules, and feature flags for the entire SaaS portal."
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Navigation Tabs */}
        <aside className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setSuccessMessage(null);
                setError(null);
              }}
              className={`w-full flex items-start gap-3 rounded-2xl p-4 text-left transition ${
                activeTab === tab.key
                  ? 'bg-sky-500 text-white shadow-[0_12px_30px_rgba(14,165,233,0.22)]'
                  : 'bg-[color:var(--app-surface)] border border-[color:var(--app-border)] text-[color:var(--app-text)] hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <DashboardIcon name={tab.icon} className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-sm leading-none">{tab.label}</p>
                <p className={`mt-1 text-xs leading-tight ${activeTab === tab.key ? 'text-sky-100' : 'text-[color:var(--app-muted)]'}`}>
                  {tab.description}
                </p>
              </div>
            </button>
          ))}
        </aside>

        {/* Setting Forms Container */}
        <main className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            {/* PLATFORM MODULE */}
            {activeTab === 'platform' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Platform Identity & Contacts</h3>
                <p className="text-sm text-[color:var(--app-muted)]">These settings determine how the application brands itself globally.</p>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Platform Name">
                    <TextInput
                      value={platformForm.name}
                      onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                      required
                    />
                  </Field>
                  <ImageUpload
                    label="Platform Logo"
                    value={platformForm.logo || ''}
                    onChange={(url) => setPlatformForm({ ...platformForm, logo: url })}
                  />
                  <Field label="Support Email">
                    <TextInput
                      type="email"
                      value={platformForm.support_email}
                      onChange={(e) => setPlatformForm({ ...platformForm, support_email: e.target.value })}
                      required
                    />
                  </Field>
                  <Field label="Support Phone">
                    <TextInput
                      value={platformForm.support_phone}
                      onChange={(e) => setPlatformForm({ ...platformForm, support_phone: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* PAYMENT MODULE */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Payment Gateways & Keys</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Manage Stripe and Razorpay integrations. Credentials are hidden for security.</p>
                
                <div className="grid gap-5 md:grid-cols-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Stripe Integration Active"
                    checked={paymentForm.stripe_enabled}
                    onChange={(checked) => setPaymentForm({ ...paymentForm, stripe_enabled: checked })}
                  />
                  <Toggle
                    label="Razorpay Integration Active"
                    checked={paymentForm.razorpay_enabled}
                    onChange={(checked) => setPaymentForm({ ...paymentForm, razorpay_enabled: checked })}
                  />
                  <Toggle
                    label="Sandbox/Test Mode Active"
                    checked={paymentForm.test_mode}
                    onChange={(checked) => setPaymentForm({ ...paymentForm, test_mode: checked })}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-[color:var(--app-text)]">Stripe API Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Stripe Publishable Key">
                      <TextInput
                        value={paymentForm.stripe_key}
                        onChange={(e) => setPaymentForm({ ...paymentForm, stripe_key: e.target.value })}
                        placeholder="pk_test_..."
                      />
                    </Field>
                    <Field label="Stripe Secret Key">
                      <div className="relative">
                        <TextInput
                          type={showStripeSecret ? 'text' : 'password'}
                          value={paymentForm.stripe_secret}
                          onChange={(e) => setPaymentForm({ ...paymentForm, stripe_secret: e.target.value })}
                          placeholder="sk_test_..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowStripeSecret(!showStripeSecret)}
                          className="absolute right-3 top-3 text-xs font-semibold text-sky-500 hover:text-sky-600"
                        >
                          {showStripeSecret ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </Field>
                    <Field label="Stripe Webhook Secret" hint="Used to verify webhook payloads on production.">
                      <TextInput
                        value={paymentForm.stripe_webhook}
                        onChange={(e) => setPaymentForm({ ...paymentForm, stripe_webhook: e.target.value })}
                        placeholder="whsec_..."
                      />
                    </Field>
                  </div>
                </div>

                <div className="space-y-4 border-t border-[color:var(--app-border)] pt-5">
                  <h4 className="font-semibold text-sm text-[color:var(--app-text)]">Razorpay API Details</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Razorpay Key ID">
                      <TextInput
                        value={paymentForm.razorpay_key}
                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpay_key: e.target.value })}
                        placeholder="rzp_test_..."
                      />
                    </Field>
                    <Field label="Razorpay Secret Key">
                      <div className="relative">
                        <TextInput
                          type={showRazorpaySecret ? 'text' : 'password'}
                          value={paymentForm.razorpay_secret}
                          onChange={(e) => setPaymentForm({ ...paymentForm, razorpay_secret: e.target.value })}
                          placeholder="Secret key"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                          className="absolute right-3 top-3 text-xs font-semibold text-sky-500 hover:text-sky-600"
                        >
                          {showRazorpaySecret ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </Field>
                    <Field label="Razorpay Webhook Secret">
                      <TextInput
                        value={paymentForm.razorpay_webhook}
                        onChange={(e) => setPaymentForm({ ...paymentForm, razorpay_webhook: e.target.value })}
                        placeholder="Webhook secret"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* BILLING MODULE */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">SaaS Platform Billing Settings</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Configure currencies, platform taxes, and auto-suspension triggers.</p>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Currency (ISO-3)" hint="e.g. USD, EUR, INR">
                    <TextInput
                      value={billingForm.currency}
                      onChange={(e) => setBillingForm({ ...billingForm, currency: e.target.value.toUpperCase() })}
                      required
                    />
                  </Field>
                  <Field label="Tax Percentage (%)" hint="Applied during tenant signups/checkouts">
                    <TextInput
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={billingForm.tax_rate}
                      onChange={(e) => setBillingForm({ ...billingForm, tax_rate: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Default Trial Duration (Days)">
                    <TextInput
                      type="number"
                      min="0"
                      value={billingForm.trial_days}
                      onChange={(e) => setBillingForm({ ...billingForm, trial_days: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Grace Period Duration (Days)" hint="Days allowed before suspension after subscription expires.">
                    <TextInput
                      type="number"
                      min="0"
                      value={billingForm.grace_period_days}
                      onChange={(e) => setBillingForm({ ...billingForm, grace_period_days: Number(e.target.value) })}
                      required
                    />
                  </Field>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Auto Suspend Gyms"
                    checked={billingForm.auto_suspend}
                    onChange={(checked) => setBillingForm({ ...billingForm, auto_suspend: checked })}
                  />
                  <p className="mt-1 text-xs text-[color:var(--app-muted)] ml-13">
                    Automatically lock gym dashboard accesses when subscriptions go past the grace period.
                  </p>
                </div>
              </div>
            )}

            {/* COUPONS MODULE */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Global Coupon System Configurations</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Toggle discounts and define default system limits.</p>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Enable Coupon Discount Checkout Code Inputs"
                    checked={couponForm.enable_coupons}
                    onChange={(checked) => setCouponForm({ ...couponForm, enable_coupons: checked })}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Maximum Allowed Discount Percentage (%)">
                    <TextInput
                      type="number"
                      min="0"
                      max="100"
                      value={couponForm.max_discount_percentage}
                      onChange={(e) => setCouponForm({ ...couponForm, max_discount_percentage: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Global Default Max Usages Per Coupon">
                    <TextInput
                      type="number"
                      min="1"
                      value={couponForm.max_usage_per_coupon}
                      onChange={(e) => setCouponForm({ ...couponForm, max_usage_per_coupon: Number(e.target.value) })}
                      required
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* TENANT CONTROL MODULE */}
            {activeTab === 'tenant' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Gym/Tenant Control Center</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Control registration requirements and set standard starting plans.</p>
                <div className="grid gap-5 md:grid-cols-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Allow Public Gym Signups"
                    checked={tenantForm.allow_signup}
                    onChange={(checked) => setTenantForm({ ...tenantForm, allow_signup: checked })}
                  />
                  <Toggle
                    label="Auto Approve Gym Registration"
                    checked={tenantForm.auto_approve}
                    onChange={(checked) => setTenantForm({ ...tenantForm, auto_approve: checked })}
                  />
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Default Starting Plan">
                    <SelectInput
                      value={tenantForm.default_plan_id ?? ''}
                      onChange={(e) => setTenantForm({ ...tenantForm, default_plan_id: e.target.value ? Number(e.target.value) : null })}
                    >
                      <option value="">No Default (Require checkout)</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </SelectInput>
                  </Field>
                </div>
              </div>
            )}

            {/* SECURITY MODULE */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Platform Security &amp; Auth Rules</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Lock down user sessions, enforce password policies, and control login lockouts.</p>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Session Timeout (Minutes)" hint="After this time, the user must log in again. Applies to new logins.">
                    <TextInput
                      type="number"
                      min="5"
                      value={securityForm.session_timeout_minutes}
                      onChange={(e) => setSecurityForm({ ...securityForm, session_timeout_minutes: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Max Failed Login Attempts" hint="After this many failures, the account will be temporarily locked.">
                    <TextInput
                      type="number"
                      min="1"
                      value={securityForm.max_login_attempts}
                      onChange={(e) => setSecurityForm({ ...securityForm, max_login_attempts: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Account Lockout Duration (Minutes)" hint="How long the account stays locked after max attempts are reached.">
                    <TextInput
                      type="number"
                      min="1"
                      value={securityForm.lockout_minutes}
                      onChange={(e) => setSecurityForm({ ...securityForm, lockout_minutes: Number(e.target.value) })}
                      required
                    />
                  </Field>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Enforce Strong Password Policies"
                    checked={securityForm.require_strong_password}
                    onChange={(checked) => setSecurityForm({ ...securityForm, require_strong_password: checked })}
                  />
                  <p className="mt-1 text-xs text-[color:var(--app-muted)] ml-13">
                    Requires numbers, symbols, uppercase characters, and at least 8 characters during password creation.
                  </p>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS MODULE */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Email Notifications</h3>
                  <p className="text-sm text-[color:var(--app-muted)] mt-1">Configure how the platform sends system emails (alerts, receipts, notifications).</p>
                </div>

                {/* Email master toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Enable Email Notifications"
                    checked={notificationForm.email_enabled}
                    onChange={(checked) => setNotificationForm({ ...notificationForm, email_enabled: checked })}
                  />
                </div>

                {notificationForm.email_enabled && (
                  <div className="space-y-5">
                    {/* Provider Selector */}
                    <Field label="Email Provider">
                      <SelectInput
                        value={notificationForm.email_provider}
                        onChange={(e) => setNotificationForm({ ...notificationForm, email_provider: e.target.value as NotificationSettings['email_provider'] })}
                      >
                        <option value="gmail">Gmail (Google SMTP)</option>
                        <option value="sendgrid">SendGrid API</option>
                        <option value="mailgun">Mailgun API</option>
                        <option value="smtp">Custom SMTP Server</option>
                      </SelectInput>
                    </Field>

                    {/* Gmail / Custom SMTP fields */}
                    {(notificationForm.email_provider === 'gmail' || notificationForm.email_provider === 'smtp') && (
                      <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--app-muted)]">
                          {notificationForm.email_provider === 'gmail' ? 'Gmail SMTP Settings' : 'Custom SMTP Settings'}
                        </p>
                        {notificationForm.email_provider === 'gmail' && (
                          <div className="rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 p-3 text-xs text-sky-700 dark:text-sky-300">
                            <strong>Gmail setup:</strong> Use <code>smtp.gmail.com</code>, port <code>587</code>, TLS. Enable &quot;App Password&quot; in your Google Account and use that as the password.
                          </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="SMTP Host">
                            <TextInput
                              value={notificationForm.smtp_host}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_host: e.target.value })}
                              placeholder={notificationForm.email_provider === 'gmail' ? 'smtp.gmail.com' : 'mail.yourdomain.com'}
                            />
                          </Field>
                          <Field label="SMTP Port">
                            <TextInput
                              type="number"
                              value={notificationForm.smtp_port}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_port: Number(e.target.value) })}
                              placeholder="587"
                            />
                          </Field>
                          <Field label="SMTP Username (Email)">
                            <TextInput
                              value={notificationForm.smtp_username}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_username: e.target.value })}
                              placeholder="you@gmail.com"
                            />
                          </Field>
                          <Field label="SMTP Password / App Password">
                            <TextInput
                              type="password"
                              value={notificationForm.smtp_password}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_password: e.target.value })}
                              placeholder="App password or SMTP password"
                            />
                          </Field>
                          <Field label="From Email Address">
                            <TextInput
                              type="email"
                              value={notificationForm.smtp_from_address}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_address: e.target.value })}
                              placeholder="noreply@yourplatform.com"
                            />
                          </Field>
                          <Field label="From Name">
                            <TextInput
                              value={notificationForm.smtp_from_name}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_name: e.target.value })}
                              placeholder="Gym SaaS Platform"
                            />
                          </Field>
                          <Field label="Encryption">
                            <SelectInput
                              value={notificationForm.smtp_encryption}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_encryption: e.target.value as 'tls' | 'ssl' | 'none' })}
                            >
                              <option value="tls">TLS (Recommended)</option>
                              <option value="ssl">SSL</option>
                              <option value="none">None (Not Recommended)</option>
                            </SelectInput>
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* SendGrid fields */}
                    {notificationForm.email_provider === 'sendgrid' && (
                      <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--app-muted)]">SendGrid API Settings</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="SendGrid API Key">
                            <TextInput
                              type="password"
                              value={notificationForm.sendgrid_api_key}
                              onChange={(e) => setNotificationForm({ ...notificationForm, sendgrid_api_key: e.target.value })}
                              placeholder="SG.xxxxxxxxxxxx"
                            />
                          </Field>
                          <Field label="From Email Address">
                            <TextInput
                              type="email"
                              value={notificationForm.smtp_from_address}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_address: e.target.value })}
                              placeholder="noreply@yourplatform.com"
                            />
                          </Field>
                          <Field label="From Name">
                            <TextInput
                              value={notificationForm.smtp_from_name}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_name: e.target.value })}
                              placeholder="Gym SaaS Platform"
                            />
                          </Field>
                        </div>
                      </div>
                    )}

                    {/* Mailgun fields */}
                    {notificationForm.email_provider === 'mailgun' && (
                      <div className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-5 space-y-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--app-muted)]">Mailgun API Settings</p>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Mailgun API Key">
                            <TextInput
                              type="password"
                              value={notificationForm.mailgun_api_key}
                              onChange={(e) => setNotificationForm({ ...notificationForm, mailgun_api_key: e.target.value })}
                              placeholder="key-xxxxxxxxxxxxxxxx"
                            />
                          </Field>
                          <Field label="Mailgun Domain">
                            <TextInput
                              value={notificationForm.mailgun_domain}
                              onChange={(e) => setNotificationForm({ ...notificationForm, mailgun_domain: e.target.value })}
                              placeholder="mg.yourdomain.com"
                            />
                          </Field>
                          <Field label="From Email Address">
                            <TextInput
                              type="email"
                              value={notificationForm.smtp_from_address}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_address: e.target.value })}
                              placeholder="noreply@yourplatform.com"
                            />
                          </Field>
                          <Field label="From Name">
                            <TextInput
                              value={notificationForm.smtp_from_name}
                              onChange={(e) => setNotificationForm({ ...notificationForm, smtp_from_name: e.target.value })}
                              placeholder="Gym SaaS Platform"
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SMS Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--app-text)]">SMS Notifications</h3>
                  <div className="mt-3 rounded-2xl border border-dashed border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-400/10">
                        <span className="text-xl">📱</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[color:var(--app-text)]">SMS Provider — Coming Soon</p>
                        <p className="text-xs text-[color:var(--app-muted)] mt-0.5">Twilio, AWS SNS and other providers will be available in a future update.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook Section */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Outbound Webhooks</h3>
                  <p className="text-sm text-[color:var(--app-muted)] mt-1">Send real-time events (subscriptions, signups, payments) to your own endpoint.</p>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Webhook URL" hint="POST requests will be sent here on key platform events.">
                        <TextInput
                          type="url"
                          value={notificationForm.webhook_url}
                          onChange={(e) => setNotificationForm({ ...notificationForm, webhook_url: e.target.value })}
                          placeholder="https://yourserver.com/webhooks/receive"
                        />
                      </Field>
                      <Field label="Webhook Format" hint="How the payload will be encoded.">
                        <SelectInput
                          value={notificationForm.webhook_format}
                          onChange={(e) => setNotificationForm({ ...notificationForm, webhook_format: e.target.value as 'json' | 'form' | 'slack' })}
                        >
                          <option value="json">JSON (application/json)</option>
                          <option value="form">Form Encoded (application/x-www-form-urlencoded)</option>
                          <option value="slack">Slack-Compatible (Block Kit)</option>
                        </SelectInput>
                      </Field>
                      <Field label="Webhook Secret" hint="Used to sign payloads. Verify X-Webhook-Signature header on your server.">
                        <TextInput
                          type="password"
                          value={notificationForm.webhook_secret}
                          onChange={(e) => setNotificationForm({ ...notificationForm, webhook_secret: e.target.value })}
                          placeholder="A strong secret key"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE FLAGS MODULE */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">SaaS Platform Feature Flags</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Toggle tenant modules globally. Disabling a feature hides/locks it for all gyms.</p>
                <div className="grid gap-5 md:grid-cols-2 p-5 border border-[color:var(--app-border)] rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <Toggle
                    label="Enable Class Booking & Scheduling Modules"
                    checked={featureForm.enable_classes}
                    onChange={(checked) => setFeatureForm({ ...featureForm, enable_classes: checked })}
                  />
                  <Toggle
                    label="Enable Trainer Profiles & Assignments"
                    checked={featureForm.enable_trainers}
                    onChange={(checked) => setFeatureForm({ ...featureForm, enable_trainers: checked })}
                  />
                  <Toggle
                    label="Enable Inventory & Store/POS Integration"
                    checked={featureForm.enable_store}
                    onChange={(checked) => setFeatureForm({ ...featureForm, enable_store: checked })}
                  />
                  <Toggle
                    label="Enable Member Diet & Workout Planners"
                    checked={featureForm.enable_diet_plans}
                    onChange={(checked) => setFeatureForm({ ...featureForm, enable_diet_plans: checked })}
                  />
                </div>
              </div>
            )}

            {/* SYSTEM MODULE */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">System & Maintenance Modes</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Manage platform health. Enable maintenance mode to restrict access.</p>
                <div className="grid gap-5 md:grid-cols-2 p-5 border border-[color:var(--app-border)] rounded-2xl bg-slate-50 dark:bg-slate-900">
                  <Toggle
                    label="Enable Platform Maintenance Mode"
                    checked={systemForm.maintenance_mode}
                    onChange={(checked) => setSystemForm({ ...systemForm, maintenance_mode: checked })}
                  />
                  <Toggle
                    label="Enable Client Debug & Detailed Error Output"
                    checked={systemForm.debug_mode}
                    onChange={(checked) => setSystemForm({ ...systemForm, debug_mode: checked })}
                  />
                </div>
                {systemForm.maintenance_mode && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                    <strong>Warning:</strong> Maintenance mode will prevent all non-admin tenants and members from accessing their portals.
                  </div>
                )}
              </div>
            )}

            {/* Submit Control */}
            <div className="flex justify-end border-t border-[color:var(--app-border)] pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {saving ? 'Saving changes...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
