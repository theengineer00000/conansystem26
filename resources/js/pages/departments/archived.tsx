import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusMessage from '@/components/status-message';
import LoadingSpinner from '@/components/loading-spinner';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';

const getBreadcrumbs = (t: (key: string) => string): BreadcrumbItem[] => [
  {
    title: t('departments.archived_title'),
    href: '/departments/archived',
  },
];

export default function DepartmentsArchived() {
  const { t, i18n } = useTranslation();
  const breadcrumbs = getBreadcrumbs(t);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [perPage] = useState(40);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/departments/list', { params: { page: pageNum, per_page: perPage, search, archived: 1 } });
        setItems(res.data?.data || []);
        setTotalPages(res.data?.last_page || 1);
        setTotalCount(res.data?.total || 0);
      } catch (e) {
        setErrorMsg('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [pageNum, perPage, search]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t('departments.archived_title')} />

      <div className="space-y-8 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
        <div className="flex justify-between items-center gap-4">
          <HeadingSmall
            title={t('departments.archived_title')}
            description={t('departments.archived_description')}
          />

          <div className="flex items-center gap-3">
            <Input
              placeholder={t('departments.search_placeholder')}
              value={search}
              onChange={(e) => {
                setPageNum(1);
                setSearch(e.target.value);
              }}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              className="w-64"
            />
            <Link href="/departments" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              {t('departments.back_to_list')}
            </Link>
          </div>
        </div>

        {errorMsg && (
          <StatusMessage type="error" message={errorMsg} />
        )}

        <div className="bg-white dark:bg-neutral-900 rounded-md border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 text-sm border-b bg-muted/40">
            <div>{t('departments.total_label')}: {totalCount}</div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size={28} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm">{t('departments.no_departments')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 font-medium">{t('departments.table.name')}</th>
                    <th className="px-4 py-3 font-medium">{t('departments.table.admin')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d) => (
                    <tr key={d.id} className="border-b">
                      <td className="px-4 py-3">
                        <Link href={`/departments/edit/${d.id}`} className="text-blue-600 hover:underline">{d.name}</Link>
                        {Number(d.is_new) === 1 && (
                          <span className="ms-2 inline-flex items-center rounded-full bg-green-600/90 text-white text-[10px] px-2 py-0.5 align-middle">{t('common.new', { defaultValue: 'New' })}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{d.admin_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
