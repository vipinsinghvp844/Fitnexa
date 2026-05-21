'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { getGymStaffMember, type GymStaffSummary } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--app-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[color:var(--app-text)]">{value || '-'}</div>
    </div>
  );
}

export default function GymStaffProfilePage() {
  const params = useParams<{ staff: string }>();
  const staffId = Number(params.staff);

  const [staff, setStaff] = useState<GymStaffSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = useCallback(async () => {
    if (!staffId) return;

    setLoading(true);
    setError(null);
    try {
      const response = (await getGymStaffMember(staffId)) as { data: GymStaffSummary };
      setStaff(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadStaff();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadStaff]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !staff) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Staff Profile"
          description="Staff details"
          actions={
            <Link href="/gym/staff" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
              Back
            </Link>
          }
        />
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error ?? 'Staff not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={staff.user?.name ?? 'Staff Profile'}
        description={staff.user?.email ?? 'Staff details'}
        actions={
          <Link href="/gym/staff" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
            Back
          </Link>
        }
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {staff.avatar ? (
              <img src={staff.avatar} alt={staff.user?.name || ''} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xl font-semibold text-slate-900">
                {staff.user?.name ? staff.user.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--app-text)]">{staff.user?.name}</h2>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">{staff.user?.email}</p>
            </div>
          </div>
          <StatusBadge value={staff.status ?? 'inactive'} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Detail label="Role" value={staff.role} />
          <Detail label="Phone" value={staff.phone} />
          <Detail label="Position" value={staff.position} />
          <Detail label="Shift" value={staff.shift} />
          <Detail label="Salary" value={staff.salary ? `$${staff.salary}` : '-'} />
          <Detail label="Branch" value={staff.branch?.name} />
          
          {staff.role === 'trainer' && (
            <>
              <Detail label="Specialization" value={staff.specialization} />
              <Detail label="Experience" value={staff.experience_years ? `${staff.experience_years} years` : '-'} />
              <Detail label="Certifications" value={staff.certifications} />
              <div className="md:col-span-3">
                <Detail label="Bio" value={staff.bio} />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
