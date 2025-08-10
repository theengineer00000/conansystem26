import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import InputError from '@/components/input-error';
import SearchableSelect from '@/components/SearchableSelect';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  { title: t('departments.title'), href: '/departments' },
  { title: t('departments.create_button'), href: '#' },
];

export default function DepartmentCreate() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);

  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const searchEmployees = async (query: string) => {
    try {
      const res = await axios.get('/employees/search', { 
        params: { q: query, limit: 15 } 
      });
      const data = res.data?.data || [];
      return data.map((emp: any) => ({
        id: emp.id,
        label: emp.full_name
      }));
    } catch (error) {
      console.error('Error searching employees:', error);
      return [];
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t('validation.required', { defaultValue: 'Required' });
    if (!adminId) errs.admin_id = t('validation.required', { defaultValue: 'Required' });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setMessage(null);
    try {
      setIsSaving(true);
      const res = await axios.post('/department/create', { name, admin_id: Number(adminId) });
      if (res.data?.success) {
        router.visit('/departments');
      } else {
        const msg = res.data?.message ? String(res.data.message) : '';
        setMessage(msg || t('departments.create_error', { defaultValue: 'Failed to create department' }));
      }
    } catch (err) {
      setMessage(t('departments.create_error', { defaultValue: 'Failed to create department' }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('departments.create_button')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[800px] w-full mx-auto">
        <HeadingSmall title={t('departments.create_button')} description={t('departments.create_description')} />

        {message && <StatusMessage type="error" message={message} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="dep_name">{t('departments.form.name')}</label>
            <input id="dep_name" value={name} onChange={(e) => setName(e.target.value)} className="border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9 w-full rounded-md border bg-white text-black dark:bg-neutral-800 dark:text-white px-3 py-1 text-sm outline-none" />
            <InputError message={errors.name} />
          </div>

          <div className="grid gap-2">
            <label htmlFor="admin_id">{t('departments.form.admin')}</label>
            <SearchableSelect
              value={adminId}
              onValueChange={(value) => setAdminId(String(value))}
              onSearch={searchEmployees}
              placeholder={t('departments.form.admin_placeholder')}
              searchPlaceholder={t('departments.form.admin_search_placeholder')}
              loadingText={t('common.loading')}
              noResultsText={t('common.no_results')}
              error={errors.admin_id}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Link href="/departments" className="px-4 py-2 text-sm font-medium bg-muted rounded-md">{t('common.cancel')}</Link>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" disabled={isSaving}>
              {isSaving ? t('buttons.saving') : t('company.create.button', { defaultValue: 'Create' })}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
