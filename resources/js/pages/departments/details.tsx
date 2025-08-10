import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import { Card } from '@/components/ui/card';

export default function DepartmentDetails({ departmentId }: { departmentId: string }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [row, setRow] = useState<any | null>(null);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('departments.title'), href: '/departments' },
    { title: t('departments.details_title', { defaultValue: 'Department Details' }), href: '#' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/department/${departmentId}`);
        if (res.data?.success) {
          setRow(res.data.data);
          setErrorMsg(null);
        } else {
          setErrorMsg(res.data?.message || t('departments.load_error'));
        }
      } catch (e) {
        setErrorMsg(t('departments.load_error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [departmentId, t]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('departments.details_title', { defaultValue: 'Department Details' })} />
      <div className="space-y-8 p-4 md:p-6 max-w-[900px] w-full mx-auto">
        <HeadingSmall title={t('departments.details_title', { defaultValue: 'Department Details' })} description={t('departments.description')} />

        {errorMsg && <StatusMessage type="error" message={errorMsg} />}

        <Card className="p-6">
          {loading ? (
            <div className="text-sm">{t('common.loading')}...</div>
          ) : row ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{row.name}</h2>
                {Number(row.is_archived) === 1 && (
                  <span className="inline-flex items-center rounded-full bg-blue-600/90 text-white text-[10px] px-2 py-0.5">{t('employees.status_labels.archived')}</span>
                )}
              </div>
              <div className="text-sm">
                <div className="mb-2">
                  <span className="font-medium">{t('departments.form.admin')}:</span> <span>{row.admin_name || '-'}</span>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/departments" className="px-4 py-2 text-sm font-medium bg-muted rounded-md">{t('departments.back_to_list')}</Link>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </AppLayout>
  );
}
