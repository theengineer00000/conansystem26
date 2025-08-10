import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import InputError from '@/components/input-error';
// Removed admin selector because job_position has no admin_id

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  { title: t('job_positions.title'), href: '/job-positions' },
  { title: t('job_positions.create_button'), href: '#' },
];

export default function JobPositionCreate() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);

  const [name, setName] = useState('');
  // No admin id in job_position
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // No employee search needed

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
    try {
      setIsSaving(true);
      const res = await axios.post('/api/job-position/create', { name });
      if (res.data?.success) {
        router.visit('/job-positions');
      } else {
        const msg = res.data?.message ? String(res.data.message) : '';
        setMessage(msg || t('job_positions.create_error', { defaultValue: 'Failed to create job position' }));
      }
    } catch (err) {
      setMessage(t('job_positions.create_error', { defaultValue: 'Failed to create job position' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('job_positions.create_button')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[800px] w-full mx-auto">
        <HeadingSmall title={t('job_positions.create_button')} description={t('job_positions.create_description')} />

        {message && <StatusMessage type="error" message={message} />}

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

          {/* No admin field since job_position has no admin_id */}

          <div className="flex justify-end gap-2">
            <Link href="/job-positions" className="px-4 py-2 text-sm font-medium bg-muted rounded-md">{t('common.cancel')}</Link>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" disabled={isSaving}>
              {isSaving ? t('buttons.saving') : t('buttons.save', { defaultValue: 'Create' })}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
