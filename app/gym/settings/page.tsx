'use client';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { getErrorMessage } from '@/lib/errors';
import {
  getGymProfile,
  getGymKVSettings,
  getGymUsers,
  getGymRoles,
  getGymPaymentSettings,
  type GymProfile,
  type GymUser,
  type GymPaymentSettings
} from '@/lib/gym';

import { GeneralTab } from './_components/general-tab';
import { PaymentTab } from './_components/payment-tab';
import { BillingTab } from './_components/billing-tab';
import { NotificationsTab } from './_components/notifications-tab';
import { UsersTab } from './_components/users-tab';
import { AdvancedTab } from './_components/advanced-tab';

type TabKey = 'general' | 'payments' | 'billing' | 'notifications' | 'users' | 'advanced';

const TABS: { id: TabKey; label: string; icon: string }[] = [
  { id: 'general', label: 'General', icon: '🏢' },
  { id: 'payments', label: 'Payments', icon: '💳' },
  { id: 'billing', label: 'Billing', icon: '🧾' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'users', label: 'Users & Roles', icon: '👥' },
  { id: 'advanced', label: 'Advanced', icon: '⚙️' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [profile, setProfile] = useState<GymProfile | null>(null);
  const [kvSettings, setKvSettings] = useState<Record<string, any>>({});
  const [paymentSettings, setPaymentSettings] = useState<GymPaymentSettings | null>(null);
  const [users, setUsers] = useState<GymUser[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prof, kv, pay, usr, rol] = await Promise.all([
        getGymProfile(),
        getGymKVSettings(),
        getGymPaymentSettings(),
        getGymUsers(),
        getGymRoles()
      ]);
      setProfile((prof as any).data);
      setKvSettings((kv as any).data || {});
      setPaymentSettings((pay as any).data || null);
      setUsers((usr as any).data || []);
      setRoles((rol as any).data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  if (loading) return <div className="p-8"><LoadingState /></div>;
  if (error) return <div className="p-8 text-rose-500">{error}</div>;

  return (
    <div className="space-y-8 pb-12">
      <AdminPageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage your gym's profile, billing rules, integrations, and staff access."
      />

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 sticky top-24">
          {TABS.map(t => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                  active 
                    ? 'bg-slate-900 text-white shadow-md dark:bg-indigo-500/20 dark:text-indigo-300' 
                    : 'text-[color:var(--app-muted)] hover:bg-[color:var(--app-surface)] hover:text-[color:var(--app-text)]'
                }`}
              >
                <span className="text-lg opacity-80">{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0 w-full">
          {activeTab === 'general' && profile && <GeneralTab initial={profile} />}
          {activeTab === 'payments' && paymentSettings && <PaymentTab initial={paymentSettings} />}
          {activeTab === 'billing' && <BillingTab initial={kvSettings} />}
          {activeTab === 'notifications' && <NotificationsTab initial={kvSettings} />}
          {activeTab === 'users' && <UsersTab users={users} roles={roles} onRefresh={loadData} />}
          {activeTab === 'advanced' && <AdvancedTab initial={kvSettings} />}
        </div>
      </div>
    </div>
  );
}
