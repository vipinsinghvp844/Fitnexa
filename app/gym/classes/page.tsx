'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';
import { getGymClasses, createGymClass, bookGymClass, updateGymClassBookingStatus, getGymTrainers, getGymMembers, getGymClassDetails, type GymClassDetails, type GymClassSchedule, type GymClassBooking } from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';
import { LoadingState } from '@/components/admin/loading-state';

export default function GymClassesPage() {
  const [classes, setClasses] = useState<GymClassDetails[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<GymClassDetails | null>(null);
  
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [classRes, trainerRes, memberRes] = await Promise.all([
        getGymClasses(),
        getGymTrainers(),
        getGymMembers()
      ]);
      setClasses((classRes as any).data);
      setTrainers((trainerRes as any).data);
      setMembers((memberRes as any).data?.data || (memberRes as any).data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openBookModal = (c: GymClassDetails) => {
    setSelectedClass(c);
    setIsBookOpen(true);
  };

  const openDetailsModal = (c: GymClassDetails) => {
    // Need to fetch details to get bookings. Actually, the index API might not return all bookings.
    // Wait, let's just pass the class as is, and the modal can fetch details.
    setSelectedClass(c);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        eyebrow="Management"
        title="Classes & Scheduling"
        description="Manage trainer-led sessions, weekly schedules, and member participation."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-1">
              <button
                onClick={() => setView('grid')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setView('table')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${view === 'table' ? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-[color:var(--app-muted)] hover:text-[color:var(--app-text)]'}`}
              >
                Table
              </button>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.02] hover:shadow-sky-500/30"
            >
              <DashboardIcon name="plus" className="h-4 w-4" />
              Create Class
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading && !error ? (
        <LoadingState />
      ) : (
        <>
          {view === 'grid' && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {classes.map((gymClass) => (
                <div key={gymClass.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-6 shadow-sm transition hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-sky-50/30 opacity-0 transition group-hover:opacity-100 dark:to-sky-900/10 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {gymClass.category || 'General'}
                        </span>
                        <h3 className="text-xl font-bold text-[color:var(--app-text)]">{gymClass.name}</h3>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        gymClass.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {gymClass.status}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-[color:var(--app-muted)]">
                      <div className="flex items-center gap-2">
                        <DashboardIcon name="trainers" className="h-4 w-4" />
                        <span className="truncate">{gymClass.trainer?.user?.name || 'No Trainer'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DashboardIcon name="attendance" className="h-4 w-4" />
                        <span>{gymClass.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DashboardIcon name="building" className="h-4 w-4" />
                        <span>Max {gymClass.capacity || '∞'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DashboardIcon name="members" className="h-4 w-4" />
                        <span>{gymClass.bookings_count || 0} Booked</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="mb-3 text-xs font-semibold uppercase text-[color:var(--app-muted)] border-b border-[color:var(--app-border)] pb-2">Weekly Schedule</h4>
                      <ul className="space-y-2">
                        {gymClass.schedules?.slice(0,3).map((sch) => (
                          <li key={sch.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-[color:var(--app-text)]">{sch.day_of_week}</span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}
                            </span>
                          </li>
                        ))}
                        {(gymClass.schedules?.length || 0) > 3 && (
                          <li className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                            +{(gymClass.schedules?.length || 0) - 3} more slots
                          </li>
                        )}
                        {!gymClass.schedules?.length && <li className="text-sm text-[color:var(--app-muted)] italic">No schedule set</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 border-t border-[color:var(--app-border)] pt-4">
                     <button
                        onClick={() => openDetailsModal(gymClass)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openBookModal(gymClass)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-600 transition hover:bg-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:hover:bg-sky-500/20"
                      >
                        Book
                      </button>
                  </div>
                </div>
              ))}
              {!classes.length && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--app-border)] p-12 text-center">
                  <div className="mb-4 rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                    <DashboardIcon name="classes" className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--app-text)]">No Classes Found</h3>
                  <p className="mt-1 text-sm text-[color:var(--app-muted)]">Create your first class to start scheduling sessions.</p>
                </div>
              )}
            </div>
          )}

          {view === 'table' && (
            <div className="overflow-hidden rounded-2xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[color:var(--app-text)]">
                  <thead className="border-b border-[color:var(--app-border)] bg-slate-50/50 text-xs uppercase text-[color:var(--app-muted)] dark:bg-slate-900/20">
                    <tr>
                      <th className="px-6 py-4 font-medium">Class</th>
                      <th className="px-6 py-4 font-medium">Trainer</th>
                      <th className="px-6 py-4 font-medium">Schedule</th>
                      <th className="px-6 py-4 font-medium">Capacity</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--app-border)]">
                    {classes.map((gymClass) => (
                      <tr key={gymClass.id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="px-6 py-4">
                          <div className="font-semibold">{gymClass.name}</div>
                          <div className="text-xs text-[color:var(--app-muted)]">{gymClass.category || 'General'}</div>
                        </td>
                        <td className="px-6 py-4">{gymClass.trainer?.user?.name || '-'}</td>
                        <td className="px-6 py-4">
                          {gymClass.schedules?.slice(0,1).map(sch => (
                            <span key={sch.id} className="block">{sch.day_of_week} ({sch.start_time.slice(0,5)})</span>
                          ))}
                          {(gymClass.schedules?.length || 0) > 1 && (
                            <span className="text-xs text-sky-600 dark:text-sky-400">+{((gymClass.schedules?.length || 0) - 1)} more</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                           {gymClass.bookings_count || 0} / {gymClass.capacity || '∞'}
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            gymClass.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {gymClass.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                           <button onClick={() => openDetailsModal(gymClass)} className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Details</button>
                           <button onClick={() => openBookModal(gymClass)} className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">Book</button>
                        </td>
                      </tr>
                    ))}
                    {!classes.length && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[color:var(--app-muted)]">No classes found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {isCreateOpen && (
        <CreateClassModal
          trainers={trainers}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => { setIsCreateOpen(false); void loadData(); }}
        />
      )}

      {isBookOpen && selectedClass && (
        <BookClassModal
          gymClass={selectedClass}
          members={members}
          onClose={() => setIsBookOpen(false)}
          onSuccess={() => { setIsBookOpen(false); void loadData(); }}
        />
      )}

      {isDetailsOpen && selectedClass && (
        <ClassDetailsModal
          classId={selectedClass.id}
          onClose={() => setIsDetailsOpen(false)}
          onUpdate={() => void loadData()}
        />
      )}
    </div>
  );
}

function CreateClassModal({ trainers, onClose, onSuccess }: { trainers: any[], onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    capacity: 20,
    duration: 60,
    trainer_id: '',
  });

  const [schedules, setSchedules] = useState<{ day_of_week: string, start_time: string, end_time: string, room: string }[]>([
    { day_of_week: 'Monday', start_time: '18:00', end_time: '19:00', room: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createGymClass({ ...formData, schedules });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--app-text)]">Create New Class</h2>
            <p className="text-sm text-[color:var(--app-muted)]">Set up a new recurring session.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition">
            <DashboardIcon name="x" className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto px-6 py-6 flex-1">
          {error && <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}

          <form id="create-class-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Class Name <span className="text-rose-500">*</span></label>
                <input required type="text" placeholder="e.g. Morning Yoga" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Wellness" className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="What is this class about?" className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Capacity (Members)</label>
                <input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Duration (Minutes)</label>
                <input type="number" min="1" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Assign Trainer</label>
                <select value={formData.trainer_id} onChange={(e) => setFormData({...formData, trainer_id: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500 appearance-none">
                  <option value="">-- Unassigned --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.user?.name}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--app-border)] bg-slate-50/50 p-5 dark:bg-slate-900/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-[color:var(--app-text)]">Weekly Schedule</h4>
                  <p className="text-xs text-[color:var(--app-muted)]">Add the days and times this class runs.</p>
                </div>
                <button type="button" onClick={() => setSchedules([...schedules, { day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: '' }])} className="inline-flex items-center gap-1 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-500/30 transition">
                  <DashboardIcon name="plus" className="h-3 w-3" /> Add Slot
                </button>
              </div>
              
              <div className="space-y-3">
                {schedules.map((sch, idx) => (
                  <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-[color:var(--app-surface)] p-3 rounded-xl border border-[color:var(--app-border)] shadow-sm">
                    <select value={sch.day_of_week} onChange={(e) => { const s = [...schedules]; s[idx].day_of_week = e.target.value; setSchedules(s); }} className="w-full md:w-auto flex-1 rounded-lg border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" required value={sch.start_time} onChange={(e) => { const s = [...schedules]; s[idx].start_time = e.target.value; setSchedules(s); }} className="rounded-lg border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    <span className="text-[color:var(--app-muted)] text-sm px-1">to</span>
                    <input type="time" required value={sch.end_time} onChange={(e) => { const s = [...schedules]; s[idx].end_time = e.target.value; setSchedules(s); }} className="rounded-lg border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    <input type="text" placeholder="Room/Location" value={sch.room} onChange={(e) => { const s = [...schedules]; s[idx].room = e.target.value; setSchedules(s); }} className="w-full md:w-auto flex-1 rounded-lg border border-[color:var(--app-border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-sky-500" />
                    <button type="button" onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 transition ml-auto md:ml-0">
                      <DashboardIcon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {!schedules.length && <p className="text-sm text-[color:var(--app-muted)] py-2 text-center">No schedule slots added.</p>}
              </div>
            </div>
          </form>
        </div>
        
        <div className="border-t border-[color:var(--app-border)] bg-slate-50/50 px-6 py-4 flex justify-end gap-3 dark:bg-slate-900/20">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[color:var(--app-text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            Cancel
          </button>
          <button form="create-class-form" disabled={loading || !schedules.length} type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition">
            {loading ? 'Saving...' : 'Create Class'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BookClassModal({ gymClass, members, onClose, onSuccess }: { gymClass: GymClassDetails, members: any[], onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    schedule_id: gymClass.schedules?.[0]?.id || '',
    member_id: '',
    booking_date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await bookGymClass(gymClass.id, {
        schedule_id: Number(formData.schedule_id),
        member_id: Number(formData.member_id),
        booking_date: formData.booking_date,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--app-text)]">Book Class</h2>
            <p className="text-sm font-medium text-sky-600 dark:text-sky-400">{gymClass.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition">
            <DashboardIcon name="x" className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto px-6 py-6">
          {error && <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">{error}</div>}

          <form id="book-class-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Select Schedule <span className="text-rose-500">*</span></label>
              <select required value={formData.schedule_id} onChange={(e) => setFormData({...formData, schedule_id: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                <option value="">-- Choose Slot --</option>
                {gymClass.schedules?.map(sch => (
                  <option key={sch.id} value={sch.id}>{sch.day_of_week} ({sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Booking Date <span className="text-rose-500">*</span></label>
              <input required type="date" value={formData.booking_date} onChange={(e) => setFormData({...formData, booking_date: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
              <p className="mt-1.5 text-xs text-[color:var(--app-muted)]">Date must match the day of the week selected above.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[color:var(--app-text)]">Select Member <span className="text-rose-500">*</span></label>
              <select required value={formData.member_id} onChange={(e) => setFormData({...formData, member_id: e.target.value})} className="w-full rounded-xl border border-[color:var(--app-border)] bg-transparent px-4 py-2.5 text-sm outline-none transition focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.user?.name} ({m.phone})</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="border-t border-[color:var(--app-border)] bg-slate-50/50 px-6 py-4 flex justify-end gap-3 dark:bg-slate-900/20">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold text-[color:var(--app-text)] hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            Cancel
          </button>
          <button form="book-class-form" disabled={loading || !gymClass.schedules?.length} type="submit" className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition">
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClassDetailsModal({ classId, onClose, onUpdate }: { classId: number, onClose: () => void, onUpdate: () => void }) {
  const [details, setDetails] = useState<GymClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGymClassDetails(classId);
      setDetails((res as any).data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const handleStatusUpdate = async (bookingId: number, status: 'attended' | 'cancelled') => {
    try {
      setActionLoading(bookingId);
      await updateGymClassBookingStatus(bookingId, status);
      await loadDetails();
      onUpdate();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-3xl bg-[color:var(--app-surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--app-text)]">Class Details</h2>
            {details && <p className="text-sm font-medium text-sky-600 dark:text-sky-400">{details.name}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition">
            <DashboardIcon name="x" className="h-5 w-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto px-6 py-6 flex-1">
          {loading ? (
             <div className="py-12 flex justify-center"><LoadingState /></div>
          ) : error ? (
            <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>
          ) : details ? (
            <div className="space-y-8">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-[color:var(--app-border)] dark:bg-slate-900/20">
                  <div>
                    <span className="block text-xs font-semibold uppercase text-[color:var(--app-muted)]">Trainer</span>
                    <span className="font-medium text-[color:var(--app-text)]">{details.trainer?.user?.name || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-[color:var(--app-muted)]">Duration</span>
                    <span className="font-medium text-[color:var(--app-text)]">{details.duration} mins</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-[color:var(--app-muted)]">Capacity</span>
                    <span className="font-medium text-[color:var(--app-text)]">{details.capacity || 'Unlimited'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-[color:var(--app-muted)]">Category</span>
                    <span className="font-medium text-[color:var(--app-text)]">{details.category || '-'}</span>
                  </div>
                  {details.description && (
                    <div className="col-span-2 md:col-span-4 mt-2">
                      <span className="block text-xs font-semibold uppercase text-[color:var(--app-muted)]">Description</span>
                      <p className="mt-1 text-sm text-[color:var(--app-text)]">{details.description}</p>
                    </div>
                  )}
               </div>

               <div>
                 <h3 className="text-lg font-bold text-[color:var(--app-text)] mb-4">Schedules</h3>
                 <div className="flex flex-wrap gap-3">
                   {details.schedules?.map(sch => (
                     <div key={sch.id} className="flex flex-col rounded-xl border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-3 px-4 shadow-sm">
                       <span className="font-bold text-[color:var(--app-text)]">{sch.day_of_week}</span>
                       <span className="text-sm text-[color:var(--app-muted)]">{sch.start_time.slice(0,5)} - {sch.end_time.slice(0,5)}</span>
                       {sch.room && <span className="mt-1 text-xs font-medium text-sky-600 dark:text-sky-400">Room: {sch.room}</span>}
                     </div>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="text-lg font-bold text-[color:var(--app-text)] mb-4">Bookings & Attendance</h3>
                 {details.bookings && details.bookings.length > 0 ? (
                   <div className="border border-[color:var(--app-border)] rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[color:var(--app-muted)] text-xs uppercase dark:bg-slate-900/20">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Member</th>
                            <th className="px-4 py-3 font-semibold">Date</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--app-border)]">
                          {details.bookings.map(b => (
                            <tr key={b.id} className="bg-[color:var(--app-surface)]">
                              <td className="px-4 py-3 font-medium text-[color:var(--app-text)]">
                                {b.member?.user?.name || `Member #${b.member_id}`}
                              </td>
                              <td className="px-4 py-3 text-[color:var(--app-muted)]">{b.booking_date}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  b.status === 'booked' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' :
                                  b.status === 'attended' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                  'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {b.status === 'booked' && (
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      disabled={actionLoading === b.id}
                                      onClick={() => handleStatusUpdate(b.id, 'attended')}
                                      className="rounded bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-600 transition disabled:opacity-50"
                                    >
                                      Mark Attended
                                    </button>
                                    <button 
                                      disabled={actionLoading === b.id}
                                      onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                                      className="rounded bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-600 transition disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                 ) : (
                   <div className="p-8 text-center border border-dashed border-[color:var(--app-border)] rounded-2xl">
                     <p className="text-[color:var(--app-muted)]">No bookings found for this class.</p>
                   </div>
                 )}
               </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
