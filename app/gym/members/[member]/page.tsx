'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { getGymMember, type GymMemberSummary } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

function formatCurrency(amount?: string | number | null) {
  if (amount === null || amount === undefined || amount === '') return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--app-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[color:var(--app-text)]">{value || '-'}</div>
    </div>
  );
}

export default function GymMemberProfilePage() {
  const params = useParams<{ member: string }>();
  const memberId = Number(params.member);

  const [member, setMember] = useState<GymMemberSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMember = useCallback(async () => {
    if (!memberId) return;

    setLoading(true);
    setError(null);
    try {
      const response = (await getGymMember(memberId)) as { data: GymMemberSummary };
      setMember(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMember();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMember]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Member Profile"
          description="Member details"
          actions={
            <Link href="/gym/members" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
              Back
            </Link>
          }
        />
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error ?? 'Member not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={member.name ?? 'Member Profile'}
        description={member.email ?? 'Member details'}
        actions={
          <Link href="/gym/members" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
            Back
          </Link>
        }
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {member.profile_picture ? (
              <img src={member.profile_picture} alt={member.name || ''} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xl font-semibold text-slate-900">
                {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--app-text)]">{member.name}</h2>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">{member.email}</p>
            </div>
          </div>
          <StatusBadge value={member.status ?? 'inactive'} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Detail label="Phone" value={member.phone} />
          <Detail label="Gender" value={member.gender} />
          <Detail label="Date of Birth" value={member.dob} />
          <Detail label="Joining Date" value={member.joining_date} />
          <Detail label="Emergency Contact" value={member.emergency_contact} />
          <Detail label="Assigned Trainer" value={member.assigned_trainer?.user.name} />
          <div className="md:col-span-3">
            <Detail label="Address" value={member.address} />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Current Membership</h2>
            <p className="mt-1 text-sm text-[color:var(--app-muted)]">{member.membership_plan?.name ?? 'No active plan'}</p>
          </div>
          {member.active_membership ? <StatusBadge value={member.active_membership.status} /> : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
          <Detail label="Plan" value={member.membership_plan?.name} />
          <Detail label="Start Date" value={member.active_membership?.start_date} />
          <Detail label="End Date" value={member.active_membership?.end_date} />
          <Detail label="Amount" value={formatCurrency(member.active_membership?.final_amount)} />
        </div>
      </section>

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Membership History</h2>
        <div className="mt-5 space-y-3">
          {member.membership_history?.length ? (
            member.membership_history.map((membership) => (
              <div key={membership.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-[color:var(--app-border)] p-4 md:grid-cols-5">
                <Detail label="Plan" value={membership.plan?.name} />
                <Detail label="Start" value={membership.start_date} />
                <Detail label="End" value={membership.end_date} />
                <Detail label="Payment" value={membership.payment_status} />
                <div className="flex items-start justify-between gap-3 md:justify-end">
                  <StatusBadge value={membership.status} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[color:var(--app-muted)]">No membership history.</p>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-dashed border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6">
        <h2 className="text-xl font-semibold text-[color:var(--app-text)]">Attendance</h2>
        <p className="mt-2 text-sm text-[color:var(--app-muted)]">Attendance records will appear here when check-in tracking is connected.</p>
      </section>
    </div>
  );
}
