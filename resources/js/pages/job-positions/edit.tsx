import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
// Removed admin selector — job_position has no admin_id

export default function JobPositionEdit({ jobPositionId }: { jobPositionId: string }) {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  // no admin fields
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('job_positions.title'), href: '/job-positions' },
    { title: t('job_positions.edit'), href: '#' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const d = await axios.get(`/api/job-position/${jobPositionId}`);
        if (d.data?.success) {
          const row = d.data.data;
          setName(row.name || '');
          // no admin fields
          setIsArchived(Boolean(row.is_archived));
        } else {
          setMessage(d.data?.message || t('job_positions.load_error', { defaultValue: 'Failed to load job position' }));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobPositionId, t]);

  // no employee search

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('validation.required', { defaultValue: 'Required' });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setMessage(null);
    setSuccess(null);
    try {
      setIsSaving(true);
      const res = await axios.post(`/api/job-position/update/${jobPositionId}`, { name });
      if (res.data?.success) {
        setSuccess(t('job_positions.update_success', { defaultValue: 'Job position updated successfully' }));
      } else {
        const msg = res.data?.message ? String(res.data.message) : '';
        setMessage(msg || t('job_positions.update_error', { defaultValue: 'Failed to update job position' }));
      }
    } catch (err) {
      setMessage(t('job_positions.update_error', { defaultValue: 'Failed to update job position' }));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (status: 'archived' | 'active' | 'deleted') => {
    try {
      setIsStatusBusy(true);
      const res = await axios.post(`/api/job-position/status/${jobPositionId}`, { status });
      if (res.data?.success) {
        if (status === 'deleted') {
          router.visit('/job-positions');
          return;
        }
        setIsArchived(status === 'archived');
        setSuccess(t('job_positions.status_updated', { defaultValue: 'Status updated' }));
      } else {
        setMessage(res.data?.message || t('job_positions.update_error', { defaultValue: 'Failed to update job position' }));
      }
    } finally {
      setIsStatusBusy(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('job_positions.edit')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[800px] w-full mx-auto">
        <HeadingSmall title={t('job_positions.edit')} description={t('job_positions.edit_description')} />

        {message && <StatusMessage type="error" message={message} />}
        {success && <StatusMessage type="success" message={success} />}

        {!loading && (
          <>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button onClick={() => updateStatus(isArchived ? 'active' : 'archived')} className={isArchived ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled={isStatusBusy}>
                {isArchived ? t('job_positions.activate', { defaultValue: 'Activate' }) : t('job_positions.archive', { defaultValue: 'Archive' })}
              </Button>
              <Button onClick={() => updateStatus('deleted')} className="bg-red-600 hover:bg-red-700 text-white" disabled={isStatusBusy}>
                {t('job_positions.delete', { defaultValue: 'Delete' })}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <label htmlFor="position_name">{t('job_positions.form.name')}</label>
                <input 
                  id="position_name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none" 
                />
                <InputError message={errors.name} />
              </div>

              {/* No admin field */}

              <div className="flex justify-end gap-2">
                <Link href="/job-positions" className="px-4 py-2 text-sm font-medium bg-muted rounded-md">{t('common.cancel')}</Link>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" disabled={isSaving}>
                  {isSaving ? t('buttons.saving') : t('buttons.save')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppLayout>
  );
}
