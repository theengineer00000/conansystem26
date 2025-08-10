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
import SearchableSelect from '@/components/SearchableSelect';

export default function DepartmentEdit({ departmentId }: { departmentId: string }) {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminName, setAdminName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatusBusy, setIsStatusBusy] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('departments.title'), href: '/departments' },
    { title: t('departments.edit'), href: '#' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const d = await axios.get(`/department/${departmentId}`);
        if (d.data?.success) {
          const row = d.data.data;
          setName(row.name || '');
          setAdminId(String(row.admin_id || ''));
          setAdminName(row.admin_name || '');
          setIsArchived(Boolean(row.is_archived));
        } else {
          setMessage(d.data?.message || t('departments.load_error', { defaultValue: 'Failed to load department' }));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [departmentId, t]);

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
    setSuccess(null);
    try {
      setIsSaving(true);
      const res = await axios.post(`/department/update/${departmentId}`, { name, admin_id: Number(adminId) });
      if (res.data?.success) {
        setSuccess(t('departments.update_success', { defaultValue: 'Department updated successfully' }));
      } else {
        const msg = res.data?.message ? String(res.data.message) : '';
        setMessage(msg || t('departments.update_error', { defaultValue: 'Failed to update department' }));
      }
    } catch (err) {
      setMessage(t('departments.update_error', { defaultValue: 'Failed to update department' }));
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (status: 'archived' | 'active' | 'deleted') => {
    try {
      setIsStatusBusy(true);
      const res = await axios.post(`/department/status/${departmentId}`, { status });
      if (res.data?.success) {
        if (status === 'deleted') {
          router.visit('/departments');
          return;
        }
        setIsArchived(status === 'archived');
        setSuccess(t('departments.status_updated', { defaultValue: 'Status updated' }));
      } else {
        setMessage(res.data?.message || t('departments.update_error', { defaultValue: 'Failed to update department' }));
      }
    } finally {
      setIsStatusBusy(false);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('departments.edit')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[800px] w-full mx-auto">
        <HeadingSmall title={t('departments.edit')} description={t('departments.edit_description')} />

        {message && <StatusMessage type="error" message={message} />}
        {success && <StatusMessage type="success" message={success} />}

        {!loading && (
          <>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button onClick={() => updateStatus(isArchived ? 'active' : 'archived')} className={isArchived ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} disabled={isStatusBusy}>
                {isArchived ? t('departments.activate', { defaultValue: 'Activate' }) : t('departments.archive', { defaultValue: 'Archive' })}
              </Button>
              <Button onClick={() => updateStatus('deleted')} className="bg-red-600 hover:bg-red-700 text-white" disabled={isStatusBusy}>
                {t('departments.delete', { defaultValue: 'Delete' })}
              </Button>
            </div>

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
                  initialOptions={adminName && adminId ? [{ id: adminId, label: adminName }] : []}
                  defaultSearchQuery={adminName}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Link href="/departments" className="px-4 py-2 text-sm font-medium bg-muted rounded-md">{t('common.cancel')}</Link>
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
