import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import LoadingSpinner from '@/components/loading-spinner';
import EmployeesTable from '@/components/EmployeesTable';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import DownloadSolidFullIcon from '@/components/icons/DownloadSolidFullIcon';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('menu.archived_employees'),
    href: '/employees/archived',
  },
];

export default function EmployeesArchived() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);
  const page = usePage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [perPage] = useState(40);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/employees/list', { params: { page: pageNum, per_page: perPage, search, archived: 1 } });
        setEmployees(res.data?.data || []);
        setTotalPages(res.data?.last_page || 1);
        setTotalCount(res.data?.total || 0);
      } catch (e) {
        setErrorMsg('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [pageNum, perPage, search]);

  const exportToCSV = () => {
    const headers = [
      t('employees.table.name'),
      t('employees.table.gender'),
      t('employees.table.phone'),
      t('employees.table.job_title'),
      t('employees.table.hire_date'),
      t('employees.table.status'),
    ];

    const statusLabel = (emp: any) =>
      emp.is_active
        ? t('employees.status_labels.active', { defaultValue: 'Active' })
        : emp.is_suspended
        ? t('employees.status_labels.suspended', { defaultValue: 'Suspended' })
        : emp.is_archived
        ? t('employees.status_labels.archived', { defaultValue: 'Archived' })
        : t('employees.status_labels.unknown', { defaultValue: 'Unknown' });

    const genderLabel = (g?: string) =>
      g === 'male'
        ? t('employees.form.gender_male', { defaultValue: 'Male' })
        : g === 'female'
        ? t('employees.form.gender_female', { defaultValue: 'Female' })
        : '-';

    const rows = employees.map((emp) => [
      emp.full_name ?? '',
      genderLabel(emp.gender),
      emp.phone ?? '',
      emp.job_title ?? '',
      emp.hire_date ?? '',
      statusLabel(emp),
    ]);

    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archived_employees_page_${pageNum}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('menu.archived_employees')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
        <div className="flex justify-between items-center gap-4">
          <HeadingSmall
            title={t('menu.archived_employees')}
            description={t('employees.archived_description_text')}
          />

          <div className="flex items-center gap-3">
            <Input
              placeholder={t('employees.search_placeholder')}
              value={search}
              onChange={(e) => {
                setPageNum(1);
                setSearch(e.target.value);
              }}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              className="w-64"
            />
            <button
              type="button"
              onClick={exportToCSV}
              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 inline-flex items-center gap-2"
              title={t('employees.export_excel')}
            >
              <DownloadSolidFullIcon className="size-4 text-white fill-white" />
              <span>{t('employees.export_excel')}</span>
            </button>
            <Link
              href="/employees"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {t('menu.employees_list')}
            </Link>
          </div>
        </div>

        {errorMsg && (
          <StatusMessage type="error" message={errorMsg} />
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-md border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 text-sm border-b bg-muted/40">
            <div>{t('employees.total_employees_label')}: {totalCount}</div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={28} />
            </div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-sm">{t('employees.table.no_employees')}</div>
          ) : (
            <EmployeesTable
              employees={employees as any[]}
              labels={{
                picture: t('employees.table.picture', { defaultValue: 'Picture' }),
                name: t('employees.table.name'),
                gender: t('employees.table.gender'),
                phone: t('employees.table.phone'),
                job_title: t('employees.table.job_title'),
                hire_date: t('employees.table.hire_date'),
                status: t('employees.table.status'),
              }}
              isRTL={i18n.language === 'ar'}
              showPicture
            />
          )}
        </div>

        <Pagination
          currentPage={pageNum}
          totalPages={totalPages}
          onPageChange={(p) => setPageNum(p)}
          isLoading={loading}
          prevLabel={t('common.back')}
          nextLabel={t('common.next')}
          alwaysCompact
          className="mt-4"
        />
      </div>
    </AppLayout>
  );
}
