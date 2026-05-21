'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { StatusBadge } from '@/components/admin/status-badge';
import { getGymTrainer, type GymTrainerSummary } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--app-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium text-[color:var(--app-text)]">{value || '-'}</div>
    </div>
  );
}

export default function GymTrainerProfilePage() {
  const params = useParams<{ trainer: string }>();
  const trainerId = Number(params.trainer);

  const [trainer, setTrainer] = useState<GymTrainerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrainer = useCallback(async () => {
    if (!trainerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = (await getGymTrainer(trainerId)) as { data: GymTrainerSummary };
      setTrainer(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTrainer();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTrainer]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !trainer) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Trainer Profile"
          description="Trainer details"
          actions={
            <Link href="/gym/trainers" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
              Back
            </Link>
          }
        />
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error ?? 'Trainer not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={trainer.user?.name ?? 'Trainer Profile'}
        description={trainer.user?.email ?? 'Trainer details'}
        actions={
          <Link href="/gym/trainers" className="rounded-2xl border border-[color:var(--app-border)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)]">
            Back
          </Link>
        }
      />

      <section className="rounded-[28px] border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {trainer.avatar ? (
              <img src={trainer.avatar} alt={trainer.user?.name || ''} className="h-16 w-16 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xl font-semibold text-slate-900">
                {trainer.user?.name ? trainer.user.name.charAt(0).toUpperCase() : 'T'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--app-text)]">{trainer.user?.name}</h2>
              <p className="mt-1 text-sm text-[color:var(--app-muted)]">{trainer.user?.email}</p>
            </div>
          </div>
          <StatusBadge value={trainer.status ?? 'inactive'} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <Detail label="Phone" value={trainer.phone} />
          <Detail label="Specialization" value={trainer.specialization} />
          <Detail label="Experience" value={trainer.experience_years ? `${trainer.experience_years} years` : '-'} />
          <Detail label="Shift" value={trainer.shift} />
          <Detail label="Salary" value={trainer.salary ? `$${trainer.salary}` : '-'} />
          <Detail label="Certifications" value={trainer.certifications} />
          <div className="md:col-span-3">
            <Detail label="Bio" value={trainer.bio} />
          </div>
        </div>
      </section>
    </div>
  );
}
