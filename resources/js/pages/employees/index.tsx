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

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('employees.employees_big_title', { defaultValue: 'Employees' }),
    href: '/employees',
  },
];

export default function EmployeesIndex() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);
  const page = usePage();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [perPage] = useState(90);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Read success message from query string (?success=1)
    const url = new URL(window.location.href);
    if (url.searchParams.get('success') === '1') {
      setSuccessMsg(t('employees.create.success'));
      // Clean the param
      url.searchParams.delete('success');
      window.history.replaceState({}, '', url.toString());
    }
  }, [t]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/employees/list', { params: { page: pageNum, per_page: perPage } });
        setEmployees(res.data?.data || []);
        setTotalPages(res.data?.last_page || 1);
      } catch (e) {
        setErrorMsg('Failed to load employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [pageNum, perPage]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('employees.employees_big_title', { defaultValue: 'Employees' })} />

      <div className="space-y-8 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
        <div className="flex justify-between items-center">
          <HeadingSmall
            title={t('employees.employees_big_title', { defaultValue: 'Employees' })}
            description={t('employees.employees_description_text', { defaultValue: 'Manage your employees' })}
          />

          <Link
            href="/employees/create"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {t('employees.create.button', { defaultValue: 'Create Employee' })}
          </Link>
        </div>

        {successMsg && (
          <StatusMessage type="success" message={successMsg} />
        )}
        {errorMsg && (
          <StatusMessage type="error" message={errorMsg} />
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-md border overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={28} />
            </div>
          ) : employees.length === 0 ? (
            <div className="p-6 text-sm">{t('employees.table.no_employees', { defaultValue: 'No employees yet' })}</div>
          ) : (
            <EmployeesTable
              employees={employees as any[]}
              labels={{
                name: t('employees.table.name', { defaultValue: 'Name' }),
                email: t('employees.table.email', { defaultValue: 'Email' }),
                phone: t('employees.table.phone', { defaultValue: 'Phone' }),
                job_title: t('employees.table.job_title', { defaultValue: 'Job Title' }),
                hire_date: t('employees.table.hire_date', { defaultValue: 'Hire Date' }),
              }}
              isRTL={i18n.language === 'ar'}
            />
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2">
          <button
            className="px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 disabled:opacity-50"
            disabled={pageNum <= 1 || loading}
            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
          >
            {t('common.back')}
          </button>
          <span className="text-sm">{pageNum} / {totalPages}</span>
          <button
            className="px-3 py-1.5 rounded-md border bg-white dark:bg-neutral-900 disabled:opacity-50"
            disabled={pageNum >= totalPages || loading}
            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
          >
            {t('common.next', { defaultValue: 'Next' })}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}


