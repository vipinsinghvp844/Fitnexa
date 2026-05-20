'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { Field, SelectInput, TextInput } from '@/components/admin/fields';
import { LoadingState } from '@/components/admin/loading-state';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Pagination } from '@/components/admin/pagination';
import { StatusBadge } from '@/components/admin/status-badge';
import {
  checkInGymMember,
  checkOutGymAttendance,
  getGymAttendance,
  getGymAttendanceToday,
  getGymMembers,
  getGymTrainers,
  type GymAttendanceRecord,
  type GymAttendanceSource,
  type GymAttendanceTodaySummary,
  type GymMemberSummary,
  type GymTrainerSummary,
  type PaginatedResponse,
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

type AttendanceQuery = {
  date: string;
  trainer_id: string;
  member_id: string;
  status: string;
  q: string;
  page: number;
};

type CheckInForm = {
  member_id: string;
  trainer_id: string;
  source: GymAttendanceSource;
  notes: string;
};

const sourceOptions: Array<{ value: GymAttendanceSource; label: string }> = [
  { value: 'manual', label: 'Manual' },
  { value: 'qr', label: 'QR' },
  { value: 'biometric', label: 'Biometric' },
];

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

function initials(name?: string | null) {
  if (!name) return 'M';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatTime(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDuration(minutes?: number | null) {
  if (minutes === null || minutes === undefined) return '-';
  if (minutes <= 0) return '<1m';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${remainingMinutes}m`;
  if (!remainingMinutes) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

function sourceLabel(source: GymAttendanceSource) {
  return sourceOptions.find((option) => option.value === source)?.label ?? source;
}

function MetricTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'sky' | 'emerald' | 'amber' | 'violet';
}) {
  const toneClass = {
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  }[tone];

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-sm opacity-80">{detail}</div>
    </div>
  );
}

export default function GymAttendancePage() {
  const [query, setQuery] = useState<AttendanceQuery>({
    date: todayString(),
    trainer_id: '',
    member_id: '',
    status: '',
    q: '',
    page: 1,
  });
  const debouncedQ = useDebouncedValue(query.q, 350);

  const [response, setResponse] = useState<PaginatedResponse<GymAttendanceRecord> | null>(null);
  const [summary, setSummary] = useState<GymAttendanceTodaySummary | null>(null);
  const [members, setMembers] = useState<GymMemberSummary[]>([]);
  const [trainers, setTrainers] = useState<GymTrainerSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [checkInForm, setCheckInForm] = useState<CheckInForm>({
    member_id: '',
    trainer_id: '',
    source: 'manual',
    notes: '',
  });

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [memberResponse, trainerResponse] = await Promise.all([
        getGymMembers({ page: 1, per_page: 100, status: 'active' }),
        getGymTrainers({ page: 1, per_page: 100 }),
      ]);

      setMembers((memberResponse as PaginatedResponse<GymMemberSummary>).data ?? []);
      setTrainers((trainerResponse as PaginatedResponse<GymTrainerSummary>).data ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [attendanceResponse, summaryResponse] = await Promise.all([
        getGymAttendance({
          date: query.date,
          trainer_id: query.trainer_id || null,
          member_id: query.member_id || null,
          status: query.status || null,
          q: debouncedQ || null,
          page: query.page,
          per_page: 15,
        }),
        getGymAttendanceToday({ date: query.date }),
      ]);

      setResponse(attendanceResponse as PaginatedResponse<GymAttendanceRecord>);
      setSummary((summaryResponse as { data: GymAttendanceTodaySummary }).data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, query.date, query.member_id, query.page, query.status, query.trainer_id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOptions]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAttendance();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAttendance]);

  const handleCheckOut = useCallback(
    async (attendance: GymAttendanceRecord) => {
      setCheckingOutId(attendance.id);
      setError(null);
      setNotice(null);

      try {
        await checkOutGymAttendance(attendance.id);
        setNotice(`${attendance.member?.name ?? 'Member'} checked out at ${formatTime(new Date().toISOString())}.`);
        await loadAttendance();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setCheckingOutId(null);
      }
    },
    [loadAttendance]
  );

  const columns = useMemo<Array<DataTableColumn<GymAttendanceRecord>>>(
    () => [
      {
        id: 'member',
        header: 'Member',
        className: 'min-w-[260px]',
        render: (attendance) => (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
              {initials(attendance.member?.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{attendance.member?.name ?? 'Member'}</div>
              <div className="truncate text-sm text-[color:var(--app-muted)]">{attendance.member?.phone ?? attendance.member?.email ?? '-'}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'trainer',
        header: 'Trainer',
        className: 'w-[180px]',
        render: (attendance) => (
          <div>
            <div className="truncate font-medium text-slate-900">{attendance.trainer?.name ?? 'Unassigned'}</div>
            <div className="truncate text-xs text-[color:var(--app-muted)]">{attendance.trainer?.specialization ?? '-'}</div>
          </div>
        ),
      },
      {
        id: 'check-in',
        header: 'Check-in',
        className: 'w-[150px]',
        render: (attendance) => (
          <div>
            <div className="font-semibold text-slate-900">{formatTime(attendance.check_in_time)}</div>
            <div className="text-xs text-[color:var(--app-muted)]">{sourceLabel(attendance.source)}</div>
          </div>
        ),
      },
      {
        id: 'check-out',
        header: 'Check-out',
        className: 'w-[150px]',
        render: (attendance) => (
          <div>
            <div className="font-semibold text-slate-900">{formatTime(attendance.check_out_time)}</div>
            <div className="text-xs text-[color:var(--app-muted)]">{attendance.is_inside ? 'Inside now' : 'Visit closed'}</div>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        className: 'w-[150px]',
        render: (attendance) => (
          <div className="space-y-2">
            <StatusBadge value={attendance.status} />
            <div className="text-xs font-medium text-[color:var(--app-muted)]">{formatDuration(attendance.duration_minutes)}</div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'w-[150px] text-right',
        render: (attendance) =>
          attendance.is_inside ? (
            <button
              type="button"
              onClick={() => void handleCheckOut(attendance)}
              disabled={checkingOutId === attendance.id}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOutId === attendance.id ? 'Saving...' : 'Check-out'}
            </button>
          ) : (
            <span className="text-xs font-semibold text-[color:var(--app-muted)]">Completed</span>
          ),
      },
    ],
    [checkingOutId, handleCheckOut]
  );

  function updateQuery(patch: Partial<AttendanceQuery>) {
    setQuery((current) => ({
      ...current,
      ...patch,
      page: patch.page ?? 1,
    }));
  }

  function handleMemberSelect(memberId: string) {
    const selectedMember = members.find((member) => String(member.id) === memberId);

    setCheckInForm((current) => ({
      ...current,
      member_id: memberId,
      trainer_id: selectedMember?.assigned_trainer_id ? String(selectedMember.assigned_trainer_id) : '',
    }));
  }

  async function handleCheckIn(event: FormEvent) {
    event.preventDefault();

    if (!checkInForm.member_id) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const payload: {
        member_id: number;
        trainer_id?: number;
        source: GymAttendanceSource;
        notes?: string | null;
      } = {
        member_id: Number(checkInForm.member_id),
        source: checkInForm.source,
        notes: checkInForm.notes.trim() || null,
      };

      if (checkInForm.trainer_id) {
        payload.trainer_id = Number(checkInForm.trainer_id);
      }

      await checkInGymMember(payload);
      const checkedInMember = members.find((member) => String(member.id) === checkInForm.member_id);
      setNotice(`${checkedInMember?.name ?? 'Member'} checked in successfully.`);
      setCheckInForm({
        member_id: '',
        trainer_id: '',
        source: checkInForm.source,
        notes: '',
      });
      await loadAttendance();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !response) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Daily Operations"
        title="Attendance"
        description="Live check-ins, trainer-linked visits, and daily occupancy tracking."
        actions={
          <>
            <button
              type="button"
              onClick={() => void loadAttendance()}
              className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] px-5 py-3 text-sm font-medium text-[color:var(--app-text)] transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-600"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() =>
                setQuery({
                  date: todayString(),
                  trainer_id: '',
                  member_id: '',
                  status: '',
                  q: '',
                  page: 1,
                })
              }
              className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:bg-sky-600"
            >
              Today
            </button>
          </>
        }
      />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Check-ins"
          value={String(summary?.total_check_ins ?? 0)}
          detail={summary?.date ?? query.date}
          tone="sky"
        />
        <MetricTile
          label="Active Today"
          value={String(summary?.active_members_today ?? 0)}
          detail="Unique member visits"
          tone="emerald"
        />
        <MetricTile
          label="Inside Now"
          value={String(summary?.currently_inside ?? 0)}
          detail="Open check-ins"
          tone="amber"
        />
        <MetricTile
          label="Avg Duration"
          value={formatDuration(summary?.avg_visit_duration_minutes)}
          detail="Completed visits"
          tone="violet"
        />
      </section>

      <section className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <form onSubmit={handleCheckIn} className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1.4fr_auto] lg:items-end">
          <Field label="Member">
            <SelectInput
              value={checkInForm.member_id}
              onChange={(event) => handleMemberSelect(event.target.value)}
              disabled={optionsLoading || submitting}
              required
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member.id} value={String(member.id)}>
                  {member.name ?? 'Member'}{member.phone ? ` - ${member.phone}` : ''}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Trainer">
            <SelectInput
              value={checkInForm.trainer_id}
              onChange={(event) => setCheckInForm({ ...checkInForm, trainer_id: event.target.value })}
              disabled={optionsLoading || submitting}
            >
              <option value="">Assigned trainer</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={String(trainer.id)}>
                  {trainer.user.name ?? 'Trainer'}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Source">
            <div className="grid grid-cols-3 rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface-raised)] p-1">
              {sourceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCheckInForm({ ...checkInForm, source: option.value })}
                  disabled={submitting}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    checkInForm.source === option.value
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-[color:var(--app-muted)] hover:bg-black/5 hover:text-[color:var(--app-text)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Notes">
            <TextInput
              value={checkInForm.notes}
              onChange={(event) => setCheckInForm({ ...checkInForm, notes: event.target.value })}
              placeholder="Optional"
              disabled={submitting}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting || optionsLoading || !checkInForm.member_id}
            className="inline-flex h-[48px] items-center justify-center rounded-2xl bg-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Checking in...' : 'Check-in'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Date">
            <TextInput
              type="date"
              value={query.date}
              onChange={(event) => updateQuery({ date: event.target.value })}
            />
          </Field>
          <Field label="Trainer">
            <SelectInput
              value={query.trainer_id}
              onChange={(event) => updateQuery({ trainer_id: event.target.value })}
            >
              <option value="">All trainers</option>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={String(trainer.id)}>
                  {trainer.user.name ?? 'Trainer'}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Member">
            <SelectInput
              value={query.member_id}
              onChange={(event) => updateQuery({ member_id: event.target.value })}
            >
              <option value="">All members</option>
              {members.map((member) => (
                <option key={member.id} value={String(member.id)}>
                  {member.name ?? 'Member'}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput
              value={query.status}
              onChange={(event) => updateQuery({ status: event.target.value })}
            >
              <option value="">All status</option>
              <option value="present">Present</option>
              <option value="missed">Missed</option>
            </SelectInput>
          </Field>
          <Field label="Search">
            <TextInput
              value={query.q}
              onChange={(event) => updateQuery({ q: event.target.value })}
              placeholder="Name, phone, trainer"
            />
          </Field>
        </div>
      </section>

      {response ? (
        <div className="space-y-6">
          <DataTable<GymAttendanceRecord>
            data={response.data}
            columns={columns}
            rowKey={(attendance) => String(attendance.id)}
            emptyTitle="No attendance found"
            emptyDescription="Check in a member or adjust the filters for this date."
            mobileRender={(attendance) => (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-900">
                    {initials(attendance.member?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-900">{attendance.member?.name ?? 'Member'}</div>
                    <div className="truncate text-sm text-[color:var(--app-muted)]">
                      {attendance.trainer?.name ?? 'Unassigned trainer'}
                    </div>
                  </div>
                  <StatusBadge value={attendance.status} />
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Check-in</span>
                    <span className="font-medium text-slate-900">{formatTime(attendance.check_in_time)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Check-out</span>
                    <span className="font-medium text-slate-900">{formatTime(attendance.check_out_time)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Duration</span>
                    <span className="font-medium text-slate-900">{formatDuration(attendance.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[color:var(--app-muted)]">Source</span>
                    <span className="font-medium text-slate-900">{sourceLabel(attendance.source)}</span>
                  </div>
                </div>

                {attendance.notes ? (
                  <div className="rounded-xl border border-[color:var(--app-border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {attendance.notes}
                  </div>
                ) : null}

                {attendance.is_inside ? (
                  <button
                    type="button"
                    onClick={() => void handleCheckOut(attendance)}
                    disabled={checkingOutId === attendance.id}
                    className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkingOutId === attendance.id ? 'Saving...' : 'Check-out'}
                  </button>
                ) : null}
              </div>
            )}
          />

          <Pagination meta={response.meta} onPageChange={(page) => updateQuery({ page })} />
        </div>
      ) : null}
    </div>
  );
}
