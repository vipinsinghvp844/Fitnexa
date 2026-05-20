'use client';

import { useState, useEffect, FormEvent } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Field, TextInput, SelectInput, Toggle } from '@/components/admin/fields';
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
  const [securityForm, setSecurityForm] = useState<SecuritySettings>({ session_timeout_minutes: 120, max_login_attempts: 5, require_strong_password: true });
  const [notificationForm, setNotificationForm] = useState<NotificationSettings>({ email_enabled: true, sms_enabled: false, webhook_url: '' });
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
                  <Field label="Logo URL">
                    <TextInput
                      value={platformForm.logo}
                      onChange={(e) => setPlatformForm({ ...platformForm, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  </Field>
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
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Platform Security & Auth Rules</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Lock down user sessions and enforce password rules.</p>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Session Timeout Duration (Minutes)">
                    <TextInput
                      type="number"
                      min="5"
                      value={securityForm.session_timeout_minutes}
                      onChange={(e) => setSecurityForm({ ...securityForm, session_timeout_minutes: Number(e.target.value) })}
                      required
                    />
                  </Field>
                  <Field label="Maximum Failed Login Attempts" hint="Temporary lock account after threshold limit is hit.">
                    <TextInput
                      type="number"
                      min="3"
                      value={securityForm.max_login_attempts}
                      onChange={(e) => setSecurityForm({ ...securityForm, max_login_attempts: Number(e.target.value) })}
                      required
                    />
                  </Field>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Enforce Strong Password Creation Policies"
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
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[color:var(--app-text)]">Alerts & System Webhooks</h3>
                <p className="text-sm text-[color:var(--app-muted)]">Toggle core notifications and configure system outbound webhooks.</p>
                <div className="grid gap-5 md:grid-cols-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[color:var(--app-border)]">
                  <Toggle
                    label="Send Platform Support Emails"
                    checked={notificationForm.email_enabled}
                    onChange={(checked) => setNotificationForm({ ...notificationForm, email_enabled: checked })}
                  />
                  <Toggle
                    label="Send Platform SMS Alerts"
                    checked={notificationForm.sms_enabled}
                    onChange={(checked) => setNotificationForm({ ...notificationForm, sms_enabled: checked })}
                  />
                </div>
                <Field label="Global Outbound Webhook URL" hint="Receives tenant creations, subscription updates, and billing failures.">
                  <TextInput
                    type="url"
                    value={notificationForm.webhook_url}
                    onChange={(e) => setNotificationForm({ ...notificationForm, webhook_url: e.target.value })}
                    placeholder="https://api.yourdomain.com/webhooks/receiver"
                  />
                </Field>
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
