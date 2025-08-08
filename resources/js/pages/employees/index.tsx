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

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('employees.employees_big_title'),
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
  const [perPage] = useState(40);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [newId, setNewId] = useState<number | null>(null);

  useEffect(() => {
    // Read success message from query string (?success=1)
    const url = new URL(window.location.href);
    if (url.searchParams.get('success') === '1') {
      setSuccessMsg(t('employees.create.success'));
      // Clean the param
      const incomingNewId = url.searchParams.get('new_id');
      if (incomingNewId) setNewId(Number(incomingNewId));
      url.searchParams.delete('success');
      url.searchParams.delete('new_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, [t]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/employees/list', { params: { page: pageNum, per_page: perPage, search, new_id: newId ?? undefined } });
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
  }, [pageNum, perPage, search, newId]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('employees.employees_big_title')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[1500px] w-full mx-auto">
        <div className="flex justify-between items-center gap-4">
          <HeadingSmall
            title={t('employees.employees_big_title')}
            description={t('employees.employees_description_text')}
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
            <Link
            href="/employees/create"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {t('employees.create.button')}
            </Link>
          </div>
        </div>

        {successMsg && (
          <StatusMessage type="success" message={successMsg} />
        )}
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
                name: t('employees.table.name'),
                gender: t('employees.table.gender'),
                phone: t('employees.table.phone'),
                job_title: t('employees.table.job_title'),
                hire_date: t('employees.table.hire_date'),
                status: t('employees.table.status'),
              }}
              isRTL={i18n.language === 'ar'}
            />
          )}
        </div>

        {/* Pagination */}
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


