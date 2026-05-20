'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/admin/modal';
import { Input, Select, Toggle } from '@/components/admin/fields';
import { createPlan, updatePlan, type PlanSummary } from '@/lib/super-admin';
import { getErrorMessage, getValidationErrors } from '@/lib/errors';
import { DashboardIcon } from '@/components/dashboard/dashboard-icons';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanSummary | null;
  onSuccess: () => void;
}

export function PlanModal({ isOpen, onClose, plan, onSuccess }: PlanModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billing_cycle: 'monthly',
    base_price: 0,
    discount_percentage: 0,
    max_members: '' as string | number,
    max_trainers: '' as string | number,
    max_branches: '' as string | number,
    is_unlimited: false,
    features: [''] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        // Reset the modal form whenever a different plan is opened.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          name: plan.name,
          description: plan.description || '',
          billing_cycle: plan.billing_cycle,
          base_price: plan.base_price,
          discount_percentage: plan.discount_percentage,
          max_members: plan.max_members ?? '',
          max_trainers: plan.max_trainers ?? '',
          max_branches: plan.max_branches ?? '',
          is_unlimited: plan.is_unlimited,
          features: plan.features?.length > 0 ? plan.features : [''],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          billing_cycle: 'monthly',
          base_price: 0,
          discount_percentage: 0,
          max_members: '',
          max_trainers: '',
          max_branches: '',
          is_unlimited: false,
          features: [''],
        });
      }
      setError(null);
      setErrors({});
    }
  }, [isOpen, plan]);

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    // Clean up empty features and format numbers
    const payload = {
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ''),
      max_members: formData.is_unlimited || formData.max_members === '' ? null : Number(formData.max_members),
      max_trainers: formData.is_unlimited || formData.max_trainers === '' ? null : Number(formData.max_trainers),
      max_branches: formData.is_unlimited || formData.max_branches === '' ? null : Number(formData.max_branches),
    };

    try {
      if (plan) {
        await updatePlan(plan.id, payload);
      } else {
        await createPlan(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setErrors(getValidationErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={plan ? 'Edit Platform Plan' : 'Create Platform Plan'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Plan Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <Select
            label="Billing Cycle"
            value={formData.billing_cycle}
            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
          />
        </div>

        <Input
          label="Description"
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          error={errors.description}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Base Price (USD)"
            type="number"
            min="0"
            step="0.01"
            required
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
            error={errors.base_price}
          />
          <Input
            label="Discount Percentage"
            type="number"
            min="0"
            max="100"
            value={formData.discount_percentage}
            onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
            error={errors.discount_percentage}
          />
        </div>

        <div className="space-y-4 rounded-xl border border-[color:var(--app-border)] p-4 bg-[color:var(--app-surface)]">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[color:var(--app-text)]">Limits Configuration</h4>
            <Toggle
              label="Unlimited Everything"
              checked={formData.is_unlimited}
              onChange={(checked) => setFormData({ ...formData, is_unlimited: checked })}
            />
          </div>

          {!formData.is_unlimited && (
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Max Members"
                type="number"
                min="0"
                placeholder="Leave blank for infinite"
                value={formData.max_members}
                onChange={(e) => setFormData({ ...formData, max_members: e.target.value })}
                error={errors.max_members}
              />
              <Input
                label="Max Trainers"
                type="number"
                min="0"
                placeholder="Leave blank for infinite"
                value={formData.max_trainers}
                onChange={(e) => setFormData({ ...formData, max_trainers: e.target.value })}
                error={errors.max_trainers}
              />
              <Input
                label="Max Branches"
                type="number"
                min="0"
                placeholder="Leave blank for infinite"
                value={formData.max_branches}
                onChange={(e) => setFormData({ ...formData, max_branches: e.target.value })}
                error={errors.max_branches}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[color:var(--app-text)]">Features List (Bullet Points)</h4>
          {formData.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                label={`Feature ${idx + 1}`}
                value={feature}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                placeholder="e.g. Advanced Analytics"
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="p-2 text-[color:var(--app-muted)] hover:text-rose-500 transition-colors"
              >
                <DashboardIcon name="x" className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            + Add Feature
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[color:var(--app-text)] hover:bg-[color:var(--app-surface-hover)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
