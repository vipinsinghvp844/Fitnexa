'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  Plus, Edit, Trash2, X, Loader2, Sparkles, 
  Check, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { AdminPageHeader } from '@/components/admin/page-header';
import { LoadingState } from '@/components/admin/loading-state';
import { Pagination } from '@/components/admin/pagination';
import { 
  getGymMembershipPlans, 
  createGymMembershipPlan, 
  updateGymMembershipPlan, 
  deleteGymMembershipPlan 
} from '@/lib/gym';
import { getErrorMessage } from '@/lib/errors';

interface GymMembershipPlanRow {
  id: number;
  name: string;
  price: string | number;
  duration_days: number;
  features?: string[] | null;
}

interface GymMembershipPlansResponse {
  data: GymMembershipPlanRow[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export default function GymMembershipPlansPage() {
  const [response, setResponse] = useState<GymMembershipPlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GymMembershipPlanRow | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inputs
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [featuresText, setFeaturesText] = useState('');

  // Fetch plans
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGymMembershipPlans({ page });
      setResponse(res as GymMembershipPlansResponse);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [page]);

  // Open Create/Edit modal
  const handleOpenModal = (plan?: GymMembershipPlanRow) => {
    setFormError(null);
    if (plan) {
      setEditingPlan(plan);
      setName(plan.name);
      setPrice(String(plan.price));
      setDurationDays(String(plan.duration_days));
      setFeaturesText(plan.features ? plan.features.join('\n') : '');
    } else {
      setEditingPlan(null);
      setName('');
      setPrice('');
      setDurationDays('30');
      setFeaturesText('Access to weight rooms\nLocker access\nFree hydration bar');
    }
    setShowModal(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !durationDays.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const parsedFeatures = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload = {
      name: name.trim(),
      price: parseFloat(price) || 0,
      duration_days: parseInt(durationDays) || 30,
      features: parsedFeatures
    };

    try {
      if (editingPlan) {
        await updateGymMembershipPlan(editingPlan.id, payload);
      } else {
        await createGymMembershipPlan(payload);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err: any) {
      setFormError(getErrorMessage(err) || 'Failed to save membership plan.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Plan
  const handleDeletePlan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this membership plan? It will no longer show on the public website.')) return;
    try {
      await deleteGymMembershipPlan(id);
      fetchPlans();
    } catch (err: any) {
      alert(getErrorMessage(err) || 'Failed to delete membership plan.');
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'name',
        header: 'Plan',
        render: (p: GymMembershipPlanRow) => (
          <div>
            <div className="font-extrabold text-slate-900">{p.name}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Catalog ID: {p.id}</div>
          </div>
        ),
      },
      {
        id: 'price',
        header: 'Price Rate',
        render: (p: GymMembershipPlanRow) => (
          <div className="font-black text-indigo-600 text-sm">₹{Number(p.price).toFixed(2)}</div>
        ),
      },
      {
        id: 'duration',
        header: 'Validity Period',
        render: (p: GymMembershipPlanRow) => (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
            {p.duration_days} Days
          </span>
        ),
      },
      {
        id: 'features',
        header: 'Features & Amenities',
        render: (p: GymMembershipPlanRow) => (
          <div className="max-w-xs space-y-1">
            {p.features && p.features.length > 0 ? (
              p.features.map((feat, i) => (
                <div key={i} className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-500 shrink-0" /> {feat}
                </div>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">No features defined</span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        render: (p: GymMembershipPlanRow) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenModal(p)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="Edit Plan"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeletePlan(p.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition"
              title="Delete Plan"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [response]
  );

  if (loading && !response) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <AdminPageHeader
          title="Membership Catalog Plans"
          description="Manage public packages, pricing, durations, and premium member benefits for your gym website."
        />
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs transition shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create New Membership Plan
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-700 flex items-start gap-2 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <div>{error}</div>
        </div>
      ) : null}

      {response ? (
        <>
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <DataTable<GymMembershipPlanRow>
              data={response.data}
              rowKey={(p) => String(p.id)}
              columns={columns}
              emptyTitle="No custom membership plans configured"
              emptyDescription="Click 'Create New Membership Plan' to define your custom rates, durations, and features. They will instantly reflect on your landing page!"
            />
          </div>
          <Pagination meta={response.meta} onPageChange={(p) => setPage(p)} />
        </>
      ) : null}

      {/* ────────────────── DIALOG: Create / Edit Membership Plan Modal ────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6 border border-slate-200 text-slate-950">
            
            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-xl">{editingPlan ? 'Edit Membership Plan' : 'Create Custom Membership Plan'}</h3>
              <p className="text-xs text-slate-500">
                Customize plans specific to your gym. Changes reflect instantly on your public website.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan Title / Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Executive Membership"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Price (INR) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 1999"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Validity (Days) *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 30"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Included Features (One per line)</label>
                <textarea 
                  rows={4}
                  placeholder="Access to cardio suite&#10;Locker rooms access&#10;Free personal trainer consult"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none" 
                />
                <p className="text-[10px] text-slate-400">Features will display as beautifully formatted bullet points on the pricing cards.</p>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {formSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingPlan ? 'Update Plan Catalog' : 'Publish Plan Live'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
